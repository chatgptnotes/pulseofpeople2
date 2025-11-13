import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Target,
  BarChart3,
  Activity,
  Crown,
  Zap,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Play,
  Pause,
  Settings,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Bookmark,
  Mic,
  Camera,
  Video,
  Link,
  Hash,
  ThumbsUp,
  MessageSquare,
  RefreshCw,
  Bell,
  Shield,
  Verified,
  Flame,
  Trending,
  Network
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platforms: string[];
  totalFollowers: number;
  engagementRate: number;
  influenceScore: number;
  sentiment: number;
  category: 'political' | 'celebrity' | 'journalist' | 'activist' | 'business' | 'academic' | 'religious' | 'local';
  verified: boolean;
  location: string;
  language: string[];
  reachEstimate: number;
  postsPerWeek: number;
  avgShares: number;
  topTopics: string[];
  politicalLean: 'left' | 'center' | 'right' | 'neutral' | 'unknown';
  credibilityScore: number;
  isActive: boolean;
  lastActive: Date;
  viralPosts: number;
  mentions: number;
  collaboration: 'high' | 'medium' | 'low' | 'none';
  riskLevel: 'high' | 'medium' | 'low';
}

interface InfluencerPost {
  id: string;
  influencerId: string;
  influencerName: string;
  platform: string;
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  reach: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  topics: string[];
  mentions: string[];
  hashtags: string[];
  mediaType: 'text' | 'image' | 'video' | 'live';
  isViral: boolean;
  influence: number;
  politicalContent: boolean;
  factChecked: boolean;
  misinformation: boolean;
}

interface TrendingInfluencer {
  id: string;
  name: string;
  growthRate: number;
  reasonForTrending: string;
  timeframe: '24h' | '7d' | '30d';
  newFollowers: number;
  viralContent: string;
  impactScore: number;
}

