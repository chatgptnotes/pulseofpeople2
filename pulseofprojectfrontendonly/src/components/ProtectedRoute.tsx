/**
 * Protected Route Component
 * Handles authentication and role-based access control
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import type { PermissionName, UserRole } from '../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionName;
  requiredPermissions?: PermissionName[]; // Require ALL of these
  anyPermission?: PermissionName[]; // Require ANY of these
  requiredRole?: UserRole;
  superAdminOnly?: boolean;
  adminOnly?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  anyPermission,
  requiredRole,
  superAdminOnly = false,
  adminOnly = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  // ✅ AUTHENTICATION ENABLED - Using Mock Auth
  // Mock authentication is enabled in AuthContext (no backend needed)
  // You can log in with test credentials from AuthContext.tsx
  const DISABLE_AUTH = false;

  if (DISABLE_AUTH) {
    console.log('⚠️ [ProtectedRoute] AUTH DISABLED - Development Mode');
    return <>{children}</>;
  }

  const { user, isLoading: authLoading, isInitializing } = useAuth();
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRoleOrHigher,
    isSuperAdmin,
    isAdmin,
    loading: permissionsLoading,
  } = usePermissions();

  console.log('[ProtectedRoute] Check:', {
    user: user?.email,
    isInitializing,
    authLoading,
    permissionsLoading,
    requiredRole,
    requiredPermission
  });

  // Show loading state while checking authentication
  // CRITICAL: Must wait for isInitializing to complete!
  if (isInitializing || authLoading || permissionsLoading) {
    console.log('[ProtectedRoute] ⏳ Waiting... isInitializing:', isInitializing, 'authLoading:', authLoading, 'permissionsLoading:', permissionsLoading);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[ProtectedRoute] ❌ No user, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[ProtectedRoute] ✅ User authenticated:', user.email, user.role);

  // Check super admin requirement
  if (superAdminOnly && !isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check admin requirement
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRoleOrHigher(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check all permissions requirement
  if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any permission requirement
  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
}

// =====================================================
// CONVENIENCE WRAPPER COMPONENTS
// =====================================================

/**
 * Super Admin only route
 */
export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute superAdminOnly>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin only route
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin or Manager route
 */
export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute anyPermission={['view_users', 'manage_field_workers']}>
      {children}
    </ProtectedRoute>
  );
}
