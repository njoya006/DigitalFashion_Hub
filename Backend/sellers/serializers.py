from rest_framework import serializers
from .models import Seller


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seller
        fields = ['id', 'store_name', 'slug', 'description', 'logo',
                  'country', 'city', 'status', 'rating', 'total_sales', 'created_at']
        read_only_fields = ['id', 'slug', 'status', 'rating', 'total_sales', 'created_at']
