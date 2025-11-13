import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apartment as ApartmentIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Public as PublicIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  subdomain: string;
  status: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  coverageArea: string;
  state: string;
  wardCount: number;
  monthlyFee: number;
  organizationId: string;
  organizationName: string;
  adminName: string;
  adminEmail: string;
  apiCalls7d?: number;
  avgActiveUsers7d?: number;
  currentStorageGb?: number;
  createdAt: string;
}

export function TenantRegistry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [filterTier, setFilterTier] = useState<'all' | 'basic' | 'standard' | 'premium' | 'enterprise'>('all');

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadTenants();
  }, [isSuperAdmin, navigate, filterStatus, filterTier]);

  async function loadTenants() {
    try {
      setLoading(true);

      // Build query params for filtering
      let queryParams = '';
      if (filterStatus !== 'all') {
        queryParams += `&status=${filterStatus}`;
      }
      if (filterTier !== 'all') {
        queryParams += `&tier=${filterTier}`;
      }

      // Fetch tenants from Django API
      const response = await apiCall(`/superadmin/tenants/${queryParams ? '?' + queryParams.substring(1) : ''}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[TenantRegistry] Tenants loaded:', data);

        // Transform Django response to match our interface
        const tenantsData = (data.results || data.tenants || data || []).map((t: any) => ({
          id: t.id?.toString() || '',
          slug: t.slug || '',
          name: t.name || '',
          displayName: t.display_name || t.name || '',
          subdomain: t.subdomain || '',
          status: t.status || 'active',
          subscriptionStatus: t.subscription_status || 'active',
          subscriptionTier: t.subscription_tier || 'standard',
          coverageArea: t.coverage_area || '',
          state: t.state || '',
          wardCount: t.ward_count || 0,
          monthlyFee: t.monthly_fee || 0,
          organizationId: t.organization_id?.toString() || t.organization?.toString() || '',
          organizationName: t.organization_name || '',
          adminName: t.admin_name || '',
          adminEmail: t.admin_email || '',
          apiCalls7d: t.api_calls_7d || 0,
          avgActiveUsers7d: t.avg_active_users_7d || 0,
          currentStorageGb: t.current_storage_gb || 0,
          createdAt: t.created_at || new Date().toISOString(),
        }));

        setTenants(tenantsData);
      } else {
        console.error('[TenantRegistry] Failed to load tenants:', response.status);
        setTenants([]); // Set empty array on error
      }
    } catch (error) {
      console.error('[TenantRegistry] Error loading tenants:', error);
      setTenants([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  function getHealthStatus(tenant: Tenant) {
    // Simple health calculation based on activity
    if (tenant.avgActiveUsers7d && tenant.avgActiveUsers7d > 10) {
      return { status: 'healthy', icon: HealthyIcon, color: 'green' };
    } else if (tenant.avgActiveUsers7d && tenant.avgActiveUsers7d > 5) {
      return { status: 'warning', icon: WarningIcon, color: 'yellow' };
    }
    return { status: 'critical', icon: ErrorIcon, color: 'red' };
  }

  function getStatusBadge(status: string, subscriptionStatus: string) {
    if (status === 'suspended') {
      return { text: 'Suspended', color: 'red' };
    }
    if (subscriptionStatus === 'trial') {
      return { text: 'Trial', color: 'yellow' };
    }
    if (subscriptionStatus === 'active') {
      return { text: 'Active', color: 'green' };
    }
    return { text: subscriptionStatus, color: 'gray' };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant registry...</p>
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
              <ApartmentIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tenant Registry</h1>
                <p className="text-sm text-gray-500">All tenants across all organizations</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/super-admin/tenants/new')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Provision Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
              </div>
              <ApartmentIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {tenants.filter((t) => t.subscriptionStatus === 'active').length}
                </p>
              </div>
              <HealthyIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trial</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tenants.filter((t) => t.subscriptionStatus === 'trial').length}
                </p>
              </div>
              <WarningIcon className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, subdomain, state, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <ApartmentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tenants found</p>
            </div>
          ) : (
            filteredTenants.map((tenant) => {
              const health = getHealthStatus(tenant);
              const badge = getStatusBadge(tenant.status, tenant.subscriptionStatus);
              const HealthIcon = health.icon;

              return (
                <div
                  key={tenant.id}
                  onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {tenant.displayName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <PublicIcon className="w-4 h-4 mr-1" />
                          {tenant.subdomain}.yourapp.com
                        </div>
                      </div>
                      <HealthIcon className={`w-6 h-6 text-${health.color}-500`} />
                    </div>

                    <div className="flex items-center mt-3 space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full bg-${badge.color}-100 text-${badge.color}-800`}
                      >
                        {badge.text}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {tenant.subscriptionTier}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {/* Organization */}
                    <div className="flex items-center text-sm">
                      <BusinessIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{tenant.organizationName}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm">
                      <PublicIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{tenant.state}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <PeopleIcon className="w-3 h-3 mr-1" />
                          Users
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {tenant.avgActiveUsers7d?.toFixed(0) || 0}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <StorageIcon className="w-3 h-3 mr-1" />
                          Storage
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {tenant.currentStorageGb?.toFixed(1) || 0} GB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <p className="text-xs text-gray-500">
                      Created {formatDate(tenant.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default TenantRegistry;
