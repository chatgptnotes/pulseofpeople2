import React, { useState } from 'react';
import {
  Flag as FlagIcon,
  CheckCircle as EnabledIcon,
  Cancel as DisabledIcon,
  TrendingUp as RolloutIcon,
  Science as ExperimentalIcon,
  Settings as SettingsIcon,
  Timeline as StatsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  getAllFeatureFlags,
  getFeatureFlagStats,
  overrideFeatureFlag,
  clearFeatureFlagOverride,
  FeatureFlag,
} from '../../lib/feature-flags';

type FilterType = 'all' | 'enabled' | 'disabled' | 'rollout' | 'experimental';
type EnvironmentFilter = 'all' | 'development' | 'staging' | 'production';

export function FeatureFlagManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>(getAllFeatureFlags());
  const [filter, setFilter] = useState<FilterType>('all');
  const [envFilter, setEnvFilter] = useState<EnvironmentFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  const stats = getFeatureFlagStats();

  function handleRefresh() {
    setFlags(getAllFeatureFlags());
  }

  function handleToggleOverride(flagKey: string, enabled: boolean) {
    if (enabled) {
      clearFeatureFlagOverride(flagKey);
    } else {
      overrideFeatureFlag(flagKey, true, 60);
    }
    handleRefresh();
  }

  function getFilteredFlags(): FeatureFlag[] {
    return flags.filter((flag) => {
      // Apply type filter
      if (filter === 'enabled' && !flag.enabled) return false;
      if (filter === 'disabled' && flag.enabled) return false;
      if (filter === 'rollout' && (!flag.rolloutPercentage || flag.rolloutPercentage >= 100)) return false;
      if (filter === 'experimental' && flag.enabled) return false;

      // Apply environment filter
      if (envFilter !== 'all' && flag.environment !== 'all' && flag.environment !== envFilter) return false;

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          flag.name.toLowerCase().includes(term) ||
          flag.description.toLowerCase().includes(term) ||
          flag.key.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  const filteredFlags = getFilteredFlags();

  function getEnvironmentBadgeColor(env?: string): string {
    switch (env) {
      case 'development':
        return 'bg-yellow-100 text-yellow-700';
      case 'staging':
        return 'bg-orange-100 text-orange-700';
      case 'production':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FlagIcon className="w-8 h-8 mr-3 text-blue-600" />
                Feature Flag Manager
              </h1>
              <p className="text-gray-600 mt-1">
                Control feature rollouts and experimental features across the platform
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Flags</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFlags}</p>
                </div>
                <FlagIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enabled</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.enabledFlags}</p>
                </div>
                <EnabledIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Experimental</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.experimentalFlags}</p>
                </div>
                <ExperimentalIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Rollout</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.rolloutFlags}</p>
                </div>
                <RolloutIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <FilterIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Flags</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
                <option value="rollout">In Rollout</option>
                <option value="experimental">Experimental</option>
              </select>
            </div>

            {/* Environment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
              <select
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value as EnvironmentFilter)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Environments</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search flags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Feature Flags ({filteredFlags.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFlags.map((flag) => (
              <div
                key={flag.key}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-base font-semibold text-gray-900">{flag.name}</h4>
                      <div className="ml-3 flex items-center space-x-2">
                        {flag.enabled ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Disabled
                          </span>
                        )}
                        {flag.environment && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEnvironmentBadgeColor(flag.environment)}`}>
                            {flag.environment}
                          </span>
                        )}
                        {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {flag.rolloutPercentage}% rollout
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{flag.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Key: <code className="bg-gray-100 px-1 py-0.5 rounded">{flag.key}</code></span>
                      {flag.allowedRoles && (
                        <span>Roles: {flag.allowedRoles.join(', ')}</span>
                      )}
                      {flag.expiresAt && (
                        <span>Expires: {new Date(flag.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedFlag(flag)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Configure"
                    >
                      <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleOverride(flag.key, flag.enabled)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        flag.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredFlags.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FlagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No feature flags match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureFlagManager;
