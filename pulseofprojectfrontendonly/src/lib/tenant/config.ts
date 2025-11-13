/**
 * Tenant Configuration Loader
 * Fetches and caches tenant configuration from local Supabase database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TenantConfig } from './types';

// Cache for tenant configurations
const tenantConfigCache = new Map<string, TenantConfig>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get Supabase client with hardcoded fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eepwbydlfecosaqdysho.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHdieWRsZmVjb3NhcWR5c2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDA3ODQsImV4cCI6MjA3ODQxNjc4NH0.Z83AOOAFPGK-xKio6fYTXwAUJEHdIlsdCxPleDtE53c';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch tenant configuration from local Supabase database
 */
export async function fetchTenantConfig(tenantSlug: string): Promise<TenantConfig | null> {
  // Check cache first
  if (tenantConfigCache.has(tenantSlug)) {
    const expiry = cacheExpiry.get(tenantSlug);
    if (expiry && expiry > Date.now()) {
      return tenantConfigCache.get(tenantSlug)!;
    }
  }

  try {
    // If no Supabase client, return mock config for development
    if (!supabase) {
      console.warn('Supabase not configured, using mock tenant config');
      return getMockTenantConfig(tenantSlug);
    }

    // Fetch from local Supabase database
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', tenantSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Tenant '${tenantSlug}' not found`);
      }
      throw new Error(`Failed to fetch tenant config: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Tenant '${tenantSlug}' not found`);
    }

    // Transform database record to TenantConfig format
    const config: TenantConfig = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      displayName: data.display_name,
      subdomain: data.subdomain,
      customDomain: data.custom_domain,
      status: data.status,
      subscriptionStatus: data.subscription_status,
      subscriptionTier: data.subscription_tier,
      branding: data.branding || {},
      features: data.features || {},
      config: data.config || {},
      metadata: data.metadata || {}
    };

    // Validate tenant is active
    if (config.status !== 'active') {
      throw new Error(`Tenant '${tenantSlug}' is not active. Status: ${config.status}`);
    }

    if (config.subscriptionStatus === 'suspended') {
      throw new Error(`Tenant '${tenantSlug}' subscription is suspended`);
    }

    if (config.subscriptionStatus === 'expired') {
      throw new Error(`Tenant '${tenantSlug}' subscription has expired`);
    }

    // Cache the configuration
    tenantConfigCache.set(tenantSlug, config);
    cacheExpiry.set(tenantSlug, Date.now() + CACHE_DURATION);

    return config;
  } catch (error) {
    console.error('Failed to fetch tenant config:', error);
    throw error;
  }
}

/**
 * Load tenant configuration
 * This is the main function to use
 */
export async function loadTenantConfig(tenantSlug: string): Promise<TenantConfig> {
  const config = await fetchTenantConfig(tenantSlug);

  if (!config) {
    throw new Error(`Tenant configuration not found for: ${tenantSlug}`);
  }

  return config;
}

/**
 * Clear tenant config cache
 */
export function clearTenantCache(tenantSlug?: string): void {
  if (tenantSlug) {
    tenantConfigCache.delete(tenantSlug);
    cacheExpiry.delete(tenantSlug);
  } else {
    tenantConfigCache.clear();
    cacheExpiry.clear();
  }
}

/**
 * Preload tenant configurations (for frequently accessed tenants)
 */
export async function preloadTenantConfigs(tenantSlugs: string[]): Promise<void> {
  await Promise.all(tenantSlugs.map(slug => fetchTenantConfig(slug)));
}

/**
 * Get mock tenant configuration for development
 */
function getMockTenantConfig(tenantSlug: string): TenantConfig {
  const configs: Record<string, TenantConfig> = {
    'party-a': {
      id: 'mock-party-a',
      slug: 'tvk-tamil-nadu',
      name: 'TVK Tamil Nadu Campaign 2026',
      displayName: 'TVK - Tamilaga Vettri Kazhagam',
      subdomain: 'party-a',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#fbbf24',
        logo: '/assets/images/tvk-logo.png',
        theme: 'red-yellow',
        heroTitle: 'TVK - Building Progressive Tamil Nadu',
        motto: 'Pirappokkum Ella Uyirkkum - All Lives are Equal by Birth'
      },
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        volunteerManagement: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Tamil Nadu',
        districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur'],
        partySymbol: 'rising-sun',
        electionYear: '2026'
      },
      metadata: {
        partyAffiliation: 'TVK',
        regionalParty: true,
        founded: '2024-02-02',
        leader: 'Vijay'
      }
    },
    'party-b': {
      id: 'mock-party-b',
      slug: 'bjp-kerala',
      name: 'BJP Tamil Nadu Campaign 2026',
      displayName: 'BJP Tamil Nadu',
      subdomain: 'party-b',
      customDomain: null,
      status: 'active',
      subscriptionStatus: 'active',
      subscriptionTier: 'premium',
      branding: {
        primaryColor: '#FF9933',
        secondaryColor: '#FF6B00',
        logo: '/assets/images/bjp-logo.png',
        theme: 'saffron',
        heroTitle: 'BJP Tamil Nadu - Building a Stronger Tomorrow',
        motto: 'Sabka Saath, Sabka Vikas, Sabka Vishwas, Sabka Prayas'
      },
      features: {
        analytics: true,
        surveys: true,
        fieldReports: true,
        socialMedia: true,
        boothManagement: true,
        digitalCampaigning: true
      },
      config: {
        state: 'Tamil Nadu',
        districts: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'],
        partySymbol: 'lotus',
        electionYear: '2026'
      },
      metadata: {
        partyAffiliation: 'BJP',
        nationalParty: true,
        founded: '1980-04-06'
      }
    }
  };

  return configs[tenantSlug] || null;
}

