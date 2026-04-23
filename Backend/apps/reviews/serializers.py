from rest_framework import serializers


class ReviewCreateSerializer(serializers.Serializer):
	product_id = serializers.UUIDField()
	order_id = serializers.UUIDField()
	rating = serializers.IntegerField(min_value=1, max_value=5)
	title = serializers.CharField(required=False, allow_blank=True, max_length=255)
	body = serializers.CharField(required=False, allow_blank=True)
	is_approved = serializers.BooleanField(required=False)