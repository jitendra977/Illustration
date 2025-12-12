# illustrations/permissions.py
from rest_framework.permissions import BasePermission


class IsVerifiedUser(BasePermission):
    """
    Custom permission to only allow verified users to access the view.
    Verified users can READ and WRITE.
    """
    def has_permission(self, request, view):
        # For schema generation (Swagger), bypass the check
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # ✅ Allow verified users to do everything (GET, POST, PUT, PATCH, DELETE)
        return getattr(request.user, 'is_verified', False)
    
    message = 'You must verify your email address before performing this action.'


class IsVerifiedUserOrReadOnly(BasePermission):
    """
    Custom permission:
    - Verified users: Full access (GET, POST, PUT, PATCH, DELETE)
    - Authenticated but NOT verified users: Read-only (GET)
    - Anonymous users: No access
    """
    def has_permission(self, request, view):
        # For schema generation (Swagger), bypass the check
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        # ✅ Anonymous users: No access at all
        if not request.user or not request.user.is_authenticated:
            return False
        
        # ✅ Read permissions (GET, HEAD, OPTIONS) for authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True  # All authenticated users can read
        
        # ✅ Write permissions (POST, PUT, PATCH, DELETE) only for verified users
        return getattr(request.user, 'is_verified', False)
    
    message = 'You must verify your email address before performing this action.'


class IsAuthenticatedAndVerified(BasePermission):
    """
    Stricter permission: Users must be both authenticated AND verified.
    Use this for sensitive operations.
    """
    def has_permission(self, request, view):
        # For schema generation (Swagger), bypass the check
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        # Must be authenticated AND verified
        if not request.user or not request.user.is_authenticated:
            return False
        
        return getattr(request.user, 'is_verified', False)
    
    message = 'You must be logged in and verified to access this resource.'


class AllowAny(BasePermission):
    """
    Allow anyone to access (no authentication required).
    Use for public endpoints like vehicle-types, fuel-types.
    """
    def has_permission(self, request, view):
        return True