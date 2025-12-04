import uuid
from django.db import models
from django.contrib.auth import get_user_model
import os

User = get_user_model()

# ------------------------------
# File Upload Path
# ------------------------------
def illustration_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    # Full folder structure: Manufacturer/CarModel/EngineModel/PartCategory/PartSubCategory/IllustrationID
    return os.path.join(
        "illustrations",
        instance.illustration.engine_model.car_model.manufacturer.slug,
        instance.illustration.engine_model.car_model.slug,
        instance.illustration.engine_model.name.replace(" ", "_"),
        instance.illustration.part_category.name.replace(" ", "_"),
        instance.illustration.part_subcategory.name.replace(" ", "_") if instance.illustration.part_subcategory else "general",
        str(instance.illustration.id),
        filename
    )


# ------------------------------
# Manufacturer
# ------------------------------
class Manufacturer(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


# ------------------------------
# Car Model
# ------------------------------
class CarModel(models.Model):
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.manufacturer.name} {self.name}"


# ------------------------------
# Engine Model
# ------------------------------
class EngineModel(models.Model):
    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # e.g., 1.6L Petrol, 2.0 Diesel
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.car_model.name} {self.name}"


# ------------------------------
# Part Category
# ------------------------------
class PartCategory(models.Model):
    engine_model = models.ForeignKey(EngineModel, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # e.g., Engine, Transmission
    slug = models.SlugField()

    def __str__(self):
        return self.name


# ------------------------------
# Part Subcategory
# ------------------------------
class PartSubCategory(models.Model):
    part_category = models.ForeignKey(PartCategory, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # e.g., Pistons, Turbo
    slug = models.SlugField()

    def __str__(self):
        return self.name


# ------------------------------
# Illustration
# ------------------------------
class Illustration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    engine_model = models.ForeignKey(EngineModel, on_delete=models.CASCADE)
    part_category = models.ForeignKey(PartCategory, on_delete=models.CASCADE)
    part_subcategory = models.ForeignKey(PartSubCategory, on_delete=models.SET_NULL, null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return self.title


# ------------------------------
# Illustration File (Multi-file)
# ------------------------------
class IllustrationFile(models.Model):
    illustration = models.ForeignKey(Illustration, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to=illustration_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.file)