/**
 * Create Supabase client for tenant (uses shared database)
 */
export function createTenantSupabaseClient(config: TenantConfig): SupabaseClient {
  // Use the shared Supabase instance with tenant context
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Return the shared client - RLS policies will handle tenant isolation
  return supabase;
}

/**
 * Get Supabase client for current tenant
 */
let currentTenantClient: SupabaseClient | null = null;
let currentTenantSlug: string | null = null;

export async function getTenantSupabaseClient(tenantSlug: string): Promise<SupabaseClient> {
  // In single-database mode, always return the shared client
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
}

/**
 * Check if feature is enabled for tenant
 */
export function isFeatureEnabled(config: TenantConfig, feature: string): boolean {
  // Check in features object
  if (config.features && typeof config.features === 'object') {
    return config.features[feature] === true;
  }
  return false;
}

/**
 * Check if tenant has reached usage limits
 */
export interface UsageLimitCheck {
  withinLimit: boolean;
  current: number;
  limit: number;
  percentage: number;
}

export function checkUserLimit(config: TenantConfig, currentUsers: number): UsageLimitCheck {
  const percentage = (currentUsers / config.maxUsers) * 100;
  return {
    withinLimit: currentUsers < config.maxUsers,
    current: currentUsers,
    limit: config.maxUsers,
    percentage,
  };
}

export function checkStorageLimit(config: TenantConfig, currentStorageGb: number): UsageLimitCheck {
  const percentage = (currentStorageGb / config.maxStorageGb) * 100;
  return {
    withinLimit: currentStorageGb < config.maxStorageGb,
    current: currentStorageGb,
    limit: config.maxStorageGb,
    percentage,
  };
}

/**
 * Get tenant branding CSS variables
 */
export function getTenantCSSVariables(config: TenantConfig): Record<string, string> {
  return {
    '--tenant-primary-color': config.branding.primaryColor,
    '--tenant-secondary-color': config.branding.secondaryColor,
  };
}

/**
 * Apply tenant branding to document
 */
export function applyTenantBranding(config: TenantConfig): void {
  const root = document.documentElement;
  const cssVars = getTenantCSSVariables(config);

  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Update page title
  document.title = `${config.displayName} - Pulse of People`;

  // Update favicon if custom logo exists
  if (config.branding.logo) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = config.branding.logo;
    }
  }
}

/**
 * Validate tenant subscription
 */
export interface SubscriptionValidation {
  isValid: boolean;
  status: string;
  daysRemaining?: number;
  message?: string;
}

export function validateSubscription(config: TenantConfig): SubscriptionValidation {
  const now = new Date();

  // Check if trial
  if (config.subscriptionStatus === 'trial') {
    if (config.trialEndDate) {
      const trialEnd = new Date(config.trialEndDate);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        return {
          isValid: false,
          status: 'trial_expired',
          daysRemaining: 0,
          message: 'Your trial has expired. Please upgrade to continue.',
        };
      }

      return {
        isValid: true,
        status: 'trial_active',
        daysRemaining,
        message: daysRemaining <= 3 ? `Trial ending in ${daysRemaining} days` : undefined,
      };
    }
  }

  // Check if active subscription
  if (config.subscriptionStatus === 'active') {
    if (config.paymentStatus === 'overdue') {
      return {
        isValid: true, // Still valid but with warning
        status: 'payment_overdue',
        message: 'Payment overdue. Please update your payment method.',
      };
    }

    return {
      isValid: true,
      status: 'active',
    };
  }

  // Suspended or cancelled
  if (config.subscriptionStatus === 'suspended') {
    return {
      isValid: false,
      status: 'suspended',
      message: 'Your subscription has been suspended. Please contact support.',
    };
  }

  if (config.subscriptionStatus === 'expired') {
    return {
      isValid: false,
      status: 'expired',
      message: 'Your subscription has expired. Please renew to continue.',
    };
  }

  return {
    isValid: false,
    status: 'unknown',
    message: 'Unknown subscription status. Please contact support.',
  };
}

/**
 * Get tenant settings value
 */
export function getTenantSetting<T = any>(
  config: TenantConfig,
  key: string,
  defaultValue: T
): T {
  return (config.customSettings[key] as T) ?? defaultValue;
}

/**
 * Export tenant configuration (for debugging)
 */
export function exportTenantConfig(config: TenantConfig): string {
  const sanitized = {
    ...config,
    supabaseAnonKey: '***REDACTED***',
  };
  return JSON.stringify(sanitized, null, 2);
}
