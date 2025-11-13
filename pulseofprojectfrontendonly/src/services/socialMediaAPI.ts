/**
 * Social Media API Service
 * Hybrid approach: Real data for TVK accounts + Aggregated estimated data for mentions
 */

import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SocialMediaMetrics {
  platform: string;
  followers: number;
  posts: number;
  engagement: number;
  reach: number;
  lastUpdated: Date;
}

export interface PostData {
  id: string;
  platform: string;
  content: string;
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  views?: number;
  mediaType: 'text' | 'image' | 'video' | 'link';
  url: string;
}

export interface MentionData {
  keyword: string;
  platform: string;
  count: number;
  sentiment: number; // -1 to 1
  growth: number; // percentage
  timeframe: '1h' | '6h' | '24h' | '7d';
}

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

const API_CONFIG = {
  facebook: {
    pageId: import.meta.env.VITE_FACEBOOK_PAGE_ID || '',
    accessToken: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || '',
    apiVersion: 'v18.0'
  },
  instagram: {
    accountId: import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID || '',
    accessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN || '',
  },
  twitter: {
    accountId: import.meta.env.VITE_TWITTER_ACCOUNT_ID || '',
    bearerToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN || '',
  },
  youtube: {
    channelId: import.meta.env.VITE_YOUTUBE_CHANNEL_ID || '',
    apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  }
};

// Check if APIs are configured
export const isAPIConfigured = (platform: string): boolean => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return !!(API_CONFIG.facebook.pageId && API_CONFIG.facebook.accessToken);
    case 'instagram':
      return !!(API_CONFIG.instagram.accountId && API_CONFIG.instagram.accessToken);
    case 'twitter':
      return !!(API_CONFIG.twitter.accountId && API_CONFIG.twitter.bearerToken);
    case 'youtube':
      return !!(API_CONFIG.youtube.channelId && API_CONFIG.youtube.apiKey);
    default:
      return false;
  }
};

// ============================================================================
// FACEBOOK / INSTAGRAM (Meta Graph API)
// ============================================================================

/**
 * Fetch Facebook Page metrics
 */
