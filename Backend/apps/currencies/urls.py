from django.urls import path

from .views import ConvertPriceView, CurrencyListView, LatestRatesView, RefreshRatesView

urlpatterns = [
	path("", CurrencyListView.as_view(), name="currencies-list"),
	path("rates/", LatestRatesView.as_view(), name="currencies-rates"),
	path("convert/", ConvertPriceView.as_view(), name="currencies-convert"),
	path("refresh/", RefreshRatesView.as_view(), name="currencies-refresh"),
]

