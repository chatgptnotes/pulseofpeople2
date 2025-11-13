/**
 * API Rate Limiting System
 * Per-tenant rate limiting to prevent abuse
 */

export interface RateLimitConfig {
  tenantId: string;
  endpoint?: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export interface RateLimitRule {
  name: string;
  pattern: string | RegExp;
  maxRequests: number;
  windowMs: number;
  tier?: string;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number; blocked?: number }>();

/**
 * Default rate limit tiers
 */
export const RATE_LIMIT_TIERS = {
  basic: {
    api: { maxRequests: 100, windowMs: 60000 }, // 100 req/min
    export: { maxRequests: 10, windowMs: 3600000 }, // 10 exports/hour
    upload: { maxRequests: 50, windowMs: 3600000 }, // 50 uploads/hour
  },
  standard: {
    api: { maxRequests: 500, windowMs: 60000 }, // 500 req/min
    export: { maxRequests: 50, windowMs: 3600000 }, // 50 exports/hour
    upload: { maxRequests: 200, windowMs: 3600000 }, // 200 uploads/hour
  },
  premium: {
    api: { maxRequests: 2000, windowMs: 60000 }, // 2000 req/min
    export: { maxRequests: 200, windowMs: 3600000 }, // 200 exports/hour
    upload: { maxRequests: 1000, windowMs: 3600000 }, // 1000 uploads/hour
  },
  enterprise: {
    api: { maxRequests: 10000, windowMs: 60000 }, // 10000 req/min
    export: { maxRequests: 1000, windowMs: 3600000 }, // Unlimited exports
    upload: { maxRequests: 5000, windowMs: 3600000 }, // Unlimited uploads
  },
};

/**
 * Check rate limit for a tenant
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const key = getRateLimitKey(config.tenantId, config.endpoint);
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  // Check if tenant is blocked
  if (entry?.blocked && entry.blocked > now) {
    const retryAfter = Math.ceil((entry.blocked - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter,
    };
  }

  // Reset window if expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    // Block tenant if configured
    if (config.blockDurationMs) {
      entry.blocked = now + config.blockDurationMs;
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Check rate limit based on tenant tier
 */
export function checkTenantRateLimit(
  tenantId: string,
  tenantTier: keyof typeof RATE_LIMIT_TIERS,
  endpoint: string
): RateLimitResult {
  const category = getEndpointCategory(endpoint);
  const tierLimits = RATE_LIMIT_TIERS[tenantTier];
  const limits = tierLimits[category as keyof typeof tierLimits] || tierLimits.api;

  return checkRateLimit({
    tenantId,
    endpoint,
    maxRequests: limits.maxRequests,
    windowMs: limits.windowMs,
    blockDurationMs: 300000, // 5 minutes block
  });
}

/**
 * Get endpoint category for rate limiting
 */
function getEndpointCategory(endpoint: string): string {
  if (endpoint.includes('/export') || endpoint.includes('/download')) {
    return 'export';
  }
  if (endpoint.includes('/upload') || endpoint.includes('/import')) {
    return 'upload';
  }
  return 'api';
}

/**
 * Generate rate limit key
 */
function getRateLimitKey(tenantId: string, endpoint?: string): string {
  return endpoint ? `${tenantId}:${endpoint}` : tenantId;
}

/**
 * Reset rate limit for a tenant
 */
export function resetRateLimit(tenantId: string, endpoint?: string): void {
  const key = getRateLimitKey(tenantId, endpoint);
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(tenantId: string, endpoint?: string): {
  count: number;
  resetAt: Date | null;
  blocked: boolean;
} {
  const key = getRateLimitKey(tenantId, endpoint);
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry) {
    return { count: 0, resetAt: null, blocked: false };
  }

  return {
    count: entry.count,
    resetAt: new Date(entry.resetAt),
    blocked: !!(entry.blocked && entry.blocked > now),
  };
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimitMiddleware(
  tenantId: string,
  tenantTier: keyof typeof RATE_LIMIT_TIERS,
  endpoint: string
): (req: Request, res: Response, next: () => void) => void {
  return (req: Request, res: any, next: () => void) => {
    const result = checkTenantRateLimit(tenantId, tenantTier, endpoint);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_TIERS[tenantTier].api.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader('Retry-After', result.retryAfter);
      }

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: result.retryAfter,
        resetAt: result.resetAt,
      });
      return;
    }

    next();
  };
}

/**
 * Burst protection - detect rapid fire requests
 */
