from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid
import os
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver


# ================= PROFILE IMAGE PATH =================
def user_profile_image_path(instance, filename):
    ext = filename.split('.')[-1]
    uid = instance.pk or uuid.uuid4().hex[:8]
    return f'users/{uid}/profile/profile.{ext}'


# ================= USER MODEL =================
class User(AbstractUser):
    # ----- AUTH -----
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # ----- EXTRA INFO -----
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True, null=True)

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

    def __str__(self):
        return self.email

    class Meta:
        ordering = ['-created_at']
        verbose_name = "User"
        verbose_name_plural = "Users"


# ================= SIGNALS =================
@receiver(pre_save, sender=User)
def delete_old_profile_image(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
        if old.profile_image and old.profile_image != instance.profile_image:
            if os.path.isfile(old.profile_image.path):
                os.remove(old.profile_image.path)
    except sender.DoesNotExist:
        pass


@receiver(post_delete, sender=User)
def delete_profile_image_on_delete(sender, instance, **kwargs):
    if instance.profile_image and os.path.isfile(instance.profile_image.path):
        os.remove(instance.profile_image.path)