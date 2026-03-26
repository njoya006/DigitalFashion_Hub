from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Customer, Seller, User
from .serializers import (
    CustomTokenObtainPairSerializer,
    CustomerProfileSerializer,
    RegisterSerializer,
    SellerProfileSerializer,
    UserProfileSerializer,
)


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
        return Response(
            {
                "success": True,
                "message": "Account created successfully. Please verify your email.",
                "data": {
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "full_name": user.full_name,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Logout", tags=["Authentication"])
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
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
