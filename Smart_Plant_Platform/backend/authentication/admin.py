from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


class UserAdminConfig(UserAdmin):
    search_fields = ("email", "username")
    ordering = ("start_date",)
    list_display = ("email", "id", "username", "is_active", "is_staff")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "username",
                )
            },
        ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )


admin.site.register(User, UserAdminConfig)
