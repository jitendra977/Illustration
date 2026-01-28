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
    Illustration, IllustrationFile, FavoriteIllustration
)

from .serializers import (
    ManufacturerSerializer, ManufacturerDetailSerializer,
    CarModelSerializer, CarModelDetailSerializer,
    EngineModelSerializer, EngineModelDetailSerializer,
    PartCategorySerializer, PartSubCategorySerializer,
    IllustrationSerializer, IllustrationDetailSerializer,
    IllustrationFileSerializer, FavoriteIllustrationSerializer
)

from .permissions import (
    AdminOrReadOnly,
    AdminOrOwner,
    AuthenticatedAndActive,
    IllustrationPermission,
)

from .pagination import DefaultPagination


# ========================================
# Manufacturer
# ========================================

class ManufacturerViewSet(viewsets.ModelViewSet):
    permission_classes = [AdminOrReadOnly]
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
    permission_classes = [AdminOrReadOnly]
    pagination_class = None
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
    permission_classes = [AdminOrReadOnly]
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
    permission_classes = [AdminOrReadOnly]
    pagination_class = None
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
    permission_classes = [AdminOrReadOnly]
    pagination_class = None
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
    permission_classes = [AuthenticatedAndActive, IllustrationPermission]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'user',
        'factory',
        'engine_model',
        'engine_model__manufacturer',
        'part_category',
        'part_subcategory',
        'applicable_car_models'
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title', 'factory__name', 'user__username', 'is_own_factory']
    ordering = ['-created_at']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Illustration.objects.none()

        user = self.request.user

        # Check if we should include files from query params
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
        ).annotate(
            file_count=Count('files', distinct=True)
        )
        
        # Annotate with own factory status for sorting
        if user and user.is_authenticated:
            user_factories = user.get_active_memberships().values_list('factory_id', flat=True)
            from django.db.models import Case, When, Value, IntegerField
            qs = qs.annotate(
                is_own_factory=Case(
                    When(factory_id__in=user_factories, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            )
        else:
            from django.db.models import Value, IntegerField
            qs = qs.annotate(is_own_factory=Value(0, output_field=IntegerField()))

        # Only prefetch files if explicitly requested or on detail view
        if self.action == 'retrieve' or include_files:
            from django.db.models import Prefetch
            from .models import IllustrationFile
            qs = qs.prefetch_related(
                Prefetch(
                    'files',
                    queryset=IllustrationFile.objects.order_by('uploaded_at')
                )
            )

        if not user.is_authenticated or not user.is_active:
            return qs.none()
            
        if user.is_superuser:
            pass # Superuser sees all
        elif user.is_verified and user.can_view_all_illustrations():
            pass # High-tier verified users (Manager, Admin, Viewer, etc.) see all
        else:
            # Restricted visibility (Contributor or Unverified)
            # 1. Users can always see their own illustrations
            # 2. They can also see any illustration within factories they are members of
            user_factories = user.get_active_memberships().values_list('factory_id', flat=True)
            from django.db.models import Q
            qs = qs.filter(Q(factory_id__in=user_factories) | Q(user=user))

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
        if not active_memberships.exists() and not user.is_superuser:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'factory': 'あなたはどの工場にも割り当てられていません'})
        
        # Default to first active factory if not provided in data
        factory = None
        if 'factory' in self.request.data:
            factory_id = self.request.data['factory']
            from apps.accounts.models import Factory
            try:
                factory = Factory.objects.get(id=factory_id)
            except Factory.DoesNotExist:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'factory': '指定された工場が見つかりません'})

            # Security check: Does user have permission in this SPECIFIC factory?
            if not user.can_create_illustration(factory):
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'factory': '指定された工場でイラストを作成する権限がありません'})
        else:
            first_membership = active_memberships.first()
            if first_membership:
                factory = first_membership.factory
        
        serializer.save(user=user, factory=factory)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return total and own factory illustration counts, plus factories and users"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
            
        from apps.accounts.models import Factory, User
        
        # Get accessible illustrations
        qs = self.get_queryset()
        
        total_count = qs.count()
        
        # Get user's active factories
        active_memberships = user.get_active_memberships()
        user_factories = active_memberships.values_list('factory_id', flat=True)
        own_factory_count = qs.filter(factory_id__in=user_factories).count()
        
        # Total Factories (All factories in the system)
        total_factories = Factory.objects.count()
        
        # Total Users
        if user.is_superuser:
            total_users = User.objects.count()
        else:
            # Users in user's factories
            total_users = User.objects.filter(
                factory_memberships__factory_id__in=user_factories,
                factory_memberships__is_active=True
            ).distinct().count()
            
        res_data = {
            'total_illustrations': total_count,
            'own_factory_illustrations': own_factory_count,
            'total_factories': total_factories,
            'total_users': total_users
        }
        print(f"DEBUG STATS for user {user.email}: {res_data}")
        return Response(res_data)

    @action(detail=True, methods=['post'])
    def add_files(self, request, pk=None):
        illustration = self.get_object()
        
        # Permissions are handled by IllustrationPermission via get_object()
        
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
    
    @action(detail=True, methods=['delete'], url_path='files/(?P<file_id>[^/.]+)')
    def delete_file(self, request, pk=None, file_id=None):
        """Delete a specific file from an illustration"""
        illustration = self.get_object()
        
        # Permissions are handled by IllustrationPermission via get_object()
        
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
    permission_classes = [AuthenticatedAndActive]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['illustration', 'file_type']
    ordering_fields = ['uploaded_at']
    ordering = ['uploaded_at']

    def get_permissions(self):
        """
        Permissions for IllustrationFile actions
        """
        if self.action == 'preview':
            return [AllowAny()]
        return [AuthenticatedAndActive(), IllustrationPermission()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return IllustrationFile.objects.none()

        qs = IllustrationFile.objects.select_related(
            'illustration__user',
            'illustration__factory',
            'illustration__engine_model__manufacturer'
        )
        
        # Allow access to preview for everyone
        if self.action == 'preview':
            return qs

        user = self.request.user
        
        # Base requirements: Must be authenticated and active
        if not user.is_authenticated or not user.is_active:
            return qs.none()
            
        if user.is_verified and (user.is_system_admin() or user.can_view_all_illustrations()):
            return qs
        else:
            # ROLE-BASED FILTERING (Strict ownership for Contributors/Unverified)
            return qs.filter(illustration__user=user)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def preview(self, request, pk=None):
        """Preview file inline in browser"""
        try:
            # We use the full queryset for preview to bypass restrictions
            file_obj = IllustrationFile.objects.get(pk=pk)
            
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
                print(f"❌ Preview error: File does not exist at {file_path}")
                return Response(
                    {
                        'error': 'ファイルがサーバー上に見つかりません',
                        'detail': f'Path not found: {file_path}',
                        'file_id': pk,
                        'illustration_id': file_obj.illustration_id
                    },
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
            except PermissionError as e:
                print(f"❌ Preview error: Permission denied for {file_path}: {str(e)}")
                return Response(
                    {'error': 'ファイルの読み取り権限がありません', 'detail': str(e)},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create response for inline viewing
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
            response['Access-Control-Allow-Origin'] = origin if origin else '*'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Length'
            
            return response
            
        except IllustrationFile.DoesNotExist:
            print(f"❌ Preview error: IllustrationFile with PK {pk} does not exist")
            return Response(
                {'error': 'ファイルレコードが見つかりません', 'pk': pk},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"❌ Preview error: {str(e)}")
            print(f"Full traceback:\n{error_trace}")
            
            return Response(
                {'error': 'プレビュー失敗', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[AuthenticatedAndActive])
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
                print(f"❌ Download error: File does not exist at {file_path}")
                return Response(
                    {
                        'error': 'ファイルがサーバー上に見つかりません',
                        'detail': f'Path not found: {file_path}',
                        'file_id': pk,
                        'illustration_id': file_obj.illustration_id
                    },
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
            from django.conf import settings
            
            if origin in settings.CORS_ALLOWED_ORIGINS:
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


# ========================================
# Favorite Illustrations
# ========================================
class FavoriteIllustrationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user favorites"""
    serializer_class = FavoriteIllustrationSerializer
    permission_classes = [AuthenticatedAndActive]
    pagination_class = DefaultPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return only the current user's favorites that they still have permission to view"""
        if getattr(self, 'swagger_fake_view', False):
            return FavoriteIllustration.objects.none()
        
        user = self.request.user
        if not user.is_authenticated or not user.is_verified:
            return FavoriteIllustration.objects.none()
        
        from django.db.models import Q
        qs = FavoriteIllustration.objects.filter(user=user)
        
        # Unified Visibility Logic for favorites:
        # Only show favorites where the user still has permission to view the illustration
        if not (user.is_verified and user.can_view_all_illustrations()):
            user_factories = user.get_active_memberships().values_list('factory_id', flat=True)
            qs = qs.filter(
                Q(illustration__user=user) |
                Q(illustration__factory_id__in=user_factories) |
                Q(illustration__factory__isnull=True)
            )

        return qs.select_related(
            'illustration__engine_model__manufacturer',
            'illustration__part_category',
            'illustration__part_subcategory',
            'illustration__user',
            'illustration__factory'
        ).prefetch_related(
            'illustration__files',
            'illustration__applicable_car_models'
        ).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Pass the include_files parameter to serializer
        include_files = self.request.query_params.get('include_files', 'false').lower() == 'true'
        context['include_files'] = include_files
        return context

    def perform_create(self, serializer):
        """Auto-set user when creating favorite"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        """Toggle favorite status for an illustration"""
        illustration_id = request.data.get('illustration')
        
        if not illustration_id:
            return Response(
                {'error': 'illustration IDが必要です'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if illustration exists
        try:
            illustration = Illustration.objects.get(id=illustration_id)
            # Check permission
            if not request.user.can_view_illustration(illustration):
                 return Response(
                    {'error': 'イラストが見つかりません'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Illustration.DoesNotExist:
            return Response(
                {'error': 'イラストが見つかりません'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already favorited
        favorite = FavoriteIllustration.objects.filter(
            user=request.user,
            illustration=illustration
        ).first()
        
        if favorite:
            # Remove from favorites
            favorite.delete()
            return Response(
                {
                    'is_favorited': False,
                    'message': 'お気に入りから削除しました'
                },
                status=status.HTTP_200_OK
            )
        else:
            # Add to favorites
            favorite = FavoriteIllustration.objects.create(
                user=request.user,
                illustration=illustration
            )
            return Response(
                {
                    'is_favorited': True,
                    'favorite_id': favorite.id,
                    'message': 'お気に入りに追加しました'
                },
                status=status.HTTP_201_CREATED
            )

    @action(detail=False, methods=['get'], url_path='check')
    def check(self, request):
        """Check if an illustration is favorited"""
        illustration_id = request.query_params.get('illustration_id')
        
        if not illustration_id:
            return Response(
                {'error': 'illustration_idが必要です'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_favorited = FavoriteIllustration.objects.filter(
            user=request.user,
            illustration_id=illustration_id
        ).exists()
        
        favorite = None
        if is_favorited:
            favorite = FavoriteIllustration.objects.get(
                user=request.user,
                illustration_id=illustration_id
            )
        
        return Response({
            'is_favorited': is_favorited,
            'favorite_id': favorite.id if favorite else None
        })