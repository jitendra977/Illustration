# views.py - WITH CORRECT PERMISSIONS APPLIED

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Manufacturer, CarModel, EngineModel,
    PartCategory, PartSubCategory,
    Illustration, IllustrationFile
)
from .serializers import (
    ManufacturerSerializer, CarModelSerializer, EngineModelSerializer,
    PartCategorySerializer, PartSubCategorySerializer,
    IllustrationSerializer, IllustrationDetailSerializer,
    IllustrationFileSerializer
)
from .permissions import (
    IsAdminOrReadOnly,
    IsAdminOrOwner,
    IsOwnerAndVerified,
)


# ========================================
# CATALOG DATA (Public Read, Admin Write)
# ========================================

class ManufacturerViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country']
    ordering_fields = ['name', 'country']
    lookup_field = 'slug'


class CarModelViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    - vehicle_types/fuel_types: Public (no auth required)
    """
    queryset = CarModel.objects.select_related('manufacturer').all()
    serializer_class = CarModelSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'vehicle_type', 'fuel_type']
    search_fields = ['name', 'manufacturer__name', 'model_code']
    ordering_fields = ['name', 'year']
    
    def get_permissions(self):
        """Override permissions for public endpoints"""
        if self.action in ['vehicle_types', 'fuel_types']:
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
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def fuel_types(self, request):
        """Get all available fuel type choices - Public endpoint"""
        fuel_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in CarModel.FUEL_TYPES
        ]
        return Response(fuel_types)


class EngineModelViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    queryset = EngineModel.objects.select_related('car_model__manufacturer').all()
    serializer_class = EngineModelSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['car_model', 'car_model__manufacturer']
    search_fields = ['name', 'engine_code', 'car_model__name']
    ordering_fields = ['name']
    lookup_field = 'slug'


class PartCategoryViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    queryset = PartCategory.objects.all()
    serializer_class = PartCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


class PartSubCategoryViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Read: Anyone (including anonymous users)
    - Write: Verified staff only
    """
    queryset = PartSubCategory.objects.select_related('part_category').all()
    serializer_class = PartSubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['part_category']
    search_fields = ['name']
    ordering_fields = ['part_category', 'name']
    ordering = ['part_category', 'name']


# ========================================
# USER-OWNED DATA (Admin sees all, Users see own)
# ========================================

class IllustrationViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Verified Staff: Can see and manage ALL illustrations from ALL users
    - Verified Users: Can see and manage only THEIR OWN illustrations
    - Unverified/Anonymous: No access
    """
    permission_classes = [IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['engine_model', 'part_category', 'part_subcategory']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return illustrations based on user role"""
        if getattr(self, 'swagger_fake_view', False):
            return Illustration.objects.none()
        
        queryset = Illustration.objects.select_related(
            'user', 'engine_model__car_model__manufacturer',
            'part_category', 'part_subcategory'
        ).prefetch_related('files')
        
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
        """Use detailed serializer for list/retrieve actions"""
        if self.action in ['list', 'retrieve']:
            return IllustrationDetailSerializer
        return IllustrationSerializer
    
    def perform_create(self, serializer):
        """Automatically set user when creating illustration"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment view count for illustration"""
        illustration = self.get_object()
        return Response(
            {'message': 'View count feature not implemented'}, 
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class IllustrationFileViewSet(viewsets.ModelViewSet):
    """
    Permissions:
    - Verified Staff: Can see and manage ALL files from ALL users
    - Verified Users: Can see and manage only files from THEIR OWN illustrations
    - Unverified/Anonymous: No access
    """
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['illustration']
    ordering_fields = ['uploaded_at']
    ordering = ['uploaded_at']
    
    def get_queryset(self):
        """Return files based on user role"""
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()
        
        queryset = IllustrationFile.objects.select_related('illustration')
        
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
    
    @action(detail=True, methods=['patch'])
    def reorder(self, request, pk=None):
        """Update file order"""
        return Response(
            {'error': 'Order field does not exist in IllustrationFile model'}, 
            status=status.HTTP_501_NOT_IMPLEMENTED
        )