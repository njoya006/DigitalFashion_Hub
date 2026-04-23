import json

from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin, IsAdminOrSeller, IsCustomer

from .serializers import CancelOrderSerializer, PaymentWebhookSerializer, PlaceOrderSerializer


class OrdersListView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="List orders", tags=["Orders"])
	def get(self, request):
		role = getattr(getattr(request.user, "role", None), "role_name", "")
		where_clause = ""
		params = []

		if role == "CUSTOMER":
			where_clause = "WHERE o.customer_id = %s"
			params.append(str(request.user.user_id))

		query = f"""
			SELECT
				o.order_id,
				o.order_number,
				o.customer_id,
				o.currency_code,
				o.order_date,
				o.total_amount,
				o.status,
				COALESCE(p.status, 'PENDING') AS payment_status
			FROM orders o
			LEFT JOIN payments p ON p.order_id = o.order_id
			{where_clause}
			ORDER BY o.order_date DESC
			LIMIT 100
		"""

		with connection.cursor() as cursor:
			cursor.execute(query, params)
			columns = [col[0] for col in cursor.description]
			orders = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": orders}, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Get order detail", tags=["Orders"])
	def get(self, request, order_id):
		role = getattr(getattr(request.user, "role", None), "role_name", "")

		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT
					o.order_id,
					o.order_number,
					o.customer_id,
					o.currency_code,
					o.order_date,
					o.subtotal,
					o.discount_amount,
					o.shipping_cost,
					o.tax_amount,
					o.total_amount,
					o.status,
					COALESCE(p.status, 'PENDING') AS payment_status,
					p.transaction_ref
				FROM orders o
				LEFT JOIN payments p ON p.order_id = o.order_id
				WHERE o.order_id = %s
				""",
				[str(order_id)],
			)
			row = cursor.fetchone()

			if not row:
				return Response({"success": False, "error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

			columns = [col[0] for col in cursor.description]
			order_data = dict(zip(columns, row))

			if role == "CUSTOMER" and str(order_data["customer_id"]) != str(request.user.user_id):
				return Response({"success": False, "error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

			cursor.execute(
				"""
				SELECT
					oi.line_number,
					oi.variant_id,
					oi.warehouse_id,
					oi.quantity,
					oi.unit_price,
					oi.final_price
				FROM order_items oi
				WHERE oi.order_id = %s
				ORDER BY oi.line_number
				""",
				[str(order_id)],
			)
			item_columns = [col[0] for col in cursor.description]
			items = [dict(zip(item_columns, item_row)) for item_row in cursor.fetchall()]

		order_data["items"] = items
		return Response({"success": True, "data": order_data}, status=status.HTTP_200_OK)


class PlaceOrderView(APIView):
	permission_classes = [IsAuthenticated, IsCustomer]

	@extend_schema(summary="Place order", tags=["Orders"])
	def post(self, request):
		serializer = PlaceOrderSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data

		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT *
				FROM fn_place_order(
					%s::uuid,
					%s::char(3),
					%s::int,
					%s::jsonb,
					%s::varchar,
					%s::decimal,
					%s::decimal
				)
				""",
				[
					str(request.user.user_id),
					payload["currency_code"],
					payload["shipping_address_id"],
					json.dumps(payload["items"]),
					payload.get("coupon_code") or None,
					payload.get("shipping_cost", 0),
					payload.get("tax_rate", 0),
				],
			)
			row = cursor.fetchone()

			if not row:
				return Response({"success": False, "error": "Order placement failed."}, status=status.HTTP_400_BAD_REQUEST)

			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_201_CREATED)


class CancelOrderView(APIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(summary="Cancel order", tags=["Orders"])
	def post(self, request, order_id):
		serializer = CancelOrderSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		role = getattr(getattr(request.user, "role", None), "role_name", "")
		if role == "CUSTOMER":
			with connection.cursor() as cursor:
				cursor.execute("SELECT customer_id FROM orders WHERE order_id = %s", [str(order_id)])
				row = cursor.fetchone()
				if not row:
					return Response({"success": False, "error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
				if str(row[0]) != str(request.user.user_id):
					return Response({"success": False, "error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

		with connection.cursor() as cursor:
			cursor.execute(
				"SELECT * FROM fn_cancel_order(%s::uuid, %s::text)",
				[str(order_id), serializer.validated_data["reason"]],
			)
			row = cursor.fetchone()

			if not row:
				return Response({"success": False, "error": "Cancellation failed."}, status=status.HTTP_400_BAD_REQUEST)

			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class PaymentWebhookView(APIView):
	permission_classes = [IsAuthenticated, IsAdminOrSeller]

	@extend_schema(summary="Update payment status (webhook simulation)", tags=["Payments"])
	def post(self, request):
		serializer = PaymentWebhookSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data

		with connection.cursor() as cursor:
			cursor.execute(
				"""
				UPDATE payments
				SET status = %s,
					payment_provider = COALESCE(%s, payment_provider),
					paid_at = CASE WHEN %s = 'SUCCESS' THEN NOW() ELSE paid_at END
				WHERE transaction_ref = %s
				RETURNING payment_id, order_id, status, transaction_ref
				""",
				[payload["status"], payload.get("payment_provider") or None, payload["status"], payload["transaction_ref"]],
			)
			row = cursor.fetchone()

			if not row:
				return Response({"success": False, "error": "Payment transaction not found."}, status=status.HTTP_404_NOT_FOUND)

			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

