from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


def _parse_bool(value):
	if value is None:
		return None
	return str(value).strip().lower() in ("1", "true", "yes", "on")


class CategoryListView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="List categories", tags=["Products"])
	def get(self, request):
		with connection.cursor() as cursor:
			cursor.execute(
				"""
				SELECT category_id, parent_category_id, category_name, slug, icon_url, display_order
				FROM categories
				ORDER BY COALESCE(display_order, 9999), category_name
				"""
			)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class ProductListView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="List products", tags=["Products"])
	def get(self, request):
		search = request.query_params.get("search")
		category_id = request.query_params.get("category_id")
		seller_id = request.query_params.get("seller_id")
		featured = _parse_bool(request.query_params.get("featured"))
		published = request.query_params.get("published")
		limit = min(int(request.query_params.get("limit", 50)), 100)
		offset = max(int(request.query_params.get("offset", 0)), 0)

		role_name = getattr(getattr(request.user, "role", None), "role_name", "") if request.user.is_authenticated else ""
		show_unpublished = role_name in ("ADMIN", "SELLER") and _parse_bool(request.query_params.get("include_unpublished"))

		filters = []
		params = []

		if not show_unpublished and str(published).lower() != "false":
			filters.append("p.is_published = TRUE")
		elif str(published).lower() == "true":
			filters.append("p.is_published = TRUE")
		elif str(published).lower() == "false":
			filters.append("p.is_published = FALSE")

		if search:
			filters.append("(p.product_name ILIKE %s OR p.brand ILIKE %s OR p.description ILIKE %s OR p.slug ILIKE %s)")
			search_term = f"%{search.strip()}%"
			params.extend([search_term, search_term, search_term, search_term])

		if category_id:
			filters.append("p.category_id = %s")
			params.append(int(category_id))

		if seller_id:
			filters.append("p.seller_id = %s")
			params.append(str(seller_id))

		if featured is not None:
			filters.append("p.is_featured = %s")
			params.append(featured)

		where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

		query = f"""
			SELECT
				p.product_id,
				p.seller_id,
				u.full_name AS seller_name,
				p.category_id,
				c.category_name,
				p.currency_code,
				p.product_name,
				p.slug,
				p.description,
				p.base_price,
				p.sku,
				p.brand,
				p.is_published,
				p.is_featured,
				p.tags,
				p.meta_json,
				p.created_at,
				p.updated_at,
				pi.image_url AS primary_image_url,
				pi.alt_text AS primary_image_alt_text
			FROM products p
			LEFT JOIN users u ON u.user_id = p.seller_id
			LEFT JOIN categories c ON c.category_id = p.category_id
			LEFT JOIN LATERAL (
				SELECT image_url, alt_text
				FROM product_images
				WHERE product_id = p.product_id
				ORDER BY COALESCE(is_primary, FALSE) DESC, COALESCE(display_order, 9999), image_id
				LIMIT 1
			) pi ON TRUE
			{where_clause}
			ORDER BY p.is_featured DESC, p.created_at DESC, p.product_name ASC
			LIMIT %s OFFSET %s
		"""
		params.extend([limit, offset])

		with connection.cursor() as cursor:
			cursor.execute(query, params)
			columns = [col[0] for col in cursor.description]
			data = [dict(zip(columns, row)) for row in cursor.fetchall()]

		return Response({"success": True, "data": data}, status=status.HTTP_200_OK)


class ProductDetailView(APIView):
	permission_classes = [AllowAny]

	@extend_schema(summary="Get product detail", tags=["Products"])
	def get(self, request, product_id):
		role_name = getattr(getattr(request.user, "role", None), "role_name", "") if request.user.is_authenticated else ""
		show_unpublished = role_name in ("ADMIN", "SELLER") and _parse_bool(request.query_params.get("include_unpublished"))

		query = """
			SELECT
				p.product_id,
				p.seller_id,
				u.full_name AS seller_name,
				p.category_id,
				c.category_name,
				p.currency_code,
				p.product_name,
				p.slug,
				p.description,
				p.base_price,
				p.sku,
				p.brand,
				p.is_published,
				p.is_featured,
				p.tags,
				p.meta_json,
				p.created_at,
				p.updated_at
			FROM products p
			LEFT JOIN users u ON u.user_id = p.seller_id
			LEFT JOIN categories c ON c.category_id = p.category_id
			WHERE p.product_id = %s
		"""
		params = [str(product_id)]
		if not show_unpublished:
			query += " AND p.is_published = TRUE"

		with connection.cursor() as cursor:
			cursor.execute(query, params)
			row = cursor.fetchone()
			if not row:
				return Response({"success": False, "error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
			columns = [col[0] for col in cursor.description]
			product = dict(zip(columns, row))

			cursor.execute(
				"""
				SELECT image_id, product_id, variant_id, image_url, alt_text, display_order, is_primary
				FROM product_images
				WHERE product_id = %s
				ORDER BY COALESCE(is_primary, FALSE) DESC, COALESCE(display_order, 9999), image_id
				""",
				[str(product_id)],
			)
			image_columns = [col[0] for col in cursor.description]
			product["images"] = [dict(zip(image_columns, image_row)) for image_row in cursor.fetchall()]

			cursor.execute(
				"""
				SELECT variant_id, product_id, variant_name, extra_attributes, price_modifier, sku, is_active
				FROM product_variants
				WHERE product_id = %s
				ORDER BY variant_name ASC
				""",
				[str(product_id)],
			)
			variant_columns = [col[0] for col in cursor.description]
			product["variants"] = [dict(zip(variant_columns, variant_row)) for variant_row in cursor.fetchall()]

		return Response({"success": True, "data": product}, status=status.HTTP_200_OK)

