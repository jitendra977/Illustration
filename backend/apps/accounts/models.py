from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.text import slugify
import unicodedata
import uuid
import os
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from .utils.email_service import AdvancedEmailService


def safe_folder_name(value):
    """
    Convert text to filesystem-safe name.
    Keeps Japanese characters.
    """
    value = unicodedata.normalize("NFKC", value)
    value = value.replace(" ", "_")
    return value


# ================= PROFILE IMAGE PATH =================
def user_profile_image_path(instance, filename):
    """
    media/Users/<username>/profile/profile_<uuid>.ext
    """
    ext = filename.split('.')[-1].lower()
    unique_id = uuid.uuid4().hex
    username = safe_folder_name(instance.username or "user")

    return (
        f"Users/"
        f"{username}/"
        f"profile/"
        f"profile_{unique_id}.{ext}"
    )


# ================= FACTORY MODEL =================
class Factory(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.address}"

    class Meta:
        verbose_name = "Factory"
        verbose_name_plural = "Factories"


# ================= ROLE MODEL =================
class Role(models.Model):
    """
    Defines permission levels for factory members
    """
    SUPER_ADMIN = 'SUPER_ADMIN'
    FACTORY_MANAGER = 'FACTORY_MANAGER'
    ILLUSTRATION_ADMIN = 'ILLUSTRATION_ADMIN'
    ILLUSTRATION_EDITOR = 'ILLUSTRATION_EDITOR'
    ILLUSTRATION_CONTRIBUTOR = 'ILLUSTRATION_CONTRIBUTOR'
    ILLUSTRATION_VIEWER = 'ILLUSTRATION_VIEWER'

    ROLE_CODES = [
        (SUPER_ADMIN, 'Super Admin'),
        (FACTORY_MANAGER, 'Factory Manager'),
        (ILLUSTRATION_ADMIN, 'Illustration Admin'),
        (ILLUSTRATION_EDITOR, 'Illustration Editor'),
        (ILLUSTRATION_CONTRIBUTOR, 'Illustration Contributor'),
        (ILLUSTRATION_VIEWER, 'Illustration Viewer'),
    ]

    code = models.CharField(
        max_length=50,
        unique=True
    )
    name = models.CharField(max_length=50)
    
    # System Permissions (Super Admin)
    can_manage_all_systems = models.BooleanField(
        default=False,
        help_text="Full system access - can manage all factories and all data"
    )
    
    # Factory Management Permissions (Factory Manager)
    can_manage_factory = models.BooleanField(
        default=False,
        help_text="Can manage factory operations and settings"
    )
    can_manage_users = models.BooleanField(default=False)
    can_manage_jobs = models.BooleanField(default=False)
    can_view_finance = models.BooleanField(default=False)
    can_edit_finance = models.BooleanField(default=False)
    
    # Catalog Management
    can_manage_catalog = models.BooleanField(
        default=False,
        help_text="Can manage manufacturers, car models, engine models, and categories"
    )
    
    # Feedback/Comment Management
    can_manage_feedback = models.BooleanField(
        default=False,
        help_text="Can view and manage user feedback and comments"
    )

    # Illustration Permissions
    can_create_illustration = models.BooleanField(default=False)
    can_view_illustration = models.BooleanField(default=False)
    can_edit_illustration = models.BooleanField(default=False)
    can_delete_illustration = models.BooleanField(default=False)
    can_view_all_factory_illustrations = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"


