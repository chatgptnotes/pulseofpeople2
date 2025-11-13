import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Hash,
  TrendingUp,
  Users,
  Heart,
  Share2,
  Eye,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Globe,
  Clock,
  Target,
  Activity,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Camera,
  Video,
  Mic,
  Image,
  Link,
  RefreshCw,
  Bell,
  MapPin,
  Calendar,
  UserPlus,
  Bookmark
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  followers: number;
  dailyPosts: number;
  engagement: number;
  sentiment: number;
  reach: number;
  isActive: boolean;
  apiStatus: 'connected' | 'limited' | 'error' | 'maintenance';
  lastUpdated: Date;
}

interface SocialPost {
  id: string;
  platform: string;
  author: string;
  authorFollowers: number;
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  topics: string[];
  mentions: string[];
  hashtags: string[];
  mediaType: 'text' | 'image' | 'video' | 'link';
  isVerified: boolean;
  location?: string;
  language: string;
  influence: number;
  viralPotential: number;
  category: 'political' | 'social' | 'economic' | 'general';
}

interface TrendingHashtag {
  id: string;
  hashtag: string;
  platform: string;
  mentions: number;
  growth: number;
  sentiment: number;
  associatedTopics: string[];
  timeframe: '1h' | '6h' | '24h' | '7d';
  peakTime: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Globe,
    color: 'bg-blue-600',
    followers: 4200000,
    dailyPosts: 15600,
    engagement: 78,
    sentiment: 68,
    reach: 12500000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    color: 'bg-pink-600',
    followers: 2800000,
    dailyPosts: 8900,
    engagement: 85,
    sentiment: 72,
    reach: 8900000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 180000) // 3 minutes ago
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: MessageCircle,
    color: 'bg-black',
    followers: 3500000,
    dailyPosts: 24500,
    engagement: 65,
    sentiment: 58,
    reach: 15600000,
    isActive: true,
    apiStatus: 'limited',
    lastUpdated: new Date(Date.now() - 420000) // 7 minutes ago
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Play,
    color: 'bg-red-600',
    followers: 1900000,
    dailyPosts: 450,
    engagement: 82,
    sentiment: 75,
    reach: 6700000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 240000) // 4 minutes ago
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    color: 'bg-green-600',
    followers: 8500000,
    dailyPosts: 45000,
    engagement: 92,
    sentiment: 69,
    reach: 18200000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 150000) // 2.5 minutes ago
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Zap,
    color: 'bg-blue-500',
    followers: 1200000,
    dailyPosts: 3200,
    engagement: 76,
    sentiment: 64,
    reach: 4800000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 360000) // 6 minutes ago
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: UserPlus,
    color: 'bg-blue-700',
    followers: 680000,
    dailyPosts: 890,
    engagement: 71,
    sentiment: 78,
    reach: 2100000,
    isActive: true,
    apiStatus: 'connected',
    lastUpdated: new Date(Date.now() - 480000) // 8 minutes ago
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Mic,
    color: 'bg-black',
    followers: 1800000,
    dailyPosts: 1200,
    engagement: 89,
    sentiment: 71,
    reach: 5400000,
    isActive: true,
    apiStatus: 'limited',
    lastUpdated: new Date(Date.now() - 600000) // 10 minutes ago
  }
];

const mockSocialPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'Facebook',
    author: 'Tamil Nadu State News',
    authorFollowers: 450000,
    content: 'Breaking: Tamil Nadu Budget 2026 allocates ₹15,000 crores for education sector modernization. This historic investment will benefit over 45 lakh students across the state. #Tamil NaduBudget2026 #Education #Development',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    engagement: {
      likes: 12500,
      shares: 3200,
      comments: 890,
      views: 125000
    },
    sentiment: 'positive',
    sentimentScore: 0.78,
    topics: ['Budget', 'Education', 'Development'],
    mentions: ['Tamil Nadu State', 'Education Department'],
    hashtags: ['#Tamil NaduBudget2026', '#Education', '#Development'],
    mediaType: 'image',
    isVerified: true,
    location: 'Thiruvananthapuram',
    language: 'English',
    influence: 85,
    viralPotential: 78,
    category: 'political'
  },
  {
    id: '2',
    platform: 'Instagram',
    author: 'YouthTamil NaduNow',
    authorFollowers: 180000,
    content: 'Young voters are speaking up! Our generation cares about climate action, job opportunities, and digital infrastructure. Time for leaders to listen 🗳️ #YouthVoice #Tamil Nadu2026',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    engagement: {
      likes: 8500,
      shares: 1200,
      comments: 450,
      views: 95000
    },
    sentiment: 'positive',
    sentimentScore: 0.65,
    topics: ['Youth', 'Climate', 'Employment', 'Digital Infrastructure'],
    mentions: ['Youth Voters', 'Leaders'],
    hashtags: ['#YouthVoice', '#Tamil Nadu2026'],
    mediaType: 'video',
    isVerified: false,
    location: 'Kochi',
    language: 'English',
    influence: 72,
    viralPotential: 85,
    category: 'social'
  },
  {
    id: '3',
    platform: 'Twitter/X',
    author: 'Tamil NaduPolitics',
    authorFollowers: 75000,
    content: 'Infrastructure projects timeline extended again. Citizens deserve transparent updates on project status and realistic completion dates. #Accountability #Infrastructure',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    engagement: {
      likes: 2800,
      shares: 1100,
      comments: 340,
      views: 45000
    },
    sentiment: 'negative',
    sentimentScore: -0.45,
    topics: ['Infrastructure', 'Accountability', 'Government'],
    mentions: ['Citizens', 'Government'],
    hashtags: ['#Accountability', '#Infrastructure'],
    mediaType: 'text',
    isVerified: true,
    location: 'Tamil Nadu',
    language: 'English',
    influence: 68,
    viralPotential: 62,
    category: 'political'
  }
];

const trendingHashtags: TrendingHashtag[] = [
  {
    id: '1',
    hashtag: '#Tamil NaduBudget2026',
    platform: 'Multiple',
    mentions: 45600,
    growth: 185,
    sentiment: 0.68,
    associatedTopics: ['Budget', 'Education', 'Healthcare', 'Infrastructure'],
    timeframe: '24h',
    peakTime: '20:00'
  },
  {
    id: '2',
    hashtag: '#YouthVoice',
    platform: 'Instagram',
    mentions: 12400,
    growth: 95,
    sentiment: 0.72,
    associatedTopics: ['Youth', 'Employment', 'Climate', 'Digital'],
    timeframe: '24h',
    peakTime: '18:30'
  },
  {
    id: '3',
    hashtag: '#Accountability',
    platform: 'Twitter/X',
    mentions: 8900,
    growth: 76,
    sentiment: 0.34,
    associatedTopics: ['Government', 'Transparency', 'Projects'],
    timeframe: '24h',
    peakTime: '21:15'
  }
];

