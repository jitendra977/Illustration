# Deep Project Directory Structure

This document provides a detailed, file-level overview of the **Illustration System** codebase.

---

## 🌳 Full Directory Tree
(Excluding `node_modules`, `venv`, `.git`, and build artifacts)

```text
.
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   │   ├── migrations/
│   │   │   ├── utils/
│   │   │   │   └── activity_logger.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── illustrations/
│   │   │   ├── migrations/
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── signals.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   └── __init__.py
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── scripts/
│   │   ├── link_engines.py
│   │   └── generate_schema_pdf.py
│   ├── media/
│   ├── staticfiles/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── entrypoint.sh
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── search_demo.webm
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── ActivityLogsTab.jsx
│   │   │   │   ├── UsersTab.jsx
│   │   │   │   └── ...
│   │   │   ├── common/
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   ├── MobileLayout.jsx
│   │   │   └── SimpleLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── MainRoutes.jsx
│   │   │   └── MobileRoutes.jsx
│   │   ├── services/
│   │   │   ├── auth.js
│   │   │   ├── activityLogs.js
│   │   │   └── ...
│   │   ├── theme/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── deploy.sh
│   ├── dev.sh
│   ├── fix-deployment.sh
│   ├── test_production_login.sh
│   └── verify_vps.exp
├── docker-compose.yml
├── docker-compose.local.yml
├── .env.example
├── SYSTEM_DOCUMENTATION_EN.md
├── SYSTEM_DOCUMENTATION_JP.md
└── DEVELOPMENT.md
```

---

## 📦 Component Details

### 1. Backend Details (`/backend`)
The backend is a **Django REST Framework** application.

-   **`apps/accounts/`**: Handles User authentication, Role-based permissions, and **Activity Logging**.
    -   `utils/activity_logger.py`: Centralized utility for recording system events.
-   **`apps/illustrations/`**: The core logic for managing automotive data.
    -   Handles Manufacturers, Engine types, Chassis codes, and Part Illustrations.
    -   `signals.py`: Handles automatic file management (deletion of files when DB records are removed).
-   **`config/`**: System-level configuration.
    -   `settings.py`: Contains database connections, CORS/CSRF settings, and security parameters.
-   **`scripts/`**: Maintenance scripts for linking entities and generating PDF technical drawings.
-   **`entrypoint.sh`**: Ensures the DB is ready, runs migrations, and starts the production server.

### 2. Frontend Details (`/frontend`)
A modern **React SPA** built with **Vite** and **Material UI (MUI)**.

-   **`src/components/admin/`**: High-level administrative widgets for User/Role management and Log auditing.
-   **`src/services/`**: Axiios-based API client layer. Separates the network logic from the UI.
-   **`src/routes/`**: Handles navigation. Split into `MainRoutes` (Desktop) and `MobileRoutes` for responsive behavior.
-   **`src/theme/`**: Contains the custom MUI theme (Vibrant blue gradients, dark mode support).
-   **`public/`**: Static assets that are served directly without processing.

### 3. Infrastructure & DevOps
-   **`docker-compose.yml`**: Production orchestration using pre-built images or optimized production builds.
-   **`docker-compose.local.yml`**: Development-specific setup with hot-reloading (Vite Dev Server) and easy debugging console access.
-   **`deploy.sh`**: Automated push-to-GitHub and remote-pull-and-restart flow.
-   **`nginx.conf`**: Critical for the frontend container to handle React Router (SPA) routing correctly.

---

## 📝 Maintenance Notes
-   Always update `requirements.txt` after installing new Python packages.
-   Always run `npm install` (or `bun install`) when the `package.json` changes.
-   Refer to `DEVELOPMENT.md` for specific environment setup instructions.
