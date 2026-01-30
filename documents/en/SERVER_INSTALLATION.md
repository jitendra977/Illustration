# 🚀 Production Server Installation Guide
[**English**] | [**日本語**](../jp/SERVER_INSTALLATION.md)

This guide provides a professional checklist for deploying the **Illustration System** to a production VPS (Ubuntu/Linux) using Docker and Nginx Proxy Manager.

---

## 📋 1. Prerequisites
Ensure your server has the following installed:
-   **Docker Engine** (v20.10+)
-   **Docker Compose** (v2.0+)
-   **Git**

---

## 📂 2. Infrastructure Setup

### A) Clone the Repository
```bash
git clone https://github.com/jitendra977/Illustration.git /opt/illustration-system
cd /opt/illustration-system
```

### B) Directory Permissions
Ensure the media directory is writable by the Docker container:
```bash
mkdir -p backend/media
chmod -R 777 backend/media
```

---

## 🔑 3. Environment Configuration
You must create **two** `.env` files in specific locations.

### 📂 Configuration File Structure
Ensure your server files are organized exactly like this:
```text
/opt/illustration-system/
├── .env                  <-- [1] Root Environment File (DB & Frontend Build Args)
├── docker-compose.yml
├── backend/
│   ├── .env              <-- [2] Backend Environment File (Django Settings)
│   └── ...
└── frontend/
    └── .env.production   <-- [DELETE THIS] (Not needed on server)
```

Use the templates below:

### 1. Root Directory (`.env`)
```env
# Database Credentials
DB_NAME=yaw_db
DB_USER=yaw_admin
DB_PASSWORD=your_secure_db_password
DB_ROOT_PASSWORD=your_secure_root_password
DB_HOST=mysql_db
DB_PORT=3306

# Frontend Build Arguments (REQUIRED for Docker build)
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Yaw Illustration"
VITE_MEDIA_URL=https://api.yourdomain.com/media
VITE_STATIC_URL=https://api.yourdomain.com/static
```

> [!TIP]
> The `frontend` directory contains a `.env.production` file, but it is **ignored** by Docker build (via `.dockerignore`). You MUST define these variables in the root `.env` file so they are passed as build arguments.
>
> **Configuration Note**: Ensure your `docker-compose.yml` is configured to blindly pass these arguments to the frontend build context:
> ```yaml
> build:
>   args:
>     - VITE_API_URL=${VITE_API_URL}
>     - VITE_MEDIA_URL=${VITE_MEDIA_URL}
>     # ... etc
> ```

### 2. Backend Directory (`backend/.env`)
```env
# Security
SECRET_KEY=your_generated_random_secret_string
DEBUG=False
SECURE_SSL_REDIRECT=False  # IMPORTANT: Disable internal SSL redirect (Nginx handles SSL)

# Superuser Credentials
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=your_secure_db_password

# Domain Settings
ALLOWED_HOSTS_EXTRA=api.yourdomain.com,yourdomain.com
CSRF_TRUSTED_ORIGINS_EXTRA=https://api.yourdomain.com,https://yourdomain.com
CORS_ALLOWED_ORIGINS_EXTRA=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email Service (SMTP)
# Example: Google SMTP
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
SUPPORT_EMAIL=support@yourdomain.com
```

> [!NOTE]
> The backend container primarily looks for `backend/.env`. You may create a `.env.local` to override specific settings for local development, as `settings.py` is configured to prioritize it if present.

---

## 🚢 4. Deployment

### Start the Stack
Run the production configuration in detached mode:
```bash
docker compose up -d --build
```

### Initialize Database
Apply migrations and create the initial administrator:
```bash
docker compose exec yaw-backend python manage.py migrate
docker compose exec yaw-backend python manage.py createsuperuser --noinput
```

---

## 🌍 5. Reverse Proxy (Nginx Proxy Manager)
Using **Nginx Proxy Manager (NPM)** simplifies SSL and routing. You need **two** Proxy Hosts:

### A. Backend Proxy Host (API)
This handles direct API calls and admin access.
-   **Domain Names**: `api.yourdomain.com`
-   **Scheme**: `http`
-   **Forward Hostname / IP**: `yaw-backend` (or server IP)
-   **Forward Port**: `8000`
-   **SSL**: Request a new Let's Encrypt Certificate (Enable Force SSL, HTTP/2 Support).

### B. Frontend Proxy Host (Main Site)
This handles the React application and proxies API calls to prevent CORS/Method errors.
-   **Domain Names**: `yourdomain.com`
-   **Scheme**: `http`
-   **Forward Hostname / IP**: `yaw-frontend` (or server IP)
-   **Forward Port**: `80`
-   **SSL**: Request a new Let's Encrypt Certificate (Enable Force SSL, HTTP/2 Support).

#### ⚠️ CRITICAL: Custom Locations for Frontend
You **MUST** add the following block in the **"Custom Locations"** tab of the **Frontend Proxy Host**. This ensures relative API requests (`/api/...`) are routed correctly to the backend container.

**Location**: `/api/`
-   **Scheme**: `http`
-   **Forward Host**: `yaw-backend`
-   **Forward Port**: `8000`
-   **Gear Icon (Advanced Config)**:
    ```nginx
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    ```

---

## ✅ 6. Verification
-   **Health Check**: Visit `https://api.yourdomain.com/health/`
-   **Admin Panel**: Visit `https://api.yourdomain.com/admin/`
-   **Main App**: Visit `https://yourdomain.com`

---

## 🛠 Maintenance
-   **Update Code**: `git pull && docker compose up -d --build`
-   **Logs**: `docker compose logs -f`
-   **Database Backup**: `docker exec mysql_db mysqldump -u root -p yaw_db > backup.sql`

---
### 📍 Navigation
- [**Main README**](../../README.md)
- [**Installation Guide**](INSTALLATION.md)
- [**Project Structure**](PROJECT_STRUCTURE.md)
- [**Development Guide**](DEVELOPMENT.md)
