import json
from uuid import uuid4

from django.db import connection, transaction
from django.utils.text import slugify
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Seller
from apps.users.permissions import IsSeller


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

	def get_permissions(self):
		if self.request.method.upper() == "POST":
			return [IsSeller()]
		return [AllowAny()]

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

	@extend_schema(summary="Create product", tags=["Products"])
	def post(self, request):
		payload = request.data
		product_name = str(payload.get("product_name", "")).strip()
		base_price = payload.get("base_price")
		currency_code = str(payload.get("currency_code", "USD")).upper().strip()
		sku = str(payload.get("sku", "")).strip()
		category_id = payload.get("category_id")
		description = payload.get("description")
		brand = payload.get("brand")
		is_published = bool(payload.get("is_published", False))
		is_featured = bool(payload.get("is_featured", False))
		tags = payload.get("tags")
		meta_json = payload.get("meta_json")
		image_url = str(payload.get("image_url", "")).strip()
		alt_text = str(payload.get("alt_text", "")).strip()

		if not product_name:
			return Response({"success": False, "error": "product_name is required."}, status=status.HTTP_400_BAD_REQUEST)
		if base_price in (None, ""):
			return Response({"success": False, "error": "base_price is required."}, status=status.HTTP_400_BAD_REQUEST)
		if not sku:
			sku = f"SKU-{uuid4().hex[:10].upper()}"

		try:
			base_price_value = float(base_price)
		except (TypeError, ValueError):
			return Response({"success": False, "error": "base_price must be numeric."}, status=status.HTTP_400_BAD_REQUEST)

		if not category_id:
			category_id = None

		seller = Seller.objects.filter(user_id=request.user.user_id).first()
		if seller is None:
			seller = Seller.objects.create(
				user_id=request.user.user_id,
				store_name=f"{request.user.full_name} Store {str(request.user.user_id)[:8]}",
			)

		slug_base = slugify(product_name)[:200] or f"product-{uuid4().hex[:8]}"
		slug = slug_base
		with connection.cursor() as cursor, transaction.atomic():
			cursor.execute("SELECT 1 FROM products WHERE slug = %s", [slug])
			if cursor.fetchone():
				slug = f"{slug_base}-{uuid4().hex[:8]}"

			cursor.execute(
				"""
				INSERT INTO products (
					seller_id, category_id, currency_code, product_name, slug,
					description, base_price, sku, brand, is_published, is_featured,
					tags, meta_json
				)
				VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
				RETURNING product_id, seller_id, category_id, currency_code, product_name, slug, description, base_price, sku, brand, is_published, is_featured, tags, meta_json, created_at, updated_at
				""",
				[
					str(seller.seller_id),
					category_id,
					currency_code,
					product_name,
					slug,
					description,
					base_price_value,
					sku,
					brand,
					is_published,
					is_featured,
					tags if isinstance(tags, list) else None,
					json.dumps(meta_json) if meta_json else None,
				],
			)
			row = cursor.fetchone()
			columns = [col[0] for col in cursor.description]
			created_product = dict(zip(columns, row))

			if image_url:
				cursor.execute(
					"""
					INSERT INTO product_images (product_id, variant_id, image_url, alt_text, display_order, is_primary)
					VALUES (%s, NULL, %s, %s, 0, TRUE)
					""",
					[str(created_product["product_id"]), image_url, alt_text or product_name],
				)

		return Response({"success": True, "message": "Product created successfully.", "data": created_product}, status=status.HTTP_201_CREATED)


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

