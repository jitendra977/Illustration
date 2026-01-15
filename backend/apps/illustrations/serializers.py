# serializers.py - CORRECTED RELATIONS (Fixed Circular Issue)

from rest_framework import serializers
from .models import (
    Manufacturer, CarModel, EngineModel, 
    PartCategory, PartSubCategory, 
    Illustration, IllustrationFile
)


# ------------------------------
# Manufacturer Serializer
# ------------------------------
class ManufacturerSerializer(serializers.ModelSerializer):
    engine_count = serializers.IntegerField(read_only=True, required=False)
    car_model_count = serializers.IntegerField(read_only=True, required=False)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'slug', 'engine_count', 'car_model_count', 'illustration_count']
        read_only_fields = ['id', 'engine_count', 'car_model_count', 'illustration_count']


# ------------------------------
# Engine Model Serializer
# ------------------------------
class EngineModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    manufacturer_slug = serializers.CharField(source='manufacturer.slug', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    car_model_count = serializers.IntegerField(read_only=True, required=False)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = EngineModel
        fields = [
            'id', 'manufacturer', 'manufacturer_name', 'manufacturer_slug',
            'name', 'engine_code', 'fuel_type', 'fuel_type_display',
            'slug', 'car_model_count', 'illustration_count'
        ]
        read_only_fields = [
            'id', 'slug', 'manufacturer_name', 'manufacturer_slug',
            'fuel_type_display', 'car_model_count', 'illustration_count'
        ]


# ------------------------------
# Car Model Serializer
# ------------------------------
class CarModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    manufacturer_slug = serializers.CharField(source='manufacturer.slug', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    engine_count = serializers.IntegerField(read_only=True, required=False)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    engines_detail = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CarModel
        fields = [
            'id', 'manufacturer', 'manufacturer_name', 'manufacturer_slug',
            'name', 'slug', 'vehicle_type', 'vehicle_type_display',
            'year_from', 'year_to', 'model_code', 'chassis_code',
            'engines', 'engines_detail', 'engine_count', 'illustration_count'
        ]
        read_only_fields = [
            'id', 'slug', 'manufacturer_name', 'manufacturer_slug',
            'vehicle_type_display', 'engines_detail', 'engine_count', 'illustration_count'
        ]
    
    def get_engines_detail(self, obj):
        """Return complete engine info with manufacturer"""
        return [
            {
                'id': engine.id,
                'name': engine.name,
                'engine_code': engine.engine_code,
                'fuel_type': engine.fuel_type,
                'fuel_type_display': engine.get_fuel_type_display(),
                'slug': engine.slug,
                'manufacturer': {
                    'id': engine.manufacturer.id,
                    'name': engine.manufacturer.name,
                    'slug': engine.manufacturer.slug
                }
            }
            for engine in obj.engines.all()
        ]


# ------------------------------
# Part Category Serializer
# ------------------------------
class PartCategorySerializer(serializers.ModelSerializer):
    subcategory_count = serializers.IntegerField(read_only=True, required=False)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = PartCategory
        fields = [
            'id', 'name', 'description', 
            'slug', 'order', 'subcategory_count', 'illustration_count'
        ]
        read_only_fields = ['id', 'subcategory_count', 'illustration_count']


# ------------------------------
# Part Subcategory Serializer
# ------------------------------
class PartSubCategorySerializer(serializers.ModelSerializer):
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    part_category_slug = serializers.CharField(source='part_category.slug', read_only=True)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = PartSubCategory
        fields = [
            'id', 'part_category', 'part_category_name', 'part_category_slug',
            'name', 'description', 'slug', 'order', 'illustration_count'
        ]
        read_only_fields = [
            'id', 'part_category_name', 'part_category_slug', 'illustration_count'
        ]


# ------------------------------
# Illustration File Serializer
# ------------------------------
class IllustrationFileSerializer(serializers.ModelSerializer):
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    file_name = serializers.SerializerMethodField(read_only=True)
    download_url = serializers.SerializerMethodField(read_only=True)
    preview_url = serializers.SerializerMethodField(read_only=True)
    file_size = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = IllustrationFile
        fields = [
            'id', 'illustration', 'file', 'file_name', 'title', 'file_type', 
            'file_type_display', 'uploaded_at', 'download_url', 'preview_url',
            'file_size'
        ]
        read_only_fields = [
            'id', 'file_type', 'file_type_display', 'uploaded_at', 
            'file_name', 'download_url', 'preview_url', 'file_size'
        ]
    
    def get_file_name(self, obj):
        """Extract readable filename from stored path"""
        if obj.file:
            return obj.file.name.split('/')[-1]
        return 'file'

    def get_file_size(self, obj):
        """Return file size in bytes"""
        try:
            if obj.file:
                return obj.file.size
        except Exception:
            pass
        return 0
    
    def get_download_url(self, obj):
        """Build download URL"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/illustration-files/{obj.id}/download/')
        return None
    
    def get_preview_url(self, obj):
        """Build preview URL"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/illustration-files/{obj.id}/preview/')
        return None


# ------------------------------
# Illustration Serializer (List/Create/Update)
# ------------------------------
class IllustrationSerializer(serializers.ModelSerializer):
    # File uploads
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    # Read-only related names
    user_name = serializers.CharField(source='user.username', read_only=True)
    factory_name = serializers.CharField(source='factory.name', read_only=True, allow_null=True)
    
    # Engine with manufacturer
    engine_model_name = serializers.CharField(source='engine_model.name', read_only=True)
    engine_model_slug = serializers.CharField(source='engine_model.slug', read_only=True)
    manufacturer_id = serializers.IntegerField(source='engine_model.manufacturer.id', read_only=True)
    manufacturer_name = serializers.CharField(source='engine_model.manufacturer.name', read_only=True)
    manufacturer_slug = serializers.CharField(source='engine_model.manufacturer.slug', read_only=True)
    
    # Part categories
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    part_category_slug = serializers.CharField(source='part_category.slug', read_only=True)
    part_subcategory_name = serializers.CharField(source='part_subcategory.name', read_only=True, allow_null=True)
    part_subcategory_slug = serializers.CharField(source='part_subcategory.slug', read_only=True, allow_null=True)
    
    # File count
    file_count = serializers.IntegerField(read_only=True, required=False)
    
    # First file (conditional)
    first_file = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name', 'factory', 'factory_name',
            'engine_model', 'engine_model_name', 'engine_model_slug',
            'manufacturer_id', 'manufacturer_name', 'manufacturer_slug',
            'part_category', 'part_category_name', 'part_category_slug',
            'part_subcategory', 'part_subcategory_name', 'part_subcategory_slug',
            'title', 'description',
            'applicable_car_models',
            'created_at', 'updated_at',
            'uploaded_files', 'file_count', 'first_file'
        ]
        read_only_fields = [
            'id', 'user', 'user_name', 'factory', 'factory_name',
            'engine_model_name', 'engine_model_slug',
            'manufacturer_id', 'manufacturer_name', 'manufacturer_slug',
            'part_category_name', 'part_category_slug',
            'part_subcategory_name', 'part_subcategory_slug',
            'created_at', 'updated_at', 'file_count'
        ]
    
    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        applicable_car_models = validated_data.pop('applicable_car_models', [])
        
        illustration = Illustration.objects.create(**validated_data)
        
        if applicable_car_models:
            illustration.applicable_car_models.set(applicable_car_models)
        
        for file in uploaded_files:
            IllustrationFile.objects.create(illustration=illustration, file=file)
        
        return illustration
    
    def update(self, instance, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        applicable_car_models = validated_data.pop('applicable_car_models', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if applicable_car_models is not None:
            instance.applicable_car_models.set(applicable_car_models)
        
        for file in uploaded_files:
            IllustrationFile.objects.create(illustration=instance, file=file)
        
        return instance
    
    def get_first_file(self, obj):
        """Return the first file's data for thumbnails"""
        include_files = self.context.get('include_files', False)
        
        if not include_files:
            return None
        
        first_file = obj.files.first()
        if first_file:
            return IllustrationFileSerializer(first_file, context=self.context).data
        return None


# ------------------------------
# Illustration Detail Serializer
# ------------------------------
class IllustrationDetailSerializer(serializers.ModelSerializer):
    # Files
    files = IllustrationFileSerializer(many=True, read_only=True)
    
    # User info
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    factory_name = serializers.CharField(source='factory.name', read_only=True, allow_null=True)
    
    # Detailed nested objects
    engine_model_detail = serializers.SerializerMethodField()
    part_category_detail = serializers.SerializerMethodField()
    part_subcategory_detail = serializers.SerializerMethodField()
    applicable_car_models_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name', 'user_email', 'factory', 'factory_name',
            'engine_model', 'engine_model_detail',
            'part_category', 'part_category_detail',
            'part_subcategory', 'part_subcategory_detail',
            'title', 'description',
            'applicable_car_models', 'applicable_car_models_detail',
            'created_at', 'updated_at',
            'files'
        ]
    
    def get_engine_model_detail(self, obj):
        return {
            'id': obj.engine_model.id,
            'name': obj.engine_model.name,
            'engine_code': obj.engine_model.engine_code,
            'fuel_type': obj.engine_model.fuel_type,
            'fuel_type_display': obj.engine_model.get_fuel_type_display(),
            'slug': obj.engine_model.slug,
            'manufacturer': {
                'id': obj.engine_model.manufacturer.id,
                'name': obj.engine_model.manufacturer.name,
                'slug': obj.engine_model.manufacturer.slug
            }
        }
    
    def get_part_category_detail(self, obj):
        return {
            'id': obj.part_category.id,
            'name': obj.part_category.name,
            'slug': obj.part_category.slug,
            'order': obj.part_category.order
        }
    
    def get_part_subcategory_detail(self, obj):
        if not obj.part_subcategory:
            return None
        return {
            'id': obj.part_subcategory.id,
            'name': obj.part_subcategory.name,
            'slug': obj.part_subcategory.slug,
            'order': obj.part_subcategory.order
        }
    
    def get_applicable_car_models_detail(self, obj):
        return [
            {
                'id': car.id,
                'name': car.name,
                'slug': car.slug,
                'manufacturer': {
                    'id': car.manufacturer.id,
                    'name': car.manufacturer.name,
                    'slug': car.manufacturer.slug
                },
                'vehicle_type': car.vehicle_type,
                'vehicle_type_display': car.get_vehicle_type_display(),
                'year_from': car.year_from,
                'year_to': car.year_to
            }
            for car in obj.applicable_car_models.all()
        ]


# ------------------------------
# Nested Detail Serializers
# ------------------------------
class ManufacturerDetailSerializer(serializers.ModelSerializer):
    """Detailed manufacturer with engines and car models"""
    engines = serializers.SerializerMethodField(read_only=True)
    car_models = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'slug', 'engines', 'car_models']
    
    def get_engines(self, obj):
        """Return all engines for this manufacturer"""
        engines = obj.engines.all()
        return [
            {
                'id': engine.id,
                'name': engine.name,
                'engine_code': engine.engine_code,
                'fuel_type': engine.fuel_type,
                'fuel_type_display': engine.get_fuel_type_display(),
                'slug': engine.slug,
                'manufacturer': engine.manufacturer.id
            }
            for engine in engines
        ]
    
    def get_car_models(self, obj):
        """Return all car models for this manufacturer"""
        car_models = obj.car_models.all()
        return [
            {
                'id': car.id,
                'name': car.name,
                'slug': car.slug,
                'vehicle_type': car.vehicle_type,
                'vehicle_type_display': car.get_vehicle_type_display(),
                'year_from': car.year_from,
                'year_to': car.year_to,
                'manufacturer': car.manufacturer.id
            }
            for car in car_models
        ]


class EngineModelDetailSerializer(serializers.ModelSerializer):
    """Detailed engine with complete manufacturer and car models"""
    manufacturer = ManufacturerSerializer(read_only=True)
    car_models = serializers.SerializerMethodField(read_only=True)
    illustration_count = serializers.IntegerField(read_only=True, required=False)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    
    class Meta:
        model = EngineModel
        fields = [
            'id', 'manufacturer', 'name', 'engine_code', 
            'fuel_type', 'fuel_type_display',
            'slug', 'car_models', 'illustration_count'
        ]
    
    def get_car_models(self, obj):
        """Return all car models with this engine"""
        car_models = obj.car_models.all()
        return [
            {
                'id': car.id,
                'name': car.name,
                'slug': car.slug,
                'vehicle_type': car.vehicle_type,
                'vehicle_type_display': car.get_vehicle_type_display(),
                'year_from': car.year_from,
                'year_to': car.year_to,
                'manufacturer': {
                    'id': car.manufacturer.id,
                    'name': car.manufacturer.name,
                    'slug': car.manufacturer.slug
                }
            }
            for car in car_models
        ]


class CarModelDetailSerializer(serializers.ModelSerializer):
    """Detailed car model with complete manufacturer and engines"""
    manufacturer = ManufacturerSerializer(read_only=True)
    engines = serializers.SerializerMethodField(read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    
    class Meta:
        model = CarModel
        fields = [
            'id', 'manufacturer', 'name', 'slug',
            'vehicle_type', 'vehicle_type_display',
            'year_from', 'year_to',
            'model_code', 'chassis_code', 'engines'
        ]
    
    def get_engines(self, obj):
        """Return all engines for this car model"""
        engines = obj.engines.all()
        return [
            {
                'id': engine.id,
                'name': engine.name,
                'engine_code': engine.engine_code,
                'fuel_type': engine.fuel_type,
                'fuel_type_display': engine.get_fuel_type_display(),
                'slug': engine.slug,
                'manufacturer': {
                    'id': engine.manufacturer.id,
                    'name': engine.manufacturer.name,
                    'slug': engine.manufacturer.slug
                }
            }
            for engine in engines
        ]