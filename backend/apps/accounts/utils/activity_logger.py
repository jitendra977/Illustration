from ..models import ActivityLog
from ..models import Factory

def log_activity(request, user, action, model_name, object_id=None, object_repr='', description='', changes=None, success=True, error_message=''):
    """
    Utility function to log user activities.
    """
    # Extract metadata from request if available
    ip_address = None
    user_agent = ''
    endpoint = ''
    method = ''
    
    if request:
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        endpoint = request.path
        method = request.method
    
    # Try to find user's factory context
    factory = None
    if hasattr(user, 'get_active_memberships'):
        memberships = user.get_active_memberships()
        if memberships.exists():
            factory = memberships.first().factory

    # Create the log entry
    return ActivityLog.objects.create(
        user=user,
        username=user.username if user else 'Anonymous',
        action=action,
        model_name=model_name,
        object_id=str(object_id) if object_id else None,
        object_repr=object_repr,
        description=description,
        changes=changes,
        ip_address=ip_address,
        user_agent=user_agent,
        endpoint=endpoint,
        method=method,
        success=success,
        error_message=error_message,
        factory=factory
    )