const influencers: Influencer[] = [
  {
    id: '1',
    name: 'M.K. Stalin',
    handle: '@mkstalin',
    avatar: '👤',
    platforms: ['Twitter/X', 'Facebook', 'Instagram'],
    totalFollowers: 2800000,
    engagementRate: 8.5,
    influenceScore: 95,
    sentiment: 68,
    category: 'political',
    verified: true,
    location: 'Tamil Nadu, India',
    language: ['Tamil', 'English'],
    reachEstimate: 5600000,
    postsPerWeek: 12,
    avgShares: 15600,
    topTopics: ['Government Policy', 'Development', 'Social Welfare'],
    politicalLean: 'left',
    credibilityScore: 89,
    isActive: true,
    lastActive: new Date(Date.now() - 1800000), // 30 minutes ago
    viralPosts: 23,
    mentions: 89000,
    collaboration: 'high',
    riskLevel: 'low'
  },
  {
    id: '2',
    name: 'Thalapathy Vijay',
    handle: '@actorvijay',
    avatar: '👤',
    platforms: ['Twitter/X', 'Facebook'],
    totalFollowers: 1200000,
    engagementRate: 6.8,
    influenceScore: 78,
    sentiment: 45,
    category: 'political',
    verified: true,
    location: 'Tamil Nadu, India',
    language: ['Tamil', 'English'],
    reachEstimate: 2400000,
    postsPerWeek: 18,
    avgShares: 8900,
    topTopics: ['Opposition Politics', 'Public Issues', 'Government Criticism'],
    politicalLean: 'center',
    credibilityScore: 76,
    isActive: true,
    lastActive: new Date(Date.now() - 3600000), // 1 hour ago
    viralPosts: 15,
    mentions: 45000,
    collaboration: 'medium',
    riskLevel: 'low'
  },
  {
    id: '3',
    name: 'Rajinikanth',
    handle: '@rajinikanth',
    avatar: '👤',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    totalFollowers: 6800000,
    engagementRate: 12.4,
    influenceScore: 82,
    sentiment: 78,
    category: 'celebrity',
    verified: true,
    location: 'Tamil Nadu, India',
    language: ['Tamil', 'English', 'Hindi'],
    reachEstimate: 8900000,
    postsPerWeek: 8,
    avgShares: 45000,
    topTopics: ['Entertainment', 'Youth Culture', 'Social Issues'],
    politicalLean: 'neutral',
    credibilityScore: 72,
    isActive: true,
    lastActive: new Date(Date.now() - 7200000), // 2 hours ago
    viralPosts: 67,
    mentions: 125000,
    collaboration: 'high',
    riskLevel: 'low'
  },
  {
    id: '4',
    name: 'Rangaraj Pandey',
    handle: '@rangarajpandey',
    avatar: '👤',
    platforms: ['Twitter/X', 'YouTube'],
    totalFollowers: 890000,
    engagementRate: 9.2,
    influenceScore: 71,
    sentiment: 62,
    category: 'journalist',
    verified: true,
    location: 'Tamil Nadu, India',
    language: ['Tamil', 'English'],
    reachEstimate: 1800000,
    postsPerWeek: 15,
    avgShares: 12000,
    topTopics: ['Media', 'Politics', 'Social Commentary'],
    politicalLean: 'center',
    credibilityScore: 88,
    isActive: true,
    lastActive: new Date(Date.now() - 900000), // 15 minutes ago
    viralPosts: 28,
    mentions: 67000,
    collaboration: 'medium',
    riskLevel: 'low'
  },
  {
    id: '5',
    name: 'Suriya Sivakumar',
    handle: '@actorsuriya',
    avatar: '👤',
    platforms: ['Twitter/X', 'Facebook'],
    totalFollowers: 450000,
    engagementRate: 11.8,
    influenceScore: 69,
    sentiment: 58,
    category: 'activist',
    verified: true,
    location: 'India',
    language: ['English', 'Hindi', 'Tamil'],
    reachEstimate: 1200000,
    postsPerWeek: 22,
    avgShares: 8500,
    topTopics: ['Social Justice', 'Environment', 'Human Rights'],
    politicalLean: 'left',
    credibilityScore: 91,
    isActive: true,
    lastActive: new Date(Date.now() - 5400000), // 90 minutes ago
    viralPosts: 19,
    mentions: 34000,
    collaboration: 'medium',
    riskLevel: 'low'
  },
  {
    id: '6',
    name: 'Kamal Haasan',
    handle: '@ikamalhaasan',
    avatar: '👤',
    platforms: ['Twitter/X', 'Instagram', 'LinkedIn'],
    totalFollowers: 3200000,
    engagementRate: 7.4,
    influenceScore: 85,
    sentiment: 71,
    category: 'political',
    verified: true,
    location: 'India',
    language: ['English', 'Hindi'],
    reachEstimate: 4800000,
    postsPerWeek: 20,
    avgShares: 18000,
    topTopics: ['Governance', 'Women Empowerment', 'Education'],
    politicalLean: 'center',
    credibilityScore: 86,
    isActive: true,
    lastActive: new Date(Date.now() - 1200000), // 20 minutes ago
    viralPosts: 34,
    mentions: 78000,
    collaboration: 'high',
    riskLevel: 'low'
  }
];

const mockInfluencerPosts: InfluencerPost[] = [
  {
    id: '1',
    influencerId: '1',
    influencerName: 'M.K. Stalin',
    platform: 'Twitter/X',
    content: 'Tamil Nadu Budget 2026 prioritizes sustainable development while ensuring social justice. Our commitment to education and healthcare remains unwavering. Together, we build a better tomorrow. #Tamil NaduBudget2026 #Development',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    engagement: {
      likes: 28000,
      shares: 12500,
      comments: 3400,
      views: 450000
    },
    reach: 1200000,
    sentiment: 'positive',
    sentimentScore: 0.78,
    topics: ['Budget', 'Development', 'Education', 'Healthcare'],
    mentions: ['Tamil Nadu Government', 'Citizens'],
    hashtags: ['#Tamil NaduBudget2026', '#Development'],
    mediaType: 'text',
    isViral: true,
    influence: 92,
    politicalContent: true,
    factChecked: true,
    misinformation: false
  },
  {
    id: '2',
    influencerId: '3',
    influencerName: 'Rajinikanth',
    platform: 'Instagram',
    content: 'Young voices matter in shaping our future! Excited to see more youth engagement in important discussions about our state\'s progress. Every opinion counts! ✨ #YouthVoice #Tamil Nadu',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    engagement: {
      likes: 89000,
      shares: 15600,
      comments: 7800,
      views: 1200000
    },
    reach: 2800000,
    sentiment: 'positive',
    sentimentScore: 0.85,
    topics: ['Youth', 'Engagement', 'Future', 'Progress'],
    mentions: ['Young People', 'Tamil Nadu'],
    hashtags: ['#YouthVoice', '#Tamil Nadu'],
    mediaType: 'video',
    isViral: true,
    influence: 88,
    politicalContent: false,
    factChecked: false,
    misinformation: false
  }
];

