from rest_framework import serializers
from .models import Currency, ExchangeRate


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']


class ExchangeRateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='currency.code', read_only=True)
    symbol = serializers.CharField(source='currency.symbol', read_only=True)

    class Meta:
        model = ExchangeRate
        fields = ['id', 'code', 'symbol', 'rate', 'updated_at']
