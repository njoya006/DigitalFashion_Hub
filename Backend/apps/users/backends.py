from .models import User


class UUIDUserBackend:
    """
    Custom authentication backend.
    Loads User by user_id UUID from JWT payload.
    """

    def authenticate(self, request, email=None, password=None):
        return None

    def get_user(self, user_id):
        try:
            return User.objects.select_related("role").get(user_id=user_id, is_active=True)
        except User.DoesNotExist:
            return None
