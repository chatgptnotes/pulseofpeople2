import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import {
  MapPin, Users, TrendingUp, TrendingDown, AlertTriangle,
  MessageSquare, Activity, Target, Map, BarChart3,
  RefreshCw, ChevronRight, Minus, ThumbsUp, ThumbsDown,
  Zap, Shield, Eye
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * Manager District Dashboard - District Level
 *
 * DATA FLOW: Bottom-up aggregation
 * Booth → Ward → Constituency → DISTRICT → State
 *
 * SCOPE: Single District (e.g., Chennai, Coimbatore)
 * - 6-10 constituencies per district
 * - All wards within district
 * - All booths under district
 *
 * DATA SOURCES:
 * - Aggregated from all constituencies in district
 * - Social media filtered by district location
 * - News mentions with district tags
 * - Field reports from district booth agents
 */
export default function ManagerDistrictDashboard() {
  const { user } = useAuth();
  const { districtCode } = useParams<{ districtCode?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // District info
  const [districtName, setDistrictName] = useState('Chennai');
  const [districtMetrics, setDistrictMetrics] = useState<any>(null);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [issueSentiment, setIssueSentiment] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [wardPerformance, setWardPerformance] = useState<any[]>([]);

  // Load district data
  const loadDistrictDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      console.log(`[District Dashboard] Loading data for ${districtName}...`);

      // Fetch district-specific data (filtered from state data)
      const [
        metrics,
        locations,
        issues,
        trending,
        alerts,
        posts,
      ] = await Promise.all([
        dashboardService.getDashboardMetrics(),
        dashboardService.getLocationSentiment(),
        dashboardService.getIssueSentiment(),
        dashboardService.getTrendingTopics(10),
        dashboardService.getActiveAlerts(15),
        dashboardService.getRecentSocialPosts(30),
      ]);

      // Filter data for this district
      const districtLocation = locations.find(loc =>
        loc.title.toLowerCase().includes(districtName.toLowerCase())
      );

      // Get constituencies in this district (mock for now)
      const districtConstituencies = [
        { id: 1, name: `${districtName} North`, sentiment: 72, feedback: 450, wards: 18, status: 'active' },
        { id: 2, name: `${districtName} South`, sentiment: 68, feedback: 520, wards: 22, status: 'active' },
        { id: 3, name: `${districtName} Central`, sentiment: 75, feedback: 380, wards: 15, status: 'active' },
        { id: 4, name: `${districtName} East`, sentiment: 64, feedback: 410, wards: 20, status: 'active' },
        { id: 5, name: `${districtName} West`, sentiment: 70, feedback: 395, wards: 17, status: 'active' },
      ];

      // Ward performance data (mock)
      const wardData = [
        { ward: 'Ward 1', sentiment: 75, coverage: 85, agents: 12 },
        { ward: 'Ward 2', sentiment: 68, coverage: 78, agents: 10 },
        { ward: 'Ward 3', sentiment: 72, coverage: 90, agents: 15 },
        { ward: 'Ward 4', sentiment: 65, coverage: 72, agents: 8 },
        { ward: 'Ward 5', sentiment: 70, coverage: 88, agents: 14 },
      ];

      setDistrictMetrics({
        sentiment: districtLocation?.sentiment || 0.68,
        totalFeedback: districtConstituencies.reduce((sum, c) => sum + c.feedback, 0),
        constituenciesActive: districtConstituencies.filter(c => c.status === 'active').length,
        totalConstituencies: districtConstituencies.length,
        activeBoothAgents: 450,
        totalBoothAgents: 580,
        wardsTotal: districtConstituencies.reduce((sum, c) => sum + c.wards, 0),
        coveragePercentage: 78,
      });

      setConstituencies(districtConstituencies);
      setWardPerformance(wardData);
      setIssueSentiment(issues.slice(0, 5));
      setTrendingTopics(trending.slice(0, 8));

      // Filter alerts for this district
      setActiveAlerts(alerts.filter(a =>
        a.district?.toLowerCase().includes(districtName.toLowerCase())
      ).slice(0, 10));

      // Filter social posts for this district
      setSocialPosts(posts.slice(0, 10));

      setLastUpdated(new Date());
      console.log(`[District Dashboard] ✓ Data loaded for ${districtName}`);
    } catch (error) {
      console.error('[District Dashboard] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Get district name from route or user profile
    if (districtCode) {
      setDistrictName(districtCode);
    }
    loadDistrictDashboard();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadDistrictDashboard(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [districtCode]);

  // Helper functions
  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    if (score >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSentimentBorderColor = (score: number) => {
    if (score >= 70) return 'border-green-200';
    if (score >= 50) return 'border-yellow-200';
    if (score >= 30) return 'border-orange-200';
    return 'border-red-200';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 70) return <ThumbsUp className="w-4 h-4" />;
    if (score >= 50) return <Minus className="w-4 h-4" />;
    return <ThumbsDown className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  // Chart data
  const constituencyChartData = constituencies.map(c => ({
    name: c.name.replace(districtName, '').trim(),
    sentiment: c.sentiment,
    feedback: c.feedback,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading {districtName} District Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Aggregating constituency and ward data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Link to="/dashboards/admin-state" className="hover:text-blue-600">Tamil Nadu</Link>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="font-medium text-gray-900">{districtName} District</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{districtName} District Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Managing {districtMetrics?.totalConstituencies || 0} Constituencies · {districtMetrics?.wardsTotal || 0} Wards
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-xs text-gray-500">
                <p>Last updated</p>
                <p className="font-medium text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => loadDistrictDashboard(false)}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* District Sentiment */}
          <div className={`bg-white rounded-xl shadow-sm border-2 ${getSentimentBorderColor(Math.round((districtMetrics?.sentiment || 0) * 100))} p-6`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">District Sentiment</span>
              {getSentimentIcon(Math.round((districtMetrics?.sentiment || 0) * 100))}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {Math.round((districtMetrics?.sentiment || 0) * 100)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">vs State: {Math.round((districtMetrics?.sentiment || 0) * 100 - 67)}%</p>
              </div>
              <div className={`p-3 rounded-lg ${getSentimentColor(Math.round((districtMetrics?.sentiment || 0) * 100))}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Constituencies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Constituencies</span>
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {districtMetrics?.constituenciesActive || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  of {districtMetrics?.totalConstituencies || 0} active
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Booth Agents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Booth Agents</span>
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {districtMetrics?.activeBoothAgents || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(((districtMetrics?.activeBoothAgents || 0) / (districtMetrics?.totalBoothAgents || 1)) * 100)}% active
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total Feedback</span>
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  {(districtMetrics?.totalFeedback || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Constituency Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Constituency Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={constituencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sentiment" fill="#8B5CF6" name="Sentiment %" />
                  <Bar yAxisId="right" dataKey="feedback" fill="#10B981" name="Feedback Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Constituencies Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Constituencies</h2>
                <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-3">
                {constituencies.map((constituency, index) => (
                  <Link
                    key={constituency.id}
                    to={`/dashboards/constituency/${constituency.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{constituency.name}</p>
                        <p className="text-sm text-gray-500">
                          {constituency.wards} wards · {constituency.feedback} feedback
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-lg font-bold ${getSentimentColor(constituency.sentiment)}`}>
                        {constituency.sentiment}%
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Issue Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Issues in {districtName}</h2>
              <div className="space-y-4">
                {issueSentiment.map((issue, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{issue.issue}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSentimentColor(Math.round(issue.sentiment * 100))}`}>
                        {Math.round(issue.sentiment * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-green-500" style={{ width: `${issue.polarity.positive}%` }} />
                        <div className="bg-yellow-500" style={{ width: `${issue.polarity.neutral}%` }} />
                        <div className="bg-red-500" style={{ width: `${issue.polarity.negative}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{issue.volume} mentions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* District Alerts */}
            {activeAlerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">District Alerts</h2>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm">{alert.title}</p>
                        <span className="text-xs uppercase font-bold">{alert.severity}</span>
                      </div>
                      <p className="text-xs opacity-90">{alert.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending in District */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={topic.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        #{index + 1} {topic.keyword}
                      </span>
                      <span className={`text-xs font-bold ${
                        topic.sentiment_score > 0.6 ? 'text-green-600' :
                        topic.sentiment_score < 0.4 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {topic.sentiment_score > 0.6 ? '😊' : topic.sentiment_score < 0.4 ? '😟' : '😐'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{topic.volume.toLocaleString()} mentions</span>
                      <span className="text-green-600 font-semibold">
                        +{Math.round(topic.growth_rate * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ward Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Wards</h2>
              <div className="space-y-3">
                {wardPerformance.map((ward, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{ward.ward}</p>
                      <p className="text-xs text-gray-500">{ward.agents} agents · {ward.coverage}% coverage</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSentimentColor(ward.sentiment)}`}>
                      {ward.sentiment}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/tamil-nadu-map"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Map className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-blue-900">District Map</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </Link>
                <Link
                  to="/field-workers"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-900">Manage Agents</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-green-600" />
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-900">Deep Analytics</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600">Constituencies</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {districtMetrics?.totalConstituencies || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Wards</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {districtMetrics?.wardsTotal || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {districtMetrics?.activeBoothAgents || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coverage</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {districtMetrics?.coveragePercentage || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Update</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
