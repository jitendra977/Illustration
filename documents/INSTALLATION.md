# 🛠 Installation Guide

Follow these steps to set up the **Illustration System** from scratch on any Docker-enabled environment (Local Mac/Windows/Linux or a Cloud VPS).

---

## 📋 1. Prerequisites
Ensure you have the following installed:
-   **Docker** (v20.10+)
-   **Docker Compose** (v2.0+)
-   **Git**

---

## 📂 2. Get the Code
```bash
git clone https://github.com/jitendra977/Illustration.git
cd Illustration
```

---

## 🔑 3. Configure Environment Variables
The system uses three levels of configuration to ensure security and flexibility.

### A) Root Orchestration (`.env`)
Create a file named `.env` in the project root. This file manages the database credentials.

```env
# MySQL Database Configuration
DB_NAME=yaw_illustration
DB_USER=nishanaweb
DB_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_user_password
DB_HOST=mysql_db
DB_PORT=3306
DB_ENGINE=django.db.backends.mysql

# Defaults (Matches local setup)
DJANGO_SUPERUSER_USERNAME=admin
```

### B) Backend Settings (`backend/.env.local`)
Create `backend/.env.local` to configure application-level behavior.

```env
# Core Django
SECRET_KEY=generate-a-random-secure-string
DEBUG=True

# Superuser Auto-Setup
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your_secure_password_match_db_password

# Domains (Comma separated)
ALLOWED_HOSTS_EXTRA=your-domain.com,api.your-domain.com
CSRF_TRUSTED_ORIGINS_EXTRA=https://your-domain.com,https://api.your-domain.com
```

### C) Frontend Settings (`frontend/.env.local`)
Create `frontend/.env.local` to point the UI to the API.

```env
# API Connectivity
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="YAW Illustration"
```
> [!TIP]
> On a production VPS, replace `localhost:8000` with your actual API domain (e.g., `https://api.your-domain.com/api`).

---

## 🚀 4. Launch the System

### For Local Development
Run the development-optimized stack which included hot-reloading and console access:
```bash
docker compose -f docker-compose.local.yml up --build
```

### For Production / VPS
Run the stabilized production stack:
```bash
docker compose up -d --build
```

---

## ✅ 5. Post-Installation Verification

1.  **Access the UI**: Open `http://localhost:5173` (Local) or your domain.
2.  **Access the Admin**: Check `http://localhost:8000/admin/`.
3.  **Login**: Use the admin credentials defined in your `backend/.env.local`.

---

## 📝 Troubleshooting
- **Database Access Denied**: Ensure that the `DB_PASSWORD` in the root `.env` matches the `DJANGO_SUPERUSER_PASSWORD` if you are using the same value, and that you reset the volume if you changed the password after the first run:
  ```bash
  docker compose -f docker-compose.local.yml down -v
  ```
- **CSRF Errors**: Double-check your `CSRF_TRUSTED_ORIGINS_EXTRA` in the backend configuration.
