from django.db.models import Count, Prefetch
from django.http import FileResponse

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import os
import mimetypes
from django.http import FileResponse, Http404
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response


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

from .pagination import DefaultPagination


# ========================================
# Manufacturer
# ========================================

class ManufacturerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['slug', 'name']
    ordering_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        qs = Manufacturer.objects.all()
        if self.action == 'list':
            qs = qs.annotate(
                engine_count=Count('engines', distinct=True),
                car_model_count=Count('car_models', distinct=True)
            )
        return qs

    def get_serializer_class(self):
        return ManufacturerDetailSerializer if self.action == 'retrieve' else ManufacturerSerializer


# ========================================
# Engine Models
# ========================================

class EngineModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'fuel_type']
    search_fields = ['name', 'engine_code', 'manufacturer__name']
    ordering_fields = ['name', 'manufacturer__name']
    ordering = ['manufacturer__name', 'name']

    def get_queryset(self):
        qs = EngineModel.objects.select_related('manufacturer')
        if self.action == 'list':
            qs = qs.annotate(
                car_model_count=Count('car_models', distinct=True),
                illustration_count=Count('illustrations', distinct=True)
            )
        return qs

    def get_serializer_class(self):
        return EngineModelDetailSerializer if self.action == 'retrieve' else EngineModelSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def fuel_types(self, request):
        return Response([
            {'value': v, 'label': l}
            for v, l in EngineModel.FUEL_TYPES
        ])


# ========================================
# Car Models
# ========================================

class CarModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'vehicle_type']
    search_fields = ['name', 'manufacturer__name', 'model_code', 'chassis_code']
    ordering_fields = ['name', 'manufacturer__name', 'year_from']
    ordering = ['manufacturer__name', 'name']
    lookup_field = 'slug'

    def get_queryset(self):
        qs = CarModel.objects.select_related('manufacturer').prefetch_related('engines')
        if self.action == 'list':
            qs = qs.annotate(engine_count=Count('engines', distinct=True))
        return qs

    def get_serializer_class(self):
        return CarModelDetailSerializer if self.action == 'retrieve' else CarModelSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def vehicle_types(self, request):
        return Response([
            {'value': v, 'label': l}
            for v, l in CarModel.VEHICLE_TYPES
        ])


# ========================================
# Part Categories
# ========================================

class PartCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = PartCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'slug']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']

    def get_queryset(self):
        qs = PartCategory.objects.all()
        if self.action == 'list':
            qs = qs.annotate(
                subcategory_count=Count('subcategories', distinct=True),
                illustration_count=Count('illustrations', distinct=True)
            )
        return qs


class PartSubCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = PartSubCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['part_category']
    search_fields = ['name', 'description', 'part_category__name']
    ordering_fields = ['order', 'name']
    ordering = ['order', 'name']

    def get_queryset(self):
        qs = PartSubCategory.objects.select_related('part_category')
        if self.action == 'list':
            qs = qs.annotate(illustration_count=Count('illustrations', distinct=True))
        return qs


# ========================================
# Illustrations
# ========================================

class IllustrationViewSet(viewsets.ModelViewSet):
    pagination_class = DefaultPagination
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
        if getattr(self, 'swagger_fake_view', False):
            return Illustration.objects.none()

        qs = Illustration.objects.select_related(
            'user',
            'engine_model__manufacturer',
            'part_category',
            'part_subcategory__part_category'
        ).prefetch_related(
            Prefetch(
                'files',
                queryset=IllustrationFile.objects.only('id', 'file', 'file_type')
            ),
            'applicable_car_models__manufacturer'
        ).annotate(file_count=Count('files', distinct=True))

        if (
            self.request.user.is_authenticated and
            self.request.user.is_staff and
            self.request.user.is_verified
        ):
            return qs

        if self.request.user.is_authenticated:
            return qs.filter(user=self.request.user)

        return qs.none()

    def get_serializer_class(self):
        return IllustrationDetailSerializer if self.action == 'retrieve' else IllustrationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_files(self, request, pk=None):
        illustration = self.get_object()
        files = request.FILES.getlist('files')

        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for file in files:
            if not file.name.lower().endswith('.pdf'):
                return Response(
                    {'error': 'Only PDF files allowed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            obj = IllustrationFile.objects.create(
                illustration=illustration,
                file=file
            )
            created.append(IllustrationFileSerializer(obj).data)

        return Response(
            {'message': f'{len(created)} file(s) uploaded', 'files': created},
            status=status.HTTP_201_CREATED
        )


# ========================================
# Illustration Files
# ========================================
class IllustrationFileViewSet(viewsets.ModelViewSet):
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsAdminOrOwner]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['illustration', 'file_type']
    ordering_fields = ['uploaded_at']
    ordering = ['uploaded_at']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()

        qs = IllustrationFile.objects.select_related(
            'illustration__user',
            'illustration__engine_model__manufacturer'
        )

        if (
            self.request.user.is_authenticated and
            self.request.user.is_staff and
            self.request.user.is_verified
        ):
            return qs

        if self.request.user.is_authenticated:
            return qs.filter(illustration__user=self.request.user)

        return qs.none()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        try:
            file_obj = self.get_object()
            
            # Debug logging
            print(f"File object: {file_obj}")
            print(f"File field: {file_obj.file}")
            print(f"File name: {file_obj.file.name}")
            
            # Check if file exists
            if not file_obj.file:
                return Response(
                    {'error': 'ファイルが関連付けられていません'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get file path - handle both local and cloud storage
            try:
                file_path = file_obj.file.path
                print(f"File path: {file_path}")
                print(f"File exists: {os.path.exists(file_path)}")
            except NotImplementedError:
                # If using cloud storage (S3, etc.), path won't work
                # Just use the file URL directly
                print("Using cloud storage, redirecting to file URL")
                return Response(
                    {'download_url': file_obj.file.url},
                    status=status.HTTP_200_OK
                )
            
            # Check if file exists on disk
            if not os.path.exists(file_path):
                return Response(
                    {'error': f'ファイルが見つかりません: {file_obj.file.name}'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract filename
            original_name = os.path.basename(file_obj.file.name)
            
            # Create readable filename
            safe_title = "".join(
                c for c in file_obj.illustration.title 
                if c.isalnum() or c in (' ', '-', '_', '.')
            ).strip()
            safe_title = safe_title.replace(' ', '_')[:50]  # Limit length
            
            # Get extension
            _, ext = os.path.splitext(original_name)
            download_filename = f"{safe_title}{ext}"
            
            print(f"Download filename: {download_filename}")
            
            # Detect MIME type
            content_type, _ = mimetypes.guess_type(download_filename)
            if not content_type:
                content_type = 'application/octet-stream'
            
            print(f"Content type: {content_type}")
            
            # Open and serve the file
            try:
                file_handle = open(file_path, 'rb')
            except PermissionError:
                return Response(
                    {'error': 'ファイルの読み取り権限がありません'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            response = FileResponse(
                file_handle,
                as_attachment=True,
                filename=download_filename,
                content_type=content_type
            )
            
            response['Content-Disposition'] = f'attachment; filename="{download_filename}"'
            
            try:
                response['Content-Length'] = os.path.getsize(file_path)
            except OSError:
                pass  # Skip if can't get file size
            
            print("Download response created successfully")
            return response
            
        except IllustrationFile.DoesNotExist:
            return Response(
                {'error': 'ファイルが見つかりません'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Log the full error
            import traceback
            error_trace = traceback.format_exc()
            print(f"Download error: {str(e)}")
            print(f"Full traceback:\n{error_trace}")
            
            return Response(
                {'error': 'ダウンロード失敗', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )