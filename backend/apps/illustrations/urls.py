from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'manufacturers', views.ManufacturerViewSet, basename='manufacturer')
router.register(r'engine-models', views.EngineModelViewSet, basename='enginemodel')
router.register(r'part-categories', views.PartCategoryViewSet, basename='partcategory')
router.register(r'part-subcategories', views.PartSubCategoryViewSet, basename='partsubcategory')
router.register(r'illustrations', views.IllustrationViewSet, basename='illustration')
router.register(r'illustration-files', views.IllustrationFileViewSet, basename='illustrationfile')
router.register(r'favorites', views.FavoriteIllustrationViewSet, basename='favorite')

# ✅ Register car-models LAST or use manual URLs for custom actions
router.register(r'car-models', views.CarModelViewSet, basename='carmodel')

urlpatterns = [
    # ✅ IMPORTANT: Put custom action URLs BEFORE router.urls
    path('car-models/vehicle-types/', 
         views.CarModelViewSet.as_view({'get': 'vehicle_types'}), 
         name='carmodel-vehicle-types'),
    path('car-models/fuel-types/', 
         views.CarModelViewSet.as_view({'get': 'fuel_types'}), 
         name='carmodel-fuel-types'),
    
    # Then include router URLs
    path('', include(router.urls)),
]

# This automatically creates these endpoints:
# 
# Manufacturers:
# GET    /api/manufacturers/
# POST   /api/manufacturers/
# GET    /api/manufacturers/{slug}/
# PUT    /api/manufacturers/{slug}/
# PATCH  /api/manufacturers/{slug}/
# DELETE /api/manufacturers/{slug}/
#
# Car Models:
# GET    /api/car-models/
# POST   /api/car-models/
# GET    /api/car-models/vehicle-types/  ✅ Custom action
# GET    /api/car-models/fuel-types/     ✅ Custom action
# GET    /api/car-models/{slug}/
# PUT    /api/car-models/{slug}/
# PATCH  /api/car-models/{slug}/
# DELETE /api/car-models/{slug}/
#
# Engine Models:
# GET    /api/engine-models/
# POST   /api/engine-models/
# GET    /api/engine-models/{slug}/
# PUT    /api/engine-models/{slug}/
# PATCH  /api/engine-models/{slug}/
# DELETE /api/engine-models/{slug}/
#
# Part Categories:
# GET    /api/part-categories/
# POST   /api/part-categories/
# GET    /api/part-categories/{id}/
# PUT    /api/part-categories/{id}/
# PATCH  /api/part-categories/{id}/
# DELETE /api/part-categories/{id}/
#
# Part Subcategories:
# GET    /api/part-subcategories/
# POST   /api/part-subcategories/
# GET    /api/part-subcategories/{id}/
# PUT    /api/part-subcategories/{id}/
# PATCH  /api/part-subcategories/{id}/
# DELETE /api/part-subcategories/{id}/
#
# Illustrations:
# GET    /api/illustrations/
# POST   /api/illustrations/
# GET    /api/illustrations/{id}/
# PUT    /api/illustrations/{id}/
# PATCH  /api/illustrations/{id}/
# DELETE /api/illustrations/{id}/
# POST   /api/illustrations/{id}/increment_view/  ✅ Custom action
#
# Illustration Files:
# GET    /api/illustration-files/
# POST   /api/illustration-files/
# GET    /api/illustration-files/{id}/
# PATCH  /api/illustration-files/{id}/
# DELETE /api/illustration-files/{id}/
# PATCH  /api/illustration-files/{id}/reorder/  ✅ Custom action