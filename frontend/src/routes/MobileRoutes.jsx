// src/routes/MobileRoutes.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import EmailVerification from '../pages/auth/EmailVerification';
import MobileLayout from '../layouts/MobileLayout';
import MobileHome from '../pages/mobile/MobileHome';
import MobileDashboard from '../pages/mobile/MobileDashboard';
import MobileIllustrations from '../pages/mobile/MobileIllustrations';
import MobileManufacturers from '../pages/mobile/MobileManufacturers';
import MobileCarModels from '../pages/mobile/MobileCarModels';
import MobileEngineModels from '../pages/mobile/MobileEngineModels';
import MobilePartCategories from '../pages/mobile/MobilePartCategories';
import MobileProfile from '../pages/mobile/MobileProfile';
import MobileSearch from '../pages/mobile/MobileSearch';

const MobileRoutes = () => {
  const router = createBrowserRouter([
    // ==================== HOME ====================
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MobileHome />
        </ProtectedRoute>
      ),
    },
    
    // ==================== DASHBOARD ====================
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileDashboard />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== EMAIL VERIFICATION ====================
    {
      path: "/verify-email/:token",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <EmailVerification />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/verify-email",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <EmailVerification />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== ILLUSTRATION ROUTES ====================
    {
      path: "/illustrations",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileIllustrations />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/illustrations/create",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileIllustrations />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/illustrations/:id",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileIllustrations />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== MANAGEMENT ROUTES ====================
    {
      path: "/manufacturers",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileManufacturers />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/manufacturers/create",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileManufacturers />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/car-models",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileCarModels />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/car-models/create",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileCarModels />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/engine-models",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileEngineModels />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/engine-models/create",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileEngineModels />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/part-categories",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobilePartCategories />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/part-categories/create",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobilePartCategories />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== ADDITIONAL MOBILE ROUTES ====================
    {
      path: "/search",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileSearch />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <MobileLayout>
            <MobileProfile />
          </MobileLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== AUTH ROUTES ====================
    { 
      path: "/login", 
      element: <Login /> 
    },
    { 
      path: "/register", 
      element: <Register /> 
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default MobileRoutes;