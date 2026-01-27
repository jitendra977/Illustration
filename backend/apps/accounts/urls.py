from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet, 
    CustomTokenObtainPairView, 
    FactoryViewSet, 
    UserListViewSet,
    RoleViewSet,
    FactoryMemberViewSet,
    CommentViewSet,
    ActivityLogViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'factories', FactoryViewSet, basename='factories')
router.register(r'roles', RoleViewSet, basename='roles')
router.register(r'factory-members', FactoryMemberViewSet, basename='factory-members')
router.register(r'users-list', UserListViewSet, basename='users-list')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-logs')




urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('verify-email/<uuid:token>/', UserViewSet.as_view({'get': 'verify_email'}), name='verify-email-with-token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]