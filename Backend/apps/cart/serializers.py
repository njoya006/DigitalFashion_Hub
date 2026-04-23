from rest_framework import serializers


class CartItemSerializer(serializers.Serializer):
	variant_id = serializers.UUIDField()
	quantity = serializers.IntegerField(min_value=1)