/**
 * Feature Flags System
 * Control feature rollouts, A/B testing, and emergency toggles
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number;
  allowedTenants?: string[];
  allowedUsers?: string[];
  allowedRoles?: string[];
  environment?: 'development' | 'staging' | 'production' | 'all';
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface FeatureFlagEvaluation {
  enabled: boolean;
  reason: string;
  variant?: string;
}

// Feature flag definitions
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Core features
  AI_INSIGHTS: {
    key: 'ai_insights',
    name: 'AI Insights Engine',
    description: 'Enable AI-powered sentiment analysis and predictions',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'user'],
    environment: 'all',
  },

  ADVANCED_ANALYTICS: {
    key: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Show advanced analytics charts and visualizations',
    enabled: true,
    rolloutPercentage: 100,
    environment: 'all',
  },

  EXPORT_FUNCTIONALITY: {
    key: 'export_functionality',
    name: 'Data Export',
    description: 'Allow users to export data in various formats',
    enabled: true,
    allowedRoles: ['super_admin', 'admin', 'user'],
    environment: 'all',
  },

  // Premium features
  BULK_SMS: {
    key: 'bulk_sms',
    name: 'Bulk SMS Campaigns',
    description: 'Send bulk SMS campaigns to voters',
    enabled: true,
    allowedRoles: ['admin', 'super_admin'],
    environment: 'production',
  },

  WHATSAPP_INTEGRATION: {
    key: 'whatsapp_integration',
    name: 'WhatsApp Bot Integration',
    description: 'Connect WhatsApp bot for voter engagement',
    enabled: true,
    rolloutPercentage: 80,
    environment: 'all',
  },

  FIELD_WORKER_APP: {
    key: 'field_worker_app',
    name: 'Field Worker Mobile App',
    description: 'Enable field worker mobile app features',
    enabled: true,
    environment: 'all',
  },

  // Experimental features
  VOICE_SURVEYS: {
    key: 'voice_surveys',
    name: 'Voice Survey System',
    description: 'Conduct surveys via voice calls',
    enabled: false,
    rolloutPercentage: 20,
    allowedRoles: ['super_admin'],
    environment: 'development',
  },

  BLOCKCHAIN_VERIFICATION: {
    key: 'blockchain_verification',
    name: 'Blockchain Verification',
    description: 'Verify voter data using blockchain',
    enabled: false,
    rolloutPercentage: 0,
    environment: 'development',
  },

  SOCIAL_LISTENING: {
    key: 'social_listening',
    name: 'Social Media Listening',
    description: 'Monitor social media sentiment in real-time',
    enabled: true,
    rolloutPercentage: 50,
    environment: 'all',
  },

  // Beta features
  NEW_DASHBOARD_UI: {
    key: 'new_dashboard_ui',
    name: 'New Dashboard UI',
    description: 'Redesigned dashboard with improved UX',
    enabled: false,
    rolloutPercentage: 10,
    environment: 'staging',
  },

  PREDICTIVE_MODELING: {
    key: 'predictive_modeling',
    name: 'Predictive Modeling',
    description: 'AI-powered election outcome predictions',
    enabled: false,
    rolloutPercentage: 5,
    allowedRoles: ['super_admin'],
    environment: 'development',
  },

  // Admin features
  TENANT_ANALYTICS: {
    key: 'tenant_analytics',
    name: 'Per-Tenant Analytics',
    description: 'Detailed analytics for each tenant',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
  },

  AUDIT_LOGS: {
    key: 'audit_logs',
    name: 'Audit Log Viewer',
    description: 'View detailed audit logs of all actions',
    enabled: true,
    allowedRoles: ['super_admin', 'admin'],
    environment: 'all',
  },

  CUSTOM_BRANDING: {
    key: 'custom_branding',
    name: 'Custom Branding',
    description: 'Allow tenants to customize branding',
    enabled: true,
    rolloutPercentage: 100,
    allowedRoles: ['admin'],
    environment: 'all',
  },
};

/**
 * Get current environment
 */
function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging')) {
    return 'staging';
  }

  return 'production';
}

/**
 * Check if flag is enabled for user
 */