export function checkBurstProtection(
  tenantId: string,
  maxBurstRequests: number = 50,
  burstWindowMs: number = 1000
): boolean {
  const key = `burst:${tenantId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + burstWindowMs,
    };
    rateLimitStore.set(key, entry);
    return true;
  }

  entry.count++;

  if (entry.count > maxBurstRequests) {
    // Block tenant for burst abuse
    const mainKey = getRateLimitKey(tenantId);
    const mainEntry = rateLimitStore.get(mainKey);
    if (mainEntry) {
      mainEntry.blocked = now + 60000; // 1 minute block
    }
    return false;
  }

  return true;
}

/**
 * Get rate limit analytics for tenant
 */
export interface RateLimitAnalytics {
  tenantId: string;
  totalRequests: number;
  blockedRequests: number;
  averageRps: number;
  peakRps: number;
  violations: number;
}

const analyticsStore = new Map<string, {
  requests: number[];
  blocked: number;
  violations: number;
}>();

/**
 * Track request for analytics
 */
export function trackRequest(tenantId: string, allowed: boolean): void {
  const key = `analytics:${tenantId}`;
  let analytics = analyticsStore.get(key);

  if (!analytics) {
    analytics = {
      requests: [],
      blocked: 0,
      violations: 0,
    };
    analyticsStore.set(key, analytics);
  }

  analytics.requests.push(Date.now());
  if (!allowed) {
    analytics.blocked++;
    analytics.violations++;
  }

  // Keep only last 1 hour of requests
  const oneHourAgo = Date.now() - 3600000;
  analytics.requests = analytics.requests.filter(t => t > oneHourAgo);
}

/**
 * Get rate limit analytics
 */
export function getRateLimitAnalytics(tenantId: string): RateLimitAnalytics {
  const key = `analytics:${tenantId}`;
  const analytics = analyticsStore.get(key);

  if (!analytics) {
    return {
      tenantId,
      totalRequests: 0,
      blockedRequests: 0,
      averageRps: 0,
      peakRps: 0,
      violations: 0,
    };
  }

  const totalRequests = analytics.requests.length;
  const timeSpanSeconds = totalRequests > 0
    ? (analytics.requests[analytics.requests.length - 1] - analytics.requests[0]) / 1000
    : 0;

  const averageRps = timeSpanSeconds > 0 ? totalRequests / timeSpanSeconds : 0;

  // Calculate peak RPS (max requests in any 1-second window)
  let peakRps = 0;
  for (let i = 0; i < analytics.requests.length; i++) {
    const windowEnd = analytics.requests[i] + 1000;
    let windowCount = 0;
    for (let j = i; j < analytics.requests.length && analytics.requests[j] < windowEnd; j++) {
      windowCount++;
    }
    peakRps = Math.max(peakRps, windowCount);
  }

  return {
    tenantId,
    totalRequests,
    blockedRequests: analytics.blocked,
    averageRps,
    peakRps,
    violations: analytics.violations,
  };
}

/**
 * IP-based rate limiting (additional security layer)
 */
export function checkIPRateLimit(
  ipAddress: string,
  maxRequests: number = 1000,
  windowMs: number = 60000
): RateLimitResult {
  return checkRateLimit({
    tenantId: `ip:${ipAddress}`,
    maxRequests,
    windowMs,
    blockDurationMs: 600000, // 10 minutes block for IP abuse
  });
}

/**
 * Cleanup old entries from store
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && (!entry.blocked || entry.blocked < now)) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 300000);
}

/**
 * Custom rate limit rules
 */
const customRules: RateLimitRule[] = [
  {
    name: 'AI Insights',
    pattern: /\/api\/ai-insights/,
    maxRequests: 50,
    windowMs: 3600000, // 50 per hour
  },
  {
    name: 'Bulk Export',
    pattern: /\/api\/export\/bulk/,
    maxRequests: 5,
    windowMs: 3600000, // 5 per hour
  },
  {
    name: 'Report Generation',
    pattern: /\/api\/reports\/generate/,
    maxRequests: 20,
    windowMs: 3600000, // 20 per hour
  },
];

/**
 * Check custom rate limit rules
 */
export function checkCustomRateLimit(
  tenantId: string,
  endpoint: string
): RateLimitResult | null {
  for (const rule of customRules) {
    const matches = typeof rule.pattern === 'string'
      ? endpoint.includes(rule.pattern)
      : rule.pattern.test(endpoint);

    if (matches) {
      return checkRateLimit({
        tenantId: `${tenantId}:${rule.name}`,
        endpoint,
        maxRequests: rule.maxRequests,
        windowMs: rule.windowMs,
      });
    }
  }

  return null;
}

export default {
  checkRateLimit,
  checkTenantRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  rateLimitMiddleware,
  checkBurstProtection,
  trackRequest,
  getRateLimitAnalytics,
  checkIPRateLimit,
  cleanupRateLimitStore,
  checkCustomRateLimit,
  RATE_LIMIT_TIERS,
};
