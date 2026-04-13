from rest_framework import serializers


class PlaceOrderItemSerializer(serializers.Serializer):
    variant_id = serializers.UUIDField()
    warehouse_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class PlaceOrderSerializer(serializers.Serializer):
    currency_code = serializers.CharField(max_length=3)
    shipping_address_id = serializers.IntegerField(min_value=1)
    items = PlaceOrderItemSerializer(many=True)
    coupon_code = serializers.CharField(max_length=30, required=False, allow_null=True, allow_blank=True)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    tax_rate = serializers.DecimalField(max_digits=7, decimal_places=6, required=False, default=0)

    def validate_currency_code(self, value):
        return value.upper().strip()


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="Cancelled by user")


class PaymentWebhookSerializer(serializers.Serializer):
    transaction_ref = serializers.CharField(max_length=200)
    status = serializers.ChoiceField(choices=["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
    payment_provider = serializers.CharField(max_length=50, required=False, allow_blank=True)
