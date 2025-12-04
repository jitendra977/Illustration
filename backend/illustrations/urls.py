from django.urls import path
from .views import (
    # Manufacturer
    ManufacturerListCreateAPIView,
    ManufacturerRetrieveUpdateDestroyAPIView,
    
    # Car Model
    CarModelListCreateAPIView,
    CarModelRetrieveUpdateDestroyAPIView,
    
    # Engine Model
    EngineModelListCreateAPIView,
    EngineModelRetrieveUpdateDestroyAPIView,
    
    # Part Category
    PartCategoryListCreateAPIView,
    PartCategoryRetrieveUpdateDestroyAPIView,
    
    # Part Subcategory
    PartSubCategoryListCreateAPIView,
    PartSubCategoryRetrieveUpdateDestroyAPIView,
    
    # Illustration
    IllustrationListCreateAPIView,
    IllustrationRetrieveUpdateDestroyAPIView,
    
    # Illustration File
    IllustrationFileListCreateAPIView,
    IllustrationFileDestroyAPIView,
)

app_name = 'illustrations'

urlpatterns = [
    # ------------------------------
    # Manufacturer URLs
    # ------------------------------
    path('manufacturers/', 
         ManufacturerListCreateAPIView.as_view(), 
         name='manufacturer-list-create'),
    path('manufacturers/<slug:slug>/', 
         ManufacturerRetrieveUpdateDestroyAPIView.as_view(), 
         name='manufacturer-detail'),
    
    # ------------------------------
    # Car Model URLs
    # ------------------------------
    path('car-models/', 
         CarModelListCreateAPIView.as_view(), 
         name='car-model-list-create'),
    path('car-models/<slug:slug>/', 
         CarModelRetrieveUpdateDestroyAPIView.as_view(), 
         name='car-model-detail'),
    
    # ------------------------------
    # Engine Model URLs
    # ------------------------------
    path('engine-models/', 
         EngineModelListCreateAPIView.as_view(), 
         name='engine-model-list-create'),
    path('engine-models/<slug:slug>/', 
         EngineModelRetrieveUpdateDestroyAPIView.as_view(), 
         name='engine-model-detail'),
    
    # ------------------------------
    # Part Category URLs
    # ------------------------------
    path('part-categories/', 
         PartCategoryListCreateAPIView.as_view(), 
         name='part-category-list-create'),
    path('part-categories/<int:pk>/', 
         PartCategoryRetrieveUpdateDestroyAPIView.as_view(), 
         name='part-category-detail'),
    
    # ------------------------------
    # Part Subcategory URLs
    # ------------------------------
    path('part-subcategories/', 
         PartSubCategoryListCreateAPIView.as_view(), 
         name='part-subcategory-list-create'),
    path('part-subcategories/<int:pk>/', 
         PartSubCategoryRetrieveUpdateDestroyAPIView.as_view(), 
         name='part-subcategory-detail'),
    
    # ------------------------------
    # Illustration URLs
    # ------------------------------
    path('illustrations/', 
         IllustrationListCreateAPIView.as_view(), 
         name='illustration-list-create'),
    path('illustrations/<int:pk>/', 
         IllustrationRetrieveUpdateDestroyAPIView.as_view(), 
         name='illustration-detail'),
    
    # ------------------------------
    # Illustration File URLs
    # ------------------------------
    path('illustration-files/', 
         IllustrationFileListCreateAPIView.as_view(), 
         name='illustration-file-list-create'),
    path('illustration-files/<int:pk>/', 
         IllustrationFileDestroyAPIView.as_view(), 
         name='illustration-file-delete'),
]