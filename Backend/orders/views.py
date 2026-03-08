from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Customers only see their own orders
        return Order.objects.filter(customer=self.request.user).prefetch_related('items')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
