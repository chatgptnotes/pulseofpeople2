/**
 * Tenant Management Dashboard
 * Admin interface for managing all tenants in the multi-tenant system
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  status: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  coverageArea: string;
  state: string;
  wardCount: number;
  contactEmail: string;
  createdAt: string;
  healthScore?: number;
  healthStatus?: string;
  apiCalls7d?: number;
  avgActiveUsers7d?: number;
  currentStorageGb?: number;
}

export function TenantManagementDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const registryUrl = import.meta.env.VITE_TENANT_REGISTRY_URL || '';
  const registryKey = import.meta.env.VITE_TENANT_REGISTRY_ANON_KEY || '';

  useEffect(() => {
    loadTenants();
  }, [filter]);

  async function loadTenants() {
    try {
      setLoading(true);

      const supabase = createClient(registryUrl, registryKey);

      let query = supabase
        .from('tenant_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('status', 'active').eq('subscription_status', 'active');
      } else if (filter === 'trial') {
        query = query.eq('subscription_status', 'trial');
      } else if (filter === 'suspended') {
        query = query.eq('status', 'suspended');
      }

      const { data, error } = await query;

      if (error) throw error;

      setTenants(
        data?.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          displayName: t.display_name,
          status: t.status,
          subscriptionStatus: t.subscription_status,
          subscriptionTier: t.subscription_tier,
          coverageArea: t.coverage_area,
          state: t.state,
          wardCount: t.ward_count,
          contactEmail: t.contact_email,
          createdAt: t.created_at,
          healthScore: t.health_score,
          healthStatus: t.health_status,
          apiCalls7d: t.api_calls_7d,
          avgActiveUsers7d: t.avg_active_users_7d,
          currentStorageGb: t.current_storage_gb,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.status === 'active' && t.subscriptionStatus === 'active').length,
    trial: tenants.filter((t) => t.subscriptionStatus === 'trial').length,
    suspended: tenants.filter((t) => t.status === 'suspended').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Management</h1>
          <p className="text-gray-600">Manage all tenants across your multi-tenant platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Tenants"
            value={stats.total}
            icon="🏢"
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon="✅"
            color="bg-green-50 text-green-700"
          />
          <StatCard title="Trial" value={stats.trial} icon="🔄" color="bg-yellow-50 text-yellow-700" />
          <StatCard
            title="Suspended"
            value={stats.suspended}
            icon="⚠️"
            color="bg-red-50 text-red-700"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <FilterButton
                label="All"
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterButton
                label="Active"
                active={filter === 'active'}
                onClick={() => setFilter('active')}
              />
              <FilterButton
                label="Trial"
                active={filter === 'trial'}
                onClick={() => setFilter('trial')}
              />
              <FilterButton
                label="Suspended"
                active={filter === 'suspended'}
                onClick={() => setFilter('suspended')}
              />
            </div>

            {/* Actions */}
            <button
              onClick={loadTenants}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tenant List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tenants...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.displayName}</div>
                        <div className="text-sm text-gray-500">{tenant.slug}.pulseofpeople.com</div>
                        <div className="text-xs text-gray-400">{tenant.state}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={tenant.subscriptionStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TierBadge tier={tenant.subscriptionTier} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <HealthIndicator score={tenant.healthScore} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tenant.apiCalls7d?.toLocaleString() || 0} API calls
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(tenant.avgActiveUsers7d || 0)} avg users
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => window.open(`https://${tenant.slug}.pulseofpeople.com`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Visit
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tenants found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-3xl ${color} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.expired}`}>
      {status}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors = {
    basic: 'bg-gray-100 text-gray-800',
    standard: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[tier as keyof typeof colors] || colors.basic}`}>
      {tier}
    </span>
  );
}

function HealthIndicator({ score }: { score?: number }) {
  if (!score) {
    return <span className="text-sm text-gray-400">N/A</span>;
  }

  let color = 'text-green-600';
  let icon = '●';

  if (score < 50) {
    color = 'text-red-600';
  } else if (score < 80) {
    color = 'text-yellow-600';
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl ${color}`}>{icon}</span>
      <span className="text-sm font-medium text-gray-900">{score}%</span>
    </div>
  );
}
