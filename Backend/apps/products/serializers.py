from rest_framework import serializers


class ProductCreateSerializer(serializers.Serializer):
	product_name = serializers.CharField(max_length=255)
	base_price = serializers.DecimalField(max_digits=12, decimal_places=2)
	currency_code = serializers.CharField(max_length=3, required=False, default="USD")
	sku = serializers.CharField(max_length=100, required=False, allow_blank=True)
	category_id = serializers.IntegerField(required=False, allow_null=True)
	description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
	brand = serializers.CharField(max_length=120, required=False, allow_blank=True, allow_null=True)
	is_published = serializers.BooleanField(required=False, default=False)
	is_featured = serializers.BooleanField(required=False, default=False)
	tags = serializers.ListField(child=serializers.CharField(max_length=40), required=False, allow_empty=True)
	meta_json = serializers.JSONField(required=False, allow_null=True)
	image_url = serializers.URLField(required=False, allow_blank=True)
	alt_text = serializers.CharField(max_length=255, required=False, allow_blank=True)

	def validate_currency_code(self, value):
		return value.upper().strip()


class ProductSalesQuerySerializer(serializers.Serializer):
	limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=50)
	offset = serializers.IntegerField(required=False, min_value=0, default=0)
	include_unpublished = serializers.BooleanField(required=False, default=True)
