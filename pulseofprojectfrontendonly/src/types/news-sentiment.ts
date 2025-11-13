/**
 * News Sentiment Analysis Types
 * Centralized type definitions for news sentiment analysis feature
 */

// =====================================================
// NEWS ARTICLE TYPES
// =====================================================

export interface NewsArticle {
  id?: string;
  organization_id: string;

  // Article Information
  title: string;
  content: string;
  summary?: string;
  url?: string;
  image_url?: string;

  // Source Information
  source: string;
  author?: string;
  published_at?: string;
  fetched_at?: string;

  // Geographic Context
  state_id?: string;
  district_id?: string;
  constituency_id?: string;

  // Language & Classification
  language?: string;
  category?: string;
  tags?: string[];

  // Sentiment Analysis Results
  sentiment_score?: number; // -1 to 1
  sentiment_polarity?: 'positive' | 'negative' | 'neutral';
  emotion?: EmotionType;
  confidence?: number; // 0 to 1
  analyzed_at?: string;

  // TVK-Specific Analysis
  tvk_mentioned?: boolean;
  tvk_mention_count?: number;
  tvk_context?: string;
  tvk_sentiment_score?: number; // -1 to 1
  tvk_sentiment_polarity?: 'positive' | 'negative' | 'neutral';

  // Article Metadata
  word_count?: number;
  reading_time_minutes?: number;
  credibility_score?: number; // 0 to 1
  is_verified?: boolean;
  is_breaking?: boolean;
  priority?: PriorityLevel;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export type EmotionType =
  | 'anger'
  | 'trust'
  | 'fear'
  | 'hope'
  | 'pride'
  | 'joy'
  | 'sadness'
  | 'surprise'
  | 'disgust';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type SentimentPolarity = 'positive' | 'negative' | 'neutral';

// =====================================================
// TVK SENTIMENT REPORT TYPES
// =====================================================

export interface TVKSentimentReport {
  id?: string;
  organization_id: string;

  // Report Period
  report_date: string;
  period_type: PeriodType;
  start_time: string;
  end_time: string;

  // Article Statistics
  total_articles: number;
  tvk_mentioned_articles: number;
  analyzed_articles: number;

  // Overall Sentiment
  overall_sentiment_score: number; // -1 to 1
  overall_sentiment_polarity: SentimentPolarity;
  sentiment_confidence: number; // 0 to 1

  // Sentiment Distribution
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;

  // Emotion Analysis
  dominant_emotion?: EmotionType;
  emotion_scores?: EmotionScores;

  // Breakdowns
  source_distribution?: Record<string, number>;
  top_sources?: string[];
  state_distribution?: Record<string, number>;
  district_distribution?: Record<string, number>;

  // Insights
  trending_topics?: string[];
  top_keywords?: string[];
  tvk_contexts?: string[];

  // Trend Analysis
  sentiment_change?: number;
  trend_direction?: TrendDirection;

  // Alert Information
  has_crisis?: boolean;
  has_anomaly?: boolean;
  alert_level?: AlertLevel;
  alert_message?: string;

  // Timestamps
  generated_at?: string;
  created_at?: string;
}

export type PeriodType = 'hourly' | 'daily' | 'weekly' | 'monthly';

export type TrendDirection = 'improving' | 'declining' | 'stable';

export type AlertLevel = 'normal' | 'warning' | 'critical';

export interface EmotionScores {
  anger?: number;
  trust?: number;
  fear?: number;
  hope?: number;
  pride?: number;
  joy?: number;
  sadness?: number;
  surprise?: number;
  disgust?: number;
}

// =====================================================
// NEWS SOURCE TYPES
// =====================================================

export interface NewsSource {
  id?: string;
  organization_id: string;

  // Source Information
  name: string;
  short_name?: string;
  url?: string;
  rss_feed_url?: string;

  // Source Characteristics
  language?: string;
  region?: string;
  source_type?: SourceType;

