import { useState, useEffect } from 'react';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import {
  Users, Building2, Activity, TrendingUp, AlertCircle,
  Settings, Database, Shield, DollarSign, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * SuperAdmin Dashboard
 *
 * Platform Owner View - Manages entire platform
 * - View all tenants/organizations
 * - Manage platform admins
 * - System health monitoring
 * - Billing and subscriptions
 * - Platform-wide analytics
 */
export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'good',
  });

  const [stateAdmins, setStateAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    // Load platform-wide statistics
    loadPlatformStats();
    // Load state admins
    loadStateAdmins();
  }, []);

  const loadPlatformStats = async () => {
    // TODO: Integrate with Django API
    // For now, using mock data
    setStats({
      totalOrganizations: 5,
      totalAdmins: 12,
      totalUsers: 1250,
      activeUsers: 847,
      systemHealth: 'good',
    });
  };

  const loadStateAdmins = async () => {
    try {
      setLoadingAdmins(true);

      // Use apiCall helper which handles token refresh automatically
      const response = await apiCall('/superadmin/users/state_admins/');

      if (response.ok) {
        const data = await response.json();
        setStateAdmins(data.admins || []);
      } else {
        console.error('[SuperAdminDashboard] Failed to load state admins:', response.status);
        const errorText = await response.text();
        console.error('[SuperAdminDashboard] Error details:', errorText);
      }
    } catch (error) {
      console.error('[SuperAdminDashboard] Error loading state admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const statCards = [
    {
      title: 'Total Organizations',
      value: stats.totalOrganizations,
      icon: Building2,
      color: 'blue',
      link: '/super-admin/tenants',
    },
    {
      title: 'Platform Admins',
      value: stats.totalAdmins,
      icon: Shield,
      color: 'purple',
      link: '/super-admin/admins',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'green',
      link: '/admin/users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: 'indigo',
      link: '/admin/users',
    },
    {
      title: 'System Health',
      value: stats.systemHealth === 'good' ? 'Healthy' : 'Issues',
      icon: Database,
      color: stats.systemHealth === 'good' ? 'green' : 'red',
      link: '/super-admin/dashboard',
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}. Here's your platform overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${colorClasses[stat.color]} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/super-admin/tenants/new"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Building2 className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">New Organization</span>
          </Link>

          <Link
            to="/super-admin/admins"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Users className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Admins</span>
          </Link>

          <Link
            to="/super-admin/billing"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View Billing</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Platform Settings</span>
          </Link>
        </div>
      </div>

      {/* State Admins List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">State Admins</h2>
          <span className="text-sm text-gray-500">{stateAdmins.length} total</span>
        </div>

        {loadingAdmins ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading state admins...</p>
          </div>
        ) : stateAdmins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No state admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stateAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm text-gray-900">{admin.organizationName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{admin.stateName || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{admin.email}</div>
                      {admin.phone && <div className="text-xs">{admin.phone}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Platform Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center text-sm">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">New organization "TVK Tamil Nadu" created</span>
            <span className="ml-auto text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">System backup completed successfully</span>
            <span className="ml-auto text-gray-400">6 hours ago</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-gray-600">New admin user added to BJP Organization</span>
            <span className="ml-auto text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Status: All Systems Operational</h3>
            <p className="text-sm text-gray-600 mt-1">
              Database: Healthy • API: Online • Storage: 67% used • Uptime: 99.98%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
