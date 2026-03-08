from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CurrencyViewSet, ExchangeRateViewSet

router = DefaultRouter()
router.register('rates', ExchangeRateViewSet, basename='exchange-rate')
router.register('', CurrencyViewSet, basename='currency')

urlpatterns = [
    path('', include(router.urls)),
]