  // Credibility & Status
  credibility_score?: number; // 0 to 1
  is_active?: boolean;
  is_verified?: boolean;

  // Statistics
  total_articles_fetched?: number;
  last_fetched_at?: string;

  // Configuration
  fetch_frequency_minutes?: number;
  priority_level?: number; // 1-5

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export type SourceType = 'news' | 'blog' | 'magazine' | 'social_media' | 'press_release' | 'other';

// =====================================================
// FILTER & QUERY TYPES
// =====================================================

export interface ArticleFilters {
  startDate?: string;
  endDate?: string;
  sources?: string[];
  tvkOnly?: boolean;
  sentimentPolarity?: SentimentPolarity;
  minConfidence?: number;
  stateId?: string;
  districtId?: string;
  language?: string;
  category?: string;
  priority?: PriorityLevel;
  isBreaking?: boolean;
  isVerified?: boolean;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  periodType?: PeriodType;
  minArticleCount?: number;
  alertLevelMin?: AlertLevel;
}

// =====================================================
// AGENT TYPES
// =====================================================

export interface AgentConfig {
  organizationId: string;
  enabled: boolean;
  analysisInterval: number; // milliseconds
  batchSize: number;
  minConfidenceThreshold: number;
  enableRealTimeAnalysis: boolean;
  enableReportGeneration: boolean;
  alertThreshold: number;
}

export interface AgentStatus {
  isRunning: boolean;
  lastRunTime?: Date;
  nextRunTime?: Date;
  articlesAnalyzed: number;
  reportsGenerated: number;
  errors: number;
  currentActivity?: string;
}

export interface AnalysisResult {
  success: boolean;
  articlesAnalyzed: number;
  tvkArticlesFound: number;
  averageSentiment: number;
  errors: string[];
}

// =====================================================
// TVK DETECTION TYPES
// =====================================================

export interface TVKKeywords {
  party_names: string[];
  leader_names: string[];
  related_terms: string[];
}

export interface TVKDetectionResult {
  mentioned: boolean;
  count: number;
  contexts: string[];
  relevanceScore: number;
}

// =====================================================
// CHART & VISUALIZATION TYPES
// =====================================================

export interface SentimentChartData {
  date: string;
  sentiment: number;
  positive: number;
  neutral: number;
  negative: number;
  articleCount: number;
}

export interface SourceChartData {
  source: string;
  count: number;
  averageSentiment: number;
  credibilityScore: number;
}

export interface EmotionChartData {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface GeographicChartData {
  location: string;
  sentiment: number;
  articleCount: number;
  coordinates?: [number, number];
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface NewsAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface NewsViewState {
  viewMode: 'list' | 'grid' | 'timeline';
  sortBy: 'date' | 'sentiment' | 'relevance' | 'source';
  sortOrder: 'asc' | 'desc';
  selectedArticle?: NewsArticle;
  filters: ArticleFilters;
}

export interface ReportViewState {
  selectedPeriod: PeriodType;
  selectedReport?: TVKSentimentReport;
  dateRange: {
    start: string;
    end: string;
  };
  comparisonEnabled: boolean;
}

// =====================================================
// ALERT TYPES
// =====================================================

export interface SentimentAlert {
  id: string;
  type: AlertType;
  severity: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  articleId?: string;
  reportId?: string;
  metadata?: Record<string, any>;
  acknowledged?: boolean;
}

export type AlertType =
  | 'sentiment_spike'
  | 'sentiment_drop'
  | 'volume_spike'
  | 'crisis_detected'
  | 'trending_negative'
  | 'source_anomaly';

// =====================================================
// EXPORT TYPES
// =====================================================

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: ArticleFilters;
}

export interface ReportExport {
  report: TVKSentimentReport;
  articles: NewsArticle[];
  charts?: ChartExport[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    format: string;
  };
}

export interface ChartExport {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'heatmap';
  data: any;
  imageUrl?: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
