import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Cancel as FailedIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface BillingStats {
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnedThisMonth: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  organizationName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  dueDate: string;
  paidDate?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subscriptionTier: string;
  paymentMethod?: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  organizationName: string;
  tier: string;
  status: string;
  monthlyFee: number;
  billingCycle: string;
  startDate: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  paymentStatus: string;
}

export function BillingDashboard() {
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const isSuperAdmin = usePermission('manage_organizations');

  const [stats, setStats] = useState<BillingStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'subscriptions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'failed'>('all');

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadBillingData();
  }, [isSuperAdmin, navigate]);

  async function loadBillingData() {
    try {
      setLoading(true);

      // Load billing stats
      const statsData = await calculateBillingStats();
      setStats(statsData);

      // Load recent invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          tenants:tenant_id (
            name,
            organizations:organization_id (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (invoicesError) throw invoicesError;

      setInvoices(
        invoicesData?.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          tenantId: inv.tenant_id,
          tenantName: inv.tenants?.name || 'Unknown',
          organizationName: inv.tenants?.organizations?.name || 'Unknown',
          amount: inv.amount,
          currency: inv.currency,
          status: inv.status,
          dueDate: inv.due_date,
          paidDate: inv.paid_date,
          billingPeriodStart: inv.billing_period_start,
          billingPeriodEnd: inv.billing_period_end,
          subscriptionTier: inv.subscription_tier,
          paymentMethod: inv.payment_method,
          createdAt: inv.created_at,
        })) || []
      );

      // Load subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('tenant_overview_with_org')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      setSubscriptions(
        subsData?.map((sub: any) => ({
          id: sub.id,
          tenantId: sub.id,
          tenantName: sub.name,
          organizationName: sub.organization_name,
          tier: sub.subscription_tier,
          status: sub.subscription_status,
          monthlyFee: sub.monthly_fee,
          billingCycle: sub.billing_cycle,
          startDate: sub.subscription_start,
          nextBillingDate: sub.next_billing_date,
          trialEndDate: sub.trial_end_date,
          paymentStatus: sub.payment_status,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateBillingStats(): Promise<BillingStats> {
    // Calculate from database or use aggregated view
    const { data: tenants } = await supabase
      .from('tenant_overview_with_org')
      .select('subscription_status, payment_status');

    const activeSubs = tenants?.filter(t => t.subscription_status === 'active') || [];
    const trialSubs = tenants?.filter(t => t.subscription_status === 'trial') || [];

    return {
      activeSubscriptions: activeSubs.length,
      trialSubscriptions: trialSubs.length,
      churnedThisMonth: 2, // Calculate from logs
    };
  }

  function formatCurrency(amount: number, currency: string = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
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

  function getStatusBadge(status: string) {
    const badges = {
      paid: { text: 'Paid', color: 'green', icon: PaidIcon },
      pending: { text: 'Pending', color: 'yellow', icon: PendingIcon },
      overdue: { text: 'Overdue', color: 'red', icon: WarningIcon },
      failed: { text: 'Failed', color: 'red', icon: FailedIcon },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
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
              <MoneyIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
                <p className="text-sm text-gray-500">Track subscriptions and payment status</p>
              </div>
            </div>
            <button
              onClick={loadBillingData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscriptions ({subscriptions.length})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">

            {/* Subscription Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Subscriptions</h3>
                <p className="text-4xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                <p className="text-sm text-gray-500 mt-2">Paying customers</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Subscriptions</h3>
                <p className="text-4xl font-bold text-yellow-600">{stats.trialSubscriptions}</p>
                <p className="text-sm text-gray-500 mt-2">In trial period</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn This Month</h3>
                <p className="text-4xl font-bold text-red-600">{stats.churnedThisMonth}</p>
                <p className="text-sm text-gray-500 mt-2">Cancelled subscriptions</p>
              </div>
            </div>

            {/* Overdue Invoices Alert */}
            {invoices.filter(inv => inv.status === 'overdue').length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <WarningIcon className="w-5 h-5 text-red-500 mr-2" />
                    Overdue Invoices Requiring Attention
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {invoices
                    .filter(inv => inv.status === 'overdue')
                    .slice(0, 5)
                    .map(invoice => (
                      <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.tenantName}</p>
                            <p className="text-sm text-gray-500">{invoice.organizationName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
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
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => {
                        const badge = getStatusBadge(invoice.status);
                        const StatusIcon = badge.icon;

                        return (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <ReceiptIcon className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {invoice.invoiceNumber}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{invoice.tenantName}</p>
                                <p className="text-sm text-gray-500">{invoice.organizationName}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{invoice.subscriptionTier}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800`}
                              >
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {badge.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(invoice.dueDate)}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-700 mr-3">
                                <DownloadIcon className="w-5 h-5" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-700">
                                <EmailIcon className="w-5 h-5" />
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
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{sub.tenantName}</h3>
                      <p className="text-sm text-gray-500">{sub.organizationName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sub.status === 'active' ? 'bg-green-100 text-green-800' :
                      sub.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{sub.tier}</span>
                    </div>
                    {sub.nextBillingDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Next Billing</span>
                        <span className="text-sm text-gray-900">{formatDate(sub.nextBillingDate)}</span>
                      </div>
                    )}
                    {sub.trialEndDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Trial Ends</span>
                        <span className="text-sm text-yellow-600">{formatDate(sub.trialEndDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/super-admin/tenants/${sub.tenantId}`)}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </button>
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

export default BillingDashboard;
