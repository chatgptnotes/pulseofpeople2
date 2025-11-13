import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../../contexts/AuthContext';
import {
  ArrowBack as BackIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { VersionFooter } from '../../components/VersionFooter';

interface TenantDetail {
  id: string;
  name: string;
  party_name: string;
  party_symbol?: string;
  party_color?: string;
  subscription_status: string;
  subscription_tier: string;
  max_users: number;
  current_users: number;
  admins: Array<{
    username: string;
    email: string;
    role: string;
  }>;
  created_at: string;
  updated_at: string;
}

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenantDetail();
  }, [id]);

  async function loadTenantDetail() {
    try {
      setLoading(true);
      const response = await apiCall(`/superadmin/tenants/${id}/`);

      if (response.ok) {
        const data = await response.json();
        console.log('[TenantDetail] Tenant loaded:', data);

        if (data.success && data.tenant) {
          setTenant(data.tenant);
        } else {
          console.error('[TenantDetail] Invalid response format');
        }
      } else {
        console.error('[TenantDetail] Failed to load tenant:', response.status);
      }
    } catch (error) {
      console.error('[TenantDetail] Error loading tenant:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BusinessIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Tenant not found</p>
          <button
            onClick={() => navigate('/super-admin/tenants')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/super-admin/tenants')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BackIcon className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tenant.party_name}</h1>
                <p className="text-sm text-gray-500 mt-1">{tenant.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <EditIcon className="w-5 h-5" />
                <span>Edit</span>
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2">
                <DeleteIcon className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Organization Name</p>
                  <p className="font-medium">{tenant.party_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tenant.subscription_status === 'active' ? <ActiveIcon className="w-4 h-4 mr-1" /> : <InactiveIcon className="w-4 h-4 mr-1" />}
                    {tenant.subscription_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subscription Tier</p>
                  <p className="font-medium capitalize">{tenant.subscription_tier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party Symbol</p>
                  <p className="font-medium">{tenant.party_symbol || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(tenant.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(tenant.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Admins Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Administrators</h2>
              {tenant.admins && tenant.admins.length > 0 ? (
                <div className="space-y-3">
                  {tenant.admins.map((admin, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{admin.username}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {admin.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No administrators found</p>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Users Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Users</h3>
                <PeopleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Users</span>
                  <span className="font-bold">{tenant.current_users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Users</span>
                  <span className="font-bold">{tenant.max_users}</span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Usage</span>
                    <span className={tenant.current_users >= tenant.max_users ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {Math.round((tenant.current_users / tenant.max_users) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${tenant.current_users >= tenant.max_users ? 'bg-red-600' : 'bg-green-600'}`}
                      style={{ width: `${Math.min((tenant.current_users / tenant.max_users) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Storage</h3>
                <StorageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">0 GB</p>
              <p className="text-sm text-gray-500 mt-1">of unlimited</p>
            </div>
          </div>
        </div>
      </div>

      <VersionFooter />
    </div>
  );
}
