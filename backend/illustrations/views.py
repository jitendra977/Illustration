from rest_framework import generics, permissions
from .models import Illustration
from .serializers import IllustrationSerializer, IllustrationCreateSerializer

# ----------------------------
# List & Create Illustration API
# ----------------------------
class IllustrationListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show user's own illustrations
        return Illustration.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IllustrationCreateSerializer
        return IllustrationSerializer

    def perform_create(self, serializer):
        # Pass logged-in user
        serializer.save(user=self.request.user)