from django.db.models import Count, Prefetch
from django.http import FileResponse, StreamingHttpResponse, Http404

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import os
import mimetypes

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
    IsAuthenticatedAndActive,
    IsVerifiedUser,
    IsVerifiedStaff,
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
                car_model_count=Count('car_models', distinct=True),
                illustration_count=Count('engines__illustrations', distinct=True)
            )
        return qs

    def get_serializer_class(self):
        return ManufacturerDetailSerializer if self.action == 'retrieve' else ManufacturerSerializer


# ========================================
# Engine Models
# ========================================

class EngineModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manufacturer', 'fuel_type']
    search_fields = ['name', 'engine_code', 'manufacturer__name']
    ordering_fields = ['name', 'manufacturer__name']
    ordering = ['manufacturer__name', 'name']

    def get_queryset(self):
        qs = EngineModel.objects.select_related('manufacturer')
        
        # Filter by car_model if provided
        car_model_id = self.request.query_params.get('car_model')
        if car_model_id:
            qs = qs.filter(car_models__id=car_model_id)
        
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
            # Illustration count - Correctly recursive
            from django.db.models import Q, F
            
            # Context-aware filtering
            engine_model_id = self.request.query_params.get('engine_model')
            
            # Base filter for illustrations
            illustration_filter = Q(engines__illustrations__applicable_car_models__isnull=True) | \
                                  Q(engines__illustrations__applicable_car_models=F('id'))
            
            # If engine context provided, only count illustrations from that engine
            if engine_model_id:
                illustration_filter &= Q(engines__illustrations__engine_model_id=engine_model_id)
                # Also filter the cars themselves to only those having this engine (optional but clean)
                qs = qs.filter(engines__id=engine_model_id)
            
            qs = qs.annotate(
                engine_count=Count('engines', distinct=True),
                illustration_count=Count(
                    'engines__illustrations',
                    filter=illustration_filter,
                    distinct=True
                )
            )
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
            # Subcategory count
            qs = qs.annotate(subcategory_count=Count('subcategories', distinct=True))
            
            # Illustration count - Context Aware
            from django.db.models import Q
            
            engine_id = self.request.query_params.get('engine_model')
            car_id = self.request.query_params.get('car_model')
            
            filter_query = Q()
            
            if engine_id:
                filter_query &= Q(illustrations__engine_model_id=engine_id)
                
            if car_id:
                # Logic: Illustration applies if it has NO specific cars OR includes this car
                filter_query &= (
                    Q(illustrations__applicable_car_models__id=car_id) | 
                    Q(illustrations__applicable_car_models__isnull=True)
                )

            qs = qs.annotate(
                 illustration_count=Count(
                     'illustrations', 
                     filter=filter_query, 
                     distinct=True
                 )
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
            # Illustration count - Context Aware
            from django.db.models import Q
            
            engine_id = self.request.query_params.get('engine_model')
            car_id = self.request.query_params.get('car_model')
            
            filter_query = Q()
            
            if engine_id:
                filter_query &= Q(illustrations__engine_model_id=engine_id)
                
            if car_id:
                # Logic: Illustration applies if it has NO specific cars OR includes this car
                filter_query &= (
                    Q(illustrations__applicable_car_models__id=car_id) | 
                    Q(illustrations__applicable_car_models__isnull=True)
                )

            qs = qs.annotate(
                 illustration_count=Count(
                     'illustrations', 
                     filter=filter_query, 
                     distinct=True
                 )
            )
        return qs


# ========================================
# Illustrations - FACTORY BASED ACCESS
# ========================================
class IllustrationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedAndActive]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'factory',
        'engine_model',
        'engine_model__manufacturer',
        'part_category',
        'part_subcategory',
        'applicable_car_models'
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Read (list, retrieve): All authenticated users (read-only for normal users)
        Write (create, update, delete): Staff or superuser only
        """
        if self.action in ['list', 'retrieve']:
            # All authenticated users can view illustrations
            return [IsAuthenticatedAndActive()]
        # Create, update, delete require staff status
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'upload_file', 'delete_file']:
            return [IsVerifiedStaff()]  # Changed from IsVerifiedUser to IsVerifiedStaff
        return [IsAuthenticatedAndActive()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Illustration.objects.none()

        # ⭐ NEW: Check if we should include files from query params
        include_files = self.request.query_params.get('include_files', 'false').lower() == 'true'

        # Base queryset with optimized joins
        qs = Illustration.objects.select_related(
            'user',
            'factory',
            'engine_model',
            'engine_model__manufacturer',
            'part_category',
            'part_subcategory'
        ).prefetch_related(
            'applicable_car_models',
            'applicable_car_models__manufacturer'
        ).annotate(file_count=Count('files', distinct=True))

        # ⭐ NEW: Only prefetch files if explicitly requested or on detail view
        if self.action == 'retrieve' or include_files:
            qs = qs.prefetch_related(
                Prefetch(
                    'files',
                    queryset=IllustrationFile.objects.order_by('uploaded_at')
                )
            )

        user = self.request.user

        # Not authenticated - no access
        if not user.is_authenticated:
            return qs.none()

        # ⭐ NEW: All authenticated users can VIEW all illustrations
        # No factory filtering - everyone sees everything (read-only for normal users)
        # Write permissions are controlled by get_permissions()

        # Apply filtering from query params for navigation hierarchy
        manufacturer_id = self.request.query_params.get('manufacturer')
        engine_id = self.request.query_params.get('engine_model')
        car_model_id = self.request.query_params.get('car_model')
        category_id = self.request.query_params.get('part_category')
        subcategory_id = self.request.query_params.get('part_subcategory')
        factory_id = self.request.query_params.get('factory')

        if manufacturer_id:
            qs = qs.filter(engine_model__manufacturer_id=manufacturer_id)
        if engine_id:
            qs = qs.filter(engine_model_id=engine_id)
        if car_model_id:
            from django.db.models import Q
            qs = qs.filter(
                Q(applicable_car_models__id=car_model_id) |
                Q(applicable_car_models__isnull=True)
            )
        if category_id:
            qs = qs.filter(part_category_id=category_id)
        if subcategory_id:
            qs = qs.filter(part_subcategory_id=subcategory_id)
        if factory_id:
            qs = qs.filter(factory_id=factory_id)

        return qs.distinct()  # Use distinct() when filtering by many-to-many fields


    def get_serializer_class(self):
        return IllustrationDetailSerializer if self.action == 'retrieve' else IllustrationSerializer

    # ⭐ NEW: Add this method to pass include_files to serializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Pass the include_files parameter to serializer
        include_files = self.request.query_params.get('include_files', 'false').lower() == 'true'
        context['include_files'] = include_files or self.action == 'retrieve'
        return context

    def perform_create(self, serializer):
        """Auto-set user and factory when creating"""
        user = self.request.user
        
        # Ensure user has at least one active factory
        active_memberships = user.get_active_memberships()
        if not active_memberships.exists() and not user.is_staff:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'factory': 'あなたはどの工場にも割り当てられていません'})
        
        # Default to first active factory if not provided in data
        factory = None
        if 'factory' in self.request.data:
            factory_id = self.request.data['factory']
            # Security check: Does user belong to this factory?
            if not active_memberships.filter(factory_id=factory_id).exists() and not user.is_staff:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'factory': '指定された工場へのアクセス権がありません'})
            from apps.accounts.models import Factory
            factory = Factory.objects.get(id=factory_id)
        else:
            first_membership = active_memberships.first()
            if first_membership:
                factory = first_membership.factory
        
        serializer.save(user=user, factory=factory)

    @action(detail=True, methods=['post'], permission_classes=[IsVerifiedUser])
    def add_files(self, request, pk=None):
        illustration = self.get_object()
        
        # Check permission: use the helper method on User model
        if not request.user.can_edit_illustration(illustration) and not request.user.is_staff:
            return Response(
                {'error': 'このイラストレーションへのアクセス権がありません'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        files = request.FILES.getlist('files')

        if not files:
            return Response({'error': 'ファイルが提供されていません'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for file in files:
            if not file.name.lower().endswith('.pdf'):
                return Response(
                    {'error': 'PDFファイルのみ許可されています'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            obj = IllustrationFile.objects.create(
                illustration=illustration,
                file=file
            )
            created.append(IllustrationFileSerializer(obj).data)

        return Response(
            {'message': f'{len(created)}個のファイルがアップロードされました', 'files': created},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'], url_path='files/(?P<file_id>[^/.]+)', permission_classes=[IsVerifiedUser])
    def delete_file(self, request, pk=None, file_id=None):
        """Delete a specific file from an illustration"""
        illustration = self.get_object()
        
        # Check permission: use the helper method on User model
        if not request.user.can_edit_illustration(illustration) and not request.user.is_staff:
            return Response(
                {'error': 'このイラストレーションへのアクセス権がありません'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            file = IllustrationFile.objects.get(id=file_id, illustration=illustration)
            file.delete()
            return Response(
                {'message': 'ファイルが削除されました'},
                status=status.HTTP_204_NO_CONTENT
            )
        except IllustrationFile.DoesNotExist:
            return Response(
                {'error': 'ファイルが見つかりません'},
                status=status.HTTP_404_NOT_FOUND
            )
# ========================================
# Illustration Files - FACTORY BASED ACCESS
# ========================================
class IllustrationFileViewSet(viewsets.ModelViewSet):
    serializer_class = IllustrationFileSerializer
    permission_classes = [IsAuthenticatedAndActive]  # Always require auth
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['illustration', 'file_type']
    ordering_fields = ['uploaded_at']
    ordering = ['uploaded_at']

    def get_permissions(self):
        """
        All actions require authentication
        But write operations also require verification
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsVerifiedUser()]
        return [IsAuthenticatedAndActive()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()

        qs = IllustrationFile.objects.select_related(
            'illustration__user',
            'illustration__factory',
            'illustration__engine_model__manufacturer'
        )

        user = self.request.user

        # Not authenticated - no access
        if not user.is_authenticated:
            return qs.none()
        
        # Staff can see all files
        if user.is_staff:
            return qs

        # Regular users: only their factories' files
        user_factories = user.get_factories()
        if user_factories.exists():
            return qs.filter(illustration__factory__in=user_factories)
        
        # No factory assigned - no access
        return qs.none()

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def preview(self, request, pk=None):
        """Preview file inline in browser"""
        try:
            # get_object() will automatically apply queryset filtering
            file_obj = self.get_object()
            
            if not file_obj.file:
                return Response(
                    {'error': 'ファイルが関連付けられていません'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get file path
            try:
                file_path = file_obj.file.path
            except NotImplementedError:
                return Response(
                    {'preview_url': file_obj.file.url},
                    status=status.HTTP_200_OK
                )
            
            # Check if file exists
            if not os.path.exists(file_path):
                return Response(
                    {'error': 'ファイルが見つかりません'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get original filename
            original_name = os.path.basename(file_obj.file.name)
            
            # Detect MIME type
            content_type, _ = mimetypes.guess_type(original_name)
            if not content_type:
                content_type = 'application/pdf'
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Open file
            try:
                file_handle = open(file_path, 'rb')
            except PermissionError:
                return Response(
                    {'error': 'ファイルの読み取り権限がありません'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create response for inline viewing
            if file_size > 10 * 1024 * 1024:  # 10MB
                response = StreamingHttpResponse(
                    file_handle,
                    content_type=content_type
                )
            else:
                response = FileResponse(
                    file_handle,
                    content_type=content_type
                )
            
            # Set inline disposition
            response['Content-Disposition'] = f'inline; filename="{original_name}"'
            response['Content-Length'] = file_size
            response['X-Content-Type-Options'] = 'nosniff'
            
            # CORS headers
            origin = request.META.get('HTTP_ORIGIN', '')
            allowed_origins = ['https://yaw.nishanaweb.cloud', 'https://api.yaw.nishanaweb.cloud']
            
            if origin in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Length'
            
            return response
            
        except IllustrationFile.DoesNotExist:
            return Response(
                {'error': 'ファイルが見つかりません（アクセス権がないか存在しません）'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Preview error: {str(e)}")
            print(f"Full traceback:\n{error_trace}")
            
            return Response(
                {'error': 'プレビュー失敗', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def download(self, request, pk=None):
        """Download file"""
        try:
            # get_object() will automatically apply queryset filtering
            file_obj = self.get_object()
            
            if not file_obj.file:
                return Response(
                    {'error': 'ファイルが関連付けられていません'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get file path
            try:
                file_path = file_obj.file.path
            except NotImplementedError:
                return Response(
                    {'download_url': file_obj.file.url},
                    status=status.HTTP_200_OK
                )
            
            # Check if file exists
            if not os.path.exists(file_path):
                return Response(
                    {'error': f'ファイルが見つかりません'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create safe filename
            safe_title = "".join(
                c for c in file_obj.illustration.title 
                if c.isalnum() or c in (' ', '-', '_', '.')
            ).strip()
            safe_title = safe_title.replace(' ', '_')[:50]
            
            # Get extension
            _, ext = os.path.splitext(file_obj.file.name)
            if not ext:
                ext = '.pdf'
            
            download_filename = f"{safe_title}{ext}"
            
            # Detect MIME type
            content_type, _ = mimetypes.guess_type(download_filename)
            if not content_type:
                content_type = 'application/pdf'
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Open file
            try:
                file_handle = open(file_path, 'rb')
            except PermissionError:
                return Response(
                    {'error': 'ファイルの読み取り権限がありません'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Use StreamingHttpResponse for large files
            if file_size > 10 * 1024 * 1024:  # 10MB
                response = StreamingHttpResponse(
                    file_handle,
                    content_type=content_type
                )
            else:
                response = FileResponse(
                    file_handle,
                    content_type=content_type
                )
            
            # Set download headers
            response['Content-Disposition'] = f'attachment; filename="{download_filename}"'
            response['Content-Length'] = file_size
            response['X-Content-Type-Options'] = 'nosniff'
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            # CORS headers
            origin = request.META.get('HTTP_ORIGIN', '')
            allowed_origins = ['https://yaw.nishanaweb.cloud', 'https://api.yaw.nishanaweb.cloud']
            
            if origin in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Length'
            
            return response
            
        except IllustrationFile.DoesNotExist:
            return Response(
                {'error': 'ファイルが見つかりません（アクセス権がないか存在しません）'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"Download error: {str(e)}")
            print(f"Full traceback:\n{error_trace}")
            
            return Response(
                {'error': 'ダウンロード失敗', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )