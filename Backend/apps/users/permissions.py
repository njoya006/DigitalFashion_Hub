from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only ADMIN role users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role
            and request.user.role.role_name == "ADMIN"
        )


class IsSeller(BasePermission):
    """Only SELLER role users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role
            and request.user.role.role_name == "SELLER"
        )


class IsCustomer(BasePermission):
    """Only CUSTOMER role users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role
            and request.user.role.role_name == "CUSTOMER"
        )


class IsAdminOrSeller(BasePermission):
    """ADMIN or SELLER roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "role")
            and request.user.role
            and request.user.role.role_name in ("ADMIN", "SELLER")
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner or admin only."""

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, "role", None) and request.user.role.role_name == "ADMIN":
            return True
        obj_user_id = getattr(obj, "user_id", None) or getattr(obj, "customer_id", None)
        return str(obj_user_id) == str(request.user.user_id)
