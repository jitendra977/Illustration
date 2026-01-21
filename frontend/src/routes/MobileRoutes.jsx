// ============================================================================
// FILE 1: FIXED src/routes/MobileRoutes.jsx
// ============================================================================

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '../pages/mobile/auth/Login';
import Register from '../pages/mobile/auth/Register';
import ProtectedRoute from './guards/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import EmailVerification from '../pages/mobile/auth/EmailVerification';
import MobileLayout from '../layouts/MobileLayout';
import MobileHome from '../pages/mobile/home/MobileHome';
import MobileIllustrations from '../pages/mobile/illustrations/MobileIllustrations';
import MobileManufacturers from '../pages/mobile/masters/MobileManufacturers';
import MobileCarModels from '../pages/mobile/masters/MobileCarModels';
import MobileEngineModels from '../pages/mobile/masters/MobileEngineModels';
import MobileSubPartCategories from '../pages/mobile/masters/MobilePartSubCategories';
import MobileProfile from '../pages/mobile/accounts/MobileProfile';
import MobilePartCategories from '../pages/mobile/masters/MobilePartCategories';
import MobileManufacturerEngines from '../pages/mobile/masters/MobileManufacturerEngines';
import MobileEngineIllustrations from '../pages/mobile/illustrations/MobileEngineIllustrations';
import AdminRoute from './guards/AdminRoute';
import MobileUserManagement from '../pages/mobile/admin/MobileUserManagement';
import MobileFavorites from '../pages/mobile/illustrations/MobileFavorites';
import ManufacturerList from '../pages/mobile/navigation/ManufacturerList';
import ManufacturerEngines from '../pages/mobile/navigation/ManufacturerEngines';
import EngineCars from '../pages/mobile/navigation/EngineCars';
import CarCategories from '../pages/mobile/navigation/CarCategories';
import CategorySubcategories from '../pages/mobile/navigation/CategorySubcategories';
import HierarchicalIllustrationList from '../pages/mobile/navigation/HierarchicalIllustrationList';
import HowToUse from '../pages/mobile/help/HowToUse';
import EngineList from '../pages/mobile/navigation/EngineList';
import CarList from '../pages/mobile/navigation/CarList';
import CategoryList from '../pages/mobile/navigation/CategoryList';
import CategorySubcategoriesList from '../pages/mobile/navigation/CategorySubcategoriesList';
import CommentManagement from '../pages/mobile/comments/CommentManagement';


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
    {
      path: "/how-to-use",
      element: <ProtectedRoute><MobileLayout><HowToUse /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // ALTERNATIVE NAVIGATION ENTRY POINTS
    // ============================================================================

    // By Engine Entry Point
    {
      path: "/engines",
      element: <ProtectedRoute><MobileLayout><EngineList /></MobileLayout></ProtectedRoute>
    },

    // By Car Entry Point
    {
      path: "/cars",
      element: <ProtectedRoute><MobileLayout><CarList /></MobileLayout></ProtectedRoute>
    },

    // By Category Entry Point
    {
      path: "/categories",
      element: <ProtectedRoute><MobileLayout><CategoryList /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/categories/:categoryId/subcategories",
      element: <ProtectedRoute><MobileLayout><CategorySubcategoriesList /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/categories/:categoryId/subcategories/:subcategoryId/illustrations",
      element: <ProtectedRoute><MobileLayout><HierarchicalIllustrationList /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // MAIN NAVIGATION FLOW: Manufacturers → Engines → Illustrations
    // ============================================================================

    // Step 1: Manufacturers List
    {
      path: "/manufacturers",
      element: <ProtectedRoute><MobileLayout><ManufacturerList /></MobileLayout></ProtectedRoute>
    },
    {
      path: "/manufacturers/create",
      element: <ProtectedRoute><MobileLayout><MobileManufacturers /></MobileLayout></ProtectedRoute>
    },

    // Step 2: Engines for a Manufacturer (Filtered by manufacturer ID)
    {
      path: "/manufacturers/:manufacturerId/engines",
      element: <ProtectedRoute><MobileLayout><ManufacturerEngines /></MobileLayout></ProtectedRoute>
    },

    // Step 3: Cars for an Engine
    {
      path: "/engines/:engineId/cars",
      element: <ProtectedRoute><MobileLayout><EngineCars /></MobileLayout></ProtectedRoute>
    },

    // Step 4: Categories for a Car
    {
      path: "/cars/:carSlug/categories",
      element: <ProtectedRoute><MobileLayout><CarCategories /></MobileLayout></ProtectedRoute>
    },

    // Step 5: Subcategories for a Category (in context of Car)
    {
      path: "/cars/:carSlug/categories/:categoryId/subcategories",
      element: <ProtectedRoute><MobileLayout><CategorySubcategories /></MobileLayout></ProtectedRoute>
    },

    // Step 6: Illustrations List (Hierarchical End)
    {
      path: "/cars/:carSlug/categories/:categoryId/subcategories/:subcategoryId/illustrations",
      element: <ProtectedRoute><MobileLayout><HierarchicalIllustrationList /></MobileLayout></ProtectedRoute>
    },

    // Legacy/Shortcut: Illustrations for an Engine (Filtered by engine ID, Grouped by category)
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
    // FAVORITES
    // ============================================================================
    {
      path: "/favorites",
      element: <ProtectedRoute><MobileLayout><MobileFavorites /></MobileLayout></ProtectedRoute>
    },

    // ============================================================================
    // PROFILE
    // ============================================================================
    {
      path: "/profile",
      element: <ProtectedRoute><MobileProfile /></ProtectedRoute>
    },

    // ============================================================================
    // ADMIN (Mobile)
    // ============================================================================
    {
      path: "/mobile/admin/users",
      element: (
        <ProtectedRoute>
          <AdminRoute>
            <MobileUserManagement />
          </AdminRoute>
        </ProtectedRoute>
      )
    },
    {
      path: "/mobile/admin/comments",
      element: (
        <ProtectedRoute>
          <AdminRoute>
            <MobileLayout>
              <CommentManagement />
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