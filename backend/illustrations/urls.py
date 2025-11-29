from django.urls import path
from .views import IllustrationListCreateAPIView 
urlpatterns = [
    path('illustrations/', IllustrationListCreateAPIView.as_view(), name='illustration-list-create'),
]