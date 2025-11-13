export const REFRESH_INTERVALS = {
  REAL_TIME: 30000,      // 30 seconds
  FREQUENT: 60000,       // 1 minute
  NORMAL: 300000,        // 5 minutes
  SLOW: 600000,          // 10 minutes
  VERY_SLOW: 1800000     // 30 minutes
} as const;

export const TIME_RANGES = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 3 months', days: 90 },
  '1y': { label: 'Last year', days: 365 },
  'all': { label: 'All time', days: null }
} as const;

export const SENTIMENT_THRESHOLDS = {
  VERY_POSITIVE: 0.8,
  POSITIVE: 0.6,
  NEUTRAL: 0.4,
  NEGATIVE: 0.2,
  VERY_NEGATIVE: 0
} as const;

export const ISSUE_CATEGORIES = [
  'Jobs',
  'Infrastructure', 
  'Health',
  'Education',
  'Law & Order',
  'Environment',
  'Economy',
  'Transportation'
] as const;

export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const SOCIAL_PLATFORMS = [
  'Twitter',
  'Facebook', 
  'Instagram',
  'YouTube',
  'LinkedIn',
  'TikTok',
  'Reddit'
] as const;

export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#8B5CF6',
  NEUTRAL: '#6B7280'
} as const;

export const EXPORT_FORMATS = ['pdf', 'excel', 'csv'] as const;

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const;