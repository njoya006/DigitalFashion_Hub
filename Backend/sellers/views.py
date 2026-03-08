from rest_framework import viewsets, permissions, filters
from .models import Seller
from .serializers import SellerSerializer


class SellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.filter(status='active')
    serializer_class = SellerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['store_name', 'country', 'city']
    ordering_fields = ['rating', 'total_sales', 'created_at']
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