export function isFeatureEnabled(
  flagKey: string,
  context: {
    userId?: string;
    tenantId?: string;
    userRole?: string;
  }
): FeatureFlagEvaluation {
  const flag = FEATURE_FLAGS[flagKey];

  if (!flag) {
    return {
      enabled: false,
      reason: 'Flag not found',
    };
  }

  // Check if flag is globally disabled
  if (!flag.enabled) {
    return {
      enabled: false,
      reason: 'Flag is globally disabled',
    };
  }

  // Check environment
  const currentEnv = getCurrentEnvironment();
  if (flag.environment && flag.environment !== 'all' && flag.environment !== currentEnv) {
    return {
      enabled: false,
      reason: `Not available in ${currentEnv} environment`,
    };
  }

  // Check expiration
  if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) {
    return {
      enabled: false,
      reason: 'Flag has expired',
    };
  }

  // Check user whitelist
  if (flag.allowedUsers && flag.allowedUsers.length > 0) {
    if (!context.userId || !flag.allowedUsers.includes(context.userId)) {
      return {
        enabled: false,
        reason: 'User not in whitelist',
      };
    }
  }

  // Check tenant whitelist
  if (flag.allowedTenants && flag.allowedTenants.length > 0) {
    if (!context.tenantId || !flag.allowedTenants.includes(context.tenantId)) {
      return {
        enabled: false,
        reason: 'Tenant not in whitelist',
      };
    }
  }

  // Check role restrictions
  if (flag.allowedRoles && flag.allowedRoles.length > 0) {
    if (!context.userRole || !flag.allowedRoles.includes(context.userRole)) {
      return {
        enabled: false,
        reason: 'User role not allowed',
      };
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const userId = context.userId || 'anonymous';
    const hash = hashString(userId + flagKey);
    const percentage = (hash % 100) + 1;

    if (percentage > flag.rolloutPercentage) {
      return {
        enabled: false,
        reason: `Not in rollout (${flag.rolloutPercentage}%)`,
      };
    }
  }

  return {
    enabled: true,
    reason: 'All checks passed',
  };
}

/**
 * Simple string hash function for consistent rollout
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all enabled features for user
 */
export function getEnabledFeatures(context: {
  userId?: string;
  tenantId?: string;
  userRole?: string;
}): string[] {
  return Object.keys(FEATURE_FLAGS).filter((key) => {
    const evaluation = isFeatureEnabled(key, context);
    return evaluation.enabled;
  });
}

/**
 * Get feature flag details
 */
export function getFeatureFlag(flagKey: string): FeatureFlag | null {
  return FEATURE_FLAGS[flagKey] || null;
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS);
}

/**
 * Override feature flag (for testing/admin purposes)
 * Stored in localStorage with expiration
 */
export function overrideFeatureFlag(
  flagKey: string,
  enabled: boolean,
  expiresInMinutes: number = 60
): void {
  const override = {
    enabled,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60000).toISOString(),
  };

  localStorage.setItem(`feature_override_${flagKey}`, JSON.stringify(override));
}

/**
 * Clear feature flag override
 */
export function clearFeatureFlagOverride(flagKey: string): void {
  localStorage.removeItem(`feature_override_${flagKey}`);
}

/**
 * Check for override
 */
export function getFeatureFlagOverride(flagKey: string): boolean | null {
  const stored = localStorage.getItem(`feature_override_${flagKey}`);

  if (!stored) {
    return null;
  }

  try {
    const override = JSON.parse(stored);

    // Check if expired
    if (override.expiresAt && new Date(override.expiresAt) < new Date()) {
      clearFeatureFlagOverride(flagKey);
      return null;
    }

    return override.enabled;
  } catch (error) {
    return null;
  }
}

/**
 * Enhanced feature check with override support
 */
export function checkFeature(
  flagKey: string,
  context: {
    userId?: string;
    tenantId?: string;
    userRole?: string;
  }
): boolean {
  // Check for override first (for testing/debugging)
  const override = getFeatureFlagOverride(flagKey);
  if (override !== null) {
    return override;
  }

  // Normal evaluation
  const evaluation = isFeatureEnabled(flagKey, context);
  return evaluation.enabled;
}

/**
 * Track feature flag usage (for analytics)
 */
export async function trackFeatureUsage(
  flagKey: string,
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    // In production, send to analytics service
    console.log('Feature flag usage:', {
      flag: flagKey,
      user: userId,
      enabled,
      timestamp: new Date().toISOString(),
    });

    // Could integrate with analytics providers like:
    // - Google Analytics
    // - Mixpanel
    // - Amplitude
    // await analytics.track('feature_flag_usage', { ... });
  } catch (error) {
    console.error('Failed to track feature usage:', error);
  }
}

/**
 * Get feature flag statistics
 */
export interface FeatureFlagStats {
  totalFlags: number;
  enabledFlags: number;
  experimentalFlags: number;
  rolloutFlags: number;
}

export function getFeatureFlagStats(): FeatureFlagStats {
  const flags = getAllFeatureFlags();

  return {
    totalFlags: flags.length,
    enabledFlags: flags.filter(f => f.enabled).length,
    experimentalFlags: flags.filter(f => !f.enabled).length,
    rolloutFlags: flags.filter(f => f.rolloutPercentage && f.rolloutPercentage < 100).length,
  };
}

export default {
  FEATURE_FLAGS,
  isFeatureEnabled,
  checkFeature,
  getEnabledFeatures,
  getFeatureFlag,
  getAllFeatureFlags,
  overrideFeatureFlag,
  clearFeatureFlagOverride,
  trackFeatureUsage,
  getFeatureFlagStats,
};
