from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class InventoryListView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="List inventory", tags=["Inventory"])
	def get(self, request):
		filters = []
		params = []
		warehouse_id = request.query_params.get("warehouse_id")
		variant_id = request.query_params.get("variant_id")
		low_stock = request.query_params.get("low_stock")
		limit = min(int(request.query_params.get("limit", 100)), 200)
		offset = max(int(request.query_params.get("offset", 0)), 0)

		if warehouse_id:
			filters.append("i.warehouse_id = %s")
			params.append(int(warehouse_id))
		if variant_id:
			filters.append("i.variant_id = %s")
			params.append(str(variant_id))
		if str(low_stock).lower() == "true":
			filters.append("COALESCE(i.quantity_on_hand, 0) <= COALESCE(i.reorder_threshold, 0)")

		where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

		with connection.cursor() as cursor:
			cursor.execute(
				f"""
				SELECT
					i.inventory_id,
					i.variant_id,
					pv.product_id,
					p.product_name,
					pv.variant_name,
					pv.sku AS variant_sku,
					i.warehouse_id,
					w.location AS warehouse_location,
					w.city AS warehouse_city,
					w.country AS warehouse_country,
					i.quantity_on_hand,
					i.reorder_threshold,
					i.reorder_quantity,
					i.last_restocked
				FROM inventory i
				JOIN product_variants pv ON pv.variant_id = i.variant_id
				JOIN products p ON p.product_id = pv.product_id
				JOIN warehouses w ON w.warehouse_id = i.warehouse_id
				{where_clause}
				ORDER BY p.product_name ASC, pv.variant_name ASC, w.city ASC
				LIMIT %s OFFSET %s
				""",
				params + [limit, offset],
			)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class InventoryDetailView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="Get inventory item", tags=["Inventory"])
	def get(self, request, inventory_id):
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT
					i.inventory_id,
					i.variant_id,
					pv.product_id,
					p.product_name,
					pv.variant_name,
					pv.sku AS variant_sku,
					i.warehouse_id,
					w.location AS warehouse_location,
					w.city AS warehouse_city,
					w.country AS warehouse_country,
					i.quantity_on_hand,
					i.reorder_threshold,
					i.reorder_quantity,
					i.last_restocked
				FROM inventory i
				JOIN product_variants pv ON pv.variant_id = i.variant_id
				JOIN products p ON p.product_id = pv.product_id
				JOIN warehouses w ON w.warehouse_id = i.warehouse_id
				WHERE i.inventory_id = %s
				""",
				[int(inventory_id)],
			)
			row = cursor.fetchone()
			if not row:
				return Response({"success": False, "error": "Inventory item not found."}, status=status.HTTP_404_NOT_FOUND)
			columns = [col[0] for col in cursor.description]
			data = dict(zip(columns, row))

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)
