import os
from pathlib import Path

# =========================
# Base settings
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-secret-for-dev")
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# =========================
# Database
# =========================
DB_ENGINE = os.getenv("DB_ENGINE", "django.db.backends.sqlite3")
DB_NAME = os.getenv("DB_NAME", BASE_DIR / "db.sqlite3")
DB_USER = os.getenv("DB_USER", "")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "")

DATABASES = {
    "default": {
        "ENGINE": DB_ENGINE,
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}

# =========================
# CORS / CSRF
# =========================
def get_env_list(key):
    """Return list of non-empty values starting with http:// or https://"""
    return [
        v.strip()
        for v in os.getenv(key, "").split(",")
        if v.strip() and v.startswith(("http://", "https://"))
    ]

CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "False") == "True"
CORS_ALLOWED_ORIGINS = get_env_list("CORS_ALLOWED_ORIGINS")
CSRF_TRUSTED_ORIGINS = get_env_list("CSRF_TRUSTED_ORIGINS")

# =========================
# JWT Settings
# =========================
JWT_ACCESS_TOKEN_LIFETIME = int(os.getenv("JWT_ACCESS_TOKEN_LIFETIME", 60))
JWT_REFRESH_TOKEN_LIFETIME = int(os.getenv("JWT_REFRESH_TOKEN_LIFETIME", 10080))

# =========================
# Email Settings
# =========================
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 25))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "False") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "")

# =========================
# File Uploads
# =========================
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("FILE_UPLOAD_MAX_MEMORY_SIZE", 5242880))
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.getenv("DATA_UPLOAD_MAX_MEMORY_SIZE", 5242880))

# =========================
# CI / Local Defaults (Optional)
# =========================
if DEBUG:
    CSRF_TRUSTED_ORIGINS += ["http://localhost", "http://127.0.0.1"]
    CORS_ALLOWED_ORIGINS += ["http://localhost:3000", "http://127.0.0.1:3000"]