# serializers.py - CORRECTED FOR NEW MODEL STRUCTURE

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
    engine_count = serializers.IntegerField(read_only=True)
    car_model_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'country', 'slug', 'engine_count', 'car_model_count']
        read_only_fields = ['id', 'slug', 'engine_count', 'car_model_count']


# ------------------------------
# Engine Model Serializer
# ------------------------------
class EngineModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    car_model_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = EngineModel
        fields = [
            'id', 'manufacturer', 'manufacturer_name', 'name', 'engine_code',
            'displacement', 'horsepower', 'torque', 'fuel_type', 'fuel_type_display',
            'slug', 'car_model_count'
        ]
        read_only_fields = ['id', 'slug', 'manufacturer_name', 'fuel_type_display', 'car_model_count']


# ------------------------------
# Car Model Serializer
# ------------------------------
class CarModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    engine_count = serializers.IntegerField(read_only=True)
    # Return engine details in list
    engines_detail = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = CarModel
        fields = [
            'id', 'manufacturer', 'manufacturer_name', 'name', 'slug',
            'vehicle_type', 'vehicle_type_display',
            'year_from', 'year_to', 'model_code', 'chassis_code',
            'engines', 'engines_detail', 'engine_count'
        ]
        read_only_fields = [
            'id', 'slug', 'manufacturer_name', 'vehicle_type_display', 
            'engines_detail', 'engine_count'
        ]
    
    def get_engines_detail(self, obj):
        """Return basic engine info for the car model"""
        return [
            {
                'id': engine.id,
                'name': engine.name,
                'engine_code': engine.engine_code,
                'fuel_type': engine.fuel_type,
                'slug': engine.slug
            }
            for engine in obj.engines.all()
        ]


# ------------------------------
# Part Category Serializer
# ------------------------------
class PartCategorySerializer(serializers.ModelSerializer):
    engine_model_name = serializers.CharField(source='engine_model.name', read_only=True)
    subcategory_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = PartCategory
        fields = [
            'id', 'engine_model', 'engine_model_name', 'name', 
            'description', 'slug', 'subcategory_count'
        ]
        read_only_fields = ['id', 'slug', 'engine_model_name', 'subcategory_count']


# ------------------------------
# Part Subcategory Serializer
# ------------------------------
class PartSubCategorySerializer(serializers.ModelSerializer):
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    engine_model_name = serializers.CharField(source='part_category.engine_model.name', read_only=True)
    
    class Meta:
        model = PartSubCategory
        fields = [
            'id', 'part_category', 'part_category_name', 'engine_model_name',
            'name', 'description', 'slug'
        ]
        read_only_fields = ['id', 'slug', 'part_category_name', 'engine_model_name']


# ------------------------------
# Illustration File Serializer
# ------------------------------
class IllustrationFileSerializer(serializers.ModelSerializer):
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    
    class Meta:
        model = IllustrationFile
        fields = ['id', 'illustration', 'file', 'file_type', 'file_type_display', 'uploaded_at']
        read_only_fields = ['id', 'file_type', 'file_type_display', 'uploaded_at']


# ------------------------------
# Illustration Serializer (Create/Update)
# ------------------------------
class IllustrationSerializer(serializers.ModelSerializer):
    # For file uploads
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    # Read-only related names
    user_name = serializers.CharField(source='user.username', read_only=True)
    engine_model_name = serializers.CharField(source='engine_model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    part_subcategory_name = serializers.CharField(source='part_subcategory.name', read_only=True, allow_null=True)
    
    # File count
    file_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name',
            'engine_model', 'engine_model_name',
            'part_category', 'part_category_name',
            'part_subcategory', 'part_subcategory_name',
            'title', 'description',
            'applicable_car_models',
            'created_at', 'updated_at',
            'uploaded_files', 'file_count'
        ]
        read_only_fields = [
            'id', 'user', 'user_name', 'engine_model_name',
            'part_category_name', 'part_subcategory_name',
            'created_at', 'updated_at', 'file_count'
        ]
    
    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        applicable_car_models = validated_data.pop('applicable_car_models', [])
        
        illustration = Illustration.objects.create(**validated_data)
        
        # Add applicable car models (ManyToMany)
        if applicable_car_models:
            illustration.applicable_car_models.set(applicable_car_models)
        
        # Create illustration files
        for file in uploaded_files:
            IllustrationFile.objects.create(illustration=illustration, file=file)
        
        return illustration
    
    def update(self, instance, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        applicable_car_models = validated_data.pop('applicable_car_models', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update applicable car models if provided
        if applicable_car_models is not None:
            instance.applicable_car_models.set(applicable_car_models)
        
        # Add new files
        for file in uploaded_files:
            IllustrationFile.objects.create(illustration=instance, file=file)
        
        return instance


# ------------------------------
# Illustration Detail Serializer (with full nested data)
# ------------------------------
class IllustrationDetailSerializer(serializers.ModelSerializer):
    # Nested serializers for detailed view
    files = IllustrationFileSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    # Engine details
    engine_model_detail = serializers.SerializerMethodField()
    
    # Part details
    part_category_detail = serializers.SerializerMethodField()
    part_subcategory_detail = serializers.SerializerMethodField()
    
    # Applicable car models
    applicable_car_models_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name', 'user_email',
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
            'slug': obj.part_category.slug
        }
    
    def get_part_subcategory_detail(self, obj):
        if not obj.part_subcategory:
            return None
        return {
            'id': obj.part_subcategory.id,
            'name': obj.part_subcategory.name,
            'slug': obj.part_subcategory.slug
        }
    
    def get_applicable_car_models_detail(self, obj):
        return [
            {
                'id': car.id,
                'name': car.name,
                'slug': car.slug,
                'manufacturer': car.manufacturer.name
            }
            for car in obj.applicable_car_models.all()
        ]


# ------------------------------
# Nested Detail Serializers (for other endpoints)
# ------------------------------
class ManufacturerDetailSerializer(serializers.ModelSerializer):
    """Detailed manufacturer with engines and car models"""
    engines = EngineModelSerializer(many=True, read_only=True)
    car_models = CarModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'country', 'slug', 'engines', 'car_models']


class EngineModelDetailSerializer(serializers.ModelSerializer):
    """Detailed engine with car models"""
    manufacturer = ManufacturerSerializer(read_only=True)
    car_models = CarModelSerializer(many=True, read_only=True)
    part_categories = PartCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = EngineModel
        fields = [
            'id', 'manufacturer', 'name', 'engine_code',
            'displacement', 'horsepower', 'torque', 'fuel_type',
            'slug', 'car_models', 'part_categories'
        ]


class CarModelDetailSerializer(serializers.ModelSerializer):
    """Detailed car model with engines"""
    manufacturer = ManufacturerSerializer(read_only=True)
    engines = EngineModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = CarModel
        fields = [
            'id', 'manufacturer', 'name', 'slug',
            'vehicle_type', 'year_from', 'year_to',
            'model_code', 'chassis_code', 'engines'
        ]