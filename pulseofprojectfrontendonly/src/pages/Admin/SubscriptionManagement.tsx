import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as UpgradeIcon,
  Cancel as CancelIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';
import {
  processPayment,
  getPaymentConfig,
  getPaymentMethods,
  cancelSubscription,
  updateSubscriptionPlan,
  downloadInvoice,
  type SubscriptionPayment,
  type PaymentMethod,
} from '../../lib/payment-gateway';

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  tier: string;
  status: string;
  monthlyFee: number;
  billingCycle: string;
  startDate: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  paymentStatus: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 3000,
    features: [
      '1 Tenant',
      '50 Users',
      '10 GB Storage',
      'Basic Support',
      'Monthly Reports',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 6000,
    features: [
      '5 Tenants',
      '100 Users',
      '50 GB Storage',
      'Priority Support',
      'Advanced Analytics',
      'API Access',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 12000,
    features: [
      '15 Tenants',
      '300 Users',
      '200 GB Storage',
      '24/7 Support',
      'Custom Branding',
      'Advanced Integrations',
      'Dedicated Account Manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25000,
    features: [
      'Unlimited Tenants',
      'Unlimited Users',
      '1 TB Storage',
      'White-label Solution',
      'Custom Development',
      'SLA Guarantee',
      'On-premise Deployment',
    ],
  },
];

export function SubscriptionManagement() {
  const navigate = useNavigate();
  const { supabase, user } = useAuth();
  const isAdmin = usePermission('manage_subscriptions');

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadSubscriptionData();
  }, [isAdmin, navigate]);

  async function loadSubscriptionData() {
    try {
      setLoading(true);

      // Get user's organization
      const { data: orgData } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (!orgData) return;

      // Load organization subscription
      const { data: subData } = await supabase
        .from('organizations')
        .select(`
          *,
          tenants:tenants(count)
        `)
        .eq('id', orgData.organization_id)
        .single();

      if (subData) {
        setSubscription({
          id: subData.subscription_id,
          tenantId: orgData.organization_id,
          tenantName: subData.name,
          tier: subData.subscription_tier,
          status: subData.subscription_status,
          monthlyFee: subData.monthly_fee,
          billingCycle: subData.billing_cycle,
          startDate: subData.subscription_start,
          nextBillingDate: subData.next_billing_date,
          trialEndDate: subData.trial_end_date,
          paymentStatus: subData.payment_status,
        });
      }

      // Load payment methods
      const paymentConfig = getPaymentConfig();
      const methods = await getPaymentMethods(orgData.organization_id, paymentConfig);
      setPaymentMethods(methods);

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', orgData.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setInvoices(
        invoicesData?.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.due_date,
          paidDate: inv.paid_date,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgradePlan() {
    if (!selectedPlan || !subscription) return;

    try {
      setProcessing(true);

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Plan not found');

      const paymentConfig = getPaymentConfig();

      const paymentData: SubscriptionPayment = {
        tenantId: subscription.tenantId,
        planId: selectedPlan,
        amount: plan.price,
        currency: 'INR',
        billingCycle: subscription.billingCycle as any,
        customerEmail: user?.email || '',
        customerName: user?.name || '',
      };

      const result = await processPayment(paymentData, paymentConfig);

      if (result.status === 'succeeded') {
        // Update subscription in database
        await updateSubscriptionPlan(subscription.id, selectedPlan, paymentConfig);

        alert('Subscription upgraded successfully!');
        setShowUpgradeModal(false);
        await loadSubscriptionData();
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription) return;

    try {
      setProcessing(true);

      const paymentConfig = getPaymentConfig();
      await cancelSubscription(subscription.id, paymentConfig);

      alert('Subscription cancelled successfully. Access will continue until the end of the billing period.');
      setShowCancelModal(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleDownloadInvoice(invoiceId: string) {
    try {
      const paymentConfig = getPaymentConfig();
      const blob = await downloadInvoice(invoiceId, paymentConfig);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
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
              <MoneyIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-sm text-gray-500">Manage your billing and subscription</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription */}
        {subscription && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'trial'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {subscription.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{subscription.tier}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Monthly Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(subscription.monthlyFee)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Next Billing Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UpgradeIcon className="w-5 h-5 mr-2" />
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <CancelIcon className="w-5 h-5 mr-2" />
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
            <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <AddIcon className="w-4 h-4 mr-1" />
              Add Method
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {paymentMethods.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No payment methods added
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CardIcon className="w-10 h-10 text-gray-400 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {method.brand} ending in {method.last4}
                      </p>
                      {method.expiryMonth && method.expiryYear && (
                        <p className="text-xs text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      )}
                      {method.isDefault && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No invoices yet
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <ReceiptIcon className="w-10 h-10 text-gray-400 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        Due: {formatDate(invoice.dueDate)}
                        {invoice.paidDate && ` | Paid: ${formatDate(invoice.paidDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = plan.id === subscription?.tier;
                  const isSelected = plan.id === selectedPlan;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : isCurrent
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        {isCurrent && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-3xl font-bold text-gray-900 mb-4">
                        {formatCurrency(plan.price)}
                        <span className="text-base font-normal text-gray-500">/month</span>
                      </p>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <ActiveIcon className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradePlan}
                disabled={!selectedPlan || processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cancel Subscription</h2>
            </div>

            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your subscription? You will lose access to all features at the end
                of your current billing period.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <WarningIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Your subscription will remain active until{' '}
                    {subscription?.nextBillingDate && formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default SubscriptionManagement;
