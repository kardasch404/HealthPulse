import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../presentation/pages/auth/LoginPage';
import { RegisterPage } from '../presentation/pages/auth/RegisterPage';
import { DashboardPage } from '../presentation/pages/DashboardPage';
import { UserManagement } from '../presentation/pages/admin/UserManagement';
import { ProtectedRoute } from '../presentation/components/organisms/ProtectedRoute';
import { Sidebar } from '../presentation/components/organisms/Sidebar';
import { useState } from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

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
    path: '/dashboard/users',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <UserManagement />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
