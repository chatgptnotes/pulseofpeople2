/**
 * React Query Configuration
 * Central configuration for all API data fetching with caching and error handling
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cache time: Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query keys factory for organized cache management
 */
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    users: (filters?: any) => [...queryKeys.auth.all, 'users', filters] as const,
  },

  // Voters
  voters: {
    all: ['voters'] as const,
    list: (filters?: any) => [...queryKeys.voters.all, 'list', filters] as const,
    stats: (filters?: any) => [...queryKeys.voters.all, 'stats', filters] as const,
    detail: (id: string) => [...queryKeys.voters.all, 'detail', id] as const,
    sentiment: (filters?: any) => [...queryKeys.voters.all, 'sentiment', filters] as const,
  },

  // Campaigns
  campaigns: {
    all: ['campaigns'] as const,
    list: (filters?: any) => [...queryKeys.campaigns.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.campaigns.all, 'detail', id] as const,
    metrics: (id: string) => [...queryKeys.campaigns.all, 'metrics', id] as const,
    performance: (id: string) => [...queryKeys.campaigns.all, 'performance', id] as const,
  },

  // Feedback
  feedback: {
    all: ['feedback'] as const,
    list: (filters?: any) => [...queryKeys.feedback.all, 'list', filters] as const,
    detail: (id: number) => [...queryKeys.feedback.all, 'detail', id] as const,
    stats: () => [...queryKeys.feedback.all, 'stats'] as const,
  },

  // Field Reports
  fieldReports: {
    all: ['fieldReports'] as const,
    list: (myOnly?: boolean) => [...queryKeys.fieldReports.all, 'list', myOnly] as const,
    stats: () => [...queryKeys.fieldReports.all, 'stats'] as const,
    recent: (limit?: number) => [...queryKeys.fieldReports.all, 'recent', limit] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...queryKeys.analytics.all, 'overview'] as const,
    constituency: (code: string) => [...queryKeys.analytics.all, 'constituency', code] as const,
    district: (id: string) => [...queryKeys.analytics.all, 'district', id] as const,
    state: (code: string) => [...queryKeys.analytics.all, 'state', code] as const,
    geographic: (filters?: any) => [...queryKeys.analytics.all, 'geographic', filters] as const,
    demographic: (filters?: any) => [...queryKeys.analytics.all, 'demographic', filters] as const,
  },

  // Polling Booths
  pollingBooths: {
    all: ['pollingBooths'] as const,
    list: (filters?: any) => [...queryKeys.pollingBooths.all, 'list', filters] as const,
    coverage: (filters?: any) => [...queryKeys.pollingBooths.all, 'coverage', filters] as const,
    map: (filters?: any) => [...queryKeys.pollingBooths.all, 'map', filters] as const,
  },

  // Social Media
  socialMedia: {
    all: ['socialMedia'] as const,
    posts: (filters?: any) => [...queryKeys.socialMedia.all, 'posts', filters] as const,
    engagement: (filters?: any) => [...queryKeys.socialMedia.all, 'engagement', filters] as const,
    trends: (filters?: any) => [...queryKeys.socialMedia.all, 'trends', filters] as const,
  },

  // Alerts
  alerts: {
    all: ['alerts'] as const,
    list: (filters?: any) => [...queryKeys.alerts.all, 'list', filters] as const,
    unread: () => [...queryKeys.alerts.all, 'unread'] as const,
  },

  // Master Data
  masterData: {
    all: ['masterData'] as const,
    states: () => [...queryKeys.masterData.all, 'states'] as const,
    districts: (stateCode?: string) => [...queryKeys.masterData.all, 'districts', stateCode] as const,
    constituencies: (stateCode?: string, type?: string) =>
      [...queryKeys.masterData.all, 'constituencies', stateCode, type] as const,
    issues: () => [...queryKeys.masterData.all, 'issues'] as const,
    voterSegments: () => [...queryKeys.masterData.all, 'voterSegments'] as const,
    parties: () => [...queryKeys.masterData.all, 'parties'] as const,
  },

  // Organizations (SuperAdmin)
  organizations: {
    all: ['organizations'] as const,
    list: (filters?: any) => [...queryKeys.organizations.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
    stats: () => [...queryKeys.organizations.all, 'stats'] as const,
  },

  // Platform (SuperAdmin)
  platform: {
    all: ['platform'] as const,
    stats: () => [...queryKeys.platform.all, 'stats'] as const,
    health: () => [...queryKeys.platform.all, 'health'] as const,
    activity: (filters?: any) => [...queryKeys.platform.all, 'activity', filters] as const,
  },
};
