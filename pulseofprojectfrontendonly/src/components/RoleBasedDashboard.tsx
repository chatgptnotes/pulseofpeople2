import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * RoleBasedDashboard Component
 *
 * Automatically routes users to their role-specific dashboard
 * Based on 7-tier hierarchy:
 * - superadmin → Platform management
 * - admin → State level (TN + Puducherry)
 * - manager → District level (38 districts)
 * - analyst → Constituency level (234 TN + 30 PD)
 * - user → Booth level (field workers)
 * - volunteer → Field data collection
 * - viewer → Read-only access
 */
export default function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('RoleBasedDashboard - User:', user?.email, 'Role:', user?.role);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role
  const roleRoutes: Record<string, string> = {
    'superadmin': '/superadmin',
    'super_admin': '/superadmin',
    'admin': '/dashboard/admin',
    'manager': '/dashboard/manager',
    'analyst': '/dashboard/analyst',
    'user': '/dashboard/user',
    'volunteer': '/dashboard/volunteer',
    'viewer': '/dashboard/viewer',
  };

  const dashboardRoute = roleRoutes[user.role] || '/dashboard/user';

  console.log('Redirecting to:', dashboardRoute);

  return <Navigate to={dashboardRoute} replace />;
}
