import React, { useState, useEffect } from 'react';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ThumbUp as LikeIcon,
  ChatBubble as CommentIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Info as InfoIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as NegativeIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface CompetitorPost {
  id: string;
  competitor_id: string;
  competitor_name: string;
  competitor_color: string;
  platform: string;
  post_id: string;
  post_url?: string;
  content: string;
  post_type: string;
  posted_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_rate?: number;
  sentiment_score?: number;
  sentiment_label?: string;
  topics?: string[];
  hashtags?: string[];
  data_source: string;
}

interface Competitor {
  id: string;
  name: string;
  party_name: string;
  color_code: string;
}

export default function CompetitorSocialMonitor() {
  const [posts, setPosts] = useState<CompetitorPost[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadCompetitors(), loadPosts()]);
  }

  async function loadCompetitors() {
    try {
      const { data, error } = await supabase
        .from('competitors')
        .select('id, name, party_name, color_code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompetitors(data || []);
    } catch (error) {
      console.error('Failed to load competitors:', error);
    }
  }

  async function loadPosts() {
    try {
      setLoading(true);

      // Build query
      let query = supabase
        .from('competitor_posts')
        .select(`
          *,
          competitors!inner(name, party_name, color_code)
        `)
        .order('posted_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform);
      }
      if (selectedCompetitor !== 'all') {
        query = query.eq('competitor_id', selectedCompetitor);
      }
      if (sentimentFilter !== 'all') {
        query = query.eq('sentiment_label', sentimentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedPosts = (data || []).map((post: any) => ({
        ...post,
        competitor_name: post.competitors.name,
        competitor_color: post.competitors.color_code,
      }));

      // Sort
      const sortedPosts = sortPosts(transformedPosts, sortBy);
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function sortPosts(posts: CompetitorPost[], sortType: string): CompetitorPost[] {
    switch (sortType) {
      case 'recent':
        return [...posts].sort((a, b) =>
          new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
        );
      case 'engagement':
        return [...posts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
      case 'likes':
        return [...posts].sort((a, b) => b.likes_count - a.likes_count);
      case 'sentiment':
        return [...posts].sort((a, b) => (b.sentiment_score || 0) - (a.sentiment_score || 0));
      default:
        return posts;
    }
  }

  useEffect(() => {
    loadPosts();
  }, [selectedPlatform, selectedCompetitor, sentimentFilter, sortBy]);

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case 'twitter': return <TwitterIcon className="w-5 h-5 text-blue-400" />;
      case 'facebook': return <FacebookIcon className="w-5 h-5 text-blue-600" />;
      case 'instagram': return <InstagramIcon className="w-5 h-5 text-pink-600" />;
      case 'youtube': return <YouTubeIcon className="w-5 h-5 text-red-600" />;
      default: return <TwitterIcon className="w-5 h-5" />;
    }
  }

  function getSentimentIcon(sentiment: string | undefined) {
    if (!sentiment) return <NeutralIcon className="w-5 h-5 text-gray-400" />;
    switch (sentiment) {
      case 'positive': return <PositiveIcon className="w-5 h-5 text-green-500" />;
      case 'negative': return <NegativeIcon className="w-5 h-5 text-red-500" />;
      default: return <NeutralIcon className="w-5 h-5 text-gray-400" />;
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Legal Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InfoIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Legal Data Sources Only
              </h3>
              <p className="text-sm text-green-800">
                All posts are collected through <strong>authorized methods</strong>: Official APIs, Mention.com, Brand24, or manual entry.
                Data source is tracked for each post.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TwitterIcon className="w-8 h-8 mr-3 text-blue-600" />
                Social Media Monitor
              </h1>
              <p className="text-gray-600 mt-1">
                Track competitor posts and engagement across platforms
              </p>
            </div>
            <button
              onClick={loadPosts}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <FilterIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            {/* Competitor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competitor</label>
              <select
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Competitors</option>
                {competitors.map((comp) => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sentiment</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="engagement">Highest Engagement</option>
                <option value="likes">Most Likes</option>
                <option value="sentiment">Best Sentiment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <TwitterIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-4">
              No competitor posts match your filters. Try adjusting the filters or add data via the Competitor Registry.
            </p>
            <p className="text-sm text-gray-500">
              💡 Tip: Add competitor social accounts in the <a href="/competitors/registry" className="text-blue-600 hover:underline">Competitor Registry</a> to start tracking posts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: post.competitor_color }}
                    >
                      {post.competitor_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.competitor_name}</h3>
                        <span className="text-gray-400">·</span>
                        <span className="text-sm text-gray-500">{formatDate(post.posted_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getPlatformIcon(post.platform)}
                        <span className="text-xs text-gray-500 capitalize">{post.platform}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-xs text-gray-500 capitalize">{post.post_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(post.sentiment_label)}
                    {post.engagement_rate !== undefined && (
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        {post.engagement_rate >= 5 ? (
                          <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : post.engagement_rate >= 2 ? (
                          <span className="w-4 h-4 mr-1">→</span>
                        ) : (
                          <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        {post.engagement_rate.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Topics & Hashtags */}
                {(post.hashtags && post.hashtags.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement Metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <LikeIcon className="w-4 h-4 mr-1.5" />
                      {formatNumber(post.likes_count)}
                    </div>
                    <div className="flex items-center">
                      <CommentIcon className="w-4 h-4 mr-1.5" />
                      {formatNumber(post.comments_count)}
                    </div>
                    <div className="flex items-center">
                      <ShareIcon className="w-4 h-4 mr-1.5" />
                      {formatNumber(post.shares_count)}
                    </div>
                    {post.views_count > 0 && (
                      <div className="flex items-center">
                        <ViewIcon className="w-4 h-4 mr-1.5" />
                        {formatNumber(post.views_count)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Data Source Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.data_source === 'manual'
                        ? 'bg-gray-100 text-gray-700'
                        : post.data_source === 'official_api'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {post.data_source === 'manual' ? '📝' :
                       post.data_source === 'official_api' ? '✅' : '🔗'}
                      {' '}{post.data_source}
                    </span>

                    {post.post_url && (
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Original →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Guidance */}
        {!loading && posts.length === 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              How to populate competitor posts:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Add competitors in the <a href="/competitors/registry" className="underline">Competitor Registry</a></li>
              <li>Add their social media accounts (handles)</li>
              <li>Option A: Enter posts manually</li>
              <li>Option B: Connect to official APIs (Facebook, Twitter, Instagram, YouTube)</li>
              <li>Option C: Subscribe to third-party services (Mention, Brand24)</li>
            </ol>
            <p className="text-xs text-blue-600 mt-3">
              See <code>docs/COMPETITOR_ANALYSIS_LEGAL_GUIDE.md</code> for legal data collection methods.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
