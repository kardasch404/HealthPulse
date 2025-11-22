import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Sidebar } from '../components/organisms/Sidebar';
import { Button } from '../components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/atoms/Card';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { isAdmin, canCreate, canRead, isDoctor, isPatient } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">
                {isAdmin ? 'Admin Dashboard' : isDoctor ? 'Doctor Dashboard' : isPatient ? 'Patient Portal' : 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-semibold">
                  {user?.fname?.[0]}{user?.lname?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fname} {user?.lname}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.roleId?.name}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold">Welcome back, {user?.fname}!</h2>
            <p className="mt-2 text-white/80">
              {isAdmin && 'You have full system access as Administrator'}
              {isDoctor && 'Manage your patients and appointments'}
              {isPatient && 'View your medical records and appointments'}
            </p>
          </div>

          {/* Stats Grid - Show based on permissions */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            {canRead('patients') && (
              <Card className="border-l-4 border-primary hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {isAdmin ? 'Total Patients' : 'My Patients'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {canRead('appointments') && (
              <Card className="border-l-4 border-primary-dark hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Appointments</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary-dark/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAdmin && (
              <Card className="border-l-4 border-secondary hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAdmin && (
              <Card className="border-l-4 border-accent hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">System Health</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">Good</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions - Based on permissions */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {canCreate('appointments') && (
                    <Button className="justify-start" variant="primary">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {isPatient ? 'Book Appointment' : 'New Appointment'}
                    </Button>
                  )}

                  {canCreate('patients') && (
                    <Button className="justify-start" variant="outline">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add Patient
                    </Button>
                  )}

                  {canCreate('users') && (
                    <Button className="justify-start" variant="outline">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m0-3h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create User
                    </Button>
                  )}

                  {canRead('patients') && (
                    <Button className="justify-start" variant="outline">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Records
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {user?.fname} {user?.lname}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                  <p className="text-base text-gray-900 mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Role</p>
                  <span className="inline-flex mt-1 items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white capitalize">
                    {user?.roleId?.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