export const fetchFacebookMetrics = async (): Promise<SocialMediaMetrics | null> => {
  if (!isAPIConfigured('facebook')) {
    console.warn('Facebook API not configured');
    return null;
  }

  try {
    const { pageId, accessToken, apiVersion } = API_CONFIG.facebook;
    const baseUrl = `https://graph.facebook.com/${apiVersion}/${pageId}`;

    const response = await axios.get(baseUrl, {
      params: {
        fields: 'followers_count,fan_count,engagement,posts{created_time}',
        access_token: accessToken
      }
    });

    const data = response.data;

    return {
      platform: 'Facebook',
      followers: data.fan_count || 0,
      posts: data.posts?.data?.length || 0,
      engagement: calculateEngagement(data),
      reach: estimateReach(data.fan_count),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Facebook API Error:', error);
    return null;
  }
};

/**
 * Fetch Facebook Page posts
 */
export const fetchFacebookPosts = async (limit = 10): Promise<PostData[]> => {
  if (!isAPIConfigured('facebook')) {
    return [];
  }

  try {
    const { pageId, accessToken, apiVersion } = API_CONFIG.facebook;
    const baseUrl = `https://graph.facebook.com/${apiVersion}/${pageId}/posts`;

    const response = await axios.get(baseUrl, {
      params: {
        fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares,attachments{type,url}',
        limit,
        access_token: accessToken
      }
    });

    return response.data.data.map((post: any) => ({
      id: post.id,
      platform: 'Facebook',
      content: post.message || '',
      timestamp: new Date(post.created_time),
      likes: post.likes?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      comments: post.comments?.summary?.total_count || 0,
      mediaType: post.attachments?.data?.[0]?.type === 'photo' ? 'image' :
                 post.attachments?.data?.[0]?.type === 'video_inline' ? 'video' : 'text',
      url: `https://facebook.com/${post.id}`
    }));
  } catch (error) {
    console.error('Facebook Posts Error:', error);
    return [];
  }
};

/**
 * Fetch Instagram Account metrics
 */
export const fetchInstagramMetrics = async (): Promise<SocialMediaMetrics | null> => {
  if (!isAPIConfigured('instagram')) {
    console.warn('Instagram API not configured');
    return null;
  }

  try {
    const { accountId, accessToken } = API_CONFIG.instagram;
    const baseUrl = `https://graph.facebook.com/v18.0/${accountId}`;

    const response = await axios.get(baseUrl, {
      params: {
        fields: 'followers_count,media_count,media{like_count,comments_count,timestamp}',
        access_token: accessToken
      }
    });

    const data = response.data;

    return {
      platform: 'Instagram',
      followers: data.followers_count || 0,
      posts: data.media_count || 0,
      engagement: calculateInstagramEngagement(data),
      reach: estimateReach(data.followers_count),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Instagram API Error:', error);
    return null;
  }
};

/**
 * Fetch Instagram posts
 */
export const fetchInstagramPosts = async (limit = 10): Promise<PostData[]> => {
  if (!isAPIConfigured('instagram')) {
    return [];
  }

  try {
    const { accountId, accessToken } = API_CONFIG.instagram;
    const baseUrl = `https://graph.facebook.com/v18.0/${accountId}/media`;

    const response = await axios.get(baseUrl, {
      params: {
        fields: 'id,caption,timestamp,like_count,comments_count,media_type,media_url,permalink',
        limit,
        access_token: accessToken
      }
    });

    return response.data.data.map((post: any) => ({
      id: post.id,
      platform: 'Instagram',
      content: post.caption || '',
      timestamp: new Date(post.timestamp),
      likes: post.like_count || 0,
      shares: 0, // Instagram API doesn't provide shares
      comments: post.comments_count || 0,
      mediaType: post.media_type === 'IMAGE' ? 'image' :
                 post.media_type === 'VIDEO' ? 'video' : 'text',
      url: post.permalink
    }));
  } catch (error) {
    console.error('Instagram Posts Error:', error);
    return [];
  }
};

// ============================================================================
// TWITTER/X API
// ============================================================================

/**
 * Fetch Twitter/X account metrics
 */
export const fetchTwitterMetrics = async (): Promise<SocialMediaMetrics | null> => {
  if (!isAPIConfigured('twitter')) {
    console.warn('Twitter API not configured');
    return null;
  }

  try {
    const { accountId, bearerToken } = API_CONFIG.twitter;
    const baseUrl = `https://api.twitter.com/2/users/${accountId}`;

    const response = await axios.get(baseUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      },
      params: {
        'user.fields': 'public_metrics'
      }
    });

    const metrics = response.data.data.public_metrics;

    return {
      platform: 'Twitter/X',
      followers: metrics.followers_count || 0,
      posts: metrics.tweet_count || 0,
      engagement: calculateTwitterEngagement(metrics),
      reach: estimateReach(metrics.followers_count),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Twitter API Error:', error);
    return null;
  }
};

/**
 * Fetch Twitter/X posts
 */
export const fetchTwitterPosts = async (limit = 10): Promise<PostData[]> => {
  if (!isAPIConfigured('twitter')) {
    return [];
  }

  try {
    const { accountId, bearerToken } = API_CONFIG.twitter;
    const baseUrl = `https://api.twitter.com/2/users/${accountId}/tweets`;

    const response = await axios.get(baseUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      },
      params: {
        'tweet.fields': 'created_at,public_metrics,attachments',
        'max_results': limit
      }
    });

    return response.data.data.map((tweet: any) => ({
      id: tweet.id,
      platform: 'Twitter/X',
      content: tweet.text || '',
      timestamp: new Date(tweet.created_at),
      likes: tweet.public_metrics.like_count || 0,
      shares: tweet.public_metrics.retweet_count || 0,
      comments: tweet.public_metrics.reply_count || 0,
      views: tweet.public_metrics.impression_count,
      mediaType: tweet.attachments ? 'image' : 'text',
      url: `https://twitter.com/i/web/status/${tweet.id}`
    }));
  } catch (error) {
    console.error('Twitter Posts Error:', error);
    return [];
  }
};

