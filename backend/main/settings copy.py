import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env.local'))  # or .env.production



# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-change-this')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Add or update CORS settings
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')

# Uncomment if you want to allow all origins (not recommended for production)
# CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist', 
    'corsheaders',
    'django_filters',
    'drf_yasg',

    # Local apps
    'accounts',
    'illustrations',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'main.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'main.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

if os.getenv('DATABASE_ENGINE') == 'django.db.backends.postgresql':
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DATABASE_ENGINE'),
            'NAME': os.getenv('DATABASE_NAME'),
            'USER': os.getenv('DATABASE_USER'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD'),
            'HOST': os.getenv('DATABASE_HOST', 'localhost'),
            'PORT': os.getenv('DATABASE_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / os.getenv('DATABASE_NAME', 'db.sqlite3'),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ============================================
# CUSTOM USER MODEL
# ============================================
AUTH_USER_MODEL = 'accounts.User'


# ============================================
# STATIC FILES CONFIGURATION
# ============================================
STATIC_URL = os.getenv('STATIC_URL', '/static/')
STATIC_ROOT = os.getenv('STATIC_ROOT', os.path.join(BASE_DIR, 'staticfiles'))

# ============================================
# MEDIA FILES CONFIGURATION
# ============================================
MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, 'media'))


# ============================================
# REST FRAMEWORK CONFIGURATION
# ============================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}


# ============================================
# JWT CONFIGURATION
# ============================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 60))),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', 10080))),
    'ROTATE_REFRESH_TOKENS': os.getenv('JWT_ROTATE_REFRESH_TOKENS', 'True') == 'True',
    'BLACKLIST_AFTER_ROTATION': os.getenv('JWT_BLACKLIST_AFTER_ROTATION', 'True') == 'True',
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    'JTI_CLAIM': 'jti',
}


# ============================================
# CSRF Settings
# ============================================
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')


# ============================================
# CORS Configuration
# ============================================
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', '')
SUPPORT_EMAIL = os.getenv('SUPPORT_EMAIL', '')


# ============================================
# FILE UPLOAD SETTINGS
# ============================================
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv('FILE_UPLOAD_MAX_MEMORY_SIZE', 5242880))
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv('DATA_UPLOAD_MAX_MEMORY_SIZE', 5242880))

# Allowed file extensions for profile images
ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']


# ============================================
# SECURITY SETTINGS (Production)
# ============================================
if not DEBUG:
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
    CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'
    SECURE_BROWSER_XSS_FILTER = os.getenv('SECURE_BROWSER_XSS_FILTER', 'True') == 'True'
    SECURE_CONTENT_TYPE_NOSNIFF = os.getenv('SECURE_CONTENT_TYPE_NOSNIFF', 'True') == 'True'
    X_FRAME_OPTIONS = os.getenv('X_FRAME_OPTIONS', 'DENY')
    SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', 31536000))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'True') == 'True'
    SECURE_HSTS_PRELOAD = os.getenv('SECURE_HSTS_PRELOAD', 'True') == 'True'


# ============================================
# LOGGING CONFIGURATION
# ============================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': os.getenv('LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': os.getenv('LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'accounts': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'