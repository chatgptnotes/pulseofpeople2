import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  TrendingUp,
  Activity,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Clock,
  Globe,
  Target,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Star,
  Share2,
  Download,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Bell,
  BookOpen,
  MapPin,
  Users,
  MessageSquare,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';

interface NewsSource {
  id: string;
  name: string;
  logo: string;
  credibilityScore: number;
  bias: 'left' | 'center' | 'right' | 'neutral';
  region: string;
  language: string;
  active: boolean;
  articlesCount: number;
  reachEstimate: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  credibilityScore: number;
  engagement: number;
  topics: string[];
  mentions: string[];
  region: string;
  language: string;
  url: string;
  isBreaking: boolean;
  priority: 'high' | 'medium' | 'low';
  verified: boolean;
}

interface TrendingTopic {
  id: string;
  topic: string;
  mentions: number;
  sentiment: number;
  growth: number;
  relatedKeywords: string[];
  timeframe: '1h' | '6h' | '24h' | '7d';
}

const newsSources: NewsSource[] = [
  {
    id: 'manorama',
    name: 'Malayala Manorama',
    logo: '📰',
    credibilityScore: 92,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1247,
    reachEstimate: 2800000
  },
  {
    id: 'mathrubhumi',
    name: 'Mathrubhumi',
    logo: '📖',
    credibilityScore: 89,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1156,
    reachEstimate: 2200000
  },
  {
    id: 'hindu',
    name: 'The Hindu',
    logo: '🗞️',
    credibilityScore: 94,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 892,
    reachEstimate: 1800000
  },
  {
    id: 'times',
    name: 'Times of India',
    logo: '⏰',
    credibilityScore: 78,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 2341,
    reachEstimate: 4200000
  },
  {
    id: 'indian-express',
    name: 'Indian Express',
    logo: '🚂',
    credibilityScore: 87,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 756,
    reachEstimate: 1600000
  },
  {
    id: 'asianet',
    name: 'Asianet News',
    logo: '📺',
    credibilityScore: 82,
    bias: 'center',
    region: 'Tamil Nadu',
    language: 'Tamil',
    active: true,
    articlesCount: 1689,
    reachEstimate: 1900000
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    logo: '📹',
    credibilityScore: 85,
    bias: 'center',
    region: 'National',
    language: 'English',
    active: true,
    articlesCount: 1123,
    reachEstimate: 2100000
  },
  {
    id: 'aaj-tak',
    name: 'Aaj Tak',
    logo: '🎯',
    credibilityScore: 75,
    bias: 'center',
    region: 'National',
    language: 'Hindi',
    active: true,
    articlesCount: 1834,
    reachEstimate: 3200000
  }
];

const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Tamil Nadu Budget 2026: Focus on Education and Healthcare Infrastructure',
    summary: 'State government announces major allocation for educational reforms and healthcare modernization across all districts.',
    source: 'Malayala Manorama',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    sentiment: 'positive',
    sentimentScore: 0.72,
    credibilityScore: 92,
    engagement: 1245,
    topics: ['Budget', 'Education', 'Healthcare', 'Infrastructure'],
    mentions: ['Chief Minister', 'Finance Minister', 'Education Department'],
    region: 'Tamil Nadu',
    language: 'Tamil',
    url: '#',
    isBreaking: true,
    priority: 'high',
    verified: true
  },
  {
    id: '2',
    title: 'Public Opinion Poll Shows Shift in Voter Preferences',
    summary: 'Latest survey reveals changing political landscape with emerging issues taking center stage.',
    source: 'The Hindu',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    sentiment: 'neutral',
    sentimentScore: 0.05,
    credibilityScore: 94,
    engagement: 892,
    topics: ['Election', 'Polling', 'Politics', 'Survey'],
    mentions: ['Opposition Leader', 'Political Parties', 'Voters'],
    region: 'Tamil Nadu',
    language: 'English',
    url: '#',
    isBreaking: false,
    priority: 'high',
    verified: true
  },
  {
    id: '3',
    title: 'Infrastructure Development Projects Face Delays',
    summary: 'Several key infrastructure projects across the state experiencing timeline extensions due to various challenges.',
    source: 'Mathrubhumi',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    sentiment: 'negative',
    sentimentScore: -0.58,
    credibilityScore: 89,
    engagement: 654,
    topics: ['Infrastructure', 'Development', 'Government', 'Projects'],
    mentions: ['PWD', 'Contractors', 'Local Bodies'],
    region: 'Tamil Nadu',
    language: 'Tamil',
    url: '#',
    isBreaking: false,
    priority: 'medium',
    verified: true
  }
];

const trendingTopics: TrendingTopic[] = [
  {
    id: '1',
    topic: 'Budget Allocation',
    mentions: 1247,
    sentiment: 0.68,
    growth: 145,
    relatedKeywords: ['education', 'healthcare', 'infrastructure', 'funding'],
    timeframe: '24h'
  },
  {
    id: '2',
    topic: 'Election Reforms',
    mentions: 892,
    sentiment: 0.34,
    growth: 78,
    relatedKeywords: ['voting', 'transparency', 'digital', 'process'],
    timeframe: '24h'
  },
  {
    id: '3',
    topic: 'Employment Schemes',
    mentions: 756,
    sentiment: 0.52,
    growth: 92,
    relatedKeywords: ['jobs', 'youth', 'skill development', 'training'],
    timeframe: '24h'
  }
];

