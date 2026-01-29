# Backend Directory Structure & Architecture

This document provides a deep-dive into the backend architecture, model relationships, and security logic of the YAW Illustration System.

## 📁 Source Layout (`backend/`)

### `config/`
The core Django project configuration.
- `settings.py`: Integrated with `.env` for secrets, CORS, and security headers.
- `urls.py`: Orchestrates the API namespace (`/api/...`) and admin portal.

### `apps/accounts/` (Security & RBAC)
Handles the complex multi-factory role system.
- **Models**:
    - `User`: Custom model supporting email-login, profile images, and verification status.
    - `Factory`: Logical units (branches/workshops) that own illustrations.
    - `Role`: Bit-field style permissions (`can_manage_catalog`, `can_view_all_factory_illustrations`, etc.).
    - `FactoryMember`: Junction table linking Users to Factories with a specific Role.
    - `ActivityLog`: Comprehensive audit trail tracking every API call, IP, and data change.
- **Logic**:
    - **Verification Gate**: High-tier roles (Managers/Admins) must have `is_verified=True` to access cross-factory data.
    - **Activity Tracking**: Uses a decorator/middleware-like pattern (`log_activity`) to automatically record actions.

### `apps/illustrations/` (Core Data)
Manages the automotive technical catalog.
- **Hierarchical Models**:
    - `Manufacturer` → `EngineModel` → `CarModel` (M2M with Engine)
    - `Illustration` (Linked to Engine + Category)
    - `IllustrationFile` (The actual PDF/Image assets)
- **Logic**:
    - **Contextual Filtering**: API views use `django-filter` and custom queryset logic to count illustrations correctly based on the current navigation context (e.g., "Illustrations for Engine X in Car Y").
    - **PDF Handling**: Specialized `preview` and `download` actions in `IllustrationFileViewSet` handle file serving with correct MIME types and permission checks.

---

## 🔐 Security & RBAC Logic

The system uses a strict **"Verify-to-Browse"** policy:
1. **Unverified Users**: Can only view their own profile and basic "How to Use" guides.
2. **Contributors**: Can upload illustrations to their assigned factory but only see their own uploads if unverified.
3. **Verified Roles**: Access level depends on the assigned `Role` (Viewer, Editor, Admin, etc.), potentially granting cross-factory visibility.

---

## 🛠️ Infrastructure & Automation
- **Docker**: Separated `Dockerfile.dev` (uses `pip` and hot-reloading) and production `Dockerfile`.
- **Media Serving**: All technical documents are stored in `/app/media` and served through a permissioned proxy view to prevent direct URL access to sensitive diagrams.

---
### 📍 Navigation
- [**Main README**](../README.md)
- [**Project Structure**](../documents/en/PROJECT_STRUCTURE.md)
- [**Development Guide**](../documents/en/DEVELOPMENT.md)
