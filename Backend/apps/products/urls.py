from django.urls import path

from .views import CategoryListView, ProductDetailView, ProductListView, ProductSalesView

urlpatterns = [
	path("", ProductListView.as_view(), name="products-list"),
	path("categories/", CategoryListView.as_view(), name="products-categories"),
	path("sales/", ProductSalesView.as_view(), name="products-sales"),
	path("<uuid:product_id>/", ProductDetailView.as_view(), name="products-detail"),
]

