# Frontend Directory Structure (`/frontend`)

The frontend is a **React SPA** built with **Vite** and **Bun/NPM**, utilizing **Material UI (MUI)** for the design system.

---

## 🌳 File Tree
```text
frontend/
├── public/             # Static public assets (Favicons, videos)
├── src/                # Application source code
│   ├── api/            # Base Axios configurations
│   ├── assets/         # Global styles, fonts, and images
│   ├── components/     # Reusable UI widgets
│   │   ├── admin/      # Specialized admin panels (Log Audit, User Mgmt)
│   │   ├── common/     # Generic buttons, loaders, etc.
│   │   └── ...
│   ├── context/        # Global state providers (Auth, Theme)
│   ├── hooks/          # Custom React hooks (useAuth, useResponsive)
│   ├── layouts/        # Page shells (Mobile, Standard)
│   ├── pages/          # Top-level route components (Dashboard, Login)
│   ├── routes/         # Unified routing definitions
│   ├── services/       # Feature-specific API clients
│   ├── theme/          # Custom Material UI theme definitions
│   ├── utils/          # Helpers (formatters, validators)
│   ├── App.jsx         # Main application entry
│   └── main.jsx        # Browser mounting point
├── Dockerfile          # Multi-stage production container (Nginx)
├── Dockerfile.dev      # Fast-reloading development container
├── nginx.conf          # Nginx routing rules for SPA Support
├── package.json        # Project metadata and dependencies
└── vite.config.js      # Vite build tool setup
```

---

## 📦 Key Components

### 1. Responsive Layouts (`/src/layouts`)
- **`MobileLayout.jsx`**: Provides the persistent bottom navigation and swipeable drawer for mobile users.

### 2. Admin System (`/src/components/admin`)
- **Auditing**: Specifically built tabs to view the `ActivityLogs` from the backend.
- **User Management**: Modularized components for managing complex user/role relationships.

### 3. Theme System (`/src/theme`)
- **Blue Gradient Design**: A premium design system with custom HSL-based colors and full Dark Mode compatibility.

---

## 🛠️ Maintenance
- Build production: `npm run build`
- Run local dev: `npm run dev`
- Lint code: `npm run lint`
