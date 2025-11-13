/**
 * Tenant Context
 * Provides tenant configuration and utilities throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { TenantConfig, TenantContext as ITenantContext } from '../lib/tenant/types';
import { identifyTenant, isMultiTenantMode } from '../lib/tenant/identification';
import {
  loadTenantConfig,
  getTenantSupabaseClient,
  applyTenantBranding,
  isFeatureEnabled,
  validateSubscription,
} from '../lib/tenant/config';

interface TenantContextValue {
  // Tenant configuration
  tenant: TenantConfig | null;
  tenantSlug: string | null;
  isLoading: boolean;
  error: Error | null;

  // Supabase client for this tenant
  supabase: SupabaseClient | null;

  // Utilities
  hasFeature: (feature: string) => boolean;
  isSubscriptionValid: () => boolean;
  reload: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  fallback?: ReactNode; // Loading state
  errorFallback?: (error: Error) => ReactNode; // Error state
}

export function TenantProvider({ children, fallback, errorFallback }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTenant = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if multi-tenant mode is enabled
      if (!isMultiTenantMode()) {
        // Single-tenant mode - use environment variables with hardcoded fallback
        const config: TenantConfig = {
          id: 'default',
          slug: 'default',
          name: 'Default Tenant',
          displayName: 'Pulse of People',
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://eepwbydlfecosaqdysho.supabase.co',
          supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c',
          supabaseRegion: 'ap-south-1',
          contactName: '',
          contactEmail: '',
          subscriptionStatus: 'active',
          subscriptionTier: 'standard',
          subscriptionStart: new Date().toISOString(),
          monthlyFee: 6000,
          currency: 'INR',
          billingCycle: 'monthly',
          paymentStatus: 'paid',
          coverageArea: 'Tamil Nadu',
          state: 'Tamil Nadu',
          districts: [],
          wardCount: 0,
          expectedUsers: 100,
          enabledFeatures: [
            'dashboard',
            'analytics',
            'field-reports',
            'surveys',
            'social-media',
            'influencer-tracking',
            'alerts',
            'recommendations',
          ],
          customSettings: {},
          dataResidency: 'india',
          branding: {
            logo: '',
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
          },
          maxUsers: 100,
          maxWards: 1000,
          maxStorageGb: 50,
          maxApiCallsPerHour: 10000,
          status: 'active',
          isDemo: false,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTenant(config);
        setTenantSlug('default');

        // Create Supabase client from env
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
        setSupabase(client);

        setIsLoading(false);
        return;
      }

      // Multi-tenant mode - identify and load tenant
      const identification = identifyTenant();

      if (!identification) {
        throw new Error(
          'No tenant identified. Please access via a tenant-specific URL (e.g., kerala.pulseofpeople.com)'
        );
      }

      setTenantSlug(identification.tenantSlug);

      // Load tenant configuration from registry
      const config = await loadTenantConfig(identification.tenantSlug);
      setTenant(config);

      // Create tenant-specific Supabase client
      const client = await getTenantSupabaseClient(identification.tenantSlug);
      setSupabase(client);

      // Apply tenant branding
      applyTenantBranding(config);

      // Validate subscription
      const validation = validateSubscription(config);
      if (!validation.isValid) {
        console.warn('Subscription validation:', validation.message);
        // You might want to show a warning banner here
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load tenant:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, []);

  const hasFeature = (feature: string): boolean => {
    if (!tenant) return false;
    return isFeatureEnabled(tenant, feature);
  };

  const isSubscriptionValid = (): boolean => {
    if (!tenant) return false;
    const validation = validateSubscription(tenant);
    return validation.isValid;
  };

  const reload = async (): Promise<void> => {
    await loadTenant();
  };

  const value: TenantContextValue = {
    tenant,
    tenantSlug,
    isLoading,
    error,
    supabase,
    hasFeature,
    isSubscriptionValid,
    reload,
  };

  // Show loading state
  if (isLoading) {
    return <>{fallback || <TenantLoadingScreen />}</>;
  }

  // Show error state
  if (error) {
    return <>{errorFallback ? errorFallback(error) : <TenantErrorScreen error={error} />}</>;
  }

  // Show content
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

/**
 * Hook to use tenant context
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * Hook to get tenant configuration
 */
export function useTenantConfig(): TenantConfig {
  const { tenant } = useTenant();

  if (!tenant) {
    throw new Error('Tenant not loaded');
  }

  return tenant;
}

/**
 * Hook to get tenant Supabase client
 */
export function useTenantSupabase(): SupabaseClient {
  const { supabase } = useTenant();

  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  return supabase;
}

/**
 * Hook to check if feature is enabled
 */
export function useFeature(feature: string): boolean {
  const { hasFeature } = useTenant();
  return hasFeature(feature);
}

/**
 * Default loading screen
 */
function TenantLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Tenant...</h2>
        <p className="text-gray-600">Please wait while we set up your workspace</p>
      </div>
    </div>
  );
}

/**
 * Default error screen
 */
function TenantErrorScreen({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tenant Error</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = 'https://pulseofpeople.com')}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go to Home
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Need help? Contact support@pulseofpeople.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HOC to require tenant context
 */
export function withTenant<P extends object>(Component: React.ComponentType<P>) {
  return function WithTenantComponent(props: P) {
    const tenant = useTenant();

    if (!tenant.tenant) {
      return <TenantLoadingScreen />;
    }

    return <Component {...props} />;
  };
}

/**
 * HOC to require specific feature
 */
export function withFeature<P extends object>(feature: string, Component: React.ComponentType<P>) {
  return function WithFeatureComponent(props: P) {
    const { hasFeature } = useTenant();

    if (!hasFeature(feature)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Feature Not Available</h2>
            <p className="text-gray-600">
              The feature "{feature}" is not enabled for your subscription.
            </p>
            <button
              onClick={() => (window.location.href = '/subscription')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
