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
    OWNER = 'OWNER'
    MANAGER = 'MANAGER'
    SUPERVISOR = 'SUPERVISOR'
    WORKER = 'WORKER'
    VIEWER = 'VIEWER'

    ROLE_CODES = [
        (OWNER, 'Owner'),
        (MANAGER, 'Manager'),
        (SUPERVISOR, 'Supervisor'),
        (WORKER, 'Worker'),
        (VIEWER, 'Viewer'),
    ]

    code = models.CharField(
        max_length=20,
        choices=ROLE_CODES,
        unique=True
    )
    name = models.CharField(max_length=50)
    
    # Permissions
    can_manage_users = models.BooleanField(default=False)
    can_manage_jobs = models.BooleanField(default=False)
    can_view_finance = models.BooleanField(default=False)
    can_edit_finance = models.BooleanField(default=False)
    can_create_illustrations = models.BooleanField(default=False)
    can_edit_illustrations = models.BooleanField(default=False)
    can_delete_illustrations = models.BooleanField(default=False)
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
        try:
            membership = self.factory_memberships.get(factory=factory, is_active=True)
            return membership.role
        except FactoryMember.DoesNotExist:
            return None

    def has_permission_in_factory(self, factory, permission):
        """
        Check if user has a specific permission in a factory
        permission: 'can_manage_users', 'can_create_illustrations', etc.
        """
        role = self.get_role_in_factory(factory)
        if role:
            return getattr(role, permission, False)
        return False

    def can_edit_illustration(self, illustration):
        """
        Check if user can edit a specific illustration
        - User can edit their own illustrations
        - User with can_edit_illustrations permission can edit any illustration in their factory
        """
        # Check if user is the creator
        if illustration.user_id == self.id:
            return True
        
        # Check if user has factory-wide edit permission
        if illustration.factory:
            return self.has_permission_in_factory(illustration.factory, 'can_edit_illustrations')
        
        return False

    def can_delete_illustration(self, illustration):
        """
        Check if user can delete a specific illustration
        - User can delete their own illustrations
        - User with can_delete_illustrations permission can delete any illustration in their factory
        """
        # Check if user is the creator
        if illustration.user_id == self.id:
            return True
        
        # Check if user has factory-wide delete permission
        if illustration.factory:
            return self.has_permission_in_factory(illustration.factory, 'can_delete_illustrations')
        
        return False

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