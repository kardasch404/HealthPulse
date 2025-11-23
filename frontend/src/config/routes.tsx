import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../presentation/pages/auth/LoginPage';
import { RegisterPage } from '../presentation/pages/auth/RegisterPage';
import { DashboardPage } from '../presentation/pages/DashboardPage';
import { UserManagement } from '../presentation/pages/admin/UserManagement';
import { RoleManagement } from '../presentation/pages/admin/RoleManagement';
import { PharmacyManagement } from '../presentation/pages/admin/PharmacyManagement';
import { LaboratoryManagement } from '../presentation/pages/admin/LaboratoryManagement';
import { MyPatients } from '../presentation/pages/doctor/MyPatients';
import { MyAppointments } from '../presentation/pages/doctor/MyAppointments';
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
    path: '/dashboard/roles',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <RoleManagement />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/pharmacies',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <PharmacyManagement />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/laboratories',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <LaboratoryManagement />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/appointments',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <MyAppointments />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/patients',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <MyPatients />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/consultations',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Consultations</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/prescriptions',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Prescriptions</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/lab-orders',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Lab Orders</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/documents',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/settings',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
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
