/**
 * News Service
 * Handles CRUD operations for news articles, TVK detection, and relevance scoring
 */

import { supabase } from '../lib/supabase';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface NewsArticle {
  id?: string;
  organization_id: string;

  // Article Info
  title: string;
  content: string;
  summary?: string;
  url?: string;
  image_url?: string;

  // Source
  source: string;
  author?: string;
  published_at?: string;
  fetched_at?: string;

  // Geography
  state_id?: string;
  district_id?: string;
  constituency_id?: string;

  // Language & Category
  language?: string;
  category?: string;
  tags?: string[];

  // Sentiment
  sentiment_score?: number;
  sentiment_polarity?: 'positive' | 'negative' | 'neutral';
  emotion?: string;
  confidence?: number;
  analyzed_at?: string;

  // TVK Specific
  tvk_mentioned?: boolean;
  tvk_mention_count?: number;
  tvk_context?: string;
  tvk_sentiment_score?: number;
  tvk_sentiment_polarity?: 'positive' | 'negative' | 'neutral';

  // Metadata
  word_count?: number;
  reading_time_minutes?: number;
  credibility_score?: number;
  is_verified?: boolean;
  is_breaking?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';

  created_at?: string;
  updated_at?: string;
}

export interface TVKSentimentReport {
  id?: string;
  organization_id: string;

  // Period
  report_date: string;
  period_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  start_time: string;
  end_time: string;

  // Statistics
  total_articles: number;
  tvk_mentioned_articles: number;
  analyzed_articles: number;

  // Sentiment
  overall_sentiment_score: number;
  overall_sentiment_polarity: 'positive' | 'negative' | 'neutral';
  sentiment_confidence: number;

  // Distribution
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;

  // Emotion
  dominant_emotion?: string;
  emotion_scores?: Record<string, number>;

  // Breakdowns
  source_distribution?: Record<string, number>;
  top_sources?: string[];
  state_distribution?: Record<string, number>;
  district_distribution?: Record<string, number>;

  // Insights
  trending_topics?: string[];
  top_keywords?: string[];
  tvk_contexts?: string[];

  // Trend
  sentiment_change?: number;
  trend_direction?: 'improving' | 'declining' | 'stable';

  // Alerts
  has_crisis?: boolean;
  has_anomaly?: boolean;
  alert_level?: 'normal' | 'warning' | 'critical';
  alert_message?: string;

  generated_at?: string;
  created_at?: string;
}

export interface NewsSource {
  id?: string;
  organization_id: string;
  name: string;
  short_name?: string;
  url?: string;
  rss_feed_url?: string;
  language?: string;
  region?: string;
  source_type?: string;
  credibility_score?: number;
  is_active?: boolean;
  is_verified?: boolean;
  total_articles_fetched?: number;
  last_fetched_at?: string;
  fetch_frequency_minutes?: number;
  priority_level?: number;
}

export interface ArticleFilters {
  startDate?: string;
  endDate?: string;
  sources?: string[];
  tvkOnly?: boolean;
  sentimentPolarity?: 'positive' | 'negative' | 'neutral';
  minConfidence?: number;
  stateId?: string;
  districtId?: string;
}

// =====================================================
// TVK DETECTION CONFIGURATION
// =====================================================

export const TVK_KEYWORDS = {
  party_names: [
    'TVK',
    'தமிழக வெற்றி கழகம்',
    'Tamilaga Vettri Kazhagam',
    'தவக',
    'தமிழக வெற்றிக் கழகம்'
  ],
  leader_names: [
    'Vijay',
    'விஜய்',
    'Thalapathy',
    'தளபதி',
    'Thalapathy Vijay',
    'தளபதி விஜய்',
    'Joseph Vijay',
    'Actor Vijay'
  ],
  related_terms: [
    'TVK party',
    'Vijay party',
    'விஜய் கட்சி',
    'தமிழக அரசியல்',
    'Tamil Nadu politics'
  ]
};

// =====================================================
// NEWS SERVICE CLASS
// =====================================================

class NewsService {
  /**
   * Detect TVK mentions in article content
   */
  detectTVKMentions(text: string): { mentioned: boolean; count: number; contexts: string[] } {
    const allKeywords = [
      ...TVK_KEYWORDS.party_names,
      ...TVK_KEYWORDS.leader_names,
      ...TVK_KEYWORDS.related_terms
    ];

    const lowerText = text.toLowerCase();
    let mentionCount = 0;
    const contexts: string[] = [];

    // Count mentions
    for (const keyword of allKeywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        mentionCount += matches.length;

        // Extract context (50 chars before and after)
        const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
        if (keywordIndex !== -1) {
          const start = Math.max(0, keywordIndex - 50);
          const end = Math.min(text.length, keywordIndex + keyword.length + 50);
          const context = text.substring(start, end).trim();
          if (context && !contexts.includes(context)) {
            contexts.push(context);
          }
        }
      }
    }

