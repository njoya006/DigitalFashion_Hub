from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['unit_price', 'currency']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'currency', 'total_amount', 'created_at']
    list_filter = ['status', 'currency']
    search_fields = ['customer__email']
    inlines = [OrderItemInline]
