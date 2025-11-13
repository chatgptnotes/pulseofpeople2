/**
 * Payment Gateway Integration
 * Supports Razorpay and Stripe for subscription payments
 */

export type PaymentProvider = 'razorpay' | 'stripe' | 'mock';

export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  apiSecret?: string;
  currency: string;
  testMode: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionPayment {
  tenantId: string;
  planId: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  customerId?: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

/**
 * Initialize Razorpay payment
 */
export async function initializeRazorpay(config: PaymentConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));

    document.body.appendChild(script);
  });
}

/**
 * Initialize Stripe payment
 */
export async function initializeStripe(config: PaymentConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      const stripe = window.Stripe(config.apiKey);
      resolve(stripe);
    };
    script.onerror = () => reject(new Error('Failed to load Stripe SDK'));

    document.body.appendChild(script);
  });
}

/**
 * Create payment intent for subscription
 */
export async function createPaymentIntent(
  payment: SubscriptionPayment,
  config: PaymentConfig
): Promise<PaymentIntent> {
  if (config.provider === 'mock') {
    return createMockPaymentIntent(payment);
  }

  // In production, call your backend API which will communicate with payment gateway
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      payment,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

/**
 * Process Razorpay payment
 */
export async function processRazorpayPayment(
  payment: SubscriptionPayment,
  config: PaymentConfig
): Promise<PaymentIntent> {
  try {
    // Create order on backend
    const intent = await createPaymentIntent(payment, config);

    return new Promise((resolve, reject) => {
      // @ts-ignore
      const razorpay = new window.Razorpay({
        key: config.apiKey,
        amount: payment.amount * 100, // Convert to paise
        currency: payment.currency,
        name: 'Pulse of People',
        description: `Subscription - ${payment.planId}`,
        order_id: intent.id,
        prefill: {
          name: payment.customerName,
          email: payment.customerEmail,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: function (response: any) {
          // Payment successful
          resolve({
            id: response.razorpay_payment_id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'succeeded',
            metadata: {
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            },
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          },
        },
      });

      razorpay.open();
    });
  } catch (error) {
    console.error('Razorpay payment error:', error);
    throw error;
  }
}

/**
 * Process Stripe payment
 */
export async function processStripePayment(
  payment: SubscriptionPayment,
  config: PaymentConfig
): Promise<PaymentIntent> {
  try {
    const stripe = await initializeStripe(config);
    const intent = await createPaymentIntent(payment, config);

    const { error, paymentIntent } = await stripe.confirmCardPayment(intent.clientSecret, {
      payment_method: {
        card: {}, // Card element would be created in UI
        billing_details: {
          name: payment.customerName,
          email: payment.customerEmail,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: paymentIntent.id,
      amount: payment.amount,
      currency: payment.currency,
      status: paymentIntent.status as any,
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
}

/**
 * Process payment based on configured provider
 */
export async function processPayment(
  payment: SubscriptionPayment,
  config: PaymentConfig
): Promise<PaymentIntent> {
  switch (config.provider) {
    case 'razorpay':
      return processRazorpayPayment(payment, config);
    case 'stripe':
      return processStripePayment(payment, config);
    case 'mock':
      return processMockPayment(payment);
    default:
      throw new Error(`Unsupported payment provider: ${config.provider}`);
  }
}

/**
 * Verify payment signature (Razorpay)
 */
export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // In production, this should be done on backend
  const crypto = await import('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Get payment methods for customer
 */
export async function getPaymentMethods(
  customerId: string,
  config: PaymentConfig
): Promise<PaymentMethod[]> {
  if (config.provider === 'mock') {
    return getMockPaymentMethods();
  }

  const response = await fetch(`/api/payments/methods?customerId=${customerId}&provider=${config.provider}`);

  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }

  return response.json();
}

/**
 * Add payment method
 */
export async function addPaymentMethod(
  customerId: string,
  paymentMethodId: string,
  config: PaymentConfig
): Promise<PaymentMethod> {
  const response = await fetch('/api/payments/methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      customerId,
      paymentMethodId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add payment method');
  }

  return response.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  config: PaymentConfig
): Promise<void> {
  const response = await fetch(`/api/payments/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: config.provider }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string,
  config: PaymentConfig
): Promise<void> {
  const response = await fetch(`/api/payments/subscriptions/${subscriptionId}/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      newPlanId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update subscription');
  }
}

/**
 * Get invoice details
 */
export async function getInvoice(
  invoiceId: string,
  config: PaymentConfig
): Promise<any> {
  const response = await fetch(`/api/payments/invoices/${invoiceId}?provider=${config.provider}`);

  if (!response.ok) {
    throw new Error('Failed to fetch invoice');
  }

  return response.json();
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(
  invoiceId: string,
  config: PaymentConfig
): Promise<Blob> {
  const response = await fetch(`/api/payments/invoices/${invoiceId}/pdf?provider=${config.provider}`);

  if (!response.ok) {
    throw new Error('Failed to download invoice');
  }

  return response.blob();
}

// Mock implementations for testing

function createMockPaymentIntent(payment: SubscriptionPayment): PaymentIntent {
  return {
    id: `mock_pi_${Date.now()}`,
    amount: payment.amount,
    currency: payment.currency,
    status: 'pending',
    clientSecret: `mock_secret_${Date.now()}`,
    metadata: {
      tenantId: payment.tenantId,
      planId: payment.planId,
    },
  };
}

async function processMockPayment(payment: SubscriptionPayment): Promise<PaymentIntent> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock successful payment (90% success rate)
  const success = Math.random() > 0.1;

  return {
    id: `mock_pi_${Date.now()}`,
    amount: payment.amount,
    currency: payment.currency,
    status: success ? 'succeeded' : 'failed',
    metadata: {
      tenantId: payment.tenantId,
      planId: payment.planId,
      mock: true,
    },
  };
}

function getMockPaymentMethods(): PaymentMethod[] {
  return [
    {
      id: 'pm_mock_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 'pm_mock_2',
      type: 'upi',
      isDefault: false,
    },
  ];
}

/**
 * Get payment provider configuration
 */
export function getPaymentConfig(): PaymentConfig {
  const provider = (import.meta.env.VITE_PAYMENT_PROVIDER || 'mock') as PaymentProvider;

  return {
    provider,
    apiKey: import.meta.env.VITE_PAYMENT_API_KEY || '',
    apiSecret: import.meta.env.VITE_PAYMENT_API_SECRET,
    currency: import.meta.env.VITE_PAYMENT_CURRENCY || 'INR',
    testMode: import.meta.env.VITE_PAYMENT_TEST_MODE === 'true',
  };
}

export default {
  processPayment,
  createPaymentIntent,
  getPaymentMethods,
  addPaymentMethod,
  cancelSubscription,
  updateSubscriptionPlan,
  getInvoice,
  downloadInvoice,
  verifyPaymentSignature,
  getPaymentConfig,
};
