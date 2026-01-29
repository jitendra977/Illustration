# Backend Directory Structure (`/backend`)

The backend is a **Django REST Framework (DRF)** application responsible for the API, data management, and business logic.

---

## 🌳 File Tree
```text
backend/
├── apps/               # Core business logic modules
│   ├── accounts/       # User, Role, and Activity Log management
│   │   ├── migrations/ # Database schema history
│   │   ├── utils/      # Shared utilities (e.g., activity_logger.py)
│   │   ├── admin.py    # Django Admin configurations
│   │   ├── models.py   # Database models
│   │   ├── serializers.py # API data format definitions
│   │   ├── urls.py     # Account-specific routing
│   │   └── views.py    # Request handling logic
│   ├── illustrations/  # Core automotive & illustration data
│   │   ├── signals.py  # Automatic file lifecycle management
│   │   └── (standard DRF files)
│   └── __init__.py
├── config/             # System configuration
│   ├── settings.py     # Main project settings (parameterized)
│   ├── urls.py         # Main URL router
│   ├── views.py        # Base/Healthcheck views
│   ├── wsgi.py         # Web Server Gateway Interface
│   └── asgi.py         # Asynchronous Server Gateway Interface
├── scripts/            # Backend utility scripts
│   ├── link_engines.py # DB population logic
│   └── generate_schema_pdf.py # Technical drawing utilities
├── media/              # Locally stored user uploads (Illustrations/Profiles)
├── staticfiles/        # Compiled static assets (Admin UI styles, etc.)
├── Dockerfile          # Production container definition
├── Dockerfile.dev      # Hot-reloading dev container definition
├── entrypoint.sh       # Container startup & migration script
├── manage.py           # Django command-line utility
└── requirements.txt    # Python dependencies
```

---

## 📦 Key Components

### 1. Account & Security (`/apps/accounts`)
- **Activity Logging**: Every major action (create, update, delete) is tracked via `activity_logger.py`.
- **Role Management**: Custom permission logic for Admin, Manufacturer, and Normal users.

### 2. Illustration Core (`/apps/illustrations`)
- **File Management**: `signals.py` ensures that when an illustration record is deleted from the database, the physical file in `/media` is also removed to save space.

### 3. Settings (`/config/settings.py`)
- **Parameterization**: Specifically configured to read `ALLOWED_HOSTS` and `CORS_ORIGINS` from environment variables, allowing the same code to run in Local and Cloud environments without changes.

---

## 🛠️ Maintenance
- Run migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Collect statics: `python manage.py collectstatic --noinput`
