import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apartment as ApartmentIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface Tenant {
  id: string;
  name: string;
  displayName: string;
  subdomain: string;
  status: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  coverageArea: string;
  state: string;
  wardCount: number;
  activeUsers7d: number;
  storageGb: number;
  monthlyFee: number;
  trialEndDate?: string;
  nextBillingDate?: string;
  createdAt: string;
}

export function TenantManagement() {
  const navigate = useNavigate();
  const { supabase, user } = useAuth();
  const isAdmin = usePermission('manage_tenants');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadTenants();
  }, [isAdmin, navigate, filterStatus]);

  async function loadTenants() {
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
      let query = supabase
        .from('tenant_overview_with_org')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        if (filterStatus === 'active') {
          query = query.eq('subscription_status', 'active');
        } else {
          query = query.eq('subscription_status', filterStatus);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setTenants(
        data?.map((t: any) => ({
          id: t.id,
          name: t.name,
          displayName: t.display_name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionStatus: t.subscription_status,
          subscriptionTier: t.subscription_tier,
          coverageArea: t.coverage_area,
          state: t.state,
          wardCount: t.ward_count,
          activeUsers7d: t.avg_active_users_7d || 0,
          storageGb: t.current_storage_gb || 0,
          monthlyFee: t.monthly_fee,
          trialEndDate: t.trial_end_date,
          nextBillingDate: t.next_billing_date,
          createdAt: t.created_at,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.state.toLowerCase().includes(searchTerm.toLowerCase())
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

  async function handlePauseTenant(tenantId: string) {
    if (!confirm('Are you sure you want to pause this tenant?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status: 'suspended' })
        .eq('id', tenantId);

      if (error) throw error;

      await loadTenants();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to pause tenant:', error);
      alert('Failed to pause tenant. Please try again.');
    }
  }

  async function handleResumeTenant(tenantId: string) {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ status: 'active' })
        .eq('id', tenantId);

      if (error) throw error;

      await loadTenants();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to resume tenant:', error);
      alert('Failed to resume tenant. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenants...</p>
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
              <ApartmentIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                <p className="text-sm text-gray-500">Manage your campaign tenants</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/tenants/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Create Tenant
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
              <ApartmentIcon className="w-10 h-10 text-purple-600" />
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
              <TrendingUpIcon className="w-10 h-10 text-green-600" />
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
              <PublicIcon className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tenants.reduce((sum, t) => sum + t.activeUsers7d, 0)}
                </p>
              </div>
              <PeopleIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <FilterIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
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
              <button
                onClick={() => navigate('/admin/tenants/new')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <AddIcon className="w-5 h-5 mr-2" />
                Create Your First Tenant
              </button>
            </div>
          ) : (
            filteredTenants.map((tenant) => {
              const badge = getStatusBadge(tenant.status, tenant.subscriptionStatus);

              return (
                <div
                  key={tenant.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
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
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowActionsMenu(showActionsMenu === tenant.id ? null : tenant.id)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreIcon className="w-5 h-5" />
                        </button>

                        {showActionsMenu === tenant.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <EditIcon className="w-4 h-4 mr-2" />
                                Edit Details
                              </button>
                              <button
                                onClick={() => navigate(`/admin/tenants/${tenant.id}/settings`)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <SettingsIcon className="w-4 h-4 mr-2" />
                                Settings
                              </button>
                              {tenant.status === 'active' ? (
                                <button
                                  onClick={() => handlePauseTenant(tenant.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                >
                                  <PauseIcon className="w-4 h-4 mr-2" />
                                  Pause Tenant
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleResumeTenant(tenant.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <ResumeIcon className="w-4 h-4 mr-2" />
                                  Resume Tenant
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
                    <div className="flex items-center text-sm">
                      <PublicIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{tenant.state}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <PeopleIcon className="w-3 h-3 mr-1" />
                          Users
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {tenant.activeUsers7d}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <StorageIcon className="w-3 h-3 mr-1" />
                          Storage
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {tenant.storageGb.toFixed(1)} GB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <button
                      onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
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

export default TenantManagement;
