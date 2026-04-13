from rest_framework import serializers

from .models import Currency


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["currency_code", "currency_name", "symbol", "is_active"]


class ConvertPriceQuerySerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    from_currency = serializers.CharField(max_length=3)
    to_currency = serializers.CharField(max_length=3)

    def validate_from_currency(self, value):
        return value.upper().strip()

    def validate_to_currency(self, value):
        return value.upper().strip()