// ============================================================================
// YOUTUBE DATA API
// ============================================================================

/**
 * Fetch YouTube channel metrics
 */
export const fetchYouTubeMetrics = async (): Promise<SocialMediaMetrics | null> => {
  if (!isAPIConfigured('youtube')) {
    console.warn('YouTube API not configured');
    return null;
  }

  try {
    const { channelId, apiKey } = API_CONFIG.youtube;
    const baseUrl = 'https://www.googleapis.com/youtube/v3/channels';

    const response = await axios.get(baseUrl, {
      params: {
        part: 'statistics',
        id: channelId,
        key: apiKey
      }
    });

    const stats = response.data.items[0].statistics;

    return {
      platform: 'YouTube',
      followers: parseInt(stats.subscriberCount) || 0,
      posts: parseInt(stats.videoCount) || 0,
      engagement: calculateYouTubeEngagement(stats),
      reach: parseInt(stats.viewCount) || 0,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    return null;
  }
};

/**
 * Fetch YouTube videos
 */
export const fetchYouTubePosts = async (limit = 10): Promise<PostData[]> => {
  if (!isAPIConfigured('youtube')) {
    return [];
  }

  try {
    const { channelId, apiKey } = API_CONFIG.youtube;

    // First get video IDs
    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    const searchResponse = await axios.get(searchUrl, {
      params: {
        part: 'id',
        channelId,
        maxResults: limit,
        order: 'date',
        type: 'video',
        key: apiKey
      }
    });

    const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(',');

    // Then get video details
    const videosUrl = 'https://www.googleapis.com/youtube/v3/videos';
    const videosResponse = await axios.get(videosUrl, {
      params: {
        part: 'snippet,statistics',
        id: videoIds,
        key: apiKey
      }
    });

    return videosResponse.data.items.map((video: any) => ({
      id: video.id,
      platform: 'YouTube',
      content: video.snippet.title,
      timestamp: new Date(video.snippet.publishedAt),
      likes: parseInt(video.statistics.likeCount) || 0,
      shares: 0, // YouTube API doesn't provide shares directly
      comments: parseInt(video.statistics.commentCount) || 0,
      views: parseInt(video.statistics.viewCount) || 0,
      mediaType: 'video' as const,
      url: `https://www.youtube.com/watch?v=${video.id}`
    }));
  } catch (error) {
    console.error('YouTube Posts Error:', error);
    return [];
  }
};

// ============================================================================
// AGGREGATED MENTIONS (Estimated Data)
// ============================================================================

/**
 * Generate estimated mention data for platforms without direct API access
 * This simulates aggregated data from WhatsApp, Telegram, LinkedIn, TikTok
 */
export const generateAggregatedMentions = (keywords: string[]): MentionData[] => {
  const platforms = ['WhatsApp', 'Telegram', 'LinkedIn', 'TikTok'];
  const timeframes: Array<'1h' | '6h' | '24h' | '7d'> = ['1h', '6h', '24h', '7d'];

  const mentions: MentionData[] = [];

  keywords.forEach(keyword => {
    platforms.forEach(platform => {
      timeframes.forEach(timeframe => {
        // Generate realistic estimates based on platform and timeframe
        const baseCount = getBaseMentionCount(platform, timeframe);
        const variance = Math.random() * 0.3 - 0.15; // ±15% variance

        mentions.push({
          keyword,
          platform,
          count: Math.round(baseCount * (1 + variance)),
          sentiment: Math.random() * 0.6 + 0.2, // Mostly positive (0.2 to 0.8)
          growth: Math.random() * 40 - 10, // -10% to +30% growth
          timeframe
        });
      });
    });
  });

  return mentions;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEngagement(data: any): number {
  // Simple engagement calculation
  const likes = data.likes?.summary?.total_count || 0;
  const comments = data.comments?.summary?.total_count || 0;
  const shares = data.shares?.count || 0;
  const followers = data.fan_count || 1;

  return Math.round(((likes + comments + shares) / followers) * 100);
}

function calculateInstagramEngagement(data: any): number {
  if (!data.media?.data) return 0;

  const totalEngagement = data.media.data.reduce((sum: number, post: any) => {
    return sum + (post.like_count || 0) + (post.comments_count || 0);
  }, 0);

  const followers = data.followers_count || 1;
  return Math.round((totalEngagement / followers) * 100);
}

function calculateTwitterEngagement(metrics: any): number {
  const followers = metrics.followers_count || 1;
  const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0);
  return Math.round((engagement / followers) * 100);
}

function calculateYouTubeEngagement(stats: any): number {
  const views = parseInt(stats.viewCount) || 1;
  const engagement = (parseInt(stats.likeCount) || 0) + (parseInt(stats.commentCount) || 0);
  return Math.round((engagement / views) * 100);
}

function estimateReach(followers: number): number {
  // Estimate reach as 2-3x follower count
  return Math.round(followers * (2 + Math.random()));
}

function getBaseMentionCount(platform: string, timeframe: string): number {
  const baseRates: Record<string, Record<string, number>> = {
    'WhatsApp': { '1h': 120, '6h': 680, '24h': 2500, '7d': 15000 },
    'Telegram': { '1h': 45, '6h': 250, '24h': 900, '7d': 5800 },
    'LinkedIn': { '1h': 15, '6h': 85, '24h': 320, '7d': 2100 },
    'TikTok': { '1h': 35, '6h': 190, '24h': 720, '7d': 4500 }
  };

  return baseRates[platform]?.[timeframe] || 100;
}

// ============================================================================
// MAIN AGGREGATOR FUNCTION
// ============================================================================

/**
 * Fetch all social media data (real + estimated)
 */
export const fetchAllSocialMediaData = async () => {
  try {
    // Fetch real data from configured APIs
    const [facebookMetrics, instagramMetrics, twitterMetrics, youtubeMetrics] = await Promise.all([
      fetchFacebookMetrics(),
      fetchInstagramMetrics(),
      fetchTwitterMetrics(),
      fetchYouTubeMetrics()
    ]);

    // Fetch posts
    const [facebookPosts, instagramPosts, twitterPosts, youtubePosts] = await Promise.all([
      fetchFacebookPosts(),
      fetchInstagramPosts(),
      fetchTwitterPosts(),
      fetchYouTubePosts()
    ]);

    // Generate aggregated mentions for TVK
    const mentions = generateAggregatedMentions([
      'TVK',
      'Tamilaga Vettri Kazhagam',
      'தமிழக வெற்றி கழகம்',
      '#TVK'
    ]);

    return {
      metrics: {
        facebook: facebookMetrics,
        instagram: instagramMetrics,
        twitter: twitterMetrics,
        youtube: youtubeMetrics
      },
      posts: [
        ...facebookPosts,
        ...instagramPosts,
        ...twitterPosts,
        ...youtubePosts
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), // Sort by newest first
      mentions,
      configuredPlatforms: {
        facebook: isAPIConfigured('facebook'),
        instagram: isAPIConfigured('instagram'),
        twitter: isAPIConfigured('twitter'),
        youtube: isAPIConfigured('youtube')
      }
    };
  } catch (error) {
    console.error('Error fetching social media data:', error);
    throw error;
  }
};

export default {
  fetchFacebookMetrics,
  fetchFacebookPosts,
  fetchInstagramMetrics,
  fetchInstagramPosts,
  fetchTwitterMetrics,
  fetchTwitterPosts,
  fetchYouTubeMetrics,
  fetchYouTubePosts,
  generateAggregatedMentions,
  fetchAllSocialMediaData,
  isAPIConfigured
};
