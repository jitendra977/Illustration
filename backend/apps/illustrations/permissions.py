# illustrations/permissions.py
from rest_framework import permissions

class IllustrationPermission(permissions.BasePermission):
    """
    Comprehensive permission class for Illustrations.
    Rules:
    - SUPER_ADMIN: Global Access (Verified)
    - FACTORY_MANAGER / ADMIN / EDITOR / VIEWER: Global View (Verified)
    - CONTRIBUTOR: Own Only (Active Only)
    """
    
    def has_permission(self, request, view):
        if getattr(view, 'swagger_fake_view', False):
            return True
            
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
            
        # Root admins bypass basic create checks
        if user.is_system_admin():
            return True

        # Action: List (Queryset handles visibility)
        if view.action == 'list':
            return True
            
        # Action: Create (Check if user has any create role in factory)
        if view.action == 'create':
            return user.has_any_role([
                'SUPER_ADMIN', 'FACTORY_MANAGER', 
                'ILLUSTRATION_ADMIN', 'ILLUSTRATION_CONTRIBUTOR'
            ])
            
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
            
        # Standardize target for nested items
        target = obj
        if hasattr(obj, 'illustration'):
            target = obj.illustration
            
        # View Operations (Retrieve, Download, Preview)
        if view.action in ['retrieve', 'download', 'preview', 'get_preview']:
            return user.can_view_illustration(target)
            
        # Edit Operations (Update, Partial Update, Add/Delete Files)
        if view.action in ['update', 'partial_update', 'add_files', 'delete_file']:
            return user.can_edit_illustration(target)
            
        # Delete Operations
        if view.action == 'destroy':
            return user.can_delete_illustration(target)
            
        return user.can_view_illustration(target)


class AdminOrReadOnly(permissions.BasePermission):
    """
    Reference data (Manufacturer, Engine, etc.)
    Read: All active users.
    Write: Verified Managers and Admins.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
            
        # Role-specific verification: 
        # All roles (Admin, Viewer, etc.) must be verified to browse the catalog.
        if not user.is_verified:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write operations require specific authority
        return user.is_system_admin() or user.has_any_role(['SUPER_ADMIN', 'FACTORY_MANAGER', 'ILLUSTRATION_ADMIN'])


class AuthenticatedAndActive(permissions.BasePermission):
    """Ensures basic app access for authenticated, active accounts."""
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.is_active


class AdminOrOwner(permissions.BasePermission):
    """Allows Owner or Verified System Admin access."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
            
        if hasattr(obj, 'user') and obj.user == user:
            return True
            
        return user.is_verified and user.is_system_admin()
