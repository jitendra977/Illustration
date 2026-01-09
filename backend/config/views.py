"""
Root URL handlers for the backend API.
"""
from django.http import JsonResponse
from django.conf import settings


def api_root(request):
    """
    Root endpoint - provides API information and available endpoints.
    """
    return JsonResponse({
        'message': 'YAW Illustration System API',
        'version': 'v1',
        'endpoints': {
            'admin': '/admin/',
            'api_auth': '/api/auth/',
            'api_docs': '/swagger/',
            'api_redoc': '/redoc/',
            'illustrations': '/api/illustrations/',
            'manufacturers': '/api/manufacturers/',
            'engine_models': '/api/engine-models/',
            'car_models': '/api/car-models/',
            'part_categories': '/api/part-categories/',
        },
        'frontend_url': settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'https://yaw.nishanaweb.cloud',
        'note': 'This is an API-only backend. Please access the frontend application for the web interface.'
    })


def health_check(request):
    """
    Health check endpoint for monitoring.
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'yaw-backend'
    })
