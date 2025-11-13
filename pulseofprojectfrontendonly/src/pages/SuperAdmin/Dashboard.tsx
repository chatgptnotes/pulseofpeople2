import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';

interface PlatformStats {
  totalAdmins: number;
  activeAdmins: number;
  totalOrganizations: number;
  totalTenants: number;
  trialTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalActiveUsers: number;
  newUsers7d: number;
  calculatedAt: string;
}

interface RecentActivity {
  id: string;
  tenantId: string;
  operation: string;
  performedBy: string;
  createdAt: string;
  details?: string;
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { supabase, user } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadDashboardData();
  }, [isSuperAdmin, navigate]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Load platform stats
      const { data: statsData, error: statsError } = await supabase
        .from('super_admin_stats')
        .select('*')
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Load recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('tenant_operations_log')
        .select(`
          id,
          tenant_id,
          operation,
          created_at,
          performed_by,
          users:performed_by (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      setRecentActivity(
        activityData?.map((item: any) => ({
          id: item.id,
          tenantId: item.tenant_id,
          operation: item.operation,
          performedBy: item.users?.name || 'System',
          createdAt: item.created_at,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'created':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <CancelIcon className="w-4 h-4 text-red-500" />;
      case 'activated':
        return <CheckIcon className="w-4 h-4 text-blue-500" />;
      case 'subscription_changed':
        return <TrendingUpIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <ScheduleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-8 -mt-6 mb-8">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DashboardIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
                <p className="text-sm text-gray-500">Super Admin Control Center</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {stats ? formatDate(stats.calculatedAt) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Admins */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <PeopleIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Admins</span>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{stats?.totalAdmins || 0}</p>
              <p className="ml-2 text-sm text-green-600">
                {stats?.activeAdmins || 0} active
              </p>
            </div>
            <button
              onClick={() => navigate('/super-admin/admins')}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage admins
            </button>
          </div>

          {/* Organizations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <BusinessIcon className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Organizations</span>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{stats?.totalOrganizations || 0}</p>
            </div>
            <button
              onClick={() => navigate('/super-admin/organizations')}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View organizations
            </button>
          </div>

          {/* Tenants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <ApartmentIcon className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-500">Tenants</span>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
            </div>
            <div className="mt-2 flex items-center text-sm space-x-4">
              <span className="text-green-600">{stats?.activeTenants || 0} active</span>
              <span className="text-yellow-600">{stats?.trialTenants || 0} trial</span>
              <span className="text-red-600">{stats?.suspendedTenants || 0} suspended</span>
            </div>
            <button
              onClick={() => navigate('/super-admin/tenants')}
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View all tenants
            </button>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalActiveUsers || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              +{stats?.newUsers7d || 0} in last 7 days
            </p>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
            <div className="flex items-center">
              <CheckIcon className="w-10 h-10 text-green-500 mr-3" />
              <div>
                <p className="text-lg font-semibold text-green-600">All Systems Operational</p>
                <p className="text-sm text-gray-500">Last checked: just now</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/super-admin/admins')}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Manage Admin Accounts
              </button>
              <button
                onClick={() => navigate('/super-admin/polling-booth-upload')}
                className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded"
              >
                Upload Polling Booth Data
              </button>
              <button
                onClick={() => navigate('/super-admin/tenants/new')}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded"
              >
                Provision New Tenant
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getOperationIcon(activity.operation)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.operation.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {activity.performedBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentActivity.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/super-admin/activity')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
