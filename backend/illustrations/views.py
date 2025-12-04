from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, BasePermission
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


# ------------------------------
# Custom Permission
# ------------------------------
class IsVerifiedUser(BasePermission):
    """
    Custom permission to only allow verified users to access the view.
    Works with your existing User model that has is_verified field.
    """
    def has_permission(self, request, view):
        # For schema generation (Swagger), bypass the check
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is verified (your User model has is_verified field)
        return request.user.is_verified
    
    message = 'You must verify your email address before performing this action.'


class IsVerifiedUserOrReadOnly(BasePermission):
    """
    Custom permission to allow verified users full access,
    and read-only access to everyone else.
    """
    def has_permission(self, request, view):
        # For schema generation (Swagger), bypass the check
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        # Read permissions are allowed to any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for verified users
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_verified
    
    message = 'You must verify your email address before performing this action.'


# ------------------------------
# Manufacturer Views
# ------------------------------
class ManufacturerListCreateAPIView(generics.ListCreateAPIView):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country']
    ordering_fields = ['name', 'country']


class ManufacturerRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    lookup_field = 'slug'


# ------------------------------
# Car Model Views
# ------------------------------
class CarModelListCreateAPIView(generics.ListCreateAPIView):
    queryset = CarModel.objects.select_related('manufacturer').all()
    serializer_class = CarModelSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer']
    search_fields = ['name', 'manufacturer__name']
    ordering_fields = ['name']


class CarModelRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CarModel.objects.select_related('manufacturer').all()
    serializer_class = CarModelSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    lookup_field = 'slug'


# ------------------------------
# Engine Model Views
# ------------------------------
class EngineModelListCreateAPIView(generics.ListCreateAPIView):
    queryset = EngineModel.objects.select_related('car_model__manufacturer').all()
    serializer_class = EngineModelSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['car_model', 'car_model__manufacturer']
    search_fields = ['name', 'car_model__name']
    ordering_fields = ['name']


class EngineModelRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EngineModel.objects.select_related('car_model__manufacturer').all()
    serializer_class = EngineModelSerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    lookup_field = 'slug'


# ------------------------------
# Part Category Views
# ------------------------------
class PartCategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = PartCategory.objects.select_related('engine_model').all()
    serializer_class = PartCategorySerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['engine_model']
    search_fields = ['name']
    ordering_fields = ['name']


class PartCategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PartCategory.objects.select_related('engine_model').all()
    serializer_class = PartCategorySerializer
    permission_classes = [IsVerifiedUserOrReadOnly]


# ------------------------------
# Part Subcategory Views
# ------------------------------
class PartSubCategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = PartSubCategory.objects.select_related('part_category').all()
    serializer_class = PartSubCategorySerializer
    permission_classes = [IsVerifiedUserOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['part_category']
    search_fields = ['name']
    ordering_fields = ['name']


class PartSubCategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PartSubCategory.objects.select_related('part_category').all()
    serializer_class = PartSubCategorySerializer
    permission_classes = [IsVerifiedUserOrReadOnly]


# ------------------------------
# Illustration Views
# ------------------------------
class IllustrationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Illustration.objects.select_related(
        'user', 'engine_model', 'part_category', 'part_subcategory'
    ).prefetch_related('files').all()
    permission_classes = [IsVerifiedUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['engine_model', 'part_category', 'part_subcategory', 'user']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return IllustrationDetailSerializer
        return IllustrationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IllustrationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Illustration.objects.select_related(
        'user', 'engine_model', 'part_category', 'part_subcategory'
    ).prefetch_related('files').all()
    serializer_class = IllustrationDetailSerializer
    permission_classes = [IsVerifiedUser]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return IllustrationSerializer
        return IllustrationDetailSerializer


# ------------------------------
# Illustration File Views
# ------------------------------
class IllustrationFileListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsVerifiedUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['illustration']
    
    def get_queryset(self):
        # Fix for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()
        
        # Only return files for illustrations created by the current user
        if self.request.user and self.request.user.is_authenticated:
            return IllustrationFile.objects.filter(
                illustration__user=self.request.user
            )
        return IllustrationFile.objects.none()


class IllustrationFileDestroyAPIView(generics.DestroyAPIView):
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsVerifiedUser]
    
    def get_queryset(self):
        # Fix for Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()
        
        # Only allow deletion of files from illustrations created by the current user
        if self.request.user and self.request.user.is_authenticated:
            return IllustrationFile.objects.filter(
                illustration__user=self.request.user
            )
        return IllustrationFile.objects.none()