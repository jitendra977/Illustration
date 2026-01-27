# accounts/permissions.py
from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    SUPER_ADMIN = 'SUPER_ADMIN' > can do every thing
    Requires active and verified account.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active or not user.is_verified:
            return False
        return user.is_superuser or user.has_role('SUPER_ADMIN')

class IsFactoryManager(permissions.BasePermission):
    """
    FACTORY_MANAGER = 'FACTORY_MANAGER' > can manage everything own factory.
    Requires active and verified account.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active or not user.is_verified:
            return False
        return user.is_superuser or user.has_role('FACTORY_MANAGER')

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active or not user.is_verified:
            return False
            
        if user.is_superuser or user.has_role('SUPER_ADMIN'):
            return True
        
        # If the object is a Factory, check membership
        from .models import Factory, FactoryMember, User
        if isinstance(obj, Factory):
            return user.has_role('FACTORY_MANAGER', factory=obj)
        
        # If the object is a FactoryMember, check if user is manager of that factory
        if isinstance(obj, FactoryMember):
            return user.has_role('FACTORY_MANAGER', factory=obj.factory)
            
        # If the object is a User, check if they share a factory with FACTORY_MANAGER role
        if isinstance(obj, User):
            manageable_factories = user.get_factories_with_permission('can_manage_users')
            return obj.factory_memberships.filter(factory__in=manageable_factories).exists()

        return False

class CanManageUsers(permissions.BasePermission):
    """Allows SUPER_ADMIN or FACTORY_MANAGER to manage users (Verified only)."""
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.can_manage_users()

class CanManageFactory(permissions.BasePermission):
    """Allows SUPER_ADMIN or FACTORY_MANAGER to manage factory settings (Verified only)."""
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.can_manage_factory()

class CanManageRoles(permissions.BasePermission):
    """Strictly restricted to high level system admins (Verified only)."""
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active or not user.is_verified:
            return False
        return user.is_superuser or user.has_role('SUPER_ADMIN')

class CanManageFeedback(permissions.BasePermission):
    """Allows Managers/Admins to manage feedback (Verified only)."""
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.can_manage_feedback()
