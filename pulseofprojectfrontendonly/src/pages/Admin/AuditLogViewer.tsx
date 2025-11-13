import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Apartment as TenantIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  tenantId?: string;
  tenantName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export function AuditLogViewer() {
  const navigate = useNavigate();
  const { supabase, user } = useAuth();
  const isAdmin = usePermission('view_audit_logs');

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadAuditLogs();
  }, [isAdmin, navigate, filterCategory, filterAction, dateRange]);

  async function loadAuditLogs() {
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

      // Calculate date filter
      let startDate = new Date();
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'all':
          startDate = new Date('2020-01-01'); // Far past date
          break;
      }

      // Load audit logs for organization
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users:user_id (name, email),
          tenants:tenant_id (name)
        `)
        .eq('organization_id', orgId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(
        data?.map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          userId: log.user_id,
          userName: log.users?.name || 'Unknown',
          userEmail: log.users?.email || 'Unknown',
          action: log.action,
          category: log.category,
          resourceType: log.resource_type,
          resourceId: log.resource_id,
          resourceName: log.resource_name,
          tenantId: log.tenant_id,
          tenantName: log.tenants?.name,
          details: log.details,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          success: log.success,
          errorMessage: log.error_message,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(searchLower) ||
      log.userEmail.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.resourceType.toLowerCase().includes(searchLower) ||
      log.resourceName?.toLowerCase().includes(searchLower) ||
      log.tenantName?.toLowerCase().includes(searchLower)
    );
  });

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function getActionIcon(action: string) {
    if (action.includes('create') || action.includes('add')) return AddIcon;
    if (action.includes('update') || action.includes('edit')) return EditIcon;
    if (action.includes('delete') || action.includes('remove')) return DeleteIcon;
    if (action.includes('login') || action.includes('auth')) return SecurityIcon;
    return InfoIcon;
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'user':
        return PersonIcon;
      case 'tenant':
        return TenantIcon;
      case 'settings':
        return SettingsIcon;
      case 'billing':
        return PaymentIcon;
      case 'security':
        return SecurityIcon;
      default:
        return HistoryIcon;
    }
  }

  async function exportToCSV() {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Category', 'Resource', 'Tenant', 'Success', 'IP Address'],
      ...filteredLogs.map((log) => [
        formatDateTime(log.timestamp),
        `${log.userName} (${log.userEmail})`,
        log.action,
        log.category,
        `${log.resourceType}: ${log.resourceName || log.resourceId}`,
        log.tenantName || 'N/A',
        log.success ? 'Yes' : 'No',
        log.ipAddress || 'N/A',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
              <HistoryIcon className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Log Viewer</h1>
                <p className="text-sm text-gray-500">Track all system and admin actions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadAuditLogs}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </div>
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
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <HistoryIcon className="w-10 h-10 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">User Actions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {logs.filter((l) => l.category === 'user').length}
                </p>
              </div>
              <PersonIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tenant Changes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {logs.filter((l) => l.category === 'tenant').length}
                </p>
              </div>
              <TenantIcon className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter((l) => !l.success).length}
                </p>
              </div>
              <SecurityIcon className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <FilterIcon className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="user">User</option>
                <option value="tenant">Tenant</option>
                <option value="billing">Billing</option>
                <option value="settings">Settings</option>
                <option value="security">Security</option>
              </select>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const ActionIcon = getActionIcon(log.action);
                    const CategoryIcon = getCategoryIcon(log.category);

                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <PersonIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                              <p className="text-xs text-gray-500">{log.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <ActionIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {log.action.replace(/_/g, ' ')}
                              </p>
                              <div className="flex items-center text-xs text-gray-500">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {log.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{log.resourceType}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {log.resourceName || log.resourceId}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {log.tenantName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.success ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Timestamp</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{selectedLog.success ? 'Success' : 'Failed'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="text-sm text-gray-900">
                  {selectedLog.userName} ({selectedLog.userEmail})
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Action</p>
                <p className="text-sm text-gray-900 capitalize">
                  {selectedLog.action.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-sm text-gray-900 capitalize">{selectedLog.category}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Resource</p>
                <p className="text-sm text-gray-900">
                  {selectedLog.resourceType}: {selectedLog.resourceName || selectedLog.resourceId}
                </p>
              </div>

              {selectedLog.tenantName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tenant</p>
                  <p className="text-sm text-gray-900">{selectedLog.tenantName}</p>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div>
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className="text-sm font-medium text-gray-500">User Agent</p>
                  <p className="text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div>
                  <p className="text-sm font-medium text-red-500">Error Message</p>
                  <p className="text-sm text-red-600">{selectedLog.errorMessage}</p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Additional Details</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-900 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default AuditLogViewer;
