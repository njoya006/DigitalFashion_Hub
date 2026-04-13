from django.urls import path

from .views import (
    ConfirmPasswordResetView,
    LoginView,
    LogoutView,
    MeView,
    RefreshTokenView,
    RegisterView,
    RequestPasswordResetView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("request-reset/", RequestPasswordResetView.as_view(), name="auth-request-reset"),
    path("confirm-reset/", ConfirmPasswordResetView.as_view(), name="auth-confirm-reset"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),
]
