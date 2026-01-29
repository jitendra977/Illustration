# 🚜 YAW Illustration System

A comprehensive automotive illustration and management system built with **Django REST Framework** and **React (Vite)**, fully containerized with **Docker**.

---

## 📖 Documentation Hub
All project documentation is centralized in the [**`documents/`**](./documents/) directory.

### 🚀 Getting Started
-   **[Installation Guide](./documents/en/INSTALLATION.md)** - Local setup (Docker, .env config).
-   **[Server Deployment](./documents/en/SERVER_INSTALLATION.md)** - Production VPS setup & NPM.
-   **[Development Guide](./documents/en/DEVELOPMENT.md)** - Daily workflows (Hot-reloading, Migrations).

### 📐 Specification & Structure
-   **[Project Structure](./documents/en/PROJECT_STRUCTURE.md)** - Deep-level file map.
-   **[System Documentation (EN)](./documents/en/SYSTEM_DOCUMENTATION.md)** - Technical specification.
-   **[システム詳細仕様書 (JP)](./documents/jp/SYSTEM_DOCUMENTATION.md)** - 日本語版テクニカルドキュメント.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python 3.11, Django 4.x, Django REST Framework |
| **Frontend** | React 18, Vite, Bun 1.0, Material UI (MUI) |
| **Database** | MySQL 8.0 |
| **Orchestration** | Docker, Docker Compose |
| **Reverse Proxy** | Nginx Proxy Manager (NPM) |

---

## 🏗 Key Features
-   **Vehicle Catalog Management**: Structured data for Manufacturers, Models, and Engines.
-   **Illustration Handling**: Image and PDF management with automatic file cleanup via Django signals.
-   **Role-Based Access (RBAC)**: Granular permissions for Admins, Manufacturers, and Viewers.
-   **Audit Trail**: Automatic activity logging for every system-critical action.
-   **Responsive Design**: Modern, glassmorphic UI optimized for both Desktop and Mobile.

---

## 🤝 Contribution
Please refer to the [**Development Guide**](./documents/en/DEVELOPMENT.md) before submitting pull requests. All code resides on the `main` branch.

---

## 📄 License
© 2026 YAW Illustration System. All rights reserved.
