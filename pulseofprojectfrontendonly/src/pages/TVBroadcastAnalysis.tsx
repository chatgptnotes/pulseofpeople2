import React, { useState, useEffect } from 'react';
import {
  Tv,
  Radio,
  Video,
  Mic,
  Users,
  TrendingUp,
  Clock,
  Globe,
  Target,
  BarChart3,
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Search,
  Filter,
  Star,
  Eye,
  MessageSquare,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Zap,
  Award,
  Timer,
  Languages,
  Headphones,
  MonitorPlay,
  Rss,
  Podcast
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';

interface TVChannel {
  id: string;
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  language: string;
  type: 'news' | 'entertainment' | 'regional' | 'national';
  viewership: number;
  credibilityScore: number;
  isLive: boolean;
  currentShow: string;
  bias: 'left' | 'center' | 'right' | 'neutral';
  region: string;
  primeTimeStart: string;
  primeTimeEnd: string;
}

interface BroadcastSegment {
  id: string;
  channel: string;
  showName: string;
  segment: string;
  timestamp: Date;
  duration: number;
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  mentions: string[];
  keywords: string[];
  viewerEngagement: number;
  transcription: string;
  clipUrl: string;
  isLive: boolean;
  priority: 'high' | 'medium' | 'low';
  anchor: string;
}

interface ShowAnalytics {
  id: string;
  showName: string;
  channel: string;
  timeSlot: string;
  averageViewership: number;
  sentimentTrend: number[];
  topicsDiscussed: string[];
  guestInfluence: number;
  politicalCoverage: number;
  biasScore: number;
  credibilityRating: number;
}

const tvChannels: TVChannel[] = [
  {
    id: 'sun-news',
    name: 'Sun News',
    logo: Tv,
    language: 'Tamil',
    type: 'news',
    viewership: 3200000,
    credibilityScore: 85,
    isLive: true,
    currentShow: 'News @ 9',
    bias: 'center',
    region: 'Tamil Nadu',
    primeTimeStart: '19:00',
    primeTimeEnd: '23:00'
  },
  {
    id: 'puthiya-thalaimurai',
    name: 'Puthiya Thalaimurai',
    logo: Rss,
    language: 'Tamil',
    type: 'news',
    viewership: 2800000,
    credibilityScore: 88,
    isLive: true,
    currentShow: 'Prime Time',
    bias: 'center',
    region: 'Tamil Nadu',
    primeTimeStart: '18:30',
    primeTimeEnd: '22:30'
  },
  {
    id: 'thanthi-tv',
    name: 'Thanthi TV',
    logo: Radio,
    language: 'Tamil',
    type: 'news',
    viewership: 2600000,
    credibilityScore: 86,
    isLive: true,
    currentShow: 'Evening Bulletin',
    bias: 'center',
    region: 'Tamil Nadu',
    primeTimeStart: '19:00',
    primeTimeEnd: '22:00'
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    logo: Video,
    language: 'English',
    type: 'news',
    viewership: 4500000,
    credibilityScore: 89,
    isLive: true,
    currentShow: 'The 9 O\'Clock News',
    bias: 'center',
    region: 'National',
    primeTimeStart: '19:00',
    primeTimeEnd: '23:00'
  },
  {
    id: 'aaj-tak',
    name: 'Aaj Tak',
    logo: Target,
    language: 'Hindi',
    type: 'news',
    viewership: 5200000,
    credibilityScore: 78,
    isLive: true,
    currentShow: 'Halla Bol',
    bias: 'center',
    region: 'National',
    primeTimeStart: '18:00',
    primeTimeEnd: '22:00'
  },
  {
    id: 'republic-tv',
    name: 'Republic TV',
    logo: Podcast,
    language: 'English',
    type: 'news',
    viewership: 3800000,
    credibilityScore: 72,
    isLive: true,
    currentShow: 'The Debate',
    bias: 'right',
    region: 'National',
    primeTimeStart: '21:00',
    primeTimeEnd: '23:00'
  },
  {
    id: 'news7-tamil',
    name: 'News7 Tamil',
    logo: MonitorPlay,
    language: 'Tamil',
    type: 'news',
    viewership: 2100000,
    credibilityScore: 81,
    isLive: true,
    currentShow: 'Tamil Nadu Roundup',
    bias: 'center',
    region: 'Tamil Nadu',
    primeTimeStart: '20:00',
    primeTimeEnd: '22:00'
  },
  {
    id: 'polimer-news',
    name: 'Polimer News',
    logo: Headphones,
    language: 'Tamil',
    type: 'news',
    viewership: 1900000,
    credibilityScore: 83,
    isLive: true,
    currentShow: 'State Focus',
    bias: 'center',
    region: 'Tamil Nadu',
    primeTimeStart: '19:30',
    primeTimeEnd: '21:30'
  }
];

const mockBroadcastSegments: BroadcastSegment[] = [
  {
    id: '1',
    channel: 'Manorama News',
    showName: 'Prime Time',
    segment: 'Budget Analysis',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    duration: 420, // 7 minutes
    topic: 'Tamil Nadu Budget 2026',
    sentiment: 'positive',
    sentimentScore: 0.68,
    mentions: ['Chief Minister', 'Finance Minister', 'Opposition'],
    keywords: ['budget', 'allocation', 'education', 'healthcare'],
    viewerEngagement: 89,
    transcription: 'The new budget shows a clear focus on education and healthcare with increased allocations...',
    clipUrl: '#',
    isLive: false,
    priority: 'high',
    anchor: 'Ajith Prabhakar'
  },
  {
    id: '2',
    channel: 'Asianet News',
    showName: 'News @ 9',
    segment: 'Political Roundtable',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    duration: 900, // 15 minutes
    topic: 'Election Preparations',
    sentiment: 'neutral',
    sentimentScore: 0.12,
    mentions: ['Political Parties', 'Election Commission', 'Voters'],
    keywords: ['election', 'preparation', 'campaign', 'polling'],
    viewerEngagement: 76,
    transcription: 'Various political parties are gearing up for the upcoming elections with strategic planning...',
    clipUrl: '#',
    isLive: false,
    priority: 'high',
    anchor: 'Sindhu Sooryakumar'
  },
  {
    id: '3',
    channel: 'NDTV',
    showName: 'The 9 O\'Clock News',
    segment: 'South India Focus',
    timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
    duration: 600, // 10 minutes
    topic: 'Regional Development',
    sentiment: 'positive',
    sentimentScore: 0.54,
    mentions: ['State Governments', 'Development Projects', 'Infrastructure'],
    keywords: ['development', 'infrastructure', 'growth', 'investment'],
    viewerEngagement: 82,
    transcription: 'South Indian states are leading in various development metrics with innovative approaches...',
    clipUrl: '#',
    isLive: false,
    priority: 'medium',
    anchor: 'Prannoy Roy'
  }
];

export default function TVBroadcastAnalysis() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalChannels: 8,
    liveChannels: 6,
    totalViewers: 25800000,
    avgSentiment: 72,
    breakingNews: 3,
    primeTimeActive: 5,
    transcriptionAccuracy: 94,
    realTimeProcessing: 847
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isInPrimeTime = (channel: TVChannel) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const primeStart = parseInt(channel.primeTimeStart.split(':')[0]) * 60 + parseInt(channel.primeTimeStart.split(':')[1]);
    const primeEnd = parseInt(channel.primeTimeEnd.split(':')[0]) * 60 + parseInt(channel.primeTimeEnd.split(':')[1]);
    
    return currentTime >= primeStart && currentTime <= primeEnd;
  };

  const tabs = [
    { key: 'live', label: 'Live TV', icon: Video },
    { key: 'channels', label: 'Channels', icon: Tv },
    { key: 'segments', label: 'Segments', icon: MonitorPlay },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'insights', label: 'Insights', icon: Activity }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-600 to-purple-600 rounded-full">
              <Tv className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                TV & Broadcast Analysis
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Real-time television sentiment tracking & analysis
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
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

        {/* Live TV Tab */}
        {activeTab === 'live' && (
          <div className="space-responsive">
            {/* Key Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center">
                <Video className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.liveChannels}
                </div>
                <div className="text-responsive-sm text-gray-600">Live Channels</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {(analytics.totalViewers / 1000000).toFixed(1)}M
                </div>
                <div className="text-responsive-sm text-gray-600">Total Viewers</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.avgSentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Avg Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Mic className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.transcriptionAccuracy}%
                </div>
                <div className="text-responsive-sm text-gray-600">AI Accuracy</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Prime Time Alert */}
            <MobileCard padding="default" className="border-yellow-200 bg-yellow-50">
              <div className="flex items-center space-x-3">
                <Timer className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="text-responsive-base font-semibold text-yellow-900">
                    Prime Time Active
                  </h3>
                  <p className="text-responsive-sm text-yellow-700">
                    {analytics.primeTimeActive} channels currently in prime time slots with increased viewership
                  </p>
                </div>
                <div className="text-responsive-lg font-bold text-yellow-900">
                  {analytics.primeTimeActive}/8
                </div>
              </div>
            </MobileCard>

            {/* Live Channels Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Live Channels
                </h3>
                <MobileButton variant="outline" size="small">
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </MobileButton>
              </div>

              <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
                {tvChannels.filter(channel => channel.isLive).map(channel => {
                  const ChannelLogo = channel.logo;
                  return (
                  <MobileCard key={channel.id} padding="default" className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <ChannelLogo className="w-8 h-8" />
                        <div>
                          <h4 className="text-responsive-sm font-semibold text-gray-900">
                            {channel.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{channel.language}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getBiasColor(channel.bias)}`}>
                              {channel.bias}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-600 font-medium">LIVE</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Now Playing:</div>
                      <div className="text-responsive-sm font-medium text-gray-900">
                        {channel.currentShow}
                      </div>
                      {isInPrimeTime(channel) && (
                        <div className="inline-flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">Prime Time</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">
                          {(channel.viewership / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-gray-600">Viewers</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-900">{channel.credibilityScore}%</div>
                        <div className="text-gray-600">Credibility</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <MobileButton variant="ghost" size="small">
                          <Volume2 className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="ghost" size="small">
                          <Headphones className="w-4 h-4" />
                        </MobileButton>
                      </div>
                      
                      <MobileButton variant="primary" size="small">
                        <Play className="w-4 h-4 mr-1" />
                        Watch
                      </MobileButton>
                    </div>
                  </MobileCard>
                  );
                })}
              </ResponsiveGrid>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-responsive">
            <div className="space-y-4">
              {tvChannels.map(channel => {
                const ChannelLogo = channel.logo;
                return (
                <MobileCard key={channel.id} padding="default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ChannelLogo className="w-12 h-12" />
                      <div>
                        <h4 className="text-responsive-base font-semibold text-gray-900">
                          {channel.name}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-600">{channel.language}</span>
                          <span className="text-xs text-gray-600">{channel.region}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getBiasColor(channel.bias)}`}>
                            {channel.bias}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Prime Time: {channel.primeTimeStart} - {channel.primeTimeEnd}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${channel.isLive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-xs font-medium ${channel.isLive ? 'text-green-600' : 'text-gray-500'}`}>
                          {channel.isLive ? 'LIVE' : 'OFFLINE'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-1 bg-gray-50 rounded">
                          <div className="font-medium">{(channel.viewership / 1000000).toFixed(1)}M</div>
                          <div className="text-gray-600">Viewers</div>
                        </div>
                        <div className="text-center p-1 bg-gray-50 rounded">
                          <div className="font-medium">{channel.credibilityScore}%</div>
                          <div className="text-gray-600">Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {channel.isLive && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-600">Now: </span>
                          <span className="text-responsive-sm font-medium text-gray-900">
                            {channel.currentShow}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <MobileButton variant="ghost" size="small">
                            <Eye className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="outline" size="small">
                            <Settings className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                  )}
                </MobileCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Segments Tab */}
        {activeTab === 'segments' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search segments..."
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
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Channel</label>
                      <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Channels</option>
                        {tvChannels.map(channel => (
                          <option key={channel.id} value={channel.name}>{channel.name}</option>
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

            {/* Segments List */}
            <div className="space-y-4">
              {mockBroadcastSegments.map(segment => (
                <MobileCard key={segment.id} padding="default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-900">{segment.channel}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">{segment.showName}</span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(segment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <h4 className="text-responsive-sm font-semibold text-gray-900 mb-1">
                        {segment.segment}
                      </h4>
                      
                      <p className="text-responsive-xs text-gray-700 mb-2">
                        Topic: {segment.topic}
                      </p>
                      
                      <p className="text-responsive-xs text-gray-600 line-clamp-2 mb-3">
                        {segment.transcription}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(segment.sentiment)}`}>
                        {segment.sentiment}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(segment.priority)}`}>
                        {segment.priority}
                      </span>
                      {segment.isLive && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    {segment.mentions.map(mention => (
                      <span key={mention} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {mention}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>{Math.floor(segment.duration / 60)}m {segment.duration % 60}s</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>{segment.viewerEngagement}% engagement</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mic className="w-3 h-3" />
                        <span>{segment.anchor}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <MobileButton variant="ghost" size="small">
                        <Play className="w-4 h-4" />
                      </MobileButton>
                      <MobileButton variant="ghost" size="small">
                        <Download className="w-4 h-4" />
                      </MobileButton>
                      <MobileButton variant="ghost" size="small">
                        <Share2 className="w-4 h-4" />
                      </MobileButton>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-responsive">
            <ResponsiveGrid cols={{ sm: 1, md: 2 }}>
              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Channel Performance
                </h3>
                <div className="space-y-3">
                  {tvChannels.slice(0, 5).map(channel => {
                    const ChannelLogo = channel.logo;
                    return (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChannelLogo className="w-5 h-5" />
                        <span className="text-xs text-gray-700">{channel.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${channel.credibilityScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 w-8">
                          {channel.credibilityScore}%
                        </span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </MobileCard>

              <MobileCard padding="default">
                <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                  Language Coverage
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Tamil</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">English</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900">30%</span>
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

            {/* Sentiment Trends */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Sentiment Trends Over Time
              </h3>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-xs">Sentiment trend chart would be displayed here</span>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                AI-Generated Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Top Performing Content
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Budget analysis segments are generating 40% higher engagement than average, 
                    with positive sentiment across Tamil and English channels.
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
                    Infrastructure development topics showing 65% increase in coverage during prime time slots, 
                    indicating growing public interest.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Coverage Gaps
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Rural development issues receiving limited coverage compared to urban topics, 
                    suggesting potential blind spots in current reporting.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Audience Preferences
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Viewers show 30% higher engagement with detailed analysis segments compared to 
                    breaking news alerts, indicating preference for in-depth coverage.
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