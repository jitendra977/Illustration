# Detailed System Documentation
[**English**] | [**日本語**](../jp/SYSTEM_DOCUMENTATION.md)

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
    -   Key Files: `package.json` (Dependencies), `vite.config.js` (Build configuration), `nginx.conf` (Internal Web Server)
    -   Features: A Single Page Application (SPA) built with Vite and powered by the high-performance Bun runtime.
    -   **Internal Web Server**: The frontend container uses an internal Nginx (`frontend/nginx.conf`) to serve static assets and handle SPA routing (redirecting 404s to `index.html`). It also applies security headers like `X-Frame-Options` and `X-Content-Type-Options`.
        > **Note**: This is bundled within the Docker image (`nginx:alpine`), so **no manual Nginx installation is required** on the host.
-   **Configuration Files**:
    ```text
    /opt/illustration-system/
    ├── .env                  <-- [1] Root Environment File (DB & Frontend Build Args)
    ├── docker-compose.yml
    └── backend/
        └── .env              <-- [2] Backend Environment File (Django Settings)
    ```


> 📝 **Configuration Details**: For complete `.env` templates and detailed configuration instructions, please refer to the [**Environment Configuration**](./SERVER_INSTALLATION.md#-3-environment-configuration) section in the Server Installation Guide.

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
    -   Static/Media Files: Served securely via Nginx with permission checks.

### Infrastructure Automation (`scripts/`)
The project includes a suite of automation tools to ensure consistent deployment and maintenance:
- **`deploy.sh`**: Automates the Git pull, build, and container restart process on the production VPS.

## 4) Documentation & Operations

### Setup Guide (New Server)
For a complete, foolproof setup guide, please refer to:
👉 [**Local Installation Guide (LOCAL_INSTALLATION.md)**](./LOCAL_INSTALLATION.md)

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
-   **Activity Logging (Audit Trail)**: Every critical action (who, when, from which IP, and what was changed) is automatically recorded.
    - **IP Geo-Logging**: Tracks the origin of administrative actions for security audits.
    - **Model-Level Tracking**: Records changes to specific database objects, creating a "time-machine" of catalog edits.
- **Detailed Error Logging**: Production errors are captured with a unique Traceback ID, allowing developers to debug issues without exposing sensitive data in the browser.

### External API Integrations
Dependency on external services is kept to a minimum to ensure system autonomy and ease of self-hosting.
-   **UI Avatars (`ui-avatars.com`)**: Generates default user avatars based on initials when no profile picture is uploaded.
-   **SMTP Service**: Used for sending system notification emails. Can be integrated with any SMTP provider via environment variables.
-   **JSQR (Local Usage)**: Used for QR code scanning in the browser; processing is performed locally without sending data to external servers.

### Infrastructure Isolation
-   **Docker Containerization**: The architecture isolates the application, database, and web server into independent containers, minimizing the potential impact of a single-point failure or security breach.

---
### 📍 Navigation
- [**Main README**](../../README.md)
- [**Local Installation Guide**](LOCAL_INSTALLATION.md)
- [**Project Structure**](PROJECT_STRUCTURE.md)
- [**Development Guide**](DEVELOPMENT.md)
