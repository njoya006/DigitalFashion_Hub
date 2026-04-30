from django.urls import path

from .views import AddressDetailView, AddressListView

urlpatterns = [
	path("", AddressListView.as_view(), name="addresses-list"),
	path("<int:address_id>/", AddressDetailView.as_view(), name="addresses-detail"),
]
