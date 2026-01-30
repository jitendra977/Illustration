# Project Directory Structure Overview
[**English**] | [**日本語**](../jp/PROJECT_STRUCTURE.md)

This is the high-level roadmap for the **Illustration System** project. 

> [!TIP]
> **Getting Started?** See the [**Installation Guide**](INSTALLATION.md) or [**Server Deployment Guide**](SERVER_INSTALLATION.md).

---

## 🔭 Main Project Layout

### 🐍 [Backend (Django)](../../backend/STRUCTURE.md)
Contains the REST API, Database Models, and Administrative logic.
- **Path**: `/backend`
- **Details**: See [backend/STRUCTURE.md](../../backend/STRUCTURE.md)

### ⚛️ [Frontend (React)](../../frontend/STRUCTURE.md)
Contains the user interface, routing, and design system.
- **Path**: `/frontend`
- **Details**: See [frontend/STRUCTURE.md](../../frontend/STRUCTURE.md)

### 🛠️ [Infrastructure & Scripts](../../scripts/)
Automation tools for deployment and local setup.
- **Path**: `/scripts`
- **Key Files**: `deploy.sh`, `dev.sh`, `fix-deployment.sh`

---

## 📄 Configuration Files

-   `INSTALLATION.md` - **First-time setup guide.**
-   `SYSTEM_DOCUMENTATION.md` - Technical specification.
-   `DEVELOPMENT.md` - Local setup and contribution guide.

---

## 📝 Design Principles
1. **Cloud Native**: All configurations are parameterized via environment variables.
2. **Modular**: Frontend and Backend are decoupled and can scale independently.
3. **Security First**: Secrets are managed in `.env` files and never committed.

---
### 📍 Navigation
- [**Main README**](../../README.md)
- [**Installation Guide**](LOCAL_INSTALLATION.md)
- [**Development Guide**](DEVELOPMENT.md)
- [**Server Deployment**](SERVER_INSTALLATION.md)
