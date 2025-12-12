# =============================================================================
# serializers.py - CORRECTED VERSION
# =============================================================================

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
    class Meta:
        model = Manufacturer
        fields = ['id', 'name', 'country', 'slug']
        read_only_fields = ['id', 'slug']  # ✅ FIXED: Added 'slug' as read-only


# ------------------------------
# Car Model Serializer
# ------------------------------
class CarModelSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)
    
    class Meta:
        model = CarModel
        fields = [
            'id', 'manufacturer', 'manufacturer_name', 'name', 'slug',
            'year', 'first_registration', 'model_code',  # ✅ FIXED: Changed 'year_from', 'year_to' to 'year'
            'chassis_number', 'vehicle_type', 'vehicle_type_display',
            'fuel_type', 'fuel_type_display'  # ✅ FIXED: Removed 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug']  # ✅ FIXED: Removed 'created_at', 'updated_at'
        

# ------------------------------
# Engine Model Serializer
# ------------------------------
class EngineModelSerializer(serializers.ModelSerializer):
    car_model_name = serializers.CharField(source='car_model.name', read_only=True)
    manufacturer_name = serializers.CharField(source='car_model.manufacturer.name', read_only=True)
    
    class Meta:
        model = EngineModel
        fields = ['id', 'car_model', 'car_model_name', 'manufacturer_name', 'name', 'slug', 'engine_code']  # ✅ ADDED: 'engine_code'
        read_only_fields = ['id', 'slug']  # ✅ FIXED: Added 'slug' as read-only


# ------------------------------
# Part Category Serializer
# ------------------------------
class PartCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartCategory
        fields = ['id', 'engine_model', 'name', 'slug']  # ✅ FIXED: Removed 'engine_model_name' (not a field)
        read_only_fields = ['id', 'slug']  # ✅ FIXED: Added 'slug' as read-only


# ------------------------------
# Part Subcategory Serializer
# ------------------------------
class PartSubCategorySerializer(serializers.ModelSerializer):
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    
    class Meta:
        model = PartSubCategory
        fields = ['id', 'part_category', 'part_category_name', 'name', 'slug']
        read_only_fields = ['id', 'slug']  # ✅ FIXED: Added 'slug' as read-only


# ------------------------------
# Illustration File Serializer
# ------------------------------
class IllustrationFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = IllustrationFile
        fields = ['id', 'illustration', 'file', 'uploaded_at']  # ✅ ADDED: 'illustration' field
        read_only_fields = ['id', 'uploaded_at']


# ------------------------------
# Illustration Serializer
# ------------------------------
class IllustrationSerializer(serializers.ModelSerializer):
    files = IllustrationFileSerializer(many=True, read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    engine_model_name = serializers.CharField(source='engine_model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    part_subcategory_name = serializers.CharField(source='part_subcategory.name', read_only=True)
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name', 'engine_model', 'engine_model_name',
            'part_category', 'part_category_name', 'part_subcategory', 
            'part_subcategory_name', 'title', 'description', 'created_at',
            'updated_at',  # ✅ ADDED: 'updated_at' field
            'files', 'uploaded_files'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']  # ✅ ADDED: 'updated_at'
    
    def create(self, validated_data):
        uploaded_files = validated_data.pop('uploaded_files', [])
        illustration = Illustration.objects.create(**validated_data)
        
        for file in uploaded_files:
            IllustrationFile.objects.create(illustration=illustration, file=file)
        
        return illustration


# ------------------------------
# Detailed Serializers (for nested data)
# ------------------------------
class CarModelDetailSerializer(serializers.ModelSerializer):
    manufacturer = ManufacturerSerializer(read_only=True)
    
    class Meta:
        model = CarModel
        fields = ['id', 'manufacturer', 'name', 'slug']


class EngineModelDetailSerializer(serializers.ModelSerializer):
    car_model = CarModelDetailSerializer(read_only=True)
    
    class Meta:
        model = EngineModel
        fields = ['id', 'car_model', 'name', 'slug']


class IllustrationDetailSerializer(serializers.ModelSerializer):
    files = IllustrationFileSerializer(many=True, read_only=True)
    engine_model = EngineModelDetailSerializer(read_only=True)
    part_category = PartCategorySerializer(read_only=True)
    part_subcategory = PartSubCategorySerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Illustration
        fields = [
            'id', 'user', 'user_name', 'engine_model', 'part_category',
            'part_subcategory', 'title', 'description', 'created_at', 
            'updated_at', 'files'  # ✅ ADDED: 'updated_at'
        ]