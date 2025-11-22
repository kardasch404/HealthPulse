import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/atoms/Card';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-primary">HealthPulse</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-semibold">
                  {user?.fname?.[0]}{user?.lname?.[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fname} {user?.lname}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.roleId?.name}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold">Welcome back, {user?.fname}!</h2>
          <p className="mt-2 text-white/80">
            Here's what's happening with your clinic today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-primary-dark">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary-dark/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-secondary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Consultations</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-accent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {user?.fname} {user?.lname}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-base text-gray-900 mt-1">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                <span className="inline-flex mt-1 items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white capitalize">
                  {user?.roleId?.name}
                </span>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-base text-gray-900 mt-1">{user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center">
                <svg className="h-5 w-5 mr-2 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-light hover:bg-light/10 transition-colors flex items-center">
                  <svg className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">New Patient</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-light hover:bg-light/10 transition-colors flex items-center">
                  <svg className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Schedule Appointment</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-light hover:bg-light/10 transition-colors flex items-center">
                  <svg className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center">
                <svg className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-sm text-gray-500">
                  No recent activity
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
