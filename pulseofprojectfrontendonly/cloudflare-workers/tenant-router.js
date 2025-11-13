/**
 * Cloudflare Workers - Tenant Router
 * Routes API requests to the correct tenant's Supabase instance
 *
 * Deploy with: wrangler publish
 */

// Tenant registry cache (in-memory with Workers KV for persistence)
const TENANT_CACHE_TTL = 300; // 5 minutes

/**
 * Extract tenant from request
 */
function extractTenantSlug(request) {
  const url = new URL(request.url);

  // Method 1: Subdomain (kerala.pulseofpeople.com)
  const hostname = url.hostname;
  const parts = hostname.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (!['www', 'app', 'api', 'admin'].includes(subdomain)) {
      return subdomain;
    }
  }

  // Method 2: Header (X-Tenant-ID)
  const tenantHeader = request.headers.get('X-Tenant-ID') || request.headers.get('x-tenant-id');
  if (tenantHeader) {
    return tenantHeader;
  }

  // Method 3: Path (/kerala/api/...)
  const pathMatch = url.pathname.match(/^\/([a-z0-9-]+)\//);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Method 4: Query parameter (?tenant=kerala)
  const tenantParam = url.searchParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  return null;
}

/**
 * Fetch tenant configuration from registry
 */
async function getTenantConfig(tenantSlug, env) {
  // Try cache first (Workers KV)
  const cacheKey = `tenant:${tenantSlug}`;

  try {
    const cached = await env.TENANT_CACHE.get(cacheKey, { type: 'json' });
    if (cached) {
      console.log(`Cache hit for tenant: ${tenantSlug}`);
      return cached;
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }

  // Fetch from registry
  console.log(`Fetching tenant config: ${tenantSlug}`);

  const registryUrl = env.TENANT_REGISTRY_URL;
  const response = await fetch(`${registryUrl}/rest/v1/tenants?slug=eq.${tenantSlug}&status=eq.active`, {
    headers: {
      'apikey': env.TENANT_REGISTRY_KEY,
      'Authorization': `Bearer ${env.TENANT_REGISTRY_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Tenant not found: ${tenantSlug}`);
  }

  const tenant = data[0];

  // Validate tenant status
  if (tenant.status !== 'active') {
    throw new Error(`Tenant is not active: ${tenant.status}`);
  }

  if (!['active', 'trial'].includes(tenant.subscription_status)) {
    throw new Error(`Invalid subscription: ${tenant.subscription_status}`);
  }

  // Cache the result
  try {
    await env.TENANT_CACHE.put(cacheKey, JSON.stringify(tenant), {
      expirationTtl: TENANT_CACHE_TTL,
    });
  } catch (error) {
    console.warn('Cache write error:', error);
  }

  return tenant;
}

/**
 * Proxy request to tenant's Supabase
 */
async function proxyToTenant(request, tenant) {
  const url = new URL(request.url);

  // Build target URL
  const tenantUrl = new URL(tenant.supabase_url);

  // Preserve path and query
  tenantUrl.pathname = url.pathname.replace(`/${tenant.slug}`, '');
  tenantUrl.search = url.search;

  // Clone headers
  const headers = new Headers(request.headers);

  // Add/override tenant-specific headers
  headers.set('apikey', tenant.supabase_anon_key);
  headers.set('X-Tenant-ID', tenant.slug);
  headers.set('X-Tenant-Name', tenant.name);

  // Remove host header (will be set automatically)
  headers.delete('host');

  // Create new request
  const modifiedRequest = new Request(tenantUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.body,
  });

  // Forward request to tenant's Supabase
  const response = await fetch(modifiedRequest);

  // Clone response and add tenant info header
  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set('X-Tenant-ID', tenant.slug);
  modifiedResponse.headers.set('X-Tenant-Region', tenant.supabase_region);

  return modifiedResponse;
}

/**
 * Record API usage (async, don't block response)
 */
async function recordUsage(tenant, request, env) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage:${tenant.id}:${today}`;

    // Increment counter in KV
    const current = await env.TENANT_CACHE.get(usageKey);
    const count = current ? parseInt(current) + 1 : 1;

    await env.TENANT_CACHE.put(usageKey, count.toString(), {
      expirationTtl: 86400 * 7, // Keep for 7 days
    });

    // Batch write to registry every 100 requests (to reduce DB writes)
    if (count % 100 === 0) {
      const registryUrl = env.TENANT_REGISTRY_URL;
      await fetch(`${registryUrl}/rest/v1/tenant_usage`, {
        method: 'POST',
        headers: {
          'apikey': env.TENANT_REGISTRY_KEY,
          'Authorization': `Bearer ${env.TENANT_REGISTRY_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          date: today,
          api_calls: count,
        }),
      });
    }
  } catch (error) {
    console.warn('Failed to record usage:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Check rate limits
 */
async function checkRateLimit(tenant, request, env) {
  const clientIp = request.headers.get('CF-Connecting-IP');
  const rateLimitKey = `ratelimit:${tenant.id}:${clientIp}`;

  try {
    const count = await env.TENANT_CACHE.get(rateLimitKey);
    const currentCount = count ? parseInt(count) : 0;

    // Check if exceeded
    const maxPerHour = tenant.max_api_calls_per_hour || 10000;

    if (currentCount >= maxPerHour) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        limit: maxPerHour,
        reset_at: new Date(Date.now() + 3600000).toISOString(),
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxPerHour.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor((Date.now() + 3600000) / 1000).toString(),
        },
      });
    }

    // Increment counter
    await env.TENANT_CACHE.put(rateLimitKey, (currentCount + 1).toString(), {
      expirationTtl: 3600, // 1 hour
    });

    return null; // No rate limit hit
  } catch (error) {
    console.warn('Rate limit check failed:', error);
    return null; // Fail open
  }
}

/**
 * Handle CORS
 */
function handleCORS(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, apikey',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  return headers;
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();

    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: handleCORS(request) });
      }

      // Extract tenant slug
      const tenantSlug = extractTenantSlug(request);

      if (!tenantSlug) {
        return new Response(JSON.stringify({
          error: 'Tenant not identified',
          message: 'Please access via a tenant-specific URL or include X-Tenant-ID header',
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...handleCORS(request),
          },
        });
      }

      // Get tenant configuration
      const tenant = await getTenantConfig(tenantSlug, env);

      // Check rate limits
      const rateLimitResponse = await checkRateLimit(tenant, request, env);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      // Proxy request to tenant's Supabase
      const response = await proxyToTenant(request, tenant);

      // Add CORS headers
      const corsHeaders = handleCORS(request);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Record usage (async, don't wait)
      ctx.waitUntil(recordUsage(tenant, request, env));

      // Add performance header
      const duration = Date.now() - startTime;
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      console.error('Router error:', error);

      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...handleCORS(request),
        },
      });
    }
  },
};
