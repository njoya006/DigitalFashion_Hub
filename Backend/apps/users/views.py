from drf_spectacular.utils import extend_schema
from django.conf import settings
from django.core import signing
from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Customer, Seller, User
from .permissions import IsAdmin
from .serializers import (
    ConfirmEmailVerificationSerializer,
    ConfirmPasswordResetSerializer,
    CustomTokenObtainPairSerializer,
    CustomerProfileSerializer,
    RequestEmailVerificationSerializer,
    RequestPasswordResetSerializer,
    RegisterSerializer,
    SellerProfileSerializer,
    UserProfileSerializer,
)
from .utils import hash_password


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Login",
        description="Authenticate with email and password. Returns JWT tokens.",
        tags=["Authentication"],
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"success": True, "data": serializer.validated_data}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Register", description="Create a new customer account.", tags=["Authentication"])
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_data = {
            "success": True,
            "message": "Account created successfully. Please verify your email.",
            "data": {
                "user_id": str(user.user_id),
                "email": user.email,
                "full_name": user.full_name,
            },
        }

        if settings.DEBUG:
            verification_token = signing.dumps(
                {"user_id": str(user.user_id), "email": user.email},
                salt="email-verification",
            )
            frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
            response_data["data"]["verification_token"] = verification_token
            response_data["data"]["verification_url"] = f"{frontend_base}/verify-email?token={verification_token}"

        return Response(response_data, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Logout", tags=["Authentication"])
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            try:
                token.blacklist()
            except Exception:
                # Blacklist tables may be unavailable in lightweight deployments.
                pass
            return Response({"success": True, "message": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"success": False, "error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get my profile", tags=["Authentication"])
    def get(self, request):
        user = request.user
        data = UserProfileSerializer(user).data

        if user.role and user.role.role_name == "CUSTOMER":
            try:
                customer = Customer.objects.select_related("tier").get(user_id=user.user_id)
                data["customer_profile"] = CustomerProfileSerializer(customer).data
            except Customer.DoesNotExist:
                pass
        elif user.role and user.role.role_name == "SELLER":
            try:
                seller = Seller.objects.get(user_id=user.user_id)
                data["seller_profile"] = SellerProfileSerializer(seller).data
            except Seller.DoesNotExist:
                pass

        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

    @extend_schema(summary="Update my profile", tags=["Authentication"])
    def patch(self, request):
        allowed_fields = {"full_name", "phone", "avatar_url"}
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        if not update_data:
            return Response({"success": False, "error": "No valid fields to update."}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.filter(user_id=request.user.user_id).update(**update_data)
        updated_user = User.objects.get(user_id=request.user.user_id)
        return Response(
            {
                "success": True,
                "message": "Profile updated.",
                "data": UserProfileSerializer(updated_user).data,
            },
            status=status.HTTP_200_OK,
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Refresh access token", tags=["Authentication"])
    def post(self, request):
        try:
            refresh = RefreshToken(request.data.get("refresh"))
            return Response({"success": True, "data": {"access": str(refresh.access_token)}}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"success": False, "error": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Request password reset", tags=["Authentication"])
    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email, is_active=True).first()

        # Always return success to avoid user enumeration.
        response_data = {
            "success": True,
            "message": "If this email exists, password reset instructions have been sent.",
        }

        if user:
            token = signing.dumps({"user_id": str(user.user_id), "email": user.email}, salt="password-reset")
            frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
            reset_url = f"{frontend_base}/reset-password?token={token}"

            # Email sending is not configured yet; provide debug token/url in development.
            if settings.DEBUG:
                response_data["data"] = {
                    "reset_token": token,
                    "reset_url": reset_url,
                }

        return Response(response_data, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Confirm password reset", tags=["Authentication"])
    def post(self, request):
        serializer = ConfirmPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        max_age_seconds = getattr(settings, "PASSWORD_RESET_TOKEN_TTL", 3600)
        user = serializer.get_user_from_token(max_age_seconds=max_age_seconds)

        User.objects.filter(user_id=user.user_id).update(password_hash=hash_password(serializer.validated_data["new_password"]))

        return Response(
            {"success": True, "message": "Password reset successful. You can now sign in."},
            status=status.HTTP_200_OK,
        )


class RequestEmailVerificationView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Request email verification", tags=["Authentication"])
    def post(self, request):
        serializer = RequestEmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email, is_active=True).first()

        response_data = {
            "success": True,
            "message": "If this email exists, verification instructions have been sent.",
        }

        if user and not user.is_verified:
            verification_token = signing.dumps(
                {"user_id": str(user.user_id), "email": user.email},
                salt="email-verification",
            )
            frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
            if settings.DEBUG:
                response_data["data"] = {
                    "verification_token": verification_token,
                    "verification_url": f"{frontend_base}/verify-email?token={verification_token}",
                }

        return Response(response_data, status=status.HTTP_200_OK)


class ConfirmEmailVerificationView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Confirm email verification", tags=["Authentication"])
    def post(self, request):
        serializer = ConfirmEmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        max_age_seconds = getattr(settings, "EMAIL_VERIFICATION_TOKEN_TTL", 86400)
        user = serializer.get_user_from_token(max_age_seconds=max_age_seconds)

        if user.is_verified:
            return Response(
                {"success": True, "message": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        User.objects.filter(user_id=user.user_id).update(is_verified=True)

        return Response(
            {"success": True, "message": "Email verified successfully. You can now sign in."},
            status=status.HTTP_200_OK,
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def _fetch_scalar(self, sql):
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                row = cursor.fetchone()
                return row[0] if row else 0
        except Exception:
            return 0

    def _fetch_rows(self, sql):
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                columns = [col[0] for col in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception:
            return []

    @extend_schema(summary="Admin dashboard analytics", tags=["Admin"])
    def get(self, request):
        total_users = self._fetch_scalar("SELECT COUNT(*) FROM users")
        total_customers = self._fetch_scalar("SELECT COUNT(*) FROM customers")
        total_sellers = self._fetch_scalar("SELECT COUNT(*) FROM sellers")
        total_orders = self._fetch_scalar("SELECT COUNT(*) FROM orders")

        revenue_rows = self._fetch_rows(
            """
            SELECT currency_code, COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            GROUP BY currency_code
            ORDER BY revenue DESC
            """
        )

        top_products = self._fetch_rows(
            """
            SELECT p.product_name, COALESCE(SUM(oi.quantity), 0) AS units_sold
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            GROUP BY p.product_name
            ORDER BY units_sold DESC
            LIMIT 5
            """
        )

        data = {
            "total_users": total_users,
            "total_customers": total_customers,
            "total_sellers": total_sellers,
            "total_orders": total_orders,
            "revenue_by_currency": revenue_rows,
            "top_products": top_products,
        }

        return Response({"success": True, "data": data}, status=status.HTTP_200_OK)
