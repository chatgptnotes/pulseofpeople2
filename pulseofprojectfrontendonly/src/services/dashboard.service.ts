/**
 * Dashboard Service - Django API Integration
 * Provides dashboard analytics and statistics
 */

import { apiCall } from '../contexts/AuthContext';

export interface DashboardStats {
  total_voters: number;
  total_constituencies: number;
  total_polling_booths: number;
  total_campaigns: number;
  active_campaigns: number;
  sentiment_distribution: Record<string, number>;
  voter_category_distribution: Record<string, number>;
  recent_interactions: number;
}

export interface SentimentTrend {
  date: string;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  average_score: number;
}

export interface HeatmapData {
  constituency_id: number;
  constituency_name: string;
  state: string;
  district: string;
  voter_count: number;
  avg_sentiment_score: number;
  boundaries?: any;
}

export const dashboardService = {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(): Promise<DashboardStats> {
    const response = await apiCall(`/dashboard/overview/`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard overview');
    }
    return response.json();
  },

  /**
   * Get sentiment trends over time
   * @param days Number of days to fetch (default: 30)
   */
  async getSentimentTrends(days: number = 30): Promise<SentimentTrend[]> {
    const response = await apiCall(`/dashboard/sentiment-trends/?days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sentiment trends');
    }
    return response.json();
  },

  /**
   * Get geographic heatmap data
   */
  async getHeatmap(): Promise<HeatmapData[]> {
    const response = await apiCall(`/dashboard/heatmap/`);
    if (!response.ok) {
      throw new Error('Failed to fetch heatmap data');
    }
    return response.json();
  },

  /**
   * Get quick stats summary
   */
  async getQuickStats() {
    try {
      const overview = await this.getOverview();
      return {
        totalVoters: overview.total_voters,
        totalConstituencies: overview.total_constituencies,
        totalPollingBooths: overview.total_polling_booths,
        activeCampaigns: overview.active_campaigns,
        recentInteractions: overview.recent_interactions,
      };
    } catch (error) {
      console.error('[Dashboard] Failed to fetch quick stats:', error);
      // Return demo data as fallback
      return {
        totalVoters: 0,
        totalConstituencies: 0,
        totalPollingBooths: 0,
        activeCampaigns: 0,
        recentInteractions: 0,
      };
    }
  },

  /**
   * Get sentiment distribution
   */
  async getSentimentDistribution() {
    try {
      const overview = await this.getOverview();
      return overview.sentiment_distribution || {};
    } catch (error) {
      console.error('[Dashboard] Failed to fetch sentiment distribution:', error);
      return {};
    }
  },

  /**
   * Get voter category distribution
   */
  async getVoterCategoryDistribution() {
    try {
      const overview = await this.getOverview();
      return overview.voter_category_distribution || {};
    } catch (error) {
      console.error('[Dashboard] Failed to fetch voter category distribution:', error);
      return {};
    }
  },

  /**
   * Get sentiment trend chart data
   */
  async getSentimentTrendChartData(days: number = 30) {
    try {
      const trends = await this.getSentimentTrends(days);

      return {
        labels: trends.map(t => t.date),
        datasets: [
          {
            label: 'Positive',
            data: trends.map(t => t.positive_count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
          {
            label: 'Neutral',
            data: trends.map(t => t.neutral_count),
            borderColor: 'rgb(201, 203, 207)',
            backgroundColor: 'rgba(201, 203, 207, 0.2)',
          },
          {
            label: 'Negative',
            data: trends.map(t => t.negative_count),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          },
        ],
      };
    } catch (error) {
      console.error('[Dashboard] Failed to fetch sentiment trend chart data:', error);
      return { labels: [], datasets: [] };
    }
  },

  /**
   * Get constituency heatmap data formatted for map display
   */
  async getConstituencyHeatmapData() {
    try {
      const heatmapData = await this.getHeatmap();

      return heatmapData.map(item => ({
        id: item.constituency_id,
        name: item.constituency_name,
        state: item.state,
        district: item.district,
        voterCount: item.voter_count,
        sentimentScore: item.avg_sentiment_score,
        boundaries: item.boundaries,
        // Calculate sentiment color
        sentimentColor: this.getSentimentColor(item.avg_sentiment_score),
      }));
    } catch (error) {
      console.error('[Dashboard] Failed to fetch constituency heatmap:', error);
      return [];
    }
  },

  /**
   * Helper: Get color based on sentiment score
   */
  getSentimentColor(score: number): string {
    if (score >= 0.5) return '#4caf50'; // Green
    if (score >= 0.2) return '#8bc34a'; // Light green
    if (score >= -0.2) return '#ffc107'; // Yellow
    if (score >= -0.5) return '#ff9800'; // Orange
    return '#f44336'; // Red
  },
};

export default dashboardService;
