# views.py - FIXED FOR INDEPENDENT CATEGORIES

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .models import (
    Manufacturer, CarModel, EngineModel,
    PartCategory, PartSubCategory,
    Illustration, IllustrationFile
)
from .serializers import (
    ManufacturerSerializer, ManufacturerDetailSerializer,
    CarModelSerializer, CarModelDetailSerializer,
    EngineModelSerializer, EngineModelDetailSerializer,
    PartCategorySerializer, PartSubCategorySerializer,
    IllustrationSerializer, IllustrationDetailSerializer,
    IllustrationFileSerializer
)
from .permissions import (
    IsAdminOrReadOnly,
    IsAdminOrOwner,
)


# ========================================
# ManufacturerViewSet
# ========================================

class ManufacturerViewSet(viewsets.ModelViewSet):
    """
    Manufacturers - Vehicle manufacturers (Hino, Isuzu, etc.)
    
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['slug', 'name']
    ordering_fields = ['name']
    ordering = ['name']

    
    def get_queryset(self):
        return Manufacturer.objects.annotate(
            engine_count=Count('engines', distinct=True),
            car_model_count=Count('car_models', distinct=True)
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ManufacturerDetailSerializer
        return ManufacturerSerializer


class EngineModelViewSet(viewsets.ModelViewSet):
    """
    Engine Models - Engine specifications (A09C, 6HK1, etc.)
    
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'fuel_type']
    search_fields = ['name', 'engine_code', 'manufacturer__name']
    ordering_fields = ['name', 'manufacturer__name']
    ordering = ['manufacturer__name', 'name']
    lookup_field = 'slug'
    
    def get_queryset(self):
        return EngineModel.objects.select_related('manufacturer').annotate(
            car_model_count=Count('car_models', distinct=True),
            illustration_count=Count('illustrations', distinct=True)
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EngineModelDetailSerializer
        return EngineModelSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def fuel_types(self, request):
        """Get all available fuel type choices - Public endpoint"""
        fuel_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in EngineModel.FUEL_TYPES
        ]
        return Response(fuel_types)


class CarModelViewSet(viewsets.ModelViewSet):
    """
    Car Models - Vehicle models (Profia, Ranger, etc.)
    
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'vehicle_type']
    search_fields = ['name', 'manufacturer__name', 'model_code', 'chassis_code']
    ordering_fields = ['name', 'manufacturer__name', 'year_from']
    ordering = ['manufacturer__name', 'name']
    lookup_field = 'slug'
    
    def get_queryset(self):
        return CarModel.objects.select_related('manufacturer').prefetch_related('engines').annotate(
            engine_count=Count('engines', distinct=True)
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CarModelDetailSerializer
        return CarModelSerializer
    
    def get_permissions(self):
        """Override permissions for public endpoints"""
        if self.action in ['vehicle_types']:
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def vehicle_types(self, request):
        """Get all available vehicle type choices - Public endpoint"""
        vehicle_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in CarModel.VEHICLE_TYPES
        ]
        return Response(vehicle_types)

# ========================================
# PART CATEGORIES VIEWSET (FIXED)
# ========================================
class PartCategoryViewSet(viewsets.ModelViewSet):
    """
    Part Categories - Universal part categories (Engine Components, Cooling System, etc.)
    """
    serializer_class = PartCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'slug']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']
    
    def get_queryset(self):  # ✅ Fixed indentation
        return PartCategory.objects.annotate(
            subcategory_count=Count('subcategories', distinct=True),
            illustration_count=Count('illustrations', distinct=True)
        )

class PartSubCategoryViewSet(viewsets.ModelViewSet):
    """
    Part Subcategories - Specific part types (Pistons, Turbo, etc.)
    """
    serializer_class = PartSubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['part_category']
    search_fields = ['name', 'description', 'part_category__name']
    ordering_fields = ['order', 'name', 'part_category__order']
    ordering = ['part_category__order', 'order', 'name']
    
    def get_queryset(self):  # ✅ Fixed indentation
        return PartSubCategory.objects.select_related('part_category').annotate(
            illustration_count=Count('illustrations', distinct=True)
        )


# ========================================
# USER-OWNED DATA (Admin sees all, Users see own)
# ========================================

class IllustrationViewSet(viewsets.ModelViewSet):
    """
    Illustrations - User-uploaded part illustrations/diagrams
    
    Illustrations link:
    - Engine Model (which engine)
    - Part Category (universal category like "Engine Components")
    - Part Subcategory (specific part like "Pistons")
    
    Permissions:
    - Verified Staff: Can see and manage ALL illustrations from ALL users
    - Verified Users: Can see and manage only THEIR OWN illustrations
    - Unverified/Anonymous: No access
    """
    permission_classes = [IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'engine_model',
        'engine_model__manufacturer',
        'part_category',
        'part_subcategory',
        'applicable_car_models'
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return illustrations based on user role"""
        if getattr(self, 'swagger_fake_view', False):
            return Illustration.objects.none()
        
        queryset = Illustration.objects.select_related(
            'user',
            'engine_model__manufacturer',
            'part_category',
            'part_subcategory__part_category'
        ).prefetch_related(
            'files',
            'applicable_car_models__manufacturer'
        ).annotate(
            file_count=Count('files', distinct=True)
        )
        
        # ✅ Verified staff can see ALL illustrations
        if (self.request.user.is_authenticated and 
            self.request.user.is_active and
            self.request.user.is_staff and 
            self.request.user.is_verified):
            return queryset
        
        # ✅ Regular users see only their own illustrations
        if self.request.user and self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        
        return queryset.none()
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return IllustrationDetailSerializer
        return IllustrationSerializer
    
    def perform_create(self, serializer):
        """Automatically set user when creating illustration"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_files(self, request, pk=None):
        """Add additional files to an existing illustration"""
        illustration = self.get_object()
        files = request.FILES.getlist('files')
        
        if not files:
            return Response(
                {'error': 'No files provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_files = []
        for file in files:
            illustration_file = IllustrationFile.objects.create(
                illustration=illustration,
                file=file
            )
            created_files.append(IllustrationFileSerializer(illustration_file).data)
        
        return Response({
            'message': f'{len(created_files)} file(s) uploaded successfully',
            'files': created_files
        }, status=status.HTTP_201_CREATED)


class IllustrationFileViewSet(viewsets.ModelViewSet):
    """
    Illustration Files - Individual files attached to illustrations
    
    Permissions:
    - Verified Staff: Can see and manage ALL files from ALL users
    - Verified Users: Can see and manage only files from THEIR OWN illustrations
    - Unverified/Anonymous: No access
    """
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['illustration', 'file_type']
    ordering_fields = ['uploaded_at']
    ordering = ['uploaded_at']
    
    def get_queryset(self):
        """Return files based on user role"""
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()
        
        queryset = IllustrationFile.objects.select_related(
            'illustration__user',
            'illustration__engine_model__manufacturer'
        )
        
        # ✅ Verified staff can see ALL files
        if (self.request.user.is_authenticated and 
            self.request.user.is_active and
            self.request.user.is_staff and 
            self.request.user.is_verified):
            return queryset
        
        # ✅ Regular users see only files from their own illustrations
        if self.request.user and self.request.user.is_authenticated:
            return queryset.filter(illustration__user=self.request.user)
        
        return queryset.none()