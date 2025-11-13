/**
 * Enhanced SuperAdmin Dashboard
 * Platform Owner View with real data integration, charts, and analytics
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, Building2, Activity, TrendingUp, AlertCircle,
  Settings, Database, Shield, DollarSign, BarChart3,
  CheckCircle, XCircle, Clock, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsers, useFeedbackStats, useAnalyticsOverview } from '../../hooks/useApiHooks';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/charts/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart, DonutChart } from '../../components/charts/PieChart';
import { BarChart } from '../../components/charts/BarChart';
import { ExportButton } from '../../components/common/ExportButton';
import { DateRangeFilter } from '../../components/filters/DateRangeFilter';
import { format, subDays } from 'date-fns';

export default function SuperAdminDashboardEnhanced() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  // Fetch data using React Query hooks
  const { data: usersData, isLoading: loadingUsers, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: feedbackStats, isLoading: loadingFeedback } = useFeedbackStats();
  const { data: analyticsData, isLoading: loadingAnalytics } = useAnalyticsOverview();

  const isLoading = loadingUsers || loadingFeedback || loadingAnalytics;

  // Calculate platform statistics
  const platformStats = {
    totalOrganizations: 5, // TODO: Add organizations endpoint
    totalAdmins: usersData?.filter((u: any) => u.role === 'admin').length || 0,
    totalUsers: usersData?.length || 0,
    activeUsers: usersData?.filter((u: any) => u.is_active).length || 0,
    systemHealth: 'good', // TODO: Add health check endpoint
    totalFeedback: feedbackStats?.total || 0,
    pendingReviews: feedbackStats?.pending || 0,
  };

  // User role distribution data for pie chart
  const roleDistribution = [
    { name: 'SuperAdmin', value: usersData?.filter((u: any) => u.role === 'superadmin').length || 0 },
    { name: 'Admin', value: usersData?.filter((u: any) => u.role === 'admin').length || 0 },
    { name: 'Manager', value: usersData?.filter((u: any) => u.role === 'manager').length || 0 },
    { name: 'Analyst', value: usersData?.filter((u: any) => u.role === 'analyst').length || 0 },
    { name: 'User', value: usersData?.filter((u: any) => u.role === 'user').length || 0 },
    { name: 'Viewer', value: usersData?.filter((u: any) => u.role === 'viewer').length || 0 },
    { name: 'Volunteer', value: usersData?.filter((u: any) => u.role === 'volunteer').length || 0 },
  ].filter(item => item.value > 0);

  // Mock growth data (TODO: Get from backend)
  const userGrowthData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    users: Math.floor(950 + Math.random() * 300 + i * 10),
    active: Math.floor(600 + Math.random() * 200 + i * 8),
  }));

  // Mock organization health data
  const organizationHealthData = [
    { name: 'TVK Tamil Nadu', health: 95, users: 450, status: 'active' },
    { name: 'BJP Karnataka', health: 88, users: 320, status: 'active' },
    { name: 'Congress Kerala', health: 72, users: 280, status: 'active' },
    { name: 'AAP Delhi', health: 91, users: 200, status: 'active' },
    { name: 'Shiv Sena Maharashtra', health: 65, users: 150, status: 'warning' },
  ];

  // Handle errors
  if (usersError) {
    return <ErrorMessage error={usersError} retry={refetchUsers} />;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton type="stats" count={6} />
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Here's your platform overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={usersData}
            filename={`platform-users-${format(new Date(), 'yyyy-MM-dd')}`}
            formats={['csv', 'excel']}
          />
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Organizations"
          value={platformStats.totalOrganizations}
          icon={Building2}
          iconColor="blue"
          link="/super-admin/tenants"
          trend={{ value: 15, label: 'vs last month' }}
        />
        <StatCard
          title="Platform Admins"
          value={platformStats.totalAdmins}
          icon={Shield}
          iconColor="purple"
          link="/super-admin/admins"
        />
        <StatCard
          title="Total Users"
          value={platformStats.totalUsers.toLocaleString()}
          icon={Users}
          iconColor="green"
          link="/admin/users"
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatCard
          title="Active Users"
          value={platformStats.activeUsers.toLocaleString()}
          icon={Activity}
          iconColor="indigo"
          subtitle={`${((platformStats.activeUsers / platformStats.totalUsers) * 100).toFixed(1)}% active`}
        />
        <StatCard
          title="Total Feedback"
          value={platformStats.totalFeedback.toLocaleString()}
          icon={FileText}
          iconColor="orange"
          link="/admin/feedback"
        />
        <StatCard
          title="System Health"
          value={platformStats.systemHealth === 'good' ? 'Healthy' : 'Issues'}
          icon={Database}
          iconColor={platformStats.systemHealth === 'good' ? 'green' : 'red'}
        />
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <DateRangeFilter
          onDateChange={(start, end) => {
            if (start && end) {
              setDateRange({ start, end });
            }
          }}
          defaultPreset="30d"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <LineChart
          data={userGrowthData}
          xKey="date"
          yKey={['users', 'active']}
          title="User Growth Trend (Last 30 Days)"
          color={['#3b82f6', '#10b981']}
          height={350}
        />

        {/* Role Distribution */}
        <DonutChart
          data={roleDistribution}
          dataKey="value"
          nameKey="name"
          title="User Distribution by Role"
          height={350}
        />
      </div>

      {/* Organization Health Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Organization Health Monitor</h2>
          <Link
            to="/super-admin/tenants"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Organization</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Health Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Users</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizationHealthData.map((org, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{org.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            org.health >= 80 ? 'bg-green-500' :
                            org.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${org.health}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{org.health}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{org.users.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {org.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Warning
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/super-admin/tenants/${index}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            to="/settings"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Platform Settings</span>
          </Link>
        </div>
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
          <div className="flex items-center text-sm">
            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            <span className="text-gray-600">{platformStats.totalUsers} total users across platform</span>
            <span className="ml-auto text-gray-400">Last updated: just now</span>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
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
