import uuid
from django.db import models
from django.contrib.auth import get_user_model
import os
from django.utils.text import slugify

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
    VEHICLE_TYPES = [
    # ----------------------------------
    # 📌 Truck Classes (トラック)
    # ----------------------------------
    ('truck_2t', '2tクラス'),
    ('truck_3t', '3tクラス'),
    ('truck_4t', '4tクラス'),
    ('truck_10t', '10tクラス'),
    ('truck_light_duty', '小型トラック'),
    ('truck_medium_duty', '中型トラック'),
    ('large_2_axle', '大型2軸'),
    ('large_3_axle', '大型3軸'),
    ('large_4_axle', '大型4軸'),

    # ----------------------------------
    # 📌 Kei Class (軽自動車)
    # ----------------------------------
    ('kei_truck', '軽トラック'),
    ('kei_van', '軽バン'),
    ('kei_passenger', '軽自動車'),

    # ----------------------------------
    # 📌 Vans & Wagons (バン・ワゴン)
    # ----------------------------------
    ('van_standard', 'バン'),
    ('cargo_van', 'カーゴバン'),
    ('hiace_class', 'ハイエースクラス'),
    ('caravan_class', 'キャラバンクラス'),

    # ----------------------------------
    # 📌 SUVs & Passenger Cars
    # ----------------------------------
    ('sedan', 'セダン'),
    ('suv', 'SUV'),
    ('wagon', 'ワゴン'),
    ('hatchback', 'ハッチバック'),
    ('mpv', 'ミニバン/MPV'),

    # ----------------------------------
    # 📌 Buses (バス)
    # ----------------------------------
    ('bus_small', '小型バス'),
    ('bus_mid', '中型バス'),
    ('bus_large', '大型バス'),
    ('bus_7m_9m', 'バス 7m以上 9m未満'),

    # ----------------------------------
    # 📌 Special Trucks (特殊車両)
    # ----------------------------------
    ('wing_body', 'ウイング車'),
    ('flatbed', '平ボディ'),
    ('dump', 'ダンプ'),
    ('mixer', 'ミキサー車'),
    ('crane', 'クレーン付き'),
    ('reefer', '冷凍車'),
    ('tanker', 'タンクローリー'),
    ('trailer', 'トレーラー'),
    ('tractor_2_axle', 'トラクター2軸'),

    # ----------------------------------
    # 📌 Misc
    # ----------------------------------
    ('other', 'その他'),
]
    vehicle_type = models.CharField(
        max_length=20, 
        choices=VEHICLE_TYPES, 
        default='truck',
        blank=True
    )
    year = models.CharField(max_length=20,blank=True)  # e.g., 2020, 2018-2021  
    first_registration = models.CharField(max_length=20, blank=True)  # 初度登録 (e.g., 201809)
    model_code = models.CharField(max_length=100, blank=True)  # e.g., XYZ123   
    chassis_number = models.CharField(max_length=100, blank=True)  # e.g., ABC456
    FUEL_TYPES = [
        ('diesel', 'ディーゼル'),            # Diesel
        ('petrol', 'ガソリン'),             # Petrol/Gasoline
        ('hybrid', 'ハイブリッド'),         # Hybrid
        ('electric', '電気（EV）'),         # Electric Vehicle
        ('lpg', 'LPG（液化プロパンガス）'),  # LPG
    ]
    fuel_type = models.CharField(
        max_length=20, 
        choices=FUEL_TYPES, 
        default='diesel',
        blank=True 
    )
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.manufacturer.name} {self.name}"

# ------------------------------
# Engine Model
# ------------------------------
class EngineModel(models.Model):
    car_model = models.ForeignKey(CarModel, on_delete=models.CASCADE, related_name='engines')
    engine_code = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    class Meta:
        verbose_name = "Engine Model"
        verbose_name_plural = "Engine Models"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            manufacturer = self.car_model.manufacturer.slug
            carmodel = self.car_model.slug
            engine = self.engine_code or self.name

            # Example: hino-profia-a09c (manufacturer-carmodel-engine)
            base_slug = slugify(f"{manufacturer}-{carmodel}-{engine}")

            slug = base_slug
            counter = 1
            # Exclude current instance when updating
            queryset = EngineModel.objects.filter(slug=slug)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            
            while queryset.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
                queryset = EngineModel.objects.filter(slug=slug)
                if self.pk:
                    queryset = queryset.exclude(pk=self.pk)

            self.slug = slug

        super().save(*args, **kwargs)

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