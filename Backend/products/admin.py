from django.contrib import admin
from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'seller', 'category', 'price', 'currency', 'stock', 'is_active', 'is_featured']
    list_filter = ['is_active', 'is_featured', 'category', 'currency']
    search_fields = ['name', 'seller__store_name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