export default function PressMediaMonitoring() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>(mockArticles);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalArticles: 12456,
    positivesentiment: 62,
    negativeSentiment: 23,
    neutralSentiment: 15,
    breakingNews: 5,
    verifiedSources: 28,
    avgCredibility: 87,
    totalReach: 18500000
  });

  useEffect(() => {
    // Filter articles based on search and filters
    let filtered = mockArticles;
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(article => article.region === selectedRegion);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(article => article.language === selectedLanguage);
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedRegion, selectedLanguage]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'left': return 'text-blue-600 bg-blue-100';
      case 'right': return 'text-red-600 bg-red-100';
      case 'center': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'sources', label: 'Sources', icon: BookOpen },
    { key: 'articles', label: 'Articles', icon: Newspaper },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                Press & Media Monitoring
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Real-time news analysis and sentiment tracking
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
                <Newspaper className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.totalArticles.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Articles Today</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.positivesentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Positive Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.verifiedSources}
                </div>
                <div className="text-responsive-sm text-gray-600">Verified Sources</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalReach / 1000000).toFixed(1)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Total Reach</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Breaking News Alert */}
            {mockArticles.some(article => article.isBreaking) && (
              <MobileCard padding="default" className="border-red-200 bg-red-50">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-red-600 animate-pulse" />
                  <div className="flex-1">
                    <h3 className="text-responsive-base font-semibold text-red-900">
                      Breaking News Alert
                    </h3>
                    <p className="text-responsive-sm text-red-700">
                      {mockArticles.find(article => article.isBreaking)?.title}
                    </p>
                  </div>
                  <MobileButton variant="outline" size="small">
                    <ExternalLink className="w-4 h-4" />
                  </MobileButton>
                </div>
              </MobileCard>
            )}

            {/* Sentiment Distribution */}
            <MobileCard padding="default">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Sentiment Distribution
                </h3>
                <div className="flex space-x-2">
                  <span className="text-responsive-xs text-gray-500">Last 24h</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.positivesentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.positivesentiment}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.neutralSentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.neutralSentiment}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-responsive-sm text-gray-700">Negative</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.negativeSentiment}%` }}
                      />
                    </div>
                    <span className="text-responsive-sm font-medium text-gray-900 w-12">
                      {analytics.negativeSentiment}%
                    </span>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Top Trending Topics */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.slice(0, 3).map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {topic.topic}
                        </span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">+{topic.growth}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          {topic.mentions} mentions
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          topic.sentiment > 0.3 ? 'bg-green-100 text-green-700' :
                          topic.sentiment < -0.3 ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {topic.sentiment > 0 ? '+' : ''}{(topic.sentiment * 100).toFixed(0)}% sentiment
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-responsive">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-responsive-lg font-semibold text-gray-900">
                News Sources
              </h3>
              <MobileButton variant="outline" size="small">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </MobileButton>
            </div>

            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
              {newsSources.map(source => (
                <MobileCard key={source.id} padding="default" className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{source.logo}</div>
                      <div>
                        <h4 className="text-responsive-sm font-semibold text-gray-900">
                          {source.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${getBiasColor(source.bias)}`}>
                            {source.bias}
                          </span>
                          <span className="text-xs text-gray-500">{source.language}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Credibility</span>
                      <span className="font-medium text-gray-900">{source.credibilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${source.credibilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{source.articlesCount}</div>
                      <div className="text-gray-600">Articles</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{(source.reachEstimate / 1000000).toFixed(1)}M</div>
                      <div className="text-gray-600">Reach</div>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </ResponsiveGrid>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
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
                  <ResponsiveGrid cols={{ sm: 1, md: 3 }} gap="small">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Region</label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Regions</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="National">National</option>
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
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
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
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {filteredArticles.map(article => (
                <MobileCard key={article.id} padding="default" className="relative">
                  <div className="flex items-start space-x-3">
                    {article.isBreaking && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          BREAKING
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">{article.source}</span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(article.timestamp).toLocaleTimeString()}
                        </span>
                        {article.verified && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      
                      <h4 className="text-responsive-sm font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h4>
                      
                      <p className="text-responsive-xs text-gray-700 mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(article.sentiment)}`}>
                          {article.sentiment} ({(article.sentimentScore * 100).toFixed(0)}%)
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(article.priority)}`}>
                          {article.priority} priority
                        </span>
                        {article.topics.slice(0, 2).map(topic => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.engagement}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{article.credibilityScore}%</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <MobileButton variant="ghost" size="small">
                            <Bookmark className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <Share2 className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <ExternalLink className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Trending Topics Analysis
              </h3>
              
              <div className="space-y-4">
                {trendingTopics.map(topic => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-responsive-base font-semibold text-gray-900">
                        {topic.topic}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">+{topic.growth}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-responsive-base font-bold text-gray-900">
                          {topic.mentions}
                        </div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-responsive-base font-bold ${
                          topic.sentiment > 0.3 ? 'text-green-600' :
                          topic.sentiment < -0.3 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(topic.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {topic.relatedKeywords.map(keyword => (
                        <span key={keyword} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {keyword}
                        </span>
                      ))}
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
                  Source Performance
                </h3>
                <div className="space-y-3">
                  {newsSources.slice(0, 5).map(source => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{source.logo}</span>
                        <span className="text-xs text-gray-700">{source.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${source.credibilityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 w-8">
                          {source.credibilityScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </MobileCard>

              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Language Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Tamil</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">English</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Hindi</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">20%</span>
                    </div>
                  </div>
                </div>
              </MobileCard>
            </ResponsiveGrid>
          </div>
        )}
      </div>
    </div>
  );
}