# ================= USER MODEL =================
class User(AbstractUser):
    # ----- AUTH -----
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # ----- EXTRA INFO -----
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to=user_profile_image_path,
        blank=True,
        null=True
    )

    # ----- EMAIL VERIFICATION -----
    is_verified = models.BooleanField(default=False)
    verification_token = models.UUIDField(null=True, blank=True)

    # ----- TIMESTAMPS -----
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    frontend_last_login = models.DateTimeField(null=True, blank=True)

    # ----- VALIDATION -----
    def clean(self):
        super().clean()
        if self.profile_image and self.profile_image.size > 5 * 1024 * 1024:
            raise ValidationError("Profile image must be under 5MB")

    # ----- HELPERS -----
    def generate_verification_token(self):
        self.verification_token = uuid.uuid4()
        self.save(update_fields=['verification_token'])

    def send_verification_email(self):
        """Send verification email with correct frontend link."""
        if not self.verification_token:
            self.generate_verification_token()
            
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{self.verification_token}"
        return AdvancedEmailService.send_verification_email(self, verification_url)

    def send_welcome_email(self):
        """Send welcome email after successful verification."""
        pass

    def mark_verified(self):
        self.is_verified = True
        self.verification_token = None
        self.save(update_fields=['is_verified', 'verification_token'])

    def update_frontend_last_login(self):
        self.frontend_last_login = timezone.now()
        self.save(update_fields=['frontend_last_login'])

    def get_profile_image_url(self):
        if self.profile_image:
            return self.profile_image.url
        return f"https://ui-avatars.com/api/?name={self.username}&background=random&color=fff"

    def get_factories(self):
        """Get all factories this user belongs to"""
        return Factory.objects.filter(members__user=self, members__is_active=True)

    def get_active_memberships(self):
        """Get all active factory memberships"""
        return self.factory_memberships.filter(is_active=True).select_related('factory', 'role')

    def get_role_in_factory(self, factory):
        """Get user's role in a specific factory"""
        if not factory:
            return None
            
        membership = self.factory_memberships.filter(
            factory=factory, 
            is_active=True
        ).select_related('role').first()
        return membership.role if membership else None

    def has_any_factory_permission(self, permission_name):
        """Check if user has a permission in ANY active factory membership"""
        if self.is_superuser:
            return True
        return self.get_active_memberships().filter(**{f'role__{permission_name}': True}).exists()

    def get_factories_with_permission(self, permission_name):
        """
        Return a queryset of Factory objects where the user has a specific permission.
        Superusers get all factories.
        """
        return self.get_factories_with_any_permission([permission_name])

    def get_factories_with_any_permission(self, permission_names):
        """
        Return a queryset of Factory objects where the user has ANY of the specified permissions.
        Superusers get all factories.
        """
        from .models import Factory
        if self.is_superuser:
            return Factory.objects.all()
            
        # Build Q object for any of the permissions on the Role
        from django.db.models import Q
        perm_q = Q()
        for perm in permission_names:
            perm_q |= Q(**{f'role__{perm}': True})
            
        # Filter memberships first to get accurate factory IDs for THIS user
        factory_ids = self.factory_memberships.filter(
            perm_q,
            is_active=True
        ).values_list('factory_id', flat=True)
            
        return Factory.objects.filter(id__in=factory_ids)

    def has_role(self, role_code, factory=None):
        """
        Check if user has a specific role code.
        Requires user to be active and verified.
        Superusers bypass this.
        """
        if not self.is_active:
            return False
            
        # Role-specific verification requirement
        if role_code in [Role.SUPER_ADMIN, Role.FACTORY_MANAGER, Role.ILLUSTRATION_ADMIN, Role.ILLUSTRATION_EDITOR, Role.ILLUSTRATION_VIEWER]:
            if not self.is_verified:
                return False

        if self.is_superuser:
            return True
            
        if factory:
            return self.get_active_memberships().filter(
                factory=factory,
                role__code=role_code
            ).exists()
            
        return self.get_active_memberships().filter(
            role__code=role_code
        ).exists()

    def has_any_role(self, role_codes, factory=None):
        """Check if user has any of the specified role codes (requires active/verified)"""
        if not self.is_active:
            return False
            
        # Check if any of the roles require verification
        requires_verification = any(rc in [Role.SUPER_ADMIN, Role.FACTORY_MANAGER, Role.ILLUSTRATION_ADMIN, Role.ILLUSTRATION_EDITOR, Role.ILLUSTRATION_VIEWER] for rc in role_codes)
        if requires_verification and not self.is_verified:
            return False
            
        if self.is_superuser:
            return True
            
        if factory:
            return self.get_active_memberships().filter(
                factory=factory,
                role__code__in=role_codes
            ).exists()
            
        return self.get_active_memberships().filter(
            role__code__in=role_codes
        ).exists()

    def has_permission_in_factory(self, factory, permission):
        """
        Check if user has a specific permission in a factory
        """
        if not self.is_active:
            return False
            
        role = self.get_role_in_factory(factory)
        if not role:
            return False
            
        # Role-specific verification requirement for high-tier roles
        if role.code in [Role.SUPER_ADMIN, Role.FACTORY_MANAGER, Role.ILLUSTRATION_ADMIN, Role.ILLUSTRATION_EDITOR, Role.ILLUSTRATION_VIEWER]:
            if not self.is_verified:
                return False
                
        return getattr(role, permission, False)

    # ================= ILLUSTRATION PERMISSIONS =================
    
    def can_view_all_illustrations(self):
        """
        Checks if the user has any role that grants 'View All' privilege.
        Roles: SUPER_ADMIN, FACTORY_MANAGER, ILLUSTRATION_ADMIN, ILLUSTRATION_EDITOR, ILLUSTRATION_VIEWER
        (Must be active and verified as per user request)
        """
        if not self.is_active or not self.is_verified:
            return False
            
        return self.has_any_role([
            Role.SUPER_ADMIN,
            Role.FACTORY_MANAGER,
            Role.ILLUSTRATION_ADMIN,
            Role.ILLUSTRATION_EDITOR,
            Role.ILLUSTRATION_VIEWER
        ])

    def can_create_illustration(self, factory):
        """
        Check if user can create illustrations in a specific factory.
        Roles: SUPER_ADMIN, FACTORY_MANAGER, ILLUSTRATION_ADMIN, ILLUSTRATION_CONTRIBUTOR
        Requirement:
        - Must be active.
        - High-tier roles (Admin, Manager) MUST be verified.
        - Contributors can create if active (per user's 'need' list excluding them).
        """
        if not self.is_active:
            return False
            
        if self.is_superuser:
            return self.is_verified
            
        role = self.get_role_in_factory(factory)
        if not role:
            return False
            
        # Check if this specific role requires verification
        if role.code in [Role.SUPER_ADMIN, Role.FACTORY_MANAGER, Role.ILLUSTRATION_ADMIN]:
            if not self.is_verified:
                return False
                
        return role.can_create_illustration
    
    def can_view_illustration(self, illustration):
        """
        Check if user can view a specific illustration.
        Rules:
        1. Owner can always view if ACTIVE.
        2. High-tier roles can view if ACTIVE and VERIFIED.
        """
        if not self.is_active:
            return False

        # Rule 1: Owner can always view if active
        if illustration.user_id == self.id:
            return True
            
        # Higher roles need verification to browse others' data
        if not self.is_verified:
            return False

        if self.is_superuser:
            return True
        
        # Check if user has ANY role that allows 'View All'
        if self.can_view_all_illustrations():
            return True
        
        # Rule 3: Check factory-based permissions
        if illustration.factory:
            role = self.get_role_in_factory(illustration.factory)
            if role:
                # Can view all factory illustrations or specific view perm
                if role.can_view_all_factory_illustrations or role.can_view_illustration:
                    return True
        
        return False

    def can_edit_illustration(self, illustration):
        """
        Check if user can edit a specific illustration.
        Rules:
        1. Superuser: Global Access.
        2. Must be active. Non-owners usually need verification.
        3. Must have an active role in the illustration's factory.
        4. In that factory:
           - Role allows 'can_edit_illustration' 
           - OR User is the owner
        """
        if not self.is_active: return False
        if self.is_superuser: return True
        if not self.is_verified and illustration.user_id != self.id: return False

        if not illustration.factory:
            return illustration.user_id == self.id

        role = self.get_role_in_factory(illustration.factory)
        if not role: return False
            
        return role.can_edit_illustration or illustration.user_id == self.id

    def can_delete_illustration(self, illustration):
        """
        Check if user can delete a specific illustration.
        Similar to edit, but uses can_delete_illustration permission.
        """
        if not self.is_active: return False
        if self.is_superuser: return True
        if not self.is_verified and illustration.user_id != self.id: return False

        if not illustration.factory:
            return illustration.user_id == self.id

        role = self.get_role_in_factory(illustration.factory)
        if not role: return False
            
        return role.can_delete_illustration or illustration.user_id == self.id

    def can_manage_catalog(self):
        """
        Check if user has permission to manage catalog data (Manufacturer, Engine, etc.)
        Requires active and verified account.
        """
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.has_any_factory_permission('can_manage_catalog')

    def can_manage_feedback(self):
        """
        Check if user has permission to manage feedback/comments.
        Requires active and verified account.
        """
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.has_any_factory_permission('can_manage_feedback')

    def is_system_admin(self):
        """Check if user is a superuser or has global system management role (must be active and verified)"""
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.can_manage_all_systems()

    def can_manage_all_systems(self):
        """Check if user has global system management permission in any factory"""
        return self.has_any_factory_permission('can_manage_all_systems')

    def can_manage_users(self):
        """Check if user can manage users (requires active/verified)"""
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.has_any_role([Role.SUPER_ADMIN, Role.FACTORY_MANAGER])

    def can_manage_factory(self):
        """Check if user can manage factory settings (requires active/verified)"""
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.has_any_role([Role.SUPER_ADMIN, Role.FACTORY_MANAGER])

    def can_manage_jobs(self):
        """Check if user can manage illustration/upload jobs (requires active/verified)"""
        if not self.is_active or not self.is_verified:
            return False
        return self.is_superuser or self.has_any_role([
            Role.SUPER_ADMIN, 
            Role.FACTORY_MANAGER,
            Role.ILLUSTRATION_ADMIN
        ])

    def __str__(self):
        return self.email

    class Meta:
        ordering = ['-created_at']
        verbose_name = "User"
        verbose_name_plural = "Users"


