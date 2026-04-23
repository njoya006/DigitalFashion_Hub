from django.urls import path

from .views import InventoryDetailView, InventoryListView

urlpatterns = [
	path("", InventoryListView.as_view(), name="inventory-list"),
	path("<int:inventory_id>/", InventoryDetailView.as_view(), name="inventory-detail"),
]

