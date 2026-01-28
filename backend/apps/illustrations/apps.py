from django.apps import AppConfig


class IllustrationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.illustrations'

    def ready(self):
        import apps.illustrations.signals
