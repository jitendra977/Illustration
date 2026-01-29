# Project Directory Structure Overview

This is the high-level roadmap for the **Illustration System** project. 

Detailed file-level documentation for each specific environment can be found in their respective directories.

---

## 🔭 Main Project Layout

### 🐍 [Backend (Django)](file:///Volumes/Programming/React-Python/YAW/Illustration-System/backend/STRUCTURE.md)
Contains the REST API, Database Models, and Administrative logic.
- **Path**: `/backend`
- **Details**: See [backend/STRUCTURE.md](file:///Volumes/Programming/React-Python/YAW/Illustration-System/backend/STRUCTURE.md)

### ⚛️ [Frontend (React)](file:///Volumes/Programming/React-Python/YAW/Illustration-System/frontend/STRUCTURE.md)
Contains the user interface, routing, and design system.
- **Path**: `/frontend`
- **Details**: See [frontend/STRUCTURE.md](file:///Volumes/Programming/React-Python/YAW/Illustration-System/frontend/STRUCTURE.md)

### 🛠️ [Infrastructure & Scripts](file:///Volumes/Programming/React-Python/YAW/Illustration-System/scripts/)
Automation tools for deployment and local setup.
- **Path**: `/scripts`
- **Key Files**: `deploy.sh`, `dev.sh`, `fix-deployment.sh`

---

## 📄 Root Configuration Files

-   `docker-compose.yml` - Production/Staging orchestration.
-   `docker-compose.local.yml` - Local development orchestration (with Hot-Reload).
-   `.env` - **[LOCAL ONLY]** Root secrets (Database, Passwords).
-   `.gitignore` - Defines what stays private from Git.
-   `SYSTEM_DOCUMENTATION_EN.md` - Technical overview (English).
-   `SYSTEM_DOCUMENTATION_JP.md` - Technical overview (Japanese).
-   `DEVELOPMENT.md` - Local setup and contribution guide.

---

## 📝 Design Principles
1. **Cloud Native**: All configurations are parameterized via environment variables.
2. **Modular**: Frontend and Backend are decoupled and can scale independently.
3. **Security First**: Secrets are managed in `.env` files and never committed.
