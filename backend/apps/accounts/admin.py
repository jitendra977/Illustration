from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Factory


# ================= FACTORY ADMIN =================
@admin.register(Factory)
class FactoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'member_count', 'created_at')
    search_fields = ('name', 'address')
    ordering = ('name',)

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = "Members"


# ================= USER ADMIN =================
@admin.register(User)
class CustomUserAdmin(UserAdmin):

    # ================= LIST VIEW =================
    list_display = (
        'profile_image_display',
        'email',
        'username',
        'factory_display',
        'phone_number',
        'is_verified',
        'is_active',
        'last_login',
        'created_at',
    )

    list_display_links = ('profile_image_display', 'email')

    list_filter = (
        'factory',
        'is_verified',
        'is_active',
        'is_staff',
        'created_at',
        'last_login',
    )

    search_fields = (
        'email',
        'username',
        'phone_number',
        'address',
        'factory__name',
    )

    ordering = ('-created_at',)

    readonly_fields = (
        'profile_image_preview',
        'factory_display_readonly',
        'created_at',
        'updated_at',
        'last_login',
        'frontend_last_login',
        'verification_token',
    )

    # ================= DETAIL VIEW =================
    fieldsets = (
        ('Profile', {
            'fields': (
                'profile_image_preview',
                'profile_image',
                'email',
                'password',
                'username',
                'first_name',
                'last_name',
            )
        }),
        ('Factory', {
            'fields': ('factory_display_readonly',),
            'description': 'Factory cannot be changed after user creation. Contact superadmin if needed.'
        }),
        ('Contact', {
            'fields': ('phone_number', 'address')
        }),
        ('Verification', {
            'fields': (
                'is_verified',
                'verification_token',
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        ('Activity', {
            'fields': (
                'last_login',
                'frontend_last_login',
                'date_joined',
                'created_at',
                'updated_at',
            )
        }),
    )

    # ================= ADD USER FORM =================
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'username',
                'factory',
                'password1',
                'password2',
            ),
        }),
    )

    # ================= CUSTOM DISPLAY =================
    def profile_image_display(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />',
                obj.profile_image.url
            )
        return format_html(
            '<div style="width:40px;height:40px;border-radius:50%;'
            'background:#e0e0e0;display:flex;align-items:center;'
            'justify-content:center;font-weight:bold;">{}</div>',
            obj.email[0].upper()
        )
    profile_image_display.short_description = "Photo"

    def profile_image_preview(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="width:150px;height:150px;'
                'border-radius:50%;object-fit:cover;border:3px solid #ddd;" />',
                obj.profile_image.url
            )
        return format_html(
            '<div style="width:150px;height:150px;border-radius:50%;'
            'background:#f0f0f0;display:flex;align-items:center;'
            'justify-content:center;font-size:48px;border:3px solid #ddd;">{}</div>',
            obj.email[0].upper()
        )
    profile_image_preview.short_description = "Profile Preview"

    def factory_display(self, obj):
        """For list view"""
        if obj.factory:
            return obj.factory.name
        return "-"
    factory_display.short_description = "Factory"
    factory_display.admin_order_field = "factory__name"

    def factory_display_readonly(self, obj):
        """For detail view - shows factory as readonly with link"""
        if obj.factory:
            from django.urls import reverse
            url = reverse('admin:accounts_factory_change', args=[obj.factory.id])
            return format_html(
                '<a href="{}" style="font-size:14px;padding:8px 12px;background:#f0f0f0;'
                'border:1px solid #ccc;border-radius:4px;display:inline-block;'
                'text-decoration:none;color:#333;">'
                '🏭 {}</a>',
                url, obj.factory.name
            )
        return format_html(
            '<span style="color:#999;font-style:italic;">No factory assigned</span>'
        )
    factory_display_readonly.short_description = "Factory"

    # ================= ACTIONS =================
    actions = ['mark_verified']

    def mark_verified(self, request, queryset):
        count = queryset.update(is_verified=True, verification_token=None)
        self.message_user(request, f"{count} users marked as verified.")
    mark_verified.short_description = "Mark selected users as verified"