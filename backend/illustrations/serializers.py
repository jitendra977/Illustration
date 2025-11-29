from rest_framework import serializers
from .models import (
    Manufacturer, CarModel, EngineModel, PartCategory, PartSubCategory,
    Illustration, IllustrationFile
)

# ----------------------------
# File Serializer
# ----------------------------
class IllustrationFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = IllustrationFile
        fields = ['id', 'file', 'uploaded_at']

# ----------------------------
# Illustration Serializer (read)
# ----------------------------
class IllustrationSerializer(serializers.ModelSerializer):
    files = IllustrationFileSerializer(many=True, read_only=True)
    engine_model = serializers.StringRelatedField()
    part_category = serializers.StringRelatedField()
    part_subcategory = serializers.StringRelatedField()

    class Meta:
        model = Illustration
        fields = [
            'id', 'title', 'description',
            'engine_model', 'part_category', 'part_subcategory',
            'files', 'created_at'
        ]

# ----------------------------
# Illustration Create Serializer (write)
# ----------------------------
class IllustrationCreateSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True
    )

    class Meta:
        model = Illustration
        fields = [
            'title', 'description',
            'engine_model', 'part_category', 'part_subcategory', 'files'
        ]

    def create(self, validated_data):
        files = validated_data.pop('files')
        # Logged-in user from context
        user = self.context['request'].user
        illustration = Illustration.objects.create(user=user, **validated_data)

        for f in files:
            IllustrationFile.objects.create(illustration=illustration, file=f)

        return illustration