    return {
      mentioned: mentionCount > 0,
      count: mentionCount,
      contexts: contexts.slice(0, 5) // Limit to top 5 contexts
    };
  }

  /**
   * Calculate article relevance score
   */
  calculateRelevanceScore(article: NewsArticle): number {
    let score = 0;

    // TVK mentions (max 40 points)
    if (article.tvk_mentioned) {
      score += Math.min(40, (article.tvk_mention_count || 0) * 10);
    }

    // Source credibility (max 20 points)
    score += (article.credibility_score || 0) * 20;

    // Geographic relevance (max 20 points)
    if (article.state_id) score += 10;
    if (article.district_id) score += 10;

    // Recency (max 20 points)
    if (article.published_at) {
      const hoursSincePublished =
        (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60);
      if (hoursSincePublished < 24) score += 20;
      else if (hoursSincePublished < 72) score += 10;
      else if (hoursSincePublished < 168) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Estimate reading time
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  /**
   * Create a new news article
   */
  async createArticle(article: NewsArticle): Promise<NewsArticle | null> {
    try {
      // Detect TVK mentions
      const tvkDetection = this.detectTVKMentions(article.title + ' ' + article.content);

      // Calculate metadata
      const wordCount = article.content.split(/\s+/).length;
      const readingTime = this.calculateReadingTime(article.content);

      const articleData = {
        ...article,
        tvk_mentioned: tvkDetection.mentioned,
        tvk_mention_count: tvkDetection.count,
        tvk_context: tvkDetection.contexts.join(' ... '),
        word_count: wordCount,
        reading_time_minutes: readingTime,
        fetched_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('news_articles')
        .insert([articleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createArticle:', error);
      return null;
    }
  }

  /**
   * Get articles with filters
   */
  async getArticles(filters: ArticleFilters = {}): Promise<NewsArticle[]> {
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('published_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('published_at', filters.endDate);
      }
      if (filters.sources && filters.sources.length > 0) {
        query = query.in('source', filters.sources);
      }
      if (filters.tvkOnly) {
        query = query.eq('tvk_mentioned', true);
      }
      if (filters.sentimentPolarity) {
        query = query.eq('sentiment_polarity', filters.sentimentPolarity);
      }
      if (filters.minConfidence) {
        query = query.gte('confidence', filters.minConfidence);
      }
      if (filters.stateId) {
        query = query.eq('state_id', filters.stateId);
      }
      if (filters.districtId) {
        query = query.eq('district_id', filters.districtId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getArticles:', error);
      return [];
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getArticleById:', error);
      return null;
    }
  }

  /**
   * Update article
   */
  async updateArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | null> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateArticle:', error);
      return null;
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting article:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteArticle:', error);
      return false;
    }
  }

  /**
   * Get unanalyzed articles
   */
  async getUnanalyzedArticles(limit: number = 50): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .is('analyzed_at', null)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching unanalyzed articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUnanalyzedArticles:', error);
      return [];
    }
  }

  /**
   * Get TVK-related articles
   */
  async getTVKArticles(filters: ArticleFilters = {}): Promise<NewsArticle[]> {
    return this.getArticles({ ...filters, tvkOnly: true });
  }

  // =====================================================
  // TVK SENTIMENT REPORTS
  // =====================================================

  /**
   * Create TVK sentiment report
   */
  async createTVKReport(report: TVKSentimentReport): Promise<TVKSentimentReport | null> {
    try {
      const { data, error } = await supabase
        .from('tvk_sentiment_reports')
        .insert([report])
        .select()
        .single();

      if (error) {
        console.error('Error creating TVK report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createTVKReport:', error);
      return null;
    }
  }

  /**
   * Get latest TVK report
   */
  async getLatestTVKReport(periodType: string = 'daily'): Promise<TVKSentimentReport | null> {
    try {
      const { data, error } = await supabase
        .from('tvk_sentiment_reports')
        .select('*')
        .eq('period_type', periodType)
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest TVK report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestTVKReport:', error);
      return null;
    }
  }

  /**
   * Get TVK reports by date range
   */
  async getTVKReports(startDate: string, endDate: string, periodType: string = 'daily'): Promise<TVKSentimentReport[]> {
    try {
      const { data, error } = await supabase
        .from('tvk_sentiment_reports')
        .select('*')
        .eq('period_type', periodType)
        .gte('report_date', startDate)
        .lte('report_date', endDate)
        .order('report_date', { ascending: false });

      if (error) {
        console.error('Error fetching TVK reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTVKReports:', error);
      return [];
    }
  }

  // =====================================================
  // NEWS SOURCES
  // =====================================================

  /**
   * Get all active news sources
   */
  async getActiveSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('priority_level', { ascending: false });

      if (error) {
        console.error('Error fetching news sources:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveSources:', error);
      return [];
    }
  }

  /**
   * Update source last fetched time
   */
  async updateSourceLastFetched(sourceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .update({
          last_fetched_at: new Date().toISOString(),
          total_articles_fetched: supabase.rpc('increment', { row_id: sourceId })
        })
        .eq('id', sourceId);

      if (error) {
        console.error('Error updating source:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSourceLastFetched:', error);
      return false;
    }
  }
}

// Export singleton instance
export const newsService = new NewsService();
export default newsService;
