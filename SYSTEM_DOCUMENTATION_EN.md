# Detailed System Documentation

This document provides detailed answers to the four specific questions requested by the DX Promotion Section.

---

## 1) Source Code

The system is composed of two primary components, Frontend and Backend, managed as a unified environment using Docker.

-   **Official Repository**: [GitHub - jitendra977/Illustration](https://github.com/jitendra977/Illustration)
-   **Backend (Django/Python)**:
    -   Directory: `/backend`
    -   Key Files: `requirements.txt` (Library dependencies), `entrypoint.sh` (Startup script)
    -   Features: Provides a robust RESTful API using Django Rest Framework.
-   **Frontend (React/Bun)**:
    -   Directory: `/frontend`
    -   Key Files: `package.json` (Dependencies), `vite.config.js` (Build configuration)
    -   Features: A Single Page Application (SPA) built with Vite and powered by the high-performance Bun runtime.
-   **Configuration Files**:
    -   `.env` (in each directory): Stores environment variables such as database credentials and API endpoints.
    -   `/docker-compose.yml`: Defines the container orchestration for the entire system.

#### Backend .env Example
```env
DEBUG=False
SECRET_KEY=your-secret-key
DB_ENGINE=django.db.backends.mysql
DB_NAME=illustration_db
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
FRONTEND_URL=https://your-frontend-domain.com

# Superuser Automation
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-secure-password

# Email Service Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
SUPPORT_EMAIL=support@your-domain.com
```

#### Frontend .env Example
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME="Yaw Illustration"
VITE_ENV=production
```

## 2) Database Information

The system utilizes **MySQL 8.0** as its core relational database.

-   **Core Table Structure**:
    1.  **Organization & Users**:
        -   `Factory`: Management unit for different locations or factories.
        -   `User`: Core account information.
        -   `Role`: Granular permission settings (Super Admin, Editor, Viewer, etc.).
    2.  **Vehicle Catalog**:
        -   `Manufacturer`: Makers (e.g., Hino, Isuzu, Toyota).
        -   `CarModel`: Vehicle names, codes, and production years.
        -   `EngineModel`: Engine types and fuel specifications.
    3.  **Content & Illustrations**:
        -   `PartCategory` / `PartSubCategory`: Hierarchical classification of parts.
        -   `Illustration`: Central entity mapping illustrations to specific vehicle/engine combinations.
        -   `IllustrationFile`: References to the actual image and PDF files.
    4.  **Operations & Logs**:
        -   `ActivityLog`: Audit trail tracking every user action (who performed what).
        -   `Comment`: User feedback system with 5-star ratings.

## 3) Infrastructure & Environment Details

The system is containerized with Docker to ensure stability and consistent behavior across environments.

-   **Hosting Environment**: Hostinger VPS (KVM 1)
-   **Proxy Management**: **Nginx Proxy Manager (NPM)** is used for handling SSL certificates (Let's Encrypt) and routing traffic to the internal Docker containers.
-   **Hardware Specs**:
    -   Plan: KVM 1
    -   CPU: 1 Core
    -   Memory: 4 GB
    -   Disk Space: 50 GB NVMe
-   **OS**: Ubuntu 25.10 (Docker Environment)
    -   **Python**: 3.11-slim (Optimized for performance and security)
    -   **Bun**: 1.0 (Modern, fast Node.js-compatible runtime)
    -   **Nginx**: Alpine-based (Web server & Reverse Proxy)
-   **External Services/APIs**:
    -   Frontend URL: `https://yaw.nishanaweb.cloud`
    -   API URL: `https://api.yaw.nishanaweb.cloud`
    -   Static/Media Files: Served securely via Nginx.

## 4) Documentation & Operations

### Setup Guide (New Server)
1.  **Preparation**: Install Docker and Docker Compose on the server.
2.  **Get Code**: Clone the repository to the desired directory.
3.  **Configure**: Set up the `.env` files with appropriate DB credentials and API keys.
4.  **Launch**: Run `docker-compose up -d --build` to start all services.
5.  **Initialize**: Use `docker exec` to run database migrations and create the initial superuser.

### Administrative Access
-   **System Admin**: Full data management is available at `https://api.yaw.nishanaweb.cloud/admin/`.
-   **Temporary Credentials**: For security reasons, specific IDs and passwords will be provided separately or via direct communication.

### Functional Overview
-   **Search & Browse**: Find illustrations by manufacturer, car model, engine, or category.
-   **Viewing/Downloading**: High-resolution display of part diagrams in image or PDF format.
-   **Master Data Management**: Administrators can easily update vehicle models and part categories.
---

## 5) Security Features

The system implements multiple layers of security to protect sensitive corporate data.

### Authentication & Authorization
-   **JWT (JSON Web Token)**: Uses stateless, secure authentication with short-lived access tokens and refresh token rotation to minimize exposure risks.
-   **Granular RBAC (Role-Based Access Control)**: Beyond simple admin/user levels, specific functional permissions (e.g., catalog editing, user management) are assigned to defined roles, ensuring strict "least privilege" access.

### Data Protection & Guards
-   **Django Security Framework**: Built-in protection against common web vulnerabilities, including XSS (Cross-Site Scripting), CSRF (Cross-Site Request Forgery), and SQL Injection.
-   **Encrypted Communication (SSL/HSTS)**: Enforced HTTPS with HSTS (HTTP Strict Transport Security) enabled to prevent man-in-the-middle attacks.
-   **CORS & Allowed Hosts**: Strict filtering of incoming requests to ensure only authorized domains can interact with the API.

### Audit & Transparency
-   **Activity Logging (Audit Trail)**: Every critical action (who, when, from which IP, and what was changed) is automatically recorded, providing high transparency and accountability for system operations.

### External API Integrations
Dependency on external services is kept to a minimum to ensure system autonomy and ease of self-hosting.
-   **UI Avatars (`ui-avatars.com`)**: Generates default user avatars based on initials when no profile picture is uploaded.
-   **SMTP Service**: Used for sending system notification emails. Can be integrated with any SMTP provider via environment variables.
-   **JSQR (Local Usage)**: Used for QR code scanning in the browser; processing is performed locally without sending data to external servers.

### Infrastructure Isolation
-   **Docker Containerization**: The architecture isolates the application, database, and web server into independent containers, minimizing the potential impact of a single-point failure or security breach.
