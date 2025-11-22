import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../presentation/pages/auth/LoginPage';
import { RegisterPage } from '../presentation/pages/auth/RegisterPage';
import { DashboardPage } from '../presentation/pages/DashboardPage';
import { ProtectedRoute } from '../presentation/components/organisms/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
