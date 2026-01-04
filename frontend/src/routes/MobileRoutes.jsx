// ============================================================================
// FILE 1: FIXED src/routes/MobileRoutes.jsx
// ============================================================================

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '../pages/mobile/auth/Login';
import Register from '../pages/mobile/auth/Register';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import EmailVerification from '../pages/auth/EmailVerification';
import MobileLayout from '../layouts/MobileLayout';
import MobileHome from '../pages/mobile/MobileHome';
import MobileIllustrations from '../pages/mobile/MobileIllustrations';
import MobileManufacturers from '../pages/mobile/MobileManufacturers';
import MobileCarModels from '../pages/mobile/MobileCarModels';
import MobileEngineModels from '../pages/mobile/MobileEngineModels';
import MobileSubPartCategories from '../pages/mobile/MobilePartSubCategories';
import MobileProfile from '../pages/mobile/MobileProfile';
import MobilePartCategories from '../pages/mobile/MobilePartCategories';
import MobileManufacturerEngines from '../pages/mobile/MobileManufacturerEngines';
import MobileEngineIllustrations from '../pages/mobile/MobileEngineIllustrations';
import AdminRoute from '../components/common/AdminRoute';
import MobileUserManagement from '../pages/mobile/admin/MobileUserManagement';

const MobileRoutes = () => {
  const router = createBrowserRouter([
    // ============================================================================
    // HOME & AUTH
    // ============================================================================
    {
      path: "/",
      element: <ProtectedRoute><MobileHome /></ProtectedRoute>
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/verify-email/:token",
      element: <ProtectedRoute><MobileLayout><EmailVerification /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/verify-email",
      element: <ProtectedRoute><MobileLayout><EmailVerification /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // MAIN NAVIGATION FLOW: Manufacturers → Engines → Illustrations
    // ============================================================================

    // Step 1: Manufacturers List
    {
      path: "/manufacturers",
      element: <ProtectedRoute><MobileLayout><MobileManufacturers /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/manufacturers/create",
      element: <ProtectedRoute><MobileLayout><MobileManufacturers /></MobileLayout></ProtectedRoute>
    },

    // Step 2: Engines for a Manufacturer (Filtered by manufacturer ID)
    {
      path: "/manufacturers/:id/engines",
      element: <ProtectedRoute><MobileLayout><MobileManufacturerEngines /></MobileLayout></ProtectedRoute>
    },

    // Step 3: Illustrations for an Engine (Filtered by engine ID, Grouped by category)
    {
      path: "/manufacturers/:id/engines/:engineId/illustrations",
      element: <ProtectedRoute><MobileLayout><MobileEngineIllustrations /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // ILLUSTRATIONS (Direct Access & Management)
    // ============================================================================
    {
      path: "/illustrations",
      element: <ProtectedRoute><MobileLayout><MobileIllustrations /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/illustrations/create",
      element: <ProtectedRoute><MobileLayout><MobileIllustrations /></MobileLayout></ProtectedRoute>
    },
    // ✅ ADDED: Route for viewing single illustration detail
    {
      path: "/illustrations/:id",
      element: <ProtectedRoute><MobileLayout><MobileIllustrations /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // CAR MODELS
    // ============================================================================
    {
      path: "/car-models",
      element: <ProtectedRoute><MobileLayout><MobileCarModels /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/car-models/create",
      element: <ProtectedRoute><MobileLayout><MobileCarModels /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // ENGINE MODELS (Global List)
    // ============================================================================
    {
      path: "/engine-models",
      element: <ProtectedRoute><MobileLayout><MobileEngineModels /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/engine-models/create",
      element: <ProtectedRoute><MobileLayout><MobileEngineModels /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // PART CATEGORIES & SUBCATEGORIES (Settings/Admin)
    // ============================================================================
    {
      path: "/part-categories",
      element: <ProtectedRoute><MobileLayout><MobilePartCategories /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/part-categories/create",
      element: <ProtectedRoute><MobileLayout><MobilePartCategories /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/part-subcategories",
      element: <ProtectedRoute><MobileLayout><MobileSubPartCategories /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/part-subcategories/create",
      element: <ProtectedRoute><MobileLayout><MobileSubPartCategories /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // PROFILE
    // ============================================================================
    {
      path: "/profile",
      element: <ProtectedRoute><MobileLayout><MobileProfile /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // ADMIN (Mobile)
    // ============================================================================
    {
      path: "/mobile/admin/users",
      element: (
        <ProtectedRoute>
          <AdminRoute>
            <MobileLayout>
              <MobileUserManagement />
            </MobileLayout>
          </AdminRoute>
        </ProtectedRoute>
      )
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default MobileRoutes;