import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import {
  checkFeature,
  getEnabledFeatures,
  trackFeatureUsage,
} from '../lib/feature-flags';

interface FeatureFlagContextType {
  isEnabled: (flagKey: string) => boolean;
  enabledFeatures: string[];
  loading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

interface FeatureFlagProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluateFeatureFlags();
  }, [user, currentTenant]);

  function evaluateFeatureFlags() {
    try {
      const context = {
        userId: user?.id,
        tenantId: currentTenant?.id,
        userRole: getUserRole(),
      };

      const enabled = getEnabledFeatures(context);
      setEnabledFeatures(enabled);
    } catch (error) {
      console.error('Failed to evaluate feature flags:', error);
    } finally {
      setLoading(false);
    }
  }

  function getUserRole(): string {
    if (!user) return 'guest';

    // Get role from user metadata
    return user.user_metadata?.role || 'user';
  }

  function isEnabled(flagKey: string): boolean {
    const context = {
      userId: user?.id,
      tenantId: currentTenant?.id,
      userRole: getUserRole(),
    };

    const enabled = checkFeature(flagKey, context);

    // Track usage for analytics (async, non-blocking)
    if (user) {
      trackFeatureUsage(flagKey, user.id, enabled).catch(console.error);
    }

    return enabled;
  }

  return (
    <FeatureFlagContext.Provider
      value={{
        isEnabled,
        enabledFeatures,
        loading,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export default FeatureFlagProvider;
