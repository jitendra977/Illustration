import uuid
from django.db import models
from django.contrib.auth import get_user_model
import os
from django.utils.text import slugify
from apps.accounts.models import Factory

User = get_user_model()


# ------------------------------
# Manufacturer
# ------------------------------
class Manufacturer(models.Model):
    """
    Vehicle manufacturer (e.g., Hino, Isuzu, Toyota, Mitsubishi Fuso)
    """
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = "Manufacturer"
        verbose_name_plural = "Manufacturers"
        ordering = ['name']

    def __str__(self):
        return self.name


# ------------------------------
# Engine Model
# ------------------------------
class EngineModel(models.Model):
    """
    Engine specifications that can be used across multiple car models.
    Example: Hino A09C engine can be used in Hino Profia, Hino Ranger, etc.
    """
    manufacturer = models.ForeignKey(
        Manufacturer, 
        on_delete=models.CASCADE,
        related_name='engines'
    )
    name = models.CharField(max_length=255, help_text="Engine name (e.g., A09C, 6HK1)")
    engine_code = models.CharField(max_length=255, blank=True, help_text="Official engine code")
    
    FUEL_TYPES = [
        ('diesel', 'ディーゼル'),
        ('petrol', 'ガソリン'),
        ('hybrid', 'ハイブリッド'),
        ('electric', '電気(EV)'),
        ('lpg', 'LPG(液化プロパンガス）'),
    ]
    fuel_type = models.CharField(
        max_length=20, 
        choices=FUEL_TYPES, 
        default='diesel'
    )
    
    slug = models.SlugField(unique=True, blank=True)

    class Meta:
        verbose_name = "Engine Model"
        verbose_name_plural = "Engine Models"
        ordering = ['manufacturer', 'name']
        unique_together = ['manufacturer', 'name']

    def __str__(self):
        return f"{self.manufacturer.name} {self.name}"


# ------------------------------
# Car Model
# ------------------------------
class CarModel(models.Model):
    """
    Specific vehicle model that can have multiple engine options.
    Example: Hino Profia can have A09C, E13C engines
    """
    manufacturer = models.ForeignKey(
        Manufacturer, 
        on_delete=models.CASCADE,
        related_name='car_models'
    )
    name = models.CharField(max_length=255, help_text="Car model name (e.g., Profia, Ranger)")
    
    # Many-to-Many: One car model can have multiple engines, one engine can be in multiple car models
    engines = models.ManyToManyField(
        EngineModel, 
        related_name="car_models", 
        blank=True,
        help_text="Available engine options for this car model"
    )
    
    VEHICLE_TYPES = [
        # Truck Classes
        ('truck_2t', '2tクラス'),
        ('truck_3t', '3tクラス'),
        ('truck_4t', '4tクラス'),
        ('truck_10t', '10tクラス'),
        ('truck_light_duty', '小型トラック'),
        ('truck_medium_duty', '中型トラック'),
        ('large_2_axle', '大型2軸'),
        ('large_3_axle', '大型3軸'),
        ('large_4_axle', '大型4軸'),
        
        # Kei Class
        ('kei_truck', '軽トラック'),
        ('kei_van', '軽バン'),
        ('kei_passenger', '軽自動車'),
        
        # Vans & Wagons
        ('van_standard', 'バン'),
        ('cargo_van', 'カーゴバン'),
        ('hiace_class', 'ハイエースクラス'),
        ('caravan_class', 'キャラバンクラス'),
        
        # SUVs & Passenger Cars
        ('sedan', 'セダン'),
        ('suv', 'SUV'),
        ('wagon', 'ワゴン'),
        ('hatchback', 'ハッチバック'),
        ('mpv', 'ミニバン/MPV'),
        
        # Buses
        ('bus_small', '小型バス'),
        ('bus_mid', '中型バス'),
        ('bus_large', '大型バス'),
        ('bus_7m_9m', 'バス 7m以上 9m未満'),
        
        # Special Trucks
        ('wing_body', 'ウイング車'),
        ('flatbed', '平ボディ'),
        ('dump', 'ダンプ'),
        ('mixer', 'ミキサー車'),
        ('crane', 'クレーン付き'),
        ('reefer', '冷凍車'),
        ('tanker', 'タンクローリー'),
        ('trailer', 'トレーラー'),
        ('tractor_2_axle', 'トラクター2軸'),
        
        # Misc
        ('other', 'その他'),
    ]
    vehicle_type = models.CharField(
        max_length=20, 
        choices=VEHICLE_TYPES, 
        blank=True
    )
    
    # Production years
    year_from = models.IntegerField(null=True, blank=True, help_text="Production start year")
    year_to = models.IntegerField(null=True, blank=True, help_text="Production end year (leave blank if still in production)")
    
    # Technical details
    model_code = models.CharField(max_length=100, blank=True, help_text="Model code (e.g., FR1EXEG)")
    chassis_code = models.CharField(max_length=100, blank=True, help_text="Chassis code")
    
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name = "Car Model"
        verbose_name_plural = "Car Models"
        ordering = ['manufacturer', 'name']
        unique_together = ['manufacturer', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            # Create slug: manufacturer-carmodel (e.g., hino-profia)
            base_slug = slugify(f"{self.manufacturer.name}-{self.name}")
            slug = base_slug
            counter = 1
            
            queryset = CarModel.objects.filter(slug=slug)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            
            while queryset.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
                queryset = CarModel.objects.filter(slug=slug)
                if self.pk:
                    queryset = queryset.exclude(pk=self.pk)
            
            self.slug = slug
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.manufacturer.name} {self.name}"


