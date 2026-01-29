# 🚀 Production Server Installation Guide

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
You must create **three** `.env` files. Use the templates below:

### 1. Root Directory (`.env`)
```env
# Database Credentials
DB_NAME=yaw_db
DB_USER=yaw_admin
DB_PASSWORD=your_secure_db_password
DB_ROOT_PASSWORD=your_secure_root_password
DB_HOST=mysql_db
DB_PORT=3306

# Superuser Initial Setup
DJANGO_SUPERUSER_USERNAME=admin
```

### 2. Backend Directory (`backend/.env.local`)
```env
# Security
SECRET_KEY=your_generated_random_secret_string
DEBUG=False

# Superuser Credentials
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=your_secure_db_password

# Domain Settings
ALLOWED_HOSTS_EXTRA=api.yourdomain.com,yourdomain.com
CSRF_TRUSTED_ORIGINS_EXTRA=https://api.yourdomain.com,https://yourdomain.com
```

### 3. Frontend Directory (`frontend/.env.local`)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Yaw Illustration"
```

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
If you are using **Nginx Proxy Manager (NPM)**:

1.  **Frontend Proxy**:
    -   Domain: `yourdomain.com`
    -   Scheme: `http`
    -   Forward Host: `SERVER_IP`
    -   Forward Port: `5173` (or mapped port)
2.  **Backend Proxy**:
    -   Domain: `api.yourdomain.com`
    -   Scheme: `http`
    -   Forward Host: `SERVER_IP`
    -   Forward Port: `8000`

> [!IMPORTANT]
> Ensure **SSL (Let's Encrypt)** is enabled in NPM and **Websockets Support** is turned on.

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
