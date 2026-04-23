from django.urls import path

from .views import CartItemCollectionView, CartItemDetailView, CartView

urlpatterns = [
	path("", CartView.as_view(), name="cart-detail"),
	path("items/", CartItemCollectionView.as_view(), name="cart-items-add"),
	path("items/<uuid:variant_id>/", CartItemDetailView.as_view(), name="cart-items-detail"),
]