const trendingInfluencers: TrendingInfluencer[] = [
  {
    id: '1',
    name: 'Rajinikanth',
    growthRate: 15.8,
    reasonForTrending: 'Youth engagement advocacy posts',
    timeframe: '24h',
    newFollowers: 45000,
    viralContent: 'Youth empowerment video',
    impactScore: 85
  },
  {
    id: '2',
    name: 'Rangaraj Pandey',
    growthRate: 12.3,
    reasonForTrending: 'Investigative journalism series',
    timeframe: '7d',
    newFollowers: 28000,
    viralContent: 'Government transparency analysis',
    impactScore: 78
  }
];

export default function InfluencerTracking() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedInfluenceRange, setSelectedInfluenceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('influence');

  const [analytics, setAnalytics] = useState({
    totalInfluencers: 1247,
    activeInfluencers: 892,
    totalReach: 45600000,
    avgInfluence: 76,
    viralPosts: 156,
    politicalInfluencers: 234,
    newTrending: 12,
    riskAlerts: 3
  });

  useEffect(() => {
    // Update analytics based on influencer data
    const totalReach = influencers.reduce((sum, influencer) => sum + influencer.reachEstimate, 0);
    const avgInfluence = Math.round(influencers.reduce((sum, influencer) => sum + influencer.influenceScore, 0) / influencers.length);
    const totalViralPosts = influencers.reduce((sum, influencer) => sum + influencer.viralPosts, 0);
    const politicalCount = influencers.filter(influencer => influencer.category === 'political').length;
    
    setAnalytics(prev => ({
      ...prev,
      totalInfluencers: influencers.length,
      activeInfluencers: influencers.filter(i => i.isActive).length,
      totalReach: totalReach,
      avgInfluence,
      viralPosts: totalViralPosts,
      politicalInfluencers: politicalCount
    }));
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'political': return 'text-blue-600 bg-blue-100';
      case 'celebrity': return 'text-pink-600 bg-pink-100';
      case 'journalist': return 'text-green-600 bg-green-100';
      case 'activist': return 'text-orange-600 bg-orange-100';
      case 'business': return 'text-purple-600 bg-purple-100';
      case 'academic': return 'text-indigo-600 bg-indigo-100';
      case 'religious': return 'text-yellow-600 bg-yellow-100';
      case 'local': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPoliticalLeanColor = (lean: string) => {
    switch (lean) {
      case 'left': return 'text-red-600 bg-red-100';
      case 'right': return 'text-blue-600 bg-blue-100';
      case 'center': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      case 'unknown': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCollaborationColor = (collaboration: string) => {
    switch (collaboration) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'none': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInfluenceLevel = (score: number) => {
    if (score >= 90) return { label: 'Mega Influencer', color: 'text-purple-600 bg-purple-100', icon: Crown };
    if (score >= 75) return { label: 'Major Influencer', color: 'text-blue-600 bg-blue-100', icon: Star };
    if (score >= 50) return { label: 'Mid Influencer', color: 'text-green-600 bg-green-100', icon: TrendingUp };
    return { label: 'Micro Influencer', color: 'text-gray-600 bg-gray-100', icon: Users };
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'influencers', label: 'Influencers', icon: Users },
    { key: 'posts', label: 'Posts', icon: MessageCircle },
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Influencer Tracking
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Monitor key opinion leaders & their impact analysis
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-responsive-sm font-medium text-gray-700">
                {isMonitoring ? 'Live Tracking' : 'Tracking Paused'}
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
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.totalInfluencers.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Total Influencers</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalReach / 1000000).toFixed(0)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Combined Reach</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.avgInfluence}%
                </div>
                <div className="text-responsive-sm text-gray-600">Avg Influence</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Flame className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.viralPosts}
                </div>
                <div className="text-responsive-sm text-gray-600">Viral Posts</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Risk Alerts */}
            {analytics.riskAlerts > 0 && (
              <MobileCard padding="default" className="border-red-200 bg-red-50">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <h3 className="text-responsive-base font-semibold text-red-900">
                      Risk Alerts
                    </h3>
                    <p className="text-responsive-sm text-red-700">
                      {analytics.riskAlerts} influencers flagged for potential misinformation or high-risk content
                    </p>
                  </div>
                  <MobileButton variant="outline" size="small">
                    <Eye className="w-4 h-4 mr-1" />
                    Review
                  </MobileButton>
                </div>
              </MobileCard>
            )}

            {/* Top Influencers by Category */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Top Influencers by Category
                </h3>
                <MobileButton variant="outline" size="small">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </MobileButton>
              </div>

              <ResponsiveGrid cols={{ sm: 1, md: 2 }} gap="small">
                {['political', 'celebrity', 'journalist', 'activist'].map(category => {
                  const categoryInfluencers = influencers.filter(i => i.category === category);
                  const topInfluencer = categoryInfluencers.sort((a, b) => b.influenceScore - a.influenceScore)[0];
                  
                  return (
                    <div key={category} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getCategoryColor(category)}`}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">{categoryInfluencers.length} tracked</span>
                      </div>
                      
                      {topInfluencer && (
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">{topInfluencer.avatar}</div>
                          <div className="flex-1">
                            <div className="text-responsive-sm font-medium text-gray-900">
                              {topInfluencer.name}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Star className="w-3 h-3" />
                              <span>{topInfluencer.influenceScore}% influence</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-gray-900">
                              {(topInfluencer.totalFollowers / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-xs text-gray-500">followers</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ResponsiveGrid>
            </MobileCard>

            {/* Recent Trending */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Recently Trending
              </h3>
              
              <div className="space-y-3">
                {trendingInfluencers.map(influencer => (
                  <div key={influencer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {influencer.name}
                        </span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{influencer.growthRate}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {influencer.reasonForTrending}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{influencer.newFollowers.toLocaleString()} new followers</span>
                        <span>{influencer.timeframe}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-responsive-sm font-bold text-purple-600">
                        {influencer.impactScore}
                      </div>
                      <div className="text-xs text-gray-500">Impact Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Influencers Tab */}
        {activeTab === 'influencers' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search influencers..."
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
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="political">Political</option>
                        <option value="celebrity">Celebrity</option>
                        <option value="journalist">Journalist</option>
                        <option value="activist">Activist</option>
                        <option value="business">Business</option>
                        <option value="academic">Academic</option>
                        <option value="religious">Religious</option>
                        <option value="local">Local</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Platform</label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Platforms</option>
                        <option value="Twitter/X">Twitter/X</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="YouTube">YouTube</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="TikTok">TikTok</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Influence Level</label>
                      <select
                        value={selectedInfluenceRange}
                        onChange={(e) => setSelectedInfluenceRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Levels</option>
                        <option value="mega">Mega (90%+)</option>
                        <option value="major">Major (75-89%)</option>
                        <option value="mid">Mid (50-74%)</option>
                        <option value="micro">Micro (&lt;50%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="influence">Influence Score</option>
                        <option value="followers">Followers</option>
                        <option value="engagement">Engagement</option>
                        <option value="reach">Reach</option>
                        <option value="activity">Last Active</option>
                      </select>
                    </div>
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Influencers List */}
            <div className="space-y-4">
              {influencers.map(influencer => {
                const influenceLevel = getInfluenceLevel(influencer.influenceScore);
                const InfluenceIcon = influenceLevel.icon;
                
                return (
                  <MobileCard key={influencer.id} padding="default">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="text-4xl">{influencer.avatar}</div>
                          {influencer.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-responsive-base font-semibold text-gray-900">
                              {influencer.name}
                            </h4>
                            <span className="text-xs text-gray-500">{influencer.handle}</span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(influencer.category)}`}>
                              {influencer.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${influenceLevel.color}`}>
                              <InfluenceIcon className="w-3 h-3 inline mr-1" />
                              {influenceLevel.label}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getPoliticalLeanColor(influencer.politicalLean)}`}>
                              {influencer.politicalLean}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(influencer.riskLevel)}`}>
                              {influencer.riskLevel} risk
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{(influencer.totalFollowers / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>{influencer.engagementRate}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{(influencer.reachEstimate / 1000000).toFixed(1)}M reach</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{influencer.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500">Languages:</span>
                            {influencer.language.map(lang => (
                              <span key={lang} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {lang}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {influencer.topTopics.slice(0, 3).map(topic => (
                              <span key={topic} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-3">
                          <div className="text-responsive-lg font-bold text-purple-600">
                            {influencer.influenceScore}%
                          </div>
                          <div className="text-xs text-gray-500">Influence</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium text-gray-900">{influencer.viralPosts}</div>
                            <div className="text-gray-600">Viral</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium text-gray-900">{influencer.credibilityScore}%</div>
                            <div className="text-gray-600">Trust</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1 mb-2">
                          {influencer.platforms.slice(0, 3).map(platform => (
                            <span key={platform} className="text-xs px-1 py-1 bg-blue-100 text-blue-700 rounded">
                              {platform.split('/')[0]}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <MobileButton variant="ghost" size="small">
                            <Eye className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <Bookmark className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="outline" size="small">
                            <ExternalLink className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded ${getCollaborationColor(influencer.collaboration)}`}>
                            {influencer.collaboration} collaboration
                          </span>
                          <span className="text-gray-500">
                            Active {Math.floor((Date.now() - influencer.lastActive.getTime()) / 60000)}m ago
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${influencer.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={`text-xs ${influencer.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                            {influencer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
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
            <div className="space-y-4">
              {mockInfluencerPosts.map(post => (
                <MobileCard key={post.id} padding="default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-responsive-sm font-semibold text-gray-900">
                            {post.influencerName}
                          </span>
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{post.platform}</span>
                          <span>•</span>
                          <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {post.isViral && (
                        <Flame className="w-4 h-4 text-red-500" />
                      )}
                      {post.factChecked && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {post.misinformation && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-responsive-sm text-gray-800 mb-3 leading-relaxed">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
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
                  
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    {post.politicalContent && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Political
                      </span>
                    )}
                    {post.topics.slice(0, 3).map(topic => (
                      <span key={topic} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>Reach: {(post.reach / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>Influence: {post.influence}%</span>
                      </div>
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
              ))}
            </div>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Influencer Analysis
              </h3>
              
              <div className="space-y-4">
                {trendingInfluencers.map(influencer => (
                  <div key={influencer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-responsive-base font-semibold text-gray-900">
                        {influencer.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          +{influencer.growthRate}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {influencer.newFollowers.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">New Followers</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {influencer.impactScore}
                        </div>
                        <div className="text-xs text-gray-600">Impact Score</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {influencer.timeframe}
                        </div>
                        <div className="text-xs text-gray-600">Timeframe</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          #{Math.floor(Math.random() * 10) + 1}
                        </div>
                        <div className="text-xs text-gray-600">Trending Rank</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Trending Reason:</div>
                      <p className="text-responsive-sm text-gray-800">{influencer.reasonForTrending}</p>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Viral Content:</div>
                      <p className="text-responsive-sm text-blue-600">{influencer.viralContent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-responsive">
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Influence Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Mega Influencers (90%+)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Major Influencers (75-89%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Mid Influencers (50-74%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Micro Influencers (&lt;50%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: '10%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">10%</span>
                    </div>
                  </div>
                </div>
              </MobileCard>

              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Platform Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Twitter/X</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-black h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Instagram</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-pink-600 h-2 rounded-full" style={{ width: '35%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Facebook</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">YouTube</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">25%</span>
                    </div>
                  </div>
                </div>
              </MobileCard>
            </ResponsiveGrid>

            {/* AI Insights */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                AI-Generated Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Top Performing Influencers
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Political influencers showing 40% higher engagement on budget-related content. 
                    Celebrity endorsements driving 65% more youth participation in political discussions.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Emerging Trends
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Regional influencers gaining 25% more traction than national ones. 
                    Tamil content outperforming English by 30% in local engagement.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Risk Assessment
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    3 influencers flagged for potential misinformation spread. 
                    Recommendation: Increased monitoring and fact-checking protocols needed.
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