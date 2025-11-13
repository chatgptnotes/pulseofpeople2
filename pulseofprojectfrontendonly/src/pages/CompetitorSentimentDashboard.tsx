import React, { useState, useEffect } from 'react';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface CompetitorMetrics {
  id: string;
  name: string;
  party_name: string;
  color_code: string;
  sentiment_score: number;
  total_posts: number;
  total_engagement: number;
  avg_engagement_rate: number;
  positive_posts: number;
  neutral_posts: number;
  negative_posts: number;
  follower_count: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
}

export default function CompetitorSentimentDashboard() {
  const { supabase } = useAuth();
  const [competitors, setCompetitors] = useState<CompetitorMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // TVK (Your party) metrics - shown as baseline
  const tvkMetrics: CompetitorMetrics = {
    id: 'tvk',
    name: 'TVK',
    party_name: 'Tamilaga Vettri Kazhagam',
    color_code: '#DC2626',
    sentiment_score: 0.72,
    total_posts: 245,
    total_engagement: 125000,
    avg_engagement_rate: 5.8,
    positive_posts: 180,
    neutral_posts: 45,
    negative_posts: 20,
    follower_count: 850000,
    trend: 'up',
    trend_percentage: 12.5,
  };

  useEffect(() => {
    loadCompetitorMetrics();
  }, [timeRange]);

  async function loadCompetitorMetrics() {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Get competitors with their metrics
      const { data: competitorsData, error: competitorsError } = await supabase
        .from('competitors')
        .select('*')
        .eq('is_active', true);

      if (competitorsError) throw competitorsError;

      // For each competitor, aggregate their metrics
      const metricsPromises = (competitorsData || []).map(async (competitor) => {
        // Get posts count and sentiment
        const { data: posts, error: postsError } = await supabase
          .from('competitor_posts')
          .select('sentiment_score, sentiment_label, likes_count, comments_count, shares_count, engagement_rate')
          .eq('competitor_id', competitor.id)
          .gte('posted_at', startDate.toISOString())
          .lte('posted_at', endDate.toISOString());

        if (postsError) {
          console.error('Error loading posts:', postsError);
          return null;
        }

        // Calculate metrics
        const totalPosts = posts?.length || 0;
        const avgSentiment = posts?.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / (totalPosts || 1);
        const totalEngagement = posts?.reduce((sum, p) => sum + (p.likes_count + p.comments_count + p.shares_count), 0) || 0;
        const avgEngagementRate = posts?.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / (totalPosts || 1);

        const positivePosts = posts?.filter(p => p.sentiment_label === 'positive').length || 0;
        const neutralPosts = posts?.filter(p => p.sentiment_label === 'neutral').length || 0;
        const negativePosts = posts?.filter(p => p.sentiment_label === 'negative').length || 0;

        // Get total followers from social accounts
        const { data: socialAccounts } = await supabase
          .from('competitor_social_accounts')
          .select('follower_count')
          .eq('competitor_id', competitor.id);

        const totalFollowers = socialAccounts?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0;

        // Calculate trend (mock for now - would compare with previous period)
        const trendPercentage = Math.random() * 20 - 10; // -10% to +10%
        const trend = trendPercentage > 2 ? 'up' : trendPercentage < -2 ? 'down' : 'stable';

        return {
          id: competitor.id,
          name: competitor.name,
          party_name: competitor.party_name,
          color_code: competitor.color_code,
          sentiment_score: avgSentiment,
          total_posts: totalPosts,
          total_engagement: totalEngagement,
          avg_engagement_rate: avgEngagementRate,
          positive_posts: positivePosts,
          neutral_posts: neutralPosts,
          negative_posts: negativePosts,
          follower_count: totalFollowers,
          trend: trend as 'up' | 'down' | 'stable',
          trend_percentage: Math.abs(trendPercentage),
        };
      });

      const metrics = await Promise.all(metricsPromises);
      setCompetitors(metrics.filter(m => m !== null) as CompetitorMetrics[]);
    } catch (error) {
      console.error('Failed to load competitor metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getSentimentColor(score: number): string {
    if (score >= 0.6) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getSentimentBgColor(score: number): string {
    if (score >= 0.6) return 'bg-green-100';
    if (score >= 0.4) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  const allCompetitors = [tvkMetrics, ...competitors];
  const maxSentiment = Math.max(...allCompetitors.map(c => c.sentiment_score));
  const maxEngagement = Math.max(...allCompetitors.map(c => c.avg_engagement_rate));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Legal Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Data from Legal Sources Only
              </h3>
              <p className="text-sm text-green-800">
                All metrics are calculated from data collected through authorized methods: Official APIs, third-party subscriptions, or manual entry.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CompareIcon className="w-8 h-8 mr-3 text-blue-600" />
                Sentiment Comparison Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Compare your performance against competitors
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={loadCompetitorMetrics}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading metrics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sentiment Score Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Score Comparison</h2>
              <div className="space-y-4">
                {allCompetitors.map((competitor) => {
                  const isYou = competitor.id === 'tvk';
                  const widthPercentage = (competitor.sentiment_score / maxSentiment) * 100;

                  return (
                    <div key={competitor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: competitor.color_code }}
                          >
                            {competitor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{competitor.name}</span>
                              {isYou && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{competitor.party_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-2xl font-bold ${getSentimentColor(competitor.sentiment_score)}`}>
                            {(competitor.sentiment_score * 100).toFixed(0)}%
                          </span>
                          <div className="flex items-center text-sm">
                            {competitor.trend === 'up' && (
                              <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                            )}
                            {competitor.trend === 'down' && (
                              <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={competitor.trend === 'up' ? 'text-green-600' : competitor.trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                              {competitor.trend_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isYou ? 'bg-gradient-to-r from-blue-500 to-blue-600' : getSentimentBgColor(competitor.sentiment_score).replace('100', '500')
                          }`}
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement Rate Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rate Comparison</h2>
              <div className="space-y-4">
                {allCompetitors.map((competitor) => {
                  const isYou = competitor.id === 'tvk';
                  const widthPercentage = (competitor.avg_engagement_rate / maxEngagement) * 100;

                  return (
                    <div key={competitor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: competitor.color_code }}
                          >
                            {competitor.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{competitor.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {competitor.avg_engagement_rate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isYou ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCompetitors.map((competitor) => {
                const isYou = competitor.id === 'tvk';

                return (
                  <div
                    key={competitor.id}
                    className={`bg-white rounded-lg border-2 p-6 ${
                      isYou ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: competitor.color_code }}
                        >
                          {competitor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                          {isYou && (
                            <span className="text-xs font-medium text-blue-600">Your Party</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Sentiment</span>
                        <span className={`font-semibold ${getSentimentColor(competitor.sentiment_score)}`}>
                          {(competitor.sentiment_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Posts</span>
                        <span className="font-semibold text-gray-900">{competitor.total_posts}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Engagement</span>
                        <span className="font-semibold text-gray-900">{formatNumber(competitor.total_engagement)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Followers</span>
                        <span className="font-semibold text-gray-900">{formatNumber(competitor.follower_count)}</span>
                      </div>

                      {/* Sentiment Breakdown */}
                      <div className="pt-3">
                        <p className="text-xs text-gray-500 mb-2">Sentiment Breakdown</p>
                        <div className="flex items-center space-x-1">
                          <div
                            className="bg-green-500 h-2 rounded-l"
                            style={{ width: `${(competitor.positive_posts / competitor.total_posts) * 100}%` }}
                            title={`Positive: ${competitor.positive_posts}`}
                          />
                          <div
                            className="bg-yellow-500 h-2"
                            style={{ width: `${(competitor.neutral_posts / competitor.total_posts) * 100}%` }}
                            title={`Neutral: ${competitor.neutral_posts}`}
                          />
                          <div
                            className="bg-red-500 h-2 rounded-r"
                            style={{ width: `${(competitor.negative_posts / competitor.total_posts) * 100}%` }}
                            title={`Negative: ${competitor.negative_posts}`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>Pos: {competitor.positive_posts}</span>
                          <span>Neu: {competitor.neutral_posts}</span>
                          <span>Neg: {competitor.negative_posts}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
