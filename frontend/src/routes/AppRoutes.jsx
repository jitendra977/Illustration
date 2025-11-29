import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import EmailVerification from '../pages/auth/EmailVerification';
import DashboardLayout from '../components/layout/DashboardLayout';
import Dashboard from '../pages/dashboard/Dashboard';
const AppRoutes = () => {
  const router = createBrowserRouter([
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

    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppRoutes;