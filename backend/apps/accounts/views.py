# views.py
from functools import wraps
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
import uuid

from .models import User, Factory, Role, FactoryMember, Comment, ActivityLog
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    EmailVerificationSerializer,
    AdminUserSerializer,
    FactorySerializer,
    RoleSerializer,
    FactoryMemberSerializer,
    CommentSerializer,
    ActivityLogSerializer
)

from .permissions import IsSuperAdmin, IsFactoryManager, CanManageUsers, CanManageFactory, CanManageRoles, CanManageFeedback
from .utils.activity_logger import log_activity


def user_permission_required(action_type=None):
    """
    Custom decorator for role-based user permissions.
    
    Permissions hierarchy:
    - Superuser: Full access to all actions
    - Staff: Can list, create, update but cannot delete users
    - Active User: Can only access own profile and change password
    """
    
    def decorator(func):
        @wraps(func)
        def wrapper(viewset, request, *args, **kwargs):
            user = request.user

            if not user.is_authenticated:
                return Response(
                    {"detail": "Authentication required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Permission checks
            if user.is_superuser:
                return func(viewset, request, *args, **kwargs)
            
            if user.is_active and user.can_manage_users():
                if action_type == 'delete':
                    return Response(
                        {"detail": "User deletion is restricted to Super Admins"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                return func(viewset, request, *args, **kwargs)
            
            if user.is_active:
                allowed_actions = ['profile', 'update_self', 'change_password', 'resend_verification']
                if action_type in allowed_actions:
                    return func(viewset, request, *args, **kwargs)
            
            return Response(
                {"detail": "Insufficient permissions"}, 
                status=status.HTTP_403_FORBIDDEN
            )

        return wrapper
    return decorator


class CustomTokenObtainPairView(APIView):
    """
    Custom JWT token obtain view with enhanced authentication.
    Supports login with either username or email.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Handle POST request for token generation"""
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            
            # Log successful login
            log_activity(
                request=request,
                user=user,
                action='LOGIN',
                model_name='User',
                object_id=user.id,
                object_repr=user.username,
                description=f"User {user.username} logged in successfully"
            )
            
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'detail': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserViewSet(viewsets.ModelViewSet):
    """
    User management viewset with role-based permissions.
    
    Supports:
    - User registration (public)
    - Profile management (authenticated users)
    - Password change (authenticated users)
    - Admin user management (staff/superusers)
    - Email verification system
    """
    
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.is_active or not user.is_verified:
            return User.objects.none()
            
        if user.is_superuser:
            return User.objects.all().order_by('-created_at')
            
        # For non-superusers, only show users in factories they can manage
        # and EXPLICITLY HIDE superusers
        manageable_factories = user.get_factories_with_permission('can_manage_users')
        return User.objects.filter(
            factory_memberships__factory__in=manageable_factories,
            factory_memberships__is_active=True,
            is_superuser=False
        ).distinct().order_by('-created_at')

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        serializer_map = {
            'register': RegisterSerializer,
            'update': UpdateUserSerializer,
            'partial_update': UpdateUserSerializer,
            'change_password': ChangePasswordSerializer,
            'profile': UpdateUserSerializer if self.request.method == 'PUT' else UserSerializer,
            'verify_email': EmailVerificationSerializer,
            'resend_verification': serializers.Serializer,  # No data needed for resend
            'logout': serializers.Serializer,
        }
        
        # Use AdminUserSerializer for those who can manage users
        if self.request.user and (self.request.user.is_superuser or self.request.user.can_manage_users()):
            return AdminUserSerializer
            
        return serializer_map.get(self.action, UserSerializer)

    @user_permission_required(action_type='list')
    def list(self, request, *args, **kwargs):
        """List users with permission-based filtering."""
        return super().list(request, *args, **kwargs)

    @user_permission_required(action_type='retrieve')
    def retrieve(self, request, *args, **kwargs):
        """Retrieve user details."""
        return super().retrieve(request, *args, **kwargs)

    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[permissions.AllowAny]
    )
    def register(self, request):
        """
        Register a new user account.
        
        Required fields: username, email, password, password_confirm
        Optional fields: first_name, last_name, phone_number, profile_image
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        user_data = UserSerializer(user).data
        
        # Log successful registration
        log_activity(
            request=request,
            user=user,
            action='CREATE',
            model_name='User',
            object_id=user.id,
            object_repr=user.username,
            description=f"New user registered: {user.username}"
        )
        
        return Response({
            'user': user_data,
            'message': 'Registration successful! Please check your email to verify your account.',
            'detail': 'Verification email sent successfully.'
        }, status=status.HTTP_201_CREATED)

    @user_permission_required(action_type='profile')
    @action(
        detail=False, 
        methods=['get', 'put'], 
        permission_classes=[permissions.IsAuthenticated]
    )
    def profile(self, request):
        """
        Get or update current user's profile.
        
        GET: Returns current user profile
        PUT: Updates current user profile
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Log profile update
        log_activity(
            request=request,
            user=request.user,
            action='UPDATE',
            model_name='User',
            object_id=request.user.id,
            object_repr=request.user.username,
            description=f"User {request.user.username} updated their profile"
        )

        return Response(UserSerializer(request.user).data)

    
    @user_permission_required(action_type='change_password')
    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[permissions.IsAuthenticated]
    )
    def change_password(self, request):
        """
        Change authenticated user's password.
        
        Required fields: old_password, new_password, confirm_password
        Validation: 
        - Old password must be correct
        - New passwords must match
        - New password minimum length: 8 characters
        """
        serializer = ChangePasswordSerializer(
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Log password change
        log_activity(
            request=request,
            user=user,
            action='UPDATE',
            model_name='User',
            object_id=user.id,
            object_repr=user.username,
            description=f"User {user.username} changed their password"
        )

        return Response({
            'message': 'Password updated successfully',
            'detail': 'Please log in again with your new password.'
        }, status=status.HTTP_200_OK)

    @action(
        detail=False, 
        methods=['post'], 
        permission_classes=[permissions.IsAuthenticated]
    )
    def logout(self, request):
        """
        Log out the current user and record the event.
        """
        user = request.user
        log_activity(
            request=request,
            user=user,
            action='LOGOUT',
            model_name='User',
            object_id=user.id,
            object_repr=user.username,
            description=f"User {user.username} logged out"
        )
        return Response({
            'message': 'Logout successful',
            'detail': 'You have been successfully logged out.'
        }, status=status.HTTP_200_OK)

    @user_permission_required(action_type='delete')
    def destroy(self, request, *args, **kwargs):
        """Delete user account (superusers only)."""
        instance = self.get_object()
        user_repr = instance.username
        user_id = instance.id
        
        response = super().destroy(request, *args, **kwargs)
        
        # Log deletion
        log_activity(
            request=request,
            user=request.user,
            action='DELETE',
            model_name='User',
            object_id=user_id,
            object_repr=user_repr,
            description=f"Admin {request.user.username} deleted user {user_repr}"
        )
        
        return response

    def perform_create(self, serializer):
        """Set password when creating user via admin API."""
        user = serializer.save()
        if 'password' in self.request.data:
            user.set_password(self.request.data['password'])
            user.save()
            
        # Log creation by admin
        log_activity(
            request=self.request,
            user=self.request.user,
            action='CREATE',
            model_name='User',
            object_id=user.id,
            object_repr=user.username,
            description=f"Admin {self.request.user.username} created user {user.username}"
        )

    def perform_update(self, serializer):
        """Log updates to user accounts."""
        user = serializer.save()
        
        # Log update by admin/manager
        log_activity(
            request=self.request,
            user=self.request.user,
            action='UPDATE',
            model_name='User',
            object_id=user.id,
            object_repr=user.username,
            description=f"User {user.username} updated"
        )
            
    # ======================== Email Verification System ========================
    @action(detail=False, methods=['post', 'get'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        """Verify user's email address using verification token"""
        token = None
        
        print(f"=== EMAIL VERIFICATION DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"Query params: {request.query_params}")
        
        # Handle GET request (token in URL)
        if request.method == 'GET':
            token = request.query_params.get('token')
            print(f"GET token from query params: {token}")
        
        # Handle POST request (token in body)
        elif request.method == 'POST':
            serializer = EmailVerificationSerializer(data=request.data)
            if serializer.is_valid():
                token = serializer.validated_data['token']
                print(f"POST token from body: {token}")
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Token to verify: {token}")
        
        if not token:
            return Response({
                'error': 'Verification token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Convert token to UUID if it's a string
            if isinstance(token, str):
                try:
                    token = uuid.UUID(token)
                except ValueError:
                    print(f"Invalid UUID format: {token}")
                    return Response({
                        'error': 'Invalid token format'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Looking for user with token: {token}")
            
            user = User.objects.get(verification_token=token)
            print(f"User found: {user.username} (ID: {user.id})")
            print(f"User verification status before: {user.is_verified}")
            
            if user.is_verified:
                print("User already verified")
                return Response({
                    'message': 'Email already verified',
                    'detail': 'Your email address was already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark user as verified
            user.is_verified = True
            user.save()
            print(f"User verification status after: {user.is_verified}")
            
            # Send welcome email
            try:
                user.send_welcome_email()
                print("Welcome email sent")
            except Exception as e:
                print(f"Welcome email failed: {e}")
            
            print("=== VERIFICATION SUCCESS ===")
            
            return Response({
                'message': 'Email verified successfully!',
                'detail': 'Your account has been activated. You can now log in.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            print(f"=== VERIFICATION FAILED ===")
            print(f"No user found with token: {token}")
            
            # Debug: List all users and their tokens
            all_users = User.objects.all()
            print("All users and their tokens:")
            for u in all_users:
                print(f"  {u.username}: {u.verification_token} (verified: {u.is_verified})")
            
            return Response({
                'error': 'Invalid or expired verification token'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resend_verification(self, request):
        """Resend verification email to authenticated user"""
        user = request.user
        
        if user.is_verified:
            return Response({
                'message': 'Email already verified',
                'detail': 'Your email address is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new token and send email
        user.verification_token = uuid.uuid4()
        user.save()
        
        if user.send_verification_email():
            return Response({
                'message': 'Verification email sent',
                'detail': 'Please check your email for the verification link.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send verification email',
                'detail': 'Please try again later or contact support.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def available_actions(self, request):
        """Debug endpoint to see available actions"""
        actions = []
        for method, action_name in [
            ('POST', 'verify_email'),
            ('POST', 'resend_verification'),
            ('POST', 'register'),
            ('GET', 'profile'),
            ('POST', 'change_password'),
        ]:
            try:
                # Test if the action exists
                getattr(self, action_name)
                actions.append(f"{method} /api/users/{action_name}/")
            except AttributeError:
                actions.append(f"❌ {method} /api/users/{action_name}/ (NOT FOUND)")
        
        return Response({
            'available_actions': actions,
            'current_user': str(request.user),
            'user_is_authenticated': request.user.is_authenticated
        })
class FactoryViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing factories.
    """
    queryset = Factory.objects.all().order_by('name')
    serializer_class = FactorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def perform_create(self, serializer):
        """Log factory creation."""
        factory = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='CREATE',
            model_name='Factory',
            object_id=factory.id,
            object_repr=factory.name,
            description=f"Factory {factory.name} created"
        )

    def perform_update(self, serializer):
        """Log factory update."""
        factory = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='UPDATE',
            model_name='Factory',
            object_id=factory.id,
            object_repr=factory.name,
            description=f"Factory {factory.name} updated"
        )

    def destroy(self, request, *args, **kwargs):
        """Log factory deletion."""
        instance = self.get_object()
        factory_repr = instance.name
        factory_id = instance.id
        
        response = super().destroy(request, *args, **kwargs)
        
        log_activity(
            request=request,
            user=request.user,
            action='DELETE',
            model_name='Factory',
            object_id=factory_id,
            object_repr=factory_repr,
            description=f"Factory {factory_repr} deleted"
        )
        return response

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsSuperAdmin()]
        if self.action in ['update', 'partial_update']:
            return [IsFactoryManager()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.is_verified:
            return Factory.objects.none()
            
        if user.is_superuser or (user.is_verified and user.can_view_all_illustrations()):
            return Factory.objects.all().order_by('name')
        
        # Non-privileged users only see factories they are members of
        return Factory.objects.filter(
            members__user=user,
            members__is_active=True
        ).distinct().order_by('name')

class RoleViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing roles.
    """
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    def get_permissions(self):
        return [CanManageRoles()]
    pagination_class = None

    def perform_create(self, serializer):
        """Log role creation."""
        role = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='CREATE',
            model_name='Role',
            object_id=role.id,
            object_repr=role.name,
            description=f"Role {role.name} created"
        )

    def perform_update(self, serializer):
        """Log role update."""
        role = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='UPDATE',
            model_name='Role',
            object_id=role.id,
            object_repr=role.name,
            description=f"Role {role.name} updated"
        )

    def destroy(self, request, *args, **kwargs):
        """Log role deletion."""
        instance = self.get_object()
        role_repr = instance.name
        role_id = instance.id
        
        response = super().destroy(request, *args, **kwargs)
        
        log_activity(
            request=request,
            user=request.user,
            action='DELETE',
            model_name='Role',
            object_id=role_id,
            object_repr=role_repr,
            description=f"Role {role_repr} deleted"
        )
        return response

class FactoryMemberViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing factory memberships.
    """
    queryset = FactoryMember.objects.all().select_related('user', 'factory', 'role')
    serializer_class = FactoryMemberSerializer
    def get_permissions(self):
        return [CanManageUsers()]

    def perform_create(self, serializer):
        """Log membership creation."""
        member = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='CREATE',
            model_name='FactoryMember',
            object_id=member.id,
            object_repr=f"{member.user.username} in {member.factory.name}",
            description=f"User {member.user.username} added to factory {member.factory.name} with role {member.role.name}"
        )

    def perform_update(self, serializer):
        """Log membership update."""
        member = serializer.save()
        log_activity(
            request=self.request,
            user=self.request.user,
            action='UPDATE',
            model_name='FactoryMember',
            object_id=member.id,
            object_repr=f"{member.user.username} in {member.factory.name}",
            description=f"Membership for {member.user.username} in {member.factory.name} updated"
        )

    def destroy(self, request, *args, **kwargs):
        """Log membership deletion."""
        instance = self.get_object()
        member_repr = f"{instance.user.username} in {instance.factory.name}"
        member_id = instance.id
        
        response = super().destroy(request, *args, **kwargs)
        
        log_activity(
            request=request,
            user=request.user,
            action='DELETE',
            model_name='FactoryMember',
            object_id=member_id,
            object_repr=member_repr,
            description=f"User removed from factory membership: {member_repr}"
        )
        return response

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.is_verified:
            return FactoryMember.objects.none()
            
        queryset = super().get_queryset()
        
        if not user.is_superuser:
            # Filter to only show memberships user is allowed to manage
            manageable_factories = user.get_active_memberships().values_list('factory_id', flat=True)
            queryset = queryset.filter(factory_id__in=manageable_factories)
            
        user_id = self.request.query_params.get('user')
        factory_id = self.request.query_params.get('factory')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if factory_id:
            queryset = queryset.filter(factory_id=factory_id)
            
        return queryset

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Simplified user list for filter dropdowns.
    Accessible to all authenticated users.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.is_active or not user.is_verified:
            return User.objects.none()
            
        if user.is_superuser:
            return User.objects.filter(is_active=True).order_by('username')
            
        # Filter users in factories the user belongs to
        user_factories = user.get_active_memberships().values_list('factory_id', flat=True)
        queryset = User.objects.filter(
            is_active=True,
            factory_memberships__factory__in=user_factories,
            factory_memberships__is_active=True
        ).distinct().order_by('username')

        factory_id = self.request.query_params.get('factory')
        if factory_id:
            queryset = queryset.filter(
                factory_memberships__factory_id=factory_id, 
                factory_memberships__is_active=True
            ).distinct()
        return queryset

    def get_serializer_class(self):
        class SimpleUserSerializer(serializers.ModelSerializer):
            class Meta:
                model = User
                fields = ['id', 'username', 'first_name', 'last_name']
        return SimpleUserSerializer


class CommentViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing user feedback/comments.
    
    Permissions:
    - Anyone can create comments (AllowAny for create)
    - Only staff/superusers can list/view comments
    """
    queryset = Comment.objects.all().select_related('user').order_by('-date')
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        """
        Feedback visibility rules.
        """
        user = self.request.user
        if not user.is_authenticated or not user.is_active or not user.is_verified:
            return Comment.objects.none()
            
        if user.is_system_admin():
            return Comment.objects.all()
            
        return Comment.objects.filter(user=user)
    
    def get_permissions(self):
        """Allow anyone to create comments, but restrict viewing/managing to authorized users."""
        if self.action == 'create':
            return [permissions.AllowAny()]
        
        return [CanManageFeedback()]

    def perform_create(self, serializer):
        """Log feedback submission and set user if authenticated."""
        user = self.request.user if self.request.user.is_authenticated else None
        
        # Save with user if authenticated
        if user:
            comment = serializer.save(user=user)
        else:
            comment = serializer.save()
        
        log_activity(
            request=self.request,
            user=user,
            action='CREATE',
            model_name='Comment',
            object_id=comment.id,
            object_repr=f"Feedback by {comment.name or 'Anonymous'}",
            description=f"New feedback submitted by {comment.name or 'Anonymous'}"
        )

    def destroy(self, request, *args, **kwargs):
        """Log feedback deletion."""
        instance = self.get_object()
        comment_repr = f"Feedback by {instance.name or 'Anonymous'}"
        comment_id = instance.id
        
        response = super().destroy(request, *args, **kwargs)
        
        log_activity(
            request=request,
            user=request.user,
            action='DELETE',
            model_name='Comment',
            object_id=comment_id,
            object_repr=comment_repr,
            description=f"Administrative deletion of feedback: {comment_repr}"
        )
        return response


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for activity logs (read-only).
    
    Features:
    - Filtering by user, action, model, date range
    - Full-text search across descriptions
    - Statistics endpoint
    - Permission-based access control
    """
    queryset = ActivityLog.objects.all().select_related('user', 'factory')
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter activity logs based on user permissions.
        Superusers see all logs, others see only their own.
        """
        user = self.request.user
        if not user.is_authenticated or not user.is_active or not user.is_verified:
            return ActivityLog.objects.none()
        
        queryset = super().get_queryset()
        
        # Superusers see everything
        if user.is_superuser:
            pass  # Keep full queryset
        elif user.can_manage_users():
            # Users who can manage users see logs from their factories
            user_factories = user.get_active_memberships().values_list('factory_id', flat=True)
            queryset = queryset.filter(
                Q(factory__in=user_factories) | Q(user=user)
            )
        else:
            # Regular users only see their own logs
            queryset = queryset.filter(user=user)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by model
        model_name = self.request.query_params.get('model')
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(object_repr__icontains=search) |
                Q(username__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get activity statistics"""
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        # Get base queryset (respects user permissions)
        queryset = self.get_queryset()
        
        # Last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        stats_data = {
            'total_activities': queryset.count(),
            'activities_last_30_days': queryset.filter(
                timestamp__gte=thirty_days_ago
            ).count(),
            'by_action': list(queryset.values('action', 'action_display').annotate(
                count=Count('id')
            ).order_by('-count')),
            'top_users': list(queryset.values('username').annotate(
                count=Count('id')
            ).order_by('-count')[:10]),
            'by_model': list(queryset.values('model_name').annotate(
                count=Count('id')
            ).order_by('-count')),
        }
        
        return Response(stats_data)
