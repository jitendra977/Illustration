# Frontend Directory Structure & Architecture

This document provides a deep-dive into the frontend architecture, state management, and navigation logic for the YAW Illustration System.

## 📁 Source Layout (`src/`)

### `context/` (State Management)
The application's "brain", managing global state without external libraries like Redux.
- **`AuthContext.jsx`**: 
    - **Token Lifecycle**: Handles `access_token` and `refresh_token` storage in `localStorage`.
    - **Verification Logic**: Implements a `hasPermission` helper that enforces the "Verification Gate" (unverified users see limited data).
    - **Profile Sync**: Automatically fetches fresh profile data on app initialization or token refresh.
- **`ThemeContext.jsx`**: Manages the "Glassmorphic" dark/light theme state and MUI theme provider.

### `navigation/` (Pages hierarchy)
The system uses a hierarchical discovery flow to help users find parts effortlessly:
1. **Manufacturer** (`ManufacturerList.jsx`)
2. **Engine** (`ManufacturerEngines.jsx`)
3. **Car Model** (`EngineCars.jsx`)
4. **Part Category** (`CarCategories.jsx`)
5. **Sub-category** (`CategorySubcategories.jsx`)
6. **Illustration List** (`HierarchicalIllustrationList.jsx`)

### `layouts/` & `routes/`
- **`MobileLayout`**: A shared wrapper providing the bottom navigation bar and breadcrumbs.
- **Guards**: 
    - `ProtectedRoute`: Redirects unauthenticated users to `/login`.
    - `AdminRoute`: Restricts access to user management and system settings to authorized roles.

---

## 🎨 UI Design System
- **MUI + Custom CSS**: Extends Material UI with a professional "Glassmorphic" aesthetic (subtle blurs, gradients, and rounded surfaces).
- **Theme Overrides**: Highly customized `Card`, `Button`, and `Dialog` components in `src/theme/`.

---

## 🛠️ Performance & Security
- **Asset Loading**: Uses `Vite` for optimized chunking.
- **API Interceptors**: `src/api/client.js` (referenced via services) automatically attaches JWT tokens and handles `401 Unauthorized` by attempting a token refresh via `AuthContext`.

---
### 📍 Navigation
- [**Main README**](../README.md)
- [**Project Structure**](../documents/en/PROJECT_STRUCTURE.md)
- [**Development Guide**](../documents/en/DEVELOPMENT.md)
