import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface OrganizationStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  activeUsers7d: number;
  totalStorageGb: number;
  monthlySpend: number;
  nextBillingDate?: string;
}

interface TenantCard {
  id: string;
  name: string;
  displayName: string;
  subdomain: string;
  status: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  state: string;
  activeUsers7d: number;
  storageGb: number;
  monthlyFee: number;
  nextBillingDate?: string;
  createdAt: string;
}

interface RecentActivity {
  id: string;
  action: string;
  tenantName: string;
  userName: string;
  timestamp: string;
}

export function OrganizationDashboard() {
  const navigate = useNavigate();
  const { supabase, user } = useAuth();
  const isAdmin = usePermission('manage_tenants');

  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [tenants, setTenants] = useState<TenantCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadDashboardData();
  }, [isAdmin, navigate]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Get user's organization
      const { data: orgData, error: orgError } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (orgError) throw orgError;

      const orgId = orgData.organization_id;
      setOrganizationId(orgId);

      // Load organization tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenant_overview_with_org')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      const mappedTenants = tenantsData?.map((t: any) => ({
        id: t.id,
        name: t.name,
        displayName: t.display_name,
        subdomain: t.subdomain,
        status: t.status,
        subscriptionStatus: t.subscription_status,
        subscriptionTier: t.subscription_tier,
        state: t.state,
        activeUsers7d: t.avg_active_users_7d || 0,
        storageGb: t.current_storage_gb || 0,
        monthlyFee: t.monthly_fee,
        nextBillingDate: t.next_billing_date,
        createdAt: t.created_at,
      })) || [];

      setTenants(mappedTenants);

      // Calculate stats
      const calculatedStats: OrganizationStats = {
        totalTenants: mappedTenants.length,
        activeTenants: mappedTenants.filter(t => t.subscriptionStatus === 'active').length,
        trialTenants: mappedTenants.filter(t => t.subscriptionStatus === 'trial').length,
        suspendedTenants: mappedTenants.filter(t => t.status === 'suspended').length,
        totalUsers: mappedTenants.reduce((sum, t) => sum + t.activeUsers7d, 0),
        activeUsers7d: mappedTenants.reduce((sum, t) => sum + t.activeUsers7d, 0),
        totalStorageGb: mappedTenants.reduce((sum, t) => sum + t.storageGb, 0),
        monthlySpend: mappedTenants
          .filter(t => t.subscriptionStatus === 'active')
          .reduce((sum, t) => sum + t.monthlyFee, 0),
      };

      setStats(calculatedStats);

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          action: 'Tenant Created',
          tenantName: mappedTenants[0]?.name || 'Unknown',
          userName: user?.name || 'You',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'green';
      case 'trial':
        return 'yellow';
      case 'suspended':
        return 'red';
      default:
        return 'gray';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BusinessIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your tenants and organization</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/tenants/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              New Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tenants */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <ApartmentIcon className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">Total Tenants</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
            <div className="mt-2 flex items-center text-sm space-x-3">
              <span className="text-green-600">{stats?.activeTenants || 0} active</span>
              <span className="text-yellow-600">{stats?.trialTenants || 0} trial</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <PeopleIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Active Users</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers7d || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
          </div>

          {/* Storage Used */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <AssessmentIcon className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-500">Storage Used</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalStorageGb.toFixed(1) || 0} GB
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all tenants</p>
          </div>

          {/* Monthly Spend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <MoneyIcon className="w-8 h-8 text-yellow-600" />
              <span className="text-sm font-medium text-gray-500">Monthly Spend</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats?.monthlySpend || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Subscription costs</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/tenants')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <ApartmentIcon className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Tenants</h3>
            <p className="text-sm text-gray-600">View and manage all your tenants</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <PeopleIcon className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Invite and manage organization users</p>
          </button>

          <button
            onClick={() => navigate('/admin/settings')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <SettingsIcon className="w-10 h-10 text-gray-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization Settings</h3>
            <p className="text-sm text-gray-600">Configure organization preferences</p>
          </button>
        </div>

        {/* Tenants List */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Tenants</h2>
            <button
              onClick={() => navigate('/admin/tenants')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>

          {tenants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ApartmentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenants Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first tenant to start managing campaigns
              </p>
              <button
                onClick={() => navigate('/admin/tenants/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <AddIcon className="w-5 h-5 mr-2" />
                Create First Tenant
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tenants.slice(0, 5).map((tenant) => {
                const statusColor = getStatusColor(tenant.subscriptionStatus);
                return (
                  <div
                    key={tenant.id}
                    onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-base font-semibold text-gray-900">
                            {tenant.displayName}
                          </h3>
                          <span
                            className={`ml-3 px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800`}
                          >
                            {tenant.subscriptionStatus}
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {tenant.subscriptionTier}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                          <span>{tenant.subdomain}.yourapp.com</span>
                          <span>{tenant.state}</span>
                          <span>{tenant.activeUsers7d} active users</span>
                          <span>{tenant.storageGb.toFixed(1)} GB</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-gray-900">
                          {formatCurrency(tenant.monthlyFee)}/mo
                        </p>
                        {tenant.nextBillingDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Next bill: {formatDate(tenant.nextBillingDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <NotificationsIcon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {activity.tenantName} by {activity.userName}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default OrganizationDashboard;