export default function SocialMediaChannels() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalPosts: 98750,
    totalEngagement: 15600000,
    avgSentiment: 67,
    viralPosts: 23,
    activePlatforms: 8,
    trendingTopics: 15,
    realTimeAlerts: 5,
    crossPlatformReach: 68500000
  });

  useEffect(() => {
    // Update analytics based on platform data
    const totalFollowers = socialPlatforms.reduce((sum, platform) => sum + platform.followers, 0);
    const totalDailyPosts = socialPlatforms.reduce((sum, platform) => sum + platform.dailyPosts, 0);
    const totalReach = socialPlatforms.reduce((sum, platform) => sum + platform.reach, 0);
    const avgSentiment = Math.round(socialPlatforms.reduce((sum, platform) => sum + platform.sentiment, 0) / socialPlatforms.length);
    
    setAnalytics(prev => ({
      ...prev,
      totalPosts: totalDailyPosts,
      avgSentiment,
      crossPlatformReach: totalReach
    }));
  }, []);

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'limited': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'link': return Link;
      default: return MessageSquare;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'political': return 'text-blue-600 bg-blue-100';
      case 'social': return 'text-green-600 bg-green-100';
      case 'economic': return 'text-purple-600 bg-purple-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'platforms', label: 'Platforms', icon: Globe },
    { key: 'posts', label: 'Posts', icon: MessageCircle },
    { key: 'hashtags', label: 'Hashtags', icon: Hash },
    { key: 'insights', label: 'Insights', icon: Activity }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Social Media Channels
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Multi-platform social media monitoring & analysis
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-responsive-sm font-medium text-gray-700">
                {isMonitoring ? 'Live Monitoring' : 'Monitoring Paused'}
              </span>
            </div>
            <MobileButton
              variant="outline"
              size="small"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isMonitoring ? 'Pause' : 'Resume'}
            </MobileButton>
          </div>
        </div>

        {/* Navigation Tabs */}
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-responsive">
            {/* Key Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.totalPosts.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Daily Posts</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalEngagement / 1000000).toFixed(1)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Engagement</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.avgSentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Avg Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.crossPlatformReach / 1000000).toFixed(0)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Total Reach</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Platform Overview */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Platform Performance
                </h3>
                <MobileButton variant="outline" size="small">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </MobileButton>
              </div>

              <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap="small">
                {socialPlatforms.slice(0, 8).map(platform => {
                  const PlatformIcon = platform.icon;
                  return (
                  <div key={platform.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <PlatformIcon className="w-6 h-6 mr-2" />
                      <div className={`w-2 h-2 rounded-full ${
                        platform.apiStatus === 'connected' ? 'bg-green-500' :
                        platform.apiStatus === 'limited' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-responsive-xs font-medium text-gray-900 mb-1">
                      {platform.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {(platform.followers / 1000000).toFixed(1)}M followers
                    </div>
                    <div className="flex justify-center space-x-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{platform.engagement}%</div>
                        <div className="text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${platform.sentiment > 60 ? 'text-green-600' : platform.sentiment < 40 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {platform.sentiment}%
                        </div>
                        <div className="text-gray-500">Sentiment</div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </ResponsiveGrid>
            </MobileCard>

            {/* Trending Topics */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Hashtags
              </h3>
              
              <div className="space-y-3">
                {trendingHashtags.slice(0, 3).map(hashtag => (
                  <div key={hashtag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {hashtag.hashtag}
                        </span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{hashtag.growth}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{hashtag.mentions.toLocaleString()} mentions</span>
                        <span>{hashtag.platform}</span>
                        <span>Peak: {hashtag.peakTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hashtag.associatedTopics.slice(0, 3).map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${
                        hashtag.sentiment > 0.5 ? 'bg-green-100 text-green-700' :
                        hashtag.sentiment < -0.5 ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(hashtag.sentiment * 100).toFixed(0)}% sentiment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-responsive">
            <div className="grid gap-4">
              {socialPlatforms.map(platform => {
                const PlatformIcon = platform.icon;
                return (
                <MobileCard key={platform.id} padding="default">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <PlatformIcon className="w-10 h-10" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-responsive-base font-semibold text-gray-900">
                            {platform.name}
                          </h4>
                          <div className={`w-3 h-3 rounded-full ${
                            platform.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                          <span>{(platform.followers / 1000000).toFixed(1)}M followers</span>
                          <span>{platform.dailyPosts.toLocaleString()} daily posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${getApiStatusColor(platform.apiStatus)}`}>
                            {platform.apiStatus}
                          </span>
                          <span className="text-xs text-gray-500">
                            Updated {Math.floor((Date.now() - platform.lastUpdated.getTime()) / 60000)}m ago
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-gray-900">{platform.engagement}%</div>
                          <div className="text-gray-600">Engagement</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className={`font-bold ${
                            platform.sentiment > 60 ? 'text-green-600' :
                            platform.sentiment < 40 ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {platform.sentiment}%
                          </div>
                          <div className="text-gray-600">Sentiment</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <MobileButton variant="outline" size="small">
                          <Settings className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="primary" size="small">
                          <Eye className="w-4 h-4" />
                        </MobileButton>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Reach:</strong> {(platform.reach / 1000000).toFixed(1)}M users
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${platform.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${platform.engagement}%` }}
                      />
                    </div>
                  </div>
                </MobileCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <MobileButton
                  variant="outline"
                  size="small"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </MobileButton>
              </div>

              {showFilters && (
                <MobileCard padding="default" className="bg-gray-50">
                  <ResponsiveGrid cols={{ sm: 1, md: 4 }} gap="small">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Platforms</option>
                        {socialPlatforms.map(platform => (
                          <option key={platform.id} value={platform.name}>{platform.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Language</label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Languages</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Timeframe</label>
                      <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last Week</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Media Type</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-sm">
                        <option value="all">All Types</option>
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {mockSocialPosts.map(post => {
                const MediaIcon = getMediaIcon(post.mediaType);
                const platformData = socialPlatforms.find(p => p.name === post.platform);
                const PostPlatformIcon = platformData?.icon || MessageCircle;

                return (
                  <MobileCard key={post.id} padding="default">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <PostPlatformIcon className="w-5 h-5" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-responsive-sm font-semibold text-gray-900">
                              {post.author}
                            </span>
                            {post.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{post.platform}</span>
                            <span>•</span>
                            <span>{(post.authorFollowers / 1000).toLocaleString()}K followers</span>
                            <span>•</span>
                            <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MediaIcon className="w-4 h-4 text-gray-400" />
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(post.sentiment)}`}>
                          {post.sentiment}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-responsive-sm text-gray-800 mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{post.engagement.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-3 h-3" />
                        <span>{post.engagement.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.engagement.comments.toLocaleString()}</span>
                      </div>
                      {post.engagement.views && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.engagement.views.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Topics and Categories */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.topics.slice(0, 3).map(topic => (
                        <span key={topic} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.map(hashtag => (
                          <span key={hashtag} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Influence: {post.influence}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Viral: {post.viralPotential}%</span>
                        </div>
                        {post.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <MobileButton variant="ghost" size="small">
                          <Bookmark className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="ghost" size="small">
                          <ExternalLink className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="ghost" size="small">
                          <Download className="w-4 h-4" />
                        </MobileButton>
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Hashtags Tab */}
        {activeTab === 'hashtags' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Hashtags Analysis
              </h3>
              
              <div className="space-y-4">
                {trendingHashtags.map(hashtag => (
                  <div key={hashtag.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-5 h-5 text-blue-600" />
                        <h4 className="text-responsive-base font-semibold text-gray-900">
                          {hashtag.hashtag}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+{hashtag.growth}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.mentions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-responsive-base font-bold ${
                          hashtag.sentiment > 0.5 ? 'text-green-600' :
                          hashtag.sentiment < -0.5 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(hashtag.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.platform}
                        </div>
                        <div className="text-xs text-gray-600">Platform</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {hashtag.peakTime}
                        </div>
                        <div className="text-xs text-gray-600">Peak Time</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Associated Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {hashtag.associatedTopics.map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                AI-Generated Social Media Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Cross-Platform Trends
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Budget-related discussions are trending across all platforms with 85% positive sentiment. 
                    Facebook and Instagram showing highest engagement rates, while Twitter drives policy discussions.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Audience Demographics
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Youth engagement (18-35) increased by 45% this week, primarily on Instagram and TikTok. 
                    Education and employment topics resonate most with this demographic.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Optimal Posting Times
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Peak engagement occurs between 7-9 PM across Tamil content, while English content 
                    performs best during 11 AM-2 PM and 6-8 PM slots.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Emerging Issues
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Infrastructure delays generating negative sentiment on Twitter. Recommend proactive 
                    communication strategy with timeline updates and transparency measures.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Content Recommendations
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Video content showing 3x higher engagement than text posts. Consider increasing visual 
                    content, especially infographics explaining policy benefits and project progress.
                  </p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}
      </div>
    </div>
  );
}