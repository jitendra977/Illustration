# illustrations/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


# ========================================
# BASIC USER PERMISSIONS
# ========================================

class IsAuthenticatedAndActive(BasePermission):
    """
    Checks: is_authenticated + is_active
    
    Usage: Basic authenticated endpoints (profile, settings)
    """
    message = 'You must be logged in with an active account.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_active


class IsVerifiedUser(BasePermission):
    """
    Checks: is_authenticated + is_active + is_verified
    
    Usage: Standard user operations requiring email verification
    """
    message = 'You must verify your email address to access this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        return request.user.is_verified


class IsVerifiedUserOrReadOnly(BasePermission):
    """
    Read: is_authenticated + is_active
    Write: is_authenticated + is_active + is_verified
    
    Usage: Catalog data (authenticated users browse, verified users edit)
    """
    message = 'You must verify your email to perform write operations.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if request.method in SAFE_METHODS:
            return True
        
        return request.user.is_verified


# ========================================
# ADMIN/STAFF PERMISSIONS
# ========================================

class IsAdmin(BasePermission):
    """
    Checks: is_authenticated + is_active + is_verified + is_staff
    
    Staff user with verified email - can manage system data
    Usage: Admin operations requiring verified staff
    """
    message = 'You must be a verified staff member to access this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if not request.user.is_verified:
            return False
        
        return request.user.is_staff


class IsVerifiedStaff(BasePermission):
    """
    Checks: is_authenticated + is_active + is_verified + is_staff
    (Alias for IsAdmin - same checks)
    
    Usage: When you want semantic clarity about "verified staff"
    """
    message = 'You must be a verified staff member to access this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if not request.user.is_verified:
            return False
        
        return request.user.is_staff


class IsSuperAdmin(BasePermission):
    """
    Checks: is_authenticated + is_active + is_verified + is_staff + is_superuser
    
    Superuser with all checks - highest privilege level
    Usage: Critical system operations, user management
    """
    message = 'You must be a verified superuser to access this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if not request.user.is_verified:
            return False
        
        if not request.user.is_staff:
            return False
        
        return request.user.is_superuser


class IsStaffOrSuperuser(BasePermission):
    """
    Checks: is_authenticated + is_active + (is_staff OR is_superuser)
    No verification required
    
    Usage: Admin panel access (verification not required)
    """
    message = 'You must be staff or superuser to access this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        return request.user.is_staff or request.user.is_superuser


# ========================================
# COMBINED/TIERED PERMISSIONS
# ========================================

class IsAdminOrOwner(BasePermission):
    """
    Admin (verified staff): Can access ALL data
    Regular users (verified): Can access only their own data
    
    Checks for Admin: is_authenticated + is_active + is_verified + is_staff
    Checks for User: is_authenticated + is_active + is_verified + owns object
    
    Usage: User-owned resources with admin oversight
    """
    message = 'You can only access your own resources unless you are an admin.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Verified staff can access everything
        if request.user.is_staff and request.user.is_verified:
            return True
        
        # Regular users must be verified
        return request.user.is_verified
    
    def has_object_permission(self, request, view, obj):
        # Verified staff can access any object
        if request.user.is_staff and request.user.is_verified:
            return True
        
        # Regular users must be verified and own the object
        if not request.user.is_verified:
            return False
        
        return hasattr(obj, 'user') and obj.user == request.user


class IsSuperAdminOrOwner(BasePermission):
    """
    SuperAdmin: Can access ALL data
    Regular users (verified): Can access only their own data
    
    Checks for SuperAdmin: is_authenticated + is_active + is_verified + is_staff + is_superuser
    Checks for User: is_authenticated + is_active + is_verified + owns object
    
    Usage: Sensitive user data requiring superuser for admin access
    """
    message = 'You can only access your own resources unless you are a superuser.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        # Verified superuser can access everything
        if request.user.is_superuser and request.user.is_verified and request.user.is_staff:
            return True
        
        # Regular users must be verified
        return request.user.is_verified
    
    def has_object_permission(self, request, view, obj):
        # Verified superuser can access any object
        if request.user.is_superuser and request.user.is_verified and request.user.is_staff:
            return True
        
        # Regular users must be verified and own the object
        if not request.user.is_verified:
            return False
        
        return hasattr(obj, 'user') and obj.user == request.user


class IsAdminOrReadOnly(BasePermission):
    """
    Read: Anyone (including anonymous)
    Write: Verified staff only
    
    Usage: Public reference data (categories, lookups)
    """
    message = 'Only verified administrators can modify this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if not request.user.is_verified:
            return False
        
        return request.user.is_staff


class IsSuperAdminOrReadOnly(BasePermission):
    """
    Read: Anyone (including anonymous)
    Write: Verified superuser only
    
    Usage: Critical system data
    """
    message = 'Only verified superusers can modify this resource.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if not request.user.is_verified:
            return False
        
        if not request.user.is_staff:
            return False
        
        return request.user.is_superuser


class IsPublicReadOrVerifiedWrite(BasePermission):
    """
    Read: Anyone (including anonymous)
    Write: Verified users (not staff-specific)
    
    Usage: Public catalog where verified users can contribute
    """
    message = 'You must verify your email to perform write operations.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        return request.user.is_verified


# ========================================
# OWNERSHIP PERMISSIONS
# ========================================

class IsOwnerAndVerified(BasePermission):
    """
    Checks: is_authenticated + is_active + is_verified + owns object
    No admin access - strictly owner only
    
    Usage: Private user data (no admin override)
    """
    message = 'You must be verified and can only access your own resources.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        return request.user.is_verified
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_verified:
            return False
        
        return hasattr(obj, 'user') and obj.user == request.user


class IsOwnerOrReadOnly(BasePermission):
    """
    Read: Any authenticated user
    Write: Owner only (verified)
    
    Usage: Public profiles, comments
    """
    message = 'You can only modify your own resources.'
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_active:
            return False
        
        if request.method in SAFE_METHODS:
            return True
        
        return request.user.is_verified
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if not request.user.is_verified:
            return False
        
        return hasattr(obj, 'user') and obj.user == request.user