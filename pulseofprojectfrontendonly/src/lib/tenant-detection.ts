/**
 * Tenant Detection and Configuration
 * Extracts tenant information from subdomain and loads configuration
 */

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  subdomain: string;
  status: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  organizationId: string;
  organizationName: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
  };
  features: string[];
  limits: {
    maxUsers: number;
    maxStorageGb: number;
    maxApiCallsPerHour: number;
  };
}

/**
 * Extract subdomain from current URL
 * Examples:
 *   kerala.yourapp.com → kerala
 *   localhost:5173 → demo (default for development)
 *   yourapp.com → null (main domain)
 */
export function extractSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Development: localhost or 127.0.0.1
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return process.env.VITE_DEFAULT_TENANT || 'demo';
  }

  // Production: subdomain.yourapp.com
  const parts = hostname.split('.');

  // If only 2 parts (yourapp.com), no subdomain
  if (parts.length <= 2) {
    return null;
  }

  // Return first part (subdomain)
  return parts[0];
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be lowercase, alphanumeric, and hyphens only
  const regex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  return regex.test(subdomain);
}

/**
 * Get tenant ID from URL params or subdomain
 * Priority: URL param > subdomain > default
 */
export function getTenantIdentifier(): string {
  // Check URL parameter first (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  // Check subdomain
  const subdomain = extractSubdomain();
  if (subdomain) {
    return subdomain;
  }

  // Default tenant (for main domain)
  return process.env.VITE_DEFAULT_TENANT || 'demo';
}

/**
 * Load tenant configuration from API
 */
export async function loadTenantConfig(
  supabase: any,
  tenantSlug: string
): Promise<TenantConfig | null> {
  try {
    const { data, error } = await supabase
      .from('tenant_overview_with_org')
      .select('*')
      .eq('subdomain', tenantSlug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Failed to load tenant config:', error);
      return null;
    }

    if (!data) {
      console.error('Tenant not found:', tenantSlug);
      return null;
    }

    // Transform to TenantConfig
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      displayName: data.display_name,
      subdomain: data.subdomain,
      status: data.status,
      subscriptionStatus: data.subscription_status,
      subscriptionTier: data.subscription_tier,
      organizationId: data.organization_id,
      organizationName: data.organization_name,
      branding: data.branding || {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
      },
      features: data.enabled_features || [],
      limits: {
        maxUsers: data.max_users || 100,
        maxStorageGb: data.max_storage_gb || 50,
        maxApiCallsPerHour: data.max_api_calls_per_hour || 10000,
      },
    };
  } catch (error) {
    console.error('Error loading tenant config:', error);
    return null;
  }
}

/**
 * Check if user has access to tenant
 */
export async function validateTenantAccess(
  supabase: any,
  userId: string,
  tenantSlug: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('user_can_access_tenant', {
      p_user_id: userId,
      p_tenant_slug: tenantSlug,
    });

    if (error) {
      console.error('Failed to validate tenant access:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return false;
  }
}

/**
 * Redirect to tenant subdomain
 */
export function redirectToTenant(tenantSubdomain: string, path: string = '/dashboard/legacy') {
  const protocol = window.location.protocol;
  const domain = window.location.hostname.split('.').slice(-2).join('.');
  const port = window.location.port ? `:${window.location.port}` : '';

  const newUrl = `${protocol}//${tenantSubdomain}.${domain}${port}${path}`;
  window.location.href = newUrl;
}

/**
 * Generate tenant-specific cache key
 */
export function getTenantCacheKey(tenantSlug: string, key: string): string {
  return `tenant:${tenantSlug}:${key}`;
}

/**
 * Apply tenant branding to document
 */
export function applyTenantBranding(config: TenantConfig) {
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--color-primary', config.branding.primaryColor);
  root.style.setProperty('--color-secondary', config.branding.secondaryColor);

  // Set page title
  document.title = `${config.displayName} | Pulse of People`;

  // Set favicon if provided
  if (config.branding.logo) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = config.branding.logo;
    }
  }
}

/**
 * Check if feature is enabled for tenant
 */
export function hasFeature(config: TenantConfig, feature: string): boolean {
  return config.features.includes(feature);
}

/**
 * Check if tenant is within limits
 */
export function isWithinLimits(
  config: TenantConfig,
  type: 'users' | 'storage' | 'api',
  current: number
): boolean {
  switch (type) {
    case 'users':
      return current < config.limits.maxUsers;
    case 'storage':
      return current < config.limits.maxStorageGb;
    case 'api':
      return current < config.limits.maxApiCallsPerHour;
    default:
      return true;
  }
}

export default {
  extractSubdomain,
  isValidSubdomain,
  getTenantIdentifier,
  loadTenantConfig,
  validateTenantAccess,
  redirectToTenant,
  getTenantCacheKey,
  applyTenantBranding,
  hasFeature,
  isWithinLimits,
};