# ================= FACTORY MEMBER MODEL =================
class FactoryMember(models.Model):
    """
    Junction table linking users to factories with roles
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='factory_memberships'
    )
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name='members'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='memberships'
    )
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.factory.name} ({self.role.code})"

    class Meta:
        verbose_name = "Factory Member"
        verbose_name_plural = "Factory Members"
        unique_together = ['user', 'factory']
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['user', 'factory', 'is_active']),
            models.Index(fields=['factory', 'is_active']),
        ]


# ================= COMMENT MODEL =================
class Comment(models.Model):
    """
    User feedback/comment model
    """
    department_name = models.CharField(
        max_length=100,
        verbose_name="部所名",
        help_text="Department name"
    )
    comment = models.TextField(
        verbose_name="コメント",
        help_text="Feedback comment"
    )
    star = models.IntegerField(
        verbose_name="評価",
        help_text="Star rating (1-5)",
        choices=[(i, f"{i} Star{'s' if i > 1 else ''}") for i in range(1, 6)],
        default=5
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comments',
        help_text="User who submitted the comment (optional)"
    )
    date = models.DateTimeField(
        auto_now_add=True,
        verbose_name="日付"
    )

    def __str__(self):
        return f"{self.department_name} - {self.star}★ ({self.date.strftime('%Y-%m-%d')})"

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        ordering = ['-date']
        indexes = [
            models.Index(fields=['-date']),
            models.Index(fields=['department_name']),
        ]


# ================= SIGNALS =================
@receiver(pre_save, sender=User)
def delete_old_profile_image(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if old.profile_image and old.profile_image != instance.profile_image:
        if old.profile_image.name and os.path.exists(old.profile_image.path):
            os.remove(old.profile_image.path)


@receiver(post_delete, sender=User)
def delete_profile_image_on_delete(sender, instance, **kwargs):
    if instance.profile_image:
        if instance.profile_image.name and os.path.exists(instance.profile_image.path):
            os.remove(instance.profile_image.path)