import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import EmailVerification from '../pages/auth/EmailVerification';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import IllustrationDashboard from '../pages/Illustrations/IllustrationDashboard';
import ManufacturerManagement from '../pages/Illustrations/ManufacturerManagement';
import CarModelManagement from '../pages/Illustrations/CarModelManagement';
import EngineModelManagement from '../pages/Illustrations/EngineModelManagement';
import PartCategoryManagement from '../pages/Illustrations/PartCategoryManagement';

const AppRoutes = () => {
  const router = createBrowserRouter([
    // ==================== DASHBOARD ====================
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== EMAIL VERIFICATION ====================
    {
      path: "/verify-email/:token",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <EmailVerification />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/verify-email",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <EmailVerification />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== ILLUSTRATION ROUTES ====================
    {
      path: "/illustrations",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <IllustrationDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/illustrations/create",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <IllustrationDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/illustrations/:id",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <IllustrationDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    
    // ==================== MANAGEMENT ROUTES ====================
    {
      path: "/manufacturers",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <ManufacturerManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/manufacturers/create",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <ManufacturerManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/car-models",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <CarModelManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/car-models/create",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <CarModelManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/engine-models",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <EngineModelManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/engine-models/create",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <EngineModelManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/part-categories",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <PartCategoryManagement />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/part-categories/create",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <PartCategoryManagement />
          </DashboardLayout>
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

export default AppRoutes;