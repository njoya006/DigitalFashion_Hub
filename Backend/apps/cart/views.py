from decimal import Decimal

from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsCustomer

from .serializers import CartItemSerializer


def _cart_payload(cart_id):
	with connection.cursor() as cursor:
		cursor.execute(
			"""
			SELECT cart_id, customer_id, session_id, created_at, updated_at
			FROM cart
			WHERE cart_id = %s
			""",
			[str(cart_id)],
		)
		cart_row = cursor.fetchone()
		if not cart_row:
			return None
		cart_columns = [col[0] for col in cursor.description]
		cart = dict(zip(cart_columns, cart_row))

		cursor.execute(
			"""
			SELECT
				ci.variant_id,
				ci.quantity,
				ci.added_at,
				pv.product_id,
				pv.variant_name,
				pv.sku AS variant_sku,
				pv.price_modifier,
				p.product_name,
				p.slug,
				p.base_price,
				p.currency_code,
				COALESCE(img.image_url, '') AS image_url,
				COALESCE(stock.total_quantity, 0) AS stock_quantity,
				COALESCE(stock.warehouse_count, 0) AS warehouse_count
			FROM cart_items ci
			JOIN product_variants pv ON pv.variant_id = ci.variant_id
			JOIN products p ON p.product_id = pv.product_id
			LEFT JOIN LATERAL (
				SELECT image_url
				FROM product_images
				WHERE product_id = p.product_id
				ORDER BY COALESCE(is_primary, FALSE) DESC, COALESCE(display_order, 9999), image_id
				LIMIT 1
			) img ON TRUE
			LEFT JOIN LATERAL (
				SELECT SUM(quantity_on_hand)::int AS total_quantity, COUNT(*)::int AS warehouse_count
				FROM inventory
				WHERE variant_id = pv.variant_id
			) stock ON TRUE
			WHERE ci.cart_id = %s
			ORDER BY ci.added_at DESC
			""",
			[str(cart_id)],
		)
		item_columns = [col[0] for col in cursor.description]
		items = [dict(zip(item_columns, item_row)) for item_row in cursor.fetchall()]

		subtotal = Decimal("0")
		for item in items:
			unit_price = (item.get("base_price") or Decimal("0")) + (item.get("price_modifier") or Decimal("0"))
			subtotal += unit_price * Decimal(item.get("quantity") or 0)

		cart["items"] = items
		cart["subtotal"] = subtotal
		cart["item_count"] = sum(int(item.get("quantity") or 0) for item in items)
		return cart


def _ensure_cart(customer_id):
	with connection.cursor() as cursor:
		cursor.execute(
			"SELECT cart_id FROM cart WHERE customer_id = %s ORDER BY created_at ASC LIMIT 1",
			[str(customer_id)],
		)
		row = cursor.fetchone()
		if row:
			return row[0]

		cursor.execute(
			"""
			INSERT INTO cart (customer_id)
			VALUES (%s)
			RETURNING cart_id
			""",
			[str(customer_id)],
		)
		return cursor.fetchone()[0]


class CartView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Get current cart", tags=["Cart"])
	def get(self, request):
		cart_id = _ensure_cart(request.user.user_id)
		cart = _cart_payload(cart_id)
		return Response({"success": True, "data": cart}, status=status.HTTP_200_OK)


class CartItemCollectionView(APIView):
	permission_classes = [IsAuthenticated, IsCustomer]

	@extend_schema(summary="Add item to cart", tags=["Cart"])
	def post(self, request):
		serializer = CartItemSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data
		cart_id = _ensure_cart(request.user.user_id)

		with connection.cursor() as cursor:
			cursor.execute(
				"SELECT variant_id FROM product_variants WHERE variant_id = %s AND COALESCE(is_active, TRUE) = TRUE",
				[str(payload["variant_id"])],
			)
			if not cursor.fetchone():
				return Response({"success": False, "error": "Variant not found."}, status=status.HTTP_404_NOT_FOUND)

			cursor.execute(
				"""
				INSERT INTO cart_items (cart_id, variant_id, quantity)
				VALUES (%s, %s, %s)
				ON CONFLICT (cart_id, variant_id)
				DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
				              added_at = NOW()
				RETURNING cart_id, variant_id, quantity, added_at
				""",
				[str(cart_id), str(payload["variant_id"]), payload["quantity"]],
			)
			row = cursor.fetchone()
			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
	permission_classes = [IsAuthenticated, IsCustomer]

	@extend_schema(summary="Update cart item", tags=["Cart"])
	def patch(self, request, variant_id):
		serializer = CartItemSerializer(data={"variant_id": variant_id, **request.data})
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data
		cart_id = _ensure_cart(request.user.user_id)

		with connection.cursor() as cursor:
			cursor.execute(
				"""
				UPDATE cart_items
				SET quantity = %s, added_at = NOW()
				WHERE cart_id = %s AND variant_id = %s
				RETURNING cart_id, variant_id, quantity, added_at
				""",
				[payload["quantity"], str(cart_id), str(variant_id)],
			)
			row = cursor.fetchone()
			if not row:
				return Response({"success": False, "error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)
			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

	@extend_schema(summary="Remove cart item", tags=["Cart"])
	def delete(self, request, variant_id):
		cart_id = _ensure_cart(request.user.user_id)
		with connection.cursor() as cursor:
			cursor.execute(
				"DELETE FROM cart_items WHERE cart_id = %s AND variant_id = %s RETURNING cart_id",
				[str(cart_id), str(variant_id)],
			)
			if not cursor.fetchone():
				return Response({"success": False, "error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

		return Response({"success": True, "message": "Cart item removed."}, status=status.HTTP_200_OK)
