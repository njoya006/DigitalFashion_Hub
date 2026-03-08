from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'tier', 'preferred_currency', 'is_active', 'created_at']
    list_filter = ['tier', 'is_active', 'is_staff']
    search_fields = ['email', 'username']
    ordering = ['-created_at']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('avatar', 'phone', 'country', 'tier', 'preferred_currency', 'total_spent')}),
    )
