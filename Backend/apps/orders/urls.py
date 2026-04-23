from django.urls import path

from .views import CancelOrderView, OrderDetailView, OrdersListView, PaymentWebhookView, PlaceOrderView

urlpatterns = [
	path("", OrdersListView.as_view(), name="orders-list"),
	path("place/", PlaceOrderView.as_view(), name="orders-place"),
	path("<uuid:order_id>/", OrderDetailView.as_view(), name="orders-detail"),
	path("<uuid:order_id>/cancel/", CancelOrderView.as_view(), name="orders-cancel"),
	path("payments/webhook/", PaymentWebhookView.as_view(), name="payments-webhook"),
]

