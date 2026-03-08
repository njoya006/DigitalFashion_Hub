from django.contrib import admin
from .models import Seller


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'user', 'country', 'status', 'rating', 'total_sales', 'created_at']
    list_filter = ['status', 'country']
    search_fields = ['store_name', 'user__email']
    prepopulated_fields = {'slug': ('store_name',)}
