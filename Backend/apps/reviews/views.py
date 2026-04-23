from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ReviewCreateSerializer


class ReviewsListCreateView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="List reviews", tags=["Reviews"])
	def get(self, request):
		filters = []
		params = []
		product_id = request.query_params.get("product_id")
		customer_id = request.query_params.get("customer_id")
		approved = request.query_params.get("approved")
		limit = min(int(request.query_params.get("limit", 50)), 200)
		offset = max(int(request.query_params.get("offset", 0)), 0)

		role_name = getattr(getattr(request.user, "role", None), "role_name", "") if request.user.is_authenticated else ""
		show_unapproved = role_name in ("ADMIN", "SELLER") and str(request.query_params.get("include_unapproved", "false")).lower() == "true"

		if product_id:
			filters.append("r.product_id = %s")
			params.append(str(product_id))
		if customer_id:
			filters.append("r.customer_id = %s")
			params.append(str(customer_id))
		if approved is not None:
			filters.append("r.is_approved = %s")
			params.append(str(approved).lower() == "true")
		elif not show_unapproved:
			filters.append("COALESCE(r.is_approved, TRUE) = TRUE")

		where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

		with connection.cursor() as cursor:
			cursor.execute(
				f"""
				SELECT
					r.review_id,
					r.product_id,
					p.product_name,
					r.customer_id,
					u.full_name AS customer_name,
					r.order_id,
					r.rating,
					r.title,
					r.body,
					r.is_approved,
					r.helpful_votes,
					r.created_at
				FROM reviews r
				JOIN products p ON p.product_id = r.product_id
				JOIN users u ON u.user_id = r.customer_id
				{where_clause}
				ORDER BY r.created_at DESC
				LIMIT %s OFFSET %s
				""",
				params + [limit, offset],
			)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

	@extend_schema(summary="Create review", tags=["Reviews"])
	def post(self, request):
		if not request.user.is_authenticated:
			return Response({"success": False, "error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

		serializer = ReviewCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		payload = serializer.validated_data

		role_name = getattr(getattr(request.user, "role", None), "role_name", "")
		if role_name != "CUSTOMER":
			return Response({"success": False, "error": "Only customers can submit reviews."}, status=status.HTTP_403_FORBIDDEN)

		with connection.cursor() as cursor:
			cursor.execute("SELECT order_id, customer_id FROM orders WHERE order_id = %s", [str(payload["order_id"])])
			order_row = cursor.fetchone()
			if not order_row:
				return Response({"success": False, "error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
			if str(order_row[1]) != str(request.user.user_id):
				return Response({"success": False, "error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

			cursor.execute("SELECT product_id FROM products WHERE product_id = %s", [str(payload["product_id"])])
			if not cursor.fetchone():
				return Response({"success": False, "error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

			cursor.execute(
				"""
				INSERT INTO reviews (product_id, customer_id, order_id, rating, title, body, is_approved, helpful_votes)
				VALUES (%s, %s, %s, %s, %s, %s, COALESCE(%s, TRUE), 0)
				RETURNING review_id, product_id, customer_id, order_id, rating, title, body, is_approved, helpful_votes, created_at
				""",
				[
					str(payload["product_id"]),
					str(request.user.user_id),
					str(payload["order_id"]),
					payload["rating"],
					payload.get("title") or None,
					payload.get("body") or None,
					payload.get("is_approved", True),
				],
			)
			row = cursor.fetchone()
			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_201_CREATED)
