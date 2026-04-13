import uuid
from django.db import transaction
from django.core import signing
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Customer, CustomerTier, Role, Seller, User
from .utils import check_password, hash_password


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer for users stored in the unmanaged PostgreSQL users table.
    """

    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password", "")

        try:
            user = User.objects.select_related("role").get(email=email, is_active=True)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"email": "No active account found with this email."}) from exc

        if not check_password(password, user.password_hash):
            raise serializers.ValidationError({"password": "Incorrect password."})

        refresh = RefreshToken.for_user(user)
        refresh["user_id"] = str(user.user_id)
        refresh["email"] = user.email
        refresh["full_name"] = user.full_name
        refresh["role"] = user.role.role_name if user.role else None

        User.objects.filter(user_id=user.user_id).update(last_login=timezone.now())

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": str(user.user_id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.role_name if user.role else None,
        }


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    preferred_currency = serializers.CharField(max_length=3, required=False, default="USD")

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        preferred_currency = validated_data.pop("preferred_currency", "USD")

        with transaction.atomic():
            customer_role = Role.objects.get(role_name="CUSTOMER")
            user = User.objects.create(
                user_id=uuid.uuid4(),
                email=validated_data["email"],
                password_hash=hash_password(validated_data["password"]),
                role=customer_role,
                full_name=validated_data["full_name"],
                phone=validated_data.get("phone"),
                is_verified=False,
                is_active=True,
            )

            standard_tier = CustomerTier.objects.get(tier_id=1)
            Customer.objects.create(
                user=user,
                tier=standard_tier,
                preferred_currency=preferred_currency,
                loyalty_points=0,
                lifetime_value=0,
            )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.role_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id",
            "email",
            "full_name",
            "phone",
            "avatar_url",
            "is_verified",
            "created_at",
            "role_name",
        ]
        read_only_fields = ["user_id", "email", "is_verified", "created_at", "role_name"]


class CustomerProfileSerializer(serializers.ModelSerializer):
    customer_id = serializers.UUIDField(source="user_id", read_only=True)
    tier_name = serializers.CharField(source="tier.tier_name", read_only=True)
    discount_percentage = serializers.DecimalField(
        source="tier.discount_percentage", max_digits=5, decimal_places=2, read_only=True
    )
    badge_color = serializers.CharField(source="tier.badge_color", read_only=True)
    next_tier_threshold = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "customer_id",
            "tier_name",
            "discount_percentage",
            "badge_color",
            "lifetime_value",
            "loyalty_points",
            "preferred_currency",
            "registered_date",
            "next_tier_threshold",
        ]

    def get_next_tier_threshold(self, obj):
        next_tier = CustomerTier.objects.filter(min_lifetime_value__gt=obj.lifetime_value).order_by(
            "min_lifetime_value"
        ).first()
        if not next_tier:
            return None
        amount_needed = next_tier.min_lifetime_value - obj.lifetime_value
        return {
            "tier_name": next_tier.tier_name,
            "threshold": next_tier.min_lifetime_value,
            "amount_needed": float(amount_needed),
        }


class SellerProfileSerializer(serializers.ModelSerializer):
    seller_id = serializers.UUIDField(source="user_id", read_only=True)

    class Meta:
        model = Seller
        fields = [
            "seller_id",
            "store_name",
            "store_logo_url",
            "store_description",
            "commission_rate",
            "is_approved",
            "rating",
            "total_sales",
        ]
        read_only_fields = ["seller_id", "commission_rate", "is_approved", "rating", "total_sales"]


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class ConfirmPasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def get_user_from_token(self, max_age_seconds=3600):
        token = self.validated_data["token"]
        try:
            payload = signing.loads(token, salt="password-reset", max_age=max_age_seconds)
            user_id = payload.get("user_id")
            email = payload.get("email")
            if not user_id or not email:
                raise serializers.ValidationError({"token": "Invalid reset token."})
            return User.objects.get(user_id=user_id, email=email, is_active=True)
        except signing.SignatureExpired as exc:
            raise serializers.ValidationError({"token": "Reset token has expired."}) from exc
        except (signing.BadSignature, User.DoesNotExist) as exc:
            raise serializers.ValidationError({"token": "Invalid reset token."}) from exc
