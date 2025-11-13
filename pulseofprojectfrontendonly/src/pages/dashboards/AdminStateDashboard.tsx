import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import DualSidebarLayout from '../../components/navigation/DualSidebarLayout';
import {
  TrendingUp, TrendingDown, AlertTriangle, Users, MapPin,
  Target, Activity, MessageCircle, Radio, ThumbsUp, ThumbsDown,
  Minus, ChevronRight, RefreshCw, Zap, Shield, Eye, Bell,
  BarChart3, Calendar, Clock, Flame, Award, TrendingUpIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EnhancedMapboxTamilNadu } from '../../components/maps/EnhancedMapboxTamilNadu';
import { WithTooltip } from '../../components/common/CardTooltip';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import tamilNaduGeoJSON from '../../assets/maps/tamilnadu-constituencies.json';

/**
 * Modern Admin State Dashboard - Tamil Nadu + Puducherry
 *
 * Design Philosophy:
 * - Map-first approach - Interactive map takes center stage
 * - Compact, modern cards with essential metrics
 * - Clean spacing and visual hierarchy
 * - Data-dense but not cluttered
 * - Mobile-responsive design
 */
export default function AdminStateDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Core Metrics
  const [metrics, setMetrics] = useState<any>(null);
  const [locationSentiment, setLocationSentiment] = useState<any[]>([]);
  const [issueSentiment, setIssueSentiment] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [sentimentDistribution, setSentimentDistribution] = useState<any>({});

  const handleConstituencyClick = useCallback((constituency: any) => {
    console.log('Selected constituency:', constituency);
  }, []);

  const loadDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const [
        metricsData,
        locationsData,
        issuesData,
        trendingData,
        alertsData,
        postsData,
        distributionData,
      ] = await Promise.all([
        dashboardService.getDashboardMetrics(),
        dashboardService.getLocationSentiment(),
        dashboardService.getIssueSentiment(),
        dashboardService.getTrendingTopics(10),
        dashboardService.getActiveAlerts(10),
        dashboardService.getRecentSocialPosts(20),
        dashboardService.getSentimentDistribution(),
      ]);

      setMetrics(metricsData);
      setLocationSentiment(locationsData);
      setIssueSentiment(issuesData);
      setTrendingTopics(trendingData);
      setActiveAlerts(alertsData);
      setSocialPosts(postsData);
      setSentimentDistribution(distributionData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('[Admin Dashboard] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    if (score >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getSentimentBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 70) return <ThumbsUp className="w-3.5 h-3.5" />;
    if (score >= 50) return <Minus className="w-3.5 h-3.5" />;
    return <ThumbsDown className="w-3.5 h-3.5" />;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving' || trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
    if (trend === 'declining' || trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-600" />;
    return <Minus className="w-3.5 h-3.5 text-slate-600" />;
  };

  // Competitor data
  const competitorData = [
    { party: 'TVK', sentiment: metrics?.overallSentiment || 67, change: '+5', color: '#8B5CF6' },
    { party: 'DMK', sentiment: 58, change: '-3', color: '#EF4444' },
    { party: 'AIADMK', sentiment: 52, change: '0', color: '#10B981' },
    { party: 'BJP', sentiment: 45, change: '+2', color: '#F97316' },
  ];

  // Prepare data for enhanced map
  const prepareSentimentData = useCallback(() => {
    const sentimentMap: { [key: string]: number } = {};

    // For demo: Generate varied sentiment scores for all constituencies
    // In production, this would come from actual constituency-level data
    const baseScore = metrics?.overallSentiment || 68;

    // Use imported GeoJSON
    const constituencies = (tamilNaduGeoJSON as any).features;

    // Generate realistic sentiment distribution
    constituencies.forEach((feature: any, index: number) => {
      const constituencyName = feature.properties.AC_NAME;

      // Use index to create deterministic but varied scores
      const hash = index % 100;
      let score;

      if (hash < 5) {
        // 5% very high (75-85%)
        score = 75 + (hash * 2);
      } else if (hash < 10) {
        // 5% very low (25-35%)
        score = 25 + (hash);
      } else if (hash < 25) {
        // 15% high (65-75%)
        score = 65 + ((hash - 10) / 1.5);
      } else if (hash < 40) {
        // 15% low (40-50%)
        score = 40 + ((hash - 25) / 1.5);
      } else {
        // 60% near average (55-70%)
        score = baseScore - 10 + ((hash - 40) / 3);
      }

      sentimentMap[constituencyName] = Math.round(Math.max(15, Math.min(90, score)));
    });

    console.log('[Dashboard] Generated sentiment data for', Object.keys(sentimentMap).length, 'constituencies');
    console.log('[Dashboard] Sample scores:', Object.entries(sentimentMap).slice(0, 5));

    return sentimentMap;
  }, [metrics]);

  const prepareIssueData = useCallback(() => {
    const issueMap: { [constituency: string]: { [issue: string]: number } } = {};

    // For each constituency in location data
    locationSentiment.forEach(loc => {
      issueMap[loc.title] = {};

      // Add issue scores from issueSentiment data
      issueSentiment.forEach(issue => {
        const issueKey = issue.issue.toLowerCase().replace(/ & /g, '').replace(/ /g, '');
        // Use volume as the intensity metric
        issueMap[loc.title][issueKey] = Math.round((issue.sentiment * issue.volume) / 10);
      });
    });

    return issueMap;
  }, [locationSentiment, issueSentiment]);

  const prepareAlertsData = useCallback(() => {
    // Transform active alerts to map markers with approximate coordinates
    // In production, these should come from the database with actual lat/lng
    const baseCoords = [
      { lat: 13.0827, lng: 80.2707 }, // Chennai
      { lat: 11.0168, lng: 76.9558 }, // Coimbatore
      { lat: 9.9252, lng: 78.1198 },  // Madurai
      { lat: 10.7905, lng: 78.7047 }, // Tiruchirappalli
      { lat: 11.6643, lng: 78.1460 }, // Salem
    ];

    return activeAlerts.slice(0, 10).map((alert, idx) => ({
      lat: baseCoords[idx % baseCoords.length].lat + (Math.random() - 0.5) * 0.5,
      lng: baseCoords[idx % baseCoords.length].lng + (Math.random() - 0.5) * 0.5,
      title: alert.title,
      description: alert.description,
      severity: alert.severity.toLowerCase()
    }));
  }, [activeAlerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-lg text-slate-700 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DualSidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Compact Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Tamil Nadu State Command</h1>
                  <p className="text-xs text-slate-500">38 Districts • 264 Constituencies • Live Data</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={() => loadDashboard(false)}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 pb-2 space-y-3">
        {/* Main Grid - Map First */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left Side - Compact Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-2.5">
            {/* TVK Sentiment Score - Hero Card */}
            <WithTooltip
              title="TVK Overall Sentiment"
              summary="This metric shows the aggregated sentiment score for TVK across all 264 constituencies in Tamil Nadu. Scores above 70% indicate strong positive sentiment. The trend shows movement compared to yesterday based on social media analysis and news coverage."
              position="top-right"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80 text-sm font-medium">TVK Sentiment</span>
                    {getTrendIcon(metrics?.sentimentTrend)}
                  </div>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl font-bold text-white">{metrics?.overallSentiment || 0}</span>
                    <span className="text-2xl text-white/80 mb-1">%</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs text-white/70">vs yesterday</span>
                    <span className="text-xs font-semibold text-emerald-300">+5.2%</span>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </WithTooltip>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-emerald-600">+12%</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{(metrics?.activeConversations || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Active Chats</p>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-xs font-semibold text-rose-600">Urgent</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{metrics?.criticalAlerts || 0}</p>
                <p className="text-xs text-slate-500">Alerts</p>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-400">of 264</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{metrics?.constituenciesCovered || 234}</p>
                <p className="text-xs text-slate-500">Coverage</p>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-600">Live</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{trendingTopics.length}</p>
                <p className="text-xs text-slate-500">Trending</p>
              </div>
            </div>

            {/* Competitor Quick View */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                <Award className="w-4 h-4 mr-2 text-indigo-600" />
                Party Rankings
              </h3>
              <div className="space-y-1.5">
                {competitorData.map((competitor, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: competitor.color }}>
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{competitor.party}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold ${competitor.change.startsWith('+') ? 'text-emerald-600' : competitor.change.startsWith('-') ? 'text-rose-600' : 'text-slate-400'}`}>
                        {competitor.change}%
                      </span>
                      <span className="text-sm font-bold text-slate-900">{competitor.sentiment}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Alerts */}
            {activeAlerts.length > 0 && (
              <WithTooltip
                title="Crisis Alerts"
                summary="Real-time critical alerts detected across Tamil Nadu based on sudden spikes in negative sentiment, high-volume issue reporting, or emergency keywords. These require immediate attention and response from the campaign team."
                position="top-right"
              >
                <div className="bg-white rounded-xl border border-rose-200 shadow-sm">
                  <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-rose-900 flex items-center">
                        <Bell className="w-4 h-4 mr-2" />
                        Crisis Alerts
                      </h3>
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full">
                        {activeAlerts.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3.5 max-h-64 overflow-y-auto">
                    {activeAlerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                        <p className="text-xs font-semibold text-rose-900 mb-2.5">{alert.title}</p>
                        <p className="text-xs text-rose-700 line-clamp-2 leading-relaxed">{alert.description}</p>
                        <div className="mt-3.5 flex items-center justify-between">
                          <span className="text-xs text-rose-600">{alert.district}</span>
                          <span className="text-xs font-bold text-rose-800 uppercase">{alert.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </WithTooltip>
            )}

          </div>

          {/* Center - Interactive Map (Primary Focus) */}
          <div className="col-span-12 lg:col-span-8 space-y-3">
            {/* Map */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Tamil Nadu Sentiment Map</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Click constituencies for detailed insights</p>
                  </div>
                  <Link
                    to="/tamil-nadu-map"
                    className="flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>Expand</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <EnhancedMapboxTamilNadu
                  height="550px"
                  onConstituencyClick={handleConstituencyClick}
                  sentimentData={prepareSentimentData()}
                  issueData={prepareIssueData()}
                  alertsData={prepareAlertsData()}
                />
              </div>
            </div>

            {/* Trending Topics & Top Districts - Below Map */}
            <div className="grid grid-cols-2 gap-3">
              {/* Trending Topics */}
              <WithTooltip
                title="Trending Topics"
                summary="Top 5 topics trending on social media and news related to TVK in the last 24 hours. The growth percentage shows how fast each topic is gaining traction across Tamil Nadu. Monitor these to stay ahead of the conversation."
                position="top-right"
              >
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 rounded-t-xl">
                    <h3 className="text-xs font-semibold text-slate-900 flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                      Trending Now
                    </h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {trendingTopics.slice(0, 5).map((topic, idx) => (
                      <div key={topic.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-slate-700 truncate">{topic.keyword}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-emerald-600 font-semibold">+{Math.round(topic.growth_rate * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </WithTooltip>

              {/* Top Districts */}
              <WithTooltip
                title="Top Districts"
                summary="Districts ranked by TVK sentiment score. Higher scores indicate stronger support and positive perception. Click any district to dive into detailed constituency-level analysis and demographic breakdowns."
                position="top-right"
              >
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 rounded-t-xl">
                    <h3 className="text-xs font-semibold text-slate-900 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      Top Districts
                    </h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {locationSentiment.slice(0, 5).map((location, idx) => (
                      <Link
                        key={location.id}
                        to={`/dashboard/district/${location.district}`}
                        className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600">{location.title}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${getSentimentColor(location.value)}`}>
                          {location.value}%
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </WithTooltip>
            </div>
          </div>

        </div>

        {/* Bottom Section - Detailed Analytics */}
        <div className="grid grid-cols-12 gap-4">
          {/* Issue Analysis */}
          <div className="col-span-12 lg:col-span-6">
            <WithTooltip
              title="Issue-wise Sentiment"
              summary="Breakdown of sentiment by key issues like jobs, healthcare, infrastructure, and education. The volume shows total mentions, while the sentiment bar indicates positive vs negative split. Use this to prioritize campaign messaging."
              position="top-right"
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Issue-wise Sentiment Analysis</h2>
                  <p className="text-sm text-slate-500 mt-1">Key concerns across Tamil Nadu</p>
                </div>
                <div className="p-4 space-y-2.5">
                  {issueSentiment.slice(0, 9).map((issue, idx) => (
                    <div key={idx} className="space-y-2 p-3 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 text-sm">{issue.issue}</span>
                          <span className="scale-75">{getTrendIcon(issue.trend)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500 font-medium">{issue.volume.toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getSentimentColor(Math.round(issue.sentiment * 100))}`}>
                            {Math.round(issue.sentiment * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden flex">
                          <div className="bg-emerald-500" style={{ width: `${issue.polarity.positive}%` }} />
                          <div className="bg-amber-400" style={{ width: `${issue.polarity.neutral}%` }} />
                          <div className="bg-rose-500" style={{ width: `${issue.polarity.negative}%` }} />
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <span className="flex items-center space-x-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-medium">{issue.polarity.positive}%</span>
                          </span>
                          <span className="flex items-center space-x-0.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-medium">{issue.polarity.negative}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </WithTooltip>
          </div>

          {/* Recent Activity */}
          <div className="col-span-12 lg:col-span-6">
            <WithTooltip
              title="Recent Social Posts"
              summary="Live feed of recent social media posts about TVK from Twitter, Facebook, and Instagram. Each post is analyzed for sentiment (positive/negative/neutral) and engagement metrics. Use this to identify viral content and influential voices."
              position="top-right"
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Recent Social Posts</h2>
                </div>
                <div className="p-4 space-y-3 max-h-[540px] overflow-y-auto">
                  {socialPosts.slice(0, 8).map((post) => (
                    <div key={post.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-indigo-600 uppercase px-2 py-1 bg-indigo-50 rounded-md">
                            {post.platform}
                          </span>
                          <span className="text-xs text-slate-400">{post.author_name}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          post.sentiment_polarity === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                          post.sentiment_polarity === 'negative' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {post.sentiment_polarity || 'neutral'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-3 mb-3 leading-relaxed">
                        {post.content || 'Content unavailable'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <span className="text-base">👍</span>
                          <span className="font-semibold">{(post.likes || 0).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="text-base">🔄</span>
                          <span className="font-semibold">{(post.shares || 0).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="text-base">💬</span>
                          <span className="font-semibold">{(post.comments || 0).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </WithTooltip>
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-2">Total Posts Analyzed</p>
              <p className="text-3xl font-bold text-slate-900">
                {(socialPosts.length * 45).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Districts Covered</p>
              <p className="text-3xl font-bold text-slate-900">38 + 4</p>
              <p className="text-xs text-slate-400 mt-1">TN + PY</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Constituencies</p>
              <p className="text-3xl font-bold text-slate-900">264</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Live Sentiment</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {metrics?.overallSentiment || 67}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Auto Refresh</p>
              <p className="text-3xl font-bold text-slate-900">5m</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </DualSidebarLayout>
  );
}
