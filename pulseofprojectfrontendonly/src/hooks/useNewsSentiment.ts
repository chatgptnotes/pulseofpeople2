/**
 * useNewsSentiment Hook
 * React hook for managing news sentiment analysis and TVK reports
 */

import { useState, useEffect, useCallback } from 'react';
import { newsService, NewsArticle, TVKSentimentReport, ArticleFilters } from '../services/newsService';
import { tvkNewsAgent, AnalysisResult } from '../services/newsAgent';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UseNewsSentimentReturn {
  // Articles
  articles: NewsArticle[];
  tvkArticles: NewsArticle[];
  loadingArticles: boolean;
  articlesError: string | null;

  // Reports
  latestReport: TVKSentimentReport | null;
  reports: TVKSentimentReport[];
  loadingReports: boolean;
  reportsError: string | null;

  // Agent Status
  agentStatus: {
    isRunning: boolean;
    lastRunTime?: Date;
    nextRunTime?: Date;
    articlesAnalyzed: number;
    reportsGenerated: number;
  };

  // Actions
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchTVKArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchLatestReport: () => Promise<void>;
  fetchReports: (startDate: string, endDate: string) => Promise<void>;
  runAnalysis: (options?: { articleIds?: string[]; generateReport?: boolean }) => Promise<AnalysisResult>;
  generateReport: (startDate?: string, endDate?: string) => Promise<TVKSentimentReport | null>;
  startAgent: () => void;
  stopAgent: () => void;
  refreshData: () => Promise<void>;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export const useNewsSentiment = (options: {
  autoFetch?: boolean;
  autoFetchInterval?: number;
  filters?: ArticleFilters;
} = {}): UseNewsSentimentReturn => {
  const {
    autoFetch = true,
    autoFetchInterval = 60000, // 1 minute
    filters: defaultFilters = {}
  } = options;

  // State for articles
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [tvkArticles, setTvkArticles] = useState<NewsArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // State for reports
  const [latestReport, setLatestReport] = useState<TVKSentimentReport | null>(null);
  const [reports, setReports] = useState<TVKSentimentReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // State for agent
  const [agentStatus, setAgentStatus] = useState(tvkNewsAgent.getStatus());

  // =====================================================
  // FETCH FUNCTIONS
  // =====================================================

  /**
   * Fetch all articles with filters
   */
  const fetchArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setLoadingArticles(true);
    setArticlesError(null);

    try {
      const fetchedArticles = await newsService.getArticles({
        ...defaultFilters,
        ...filters
      });
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to fetch articles');
    } finally {
      setLoadingArticles(false);
    }
  }, [defaultFilters]);

  /**
   * Fetch TVK-specific articles
   */
  const fetchTVKArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setLoadingArticles(true);
    setArticlesError(null);

    try {
      const fetchedArticles = await newsService.getTVKArticles({
        ...defaultFilters,
        ...filters
      });
      setTvkArticles(fetchedArticles);
    } catch (error) {
      console.error('Error fetching TVK articles:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to fetch TVK articles');
    } finally {
      setLoadingArticles(false);
    }
  }, [defaultFilters]);

  /**
   * Fetch latest TVK sentiment report
   */
  const fetchLatestReport = useCallback(async () => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const report = await newsService.getLatestTVKReport('daily');
      setLatestReport(report);
    } catch (error) {
      console.error('Error fetching latest report:', error);
      setReportsError(error instanceof Error ? error.message : 'Failed to fetch latest report');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  /**
   * Fetch TVK reports for date range
   */
  const fetchReports = useCallback(async (startDate: string, endDate: string) => {
    setLoadingReports(true);
    setReportsError(null);

    try {
      const fetchedReports = await newsService.getTVKReports(startDate, endDate, 'daily');
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReportsError(error instanceof Error ? error.message : 'Failed to fetch reports');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // =====================================================
  // AGENT ACTIONS
  // =====================================================

  /**
   * Run manual analysis
   */
  const runAnalysis = useCallback(async (options: {
    articleIds?: string[];
    generateReport?: boolean;
  } = {}): Promise<AnalysisResult> => {
    try {
      const result = await tvkNewsAgent.runManualAnalysis(options);

      // Update agent status
      setAgentStatus(tvkNewsAgent.getStatus());

      // Refresh data after analysis
      await refreshData();

      return result;
    } catch (error) {
      console.error('Error running analysis:', error);
      return {
        success: false,
        articlesAnalyzed: 0,
        tvkArticlesFound: 0,
        averageSentiment: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }, []);

  /**
   * Generate TVK sentiment report
   */
  const generateReport = useCallback(async (
    startDate?: string,
    endDate?: string
  ): Promise<TVKSentimentReport | null> => {
    try {
      let report: TVKSentimentReport | null;

      if (startDate && endDate) {
        report = await tvkNewsAgent.generateCustomReport(startDate, endDate);
      } else {
        report = await tvkNewsAgent.generateDailyTVKReport();
      }

      // Update agent status
      setAgentStatus(tvkNewsAgent.getStatus());

      // Refresh reports
      await fetchLatestReport();

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [fetchLatestReport]);

  /**
   * Start the autonomous agent
   */
  const startAgent = useCallback(() => {
    tvkNewsAgent.start();
    setAgentStatus(tvkNewsAgent.getStatus());
  }, []);

  /**
   * Stop the autonomous agent
   */
  const stopAgent = useCallback(() => {
    tvkNewsAgent.stop();
    setAgentStatus(tvkNewsAgent.getStatus());
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchArticles(),
      fetchTVKArticles(),
      fetchLatestReport()
    ]);
  }, [fetchArticles, fetchTVKArticles, fetchLatestReport]);

  // =====================================================
  // EFFECTS
  // =====================================================

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (autoFetch) {
      refreshData();
    }
  }, [autoFetch, refreshData]);

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (!autoFetch || !autoFetchInterval) return;

    const intervalId = setInterval(() => {
      refreshData();
      setAgentStatus(tvkNewsAgent.getStatus());
    }, autoFetchInterval);

    return () => clearInterval(intervalId);
  }, [autoFetch, autoFetchInterval, refreshData]);

  /**
   * Update agent status periodically
   */
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setAgentStatus(tvkNewsAgent.getStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Articles
    articles,
    tvkArticles,
    loadingArticles,
    articlesError,

    // Reports
    latestReport,
    reports,
    loadingReports,
    reportsError,

    // Agent Status
    agentStatus,

    // Actions
    fetchArticles,
    fetchTVKArticles,
    fetchLatestReport,
    fetchReports,
    runAnalysis,
    generateReport,
    startAgent,
    stopAgent,
    refreshData
  };
};

export default useNewsSentiment;
