from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Illustration, Manufacturer, EngineModel, CarModel, PartCategory, PartSubCategory
from apps.accounts.utils.activity_logger import log_activity

@receiver(post_save, sender=Illustration)
def log_illustration_save(sender, instance, created, **kwargs):
    action = 'CREATE' if created else 'UPDATE'
    log_activity(
        request=None,
        user=instance.user,
        action=action,
        model_name='Illustration',
        object_id=instance.id,
        object_repr=instance.title,
        description=f"Illustration '{instance.title}' {'created' if created else 'updated'}"
    )

@receiver(post_delete, sender=Illustration)
def log_illustration_delete(sender, instance, **kwargs):
    log_activity(
        request=None,
        user=instance.user,
        action='DELETE',
        model_name='Illustration',
        object_id=instance.id,
        object_repr=instance.title,
        description=f"Illustration '{instance.title}' deleted"
    )

# Also log related model changes
@receiver(post_save, sender=Manufacturer)
def log_manufacturer_save(sender, instance, created, **kwargs):
    log_activity(
        request=None,
        user=None, # System action if from shell/admin
        action='CREATE' if created else 'UPDATE',
        model_name='Manufacturer',
        object_id=instance.id,
        object_repr=instance.name,
        description=f"Manufacturer '{instance.name}' {'created' if created else 'updated'}"
    )

@receiver(post_save, sender=EngineModel)
def log_engine_save(sender, instance, created, **kwargs):
    log_activity(
        request=None,
        user=None,
        action='CREATE' if created else 'UPDATE',
        model_name='EngineModel',
        object_id=instance.id,
        object_repr=instance.name,
        description=f"Engine model '{instance.name}' {'created' if created else 'updated'}"
    )