# ------------------------------
# Part Category Model
# ------------------------------
class PartCategory(models.Model):
    """
    Universal part categories that apply to ALL engines.
    """
    name = models.CharField(max_length=255, unique=True, help_text="Category name (e.g., Engine Components)")
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    order = models.IntegerField(default=0, help_text="Display order (lower = first)")
    
    class Meta:
        verbose_name = "Part Category"
        verbose_name_plural = "Part Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.name}"


# ------------------------------
# Part Subcategory Model
# ------------------------------
class PartSubCategory(models.Model):
    """
    Universal subcategories within part categories.
    """
    part_category = models.ForeignKey(
        PartCategory, 
        on_delete=models.CASCADE,
        related_name='subcategories'
    )
    name = models.CharField(max_length=255, help_text="Subcategory name (e.g., Pistons)")
    description = models.TextField(blank=True)
    slug = models.SlugField()
    order = models.IntegerField(default=0, help_text="Display order (lower = first)")
    
    class Meta:
        verbose_name = "Part Subcategory"
        verbose_name_plural = "Part Subcategories"
        ordering = ['part_category', 'order', 'name']
        unique_together = ['part_category', 'name']
    
    def __str__(self):
        return f"{self.part_category.name} > {self.name}"


# ------------------------------
# Illustration
# ------------------------------
class Illustration(models.Model):
    """
    User-uploaded illustrations/diagrams for specific engine parts.
    
    The ILLUSTRATION links:
    - Which ENGINE (e.g., A09C)
    - Which CATEGORY (e.g., Engine Components) 
    - Which SUBCATEGORY (e.g., Pistons)
    
    User and Factory are automatically set and cannot be changed.
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='illustrations',
        editable=False,
        help_text="Automatically set to the creating user"
    )
    
    # Factory is auto-populated from user.factory
    factory = models.ForeignKey(
        Factory,
        on_delete=models.PROTECT,
        related_name="illustrations",
        null=True,
        blank=True,
        editable=False,  # Cannot be edited manually in forms
        help_text="Automatically set from user's factory"
    )
    
    # CRITICAL: Engine + Category combination happens HERE, not in PartCategory
    engine_model = models.ForeignKey(
        EngineModel, 
        on_delete=models.CASCADE,
        related_name='illustrations',
        help_text="Which engine this illustration is for"
    )
    part_category = models.ForeignKey(
        PartCategory, 
        on_delete=models.CASCADE,
        related_name='illustrations',
        help_text="Universal part category (e.g., Engine Components)"
    )
    part_subcategory = models.ForeignKey(
        PartSubCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='illustrations',
        help_text="Specific part type (e.g., Pistons)"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Optional: Link to specific car models
    applicable_car_models = models.ManyToManyField(
        CarModel,
        blank=True,
        related_name='illustrations',
        help_text="Car models where this part is applicable"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Illustration"
        verbose_name_plural = "Illustrations"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['engine_model', 'part_category']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['factory']),
        ]
        # Ensure no duplicate illustrations for same engine+category+subcategory+title
        unique_together = ['engine_model', 'part_category', 'part_subcategory', 'title']

    def __str__(self):
        return f"{self.engine_model.name} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Auto-populate factory from user if not already set
        if not self.factory and self.user and self.user.factory:
            self.factory = self.user.factory
        super().save(*args, **kwargs)


# ------------------------------
# File Upload Path
# ------------------------------
def illustration_file_path(instance, filename):
    """
    Generate upload path: illustrations/Manufacturer/EngineModel/PartCategory/PartSubCategory/IllustrationID/filename
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    return os.path.join(
        "illustrations",
        instance.illustration.engine_model.manufacturer.slug,
        instance.illustration.engine_model.slug,
        instance.illustration.part_category.slug,
        instance.illustration.part_subcategory.slug if instance.illustration.part_subcategory else "general",
        str(instance.illustration.id),
        filename
    )


# ------------------------------
# Illustration File (Multi-file)
# ------------------------------
class IllustrationFile(models.Model):
    """
    Multiple files (images, PDFs) associated with an illustration
    """
    illustration = models.ForeignKey(
        Illustration, 
        on_delete=models.CASCADE, 
        related_name="files"
    )
    file = models.FileField(upload_to=illustration_file_path)
    file_type = models.CharField(
        max_length=10,
        choices=[
            ('image', 'Image'),
            ('pdf', 'PDF'),
            ('other', 'Other'),
        ],
        default='image'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Illustration File"
        verbose_name_plural = "Illustration Files"
        ordering = ['uploaded_at']

    def save(self, *args, **kwargs):
        # Auto-detect file type
        if self.file:
            ext = self.file.name.split('.')[-1].lower()
            if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']:
                self.file_type = 'image'
            elif ext == 'pdf':
                self.file_type = 'pdf'
            else:
                self.file_type = 'other'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.illustration.title} - {self.file.name}"