import SentimentByIssue from '../components/SentimentByIssue'
import SentimentTrends from '../components/SentimentTrends'
import SentimentDistribution from '../components/SentimentDistribution'
import IssueImportance from '../components/IssueImportance'
import CompetitorComparison from '../components/CompetitorComparison'
import SentimentHeatmap from '../components/SentimentHeatmap'
import InfluencerTracking from '../components/InfluencerTracking'
import AlertsPanel from '../components/AlertsPanel'
import { MapboxTamilNadu } from '../components/maps/MapboxTamilNadu'
import ExportManager from '../components/ExportManager'
import AdvancedChart from '../components/AdvancedChart'
import { MobileNavigation, ResponsiveContainer, MobileCard, ResponsiveGrid, MobileButton, MobileStats } from '../components/MobileResponsive'
import { TrendingUp, Users, AlertTriangle, Target, Calendar, Brain, Zap, Globe, Lightbulb } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { realTimeService } from '../services/realTimeService'
import { crisisDetection } from '../services/crisisDetection'
import { recommendationsEngine } from '../services/recommendationsEngine'
// Import Django services
import { dashboardService } from '../services'
import type { DashboardStats } from '../services'


export default function Dashboard() {
  // Real data from Django backend
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [platformDistribution, setPlatformDistribution] = useState<{ [key: string]: number }>({});

  // Legacy state for compatibility
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoized callback for constituency clicks (prevents map re-initialization)
  const handleConstituencyClick = useCallback((constituency: any) => {
    console.log('Clicked:', constituency);
    // Add any additional logic here (e.g., show details, update filters, etc.)
  }, []);

  // Load real data from Django backend on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('[Dashboard] Loading data from Django backend...');

        // Load dashboard stats from Django API
        const dashboardStats = await dashboardService.getOverview();
        console.log('[Dashboard] Stats loaded:', dashboardStats);

        setStats(dashboardStats);

        // Create metrics object for legacy compatibility
        const metricsData = {
          overallSentiment: Math.round(
            (dashboardStats.sentiment_distribution?.positive || 0) * 100
          ),
          activeConversations: dashboardStats.total_voters || 0,
          criticalAlerts: 0, // No alerts in current Django backend
          topIssue: 'Voters Management', // Default
          constituenciesCovered: dashboardStats.total_constituencies || 0,
          sentimentTrend: 'stable' as const,
        };

        setMetrics(metricsData);

        // Set legacy liveMetrics for backward compatibility
        setLiveMetrics({
          overallSentiment: metricsData.overallSentiment,
          activeConversations: metricsData.activeConversations,
          criticalAlerts: metricsData.criticalAlerts,
          engagement: {
            twitter: 0,
            facebook: 0,
            instagram: 0,
            youtube: 0,
            news: 0,
          },
        });

        console.log('[Dashboard] ✓ Django data loaded successfully');
      } catch (error) {
        console.error('[Dashboard] Failed to load data:', error);
        // Set fallback data
        setMetrics({
          overallSentiment: 68,
          activeConversations: 0,
          criticalAlerts: 0,
          topIssue: 'Loading...',
          constituenciesCovered: 0,
          sentimentTrend: 'stable' as const,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('[Dashboard] Refreshing data...');
      loadDashboardData();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Calculate KPIs from real metrics
  const kpis = [
    {
      label: 'Overall Sentiment',
      value: metrics ? `${metrics.overallSentiment}%` : (liveMetrics?.overallSentiment ? `${liveMetrics.overallSentiment}%` : '...'),
      change: metrics ? (metrics.sentimentTrend === 'improving' ? '+5%' : metrics.sentimentTrend === 'declining' ? '-3%' : '0%') : '+5%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Active Conversations',
      value: metrics ? metrics.activeConversations.toLocaleString() : (liveMetrics?.activeConversations?.toLocaleString() || '...'),
      change: '+18%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Critical Alerts',
      value: metrics ? metrics.criticalAlerts.toString() : activeAlerts.filter((a) => a.severity === 'critical').length.toString(),
      change: '-2',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
    {
      label: 'Top Issue',
      value: metrics ? metrics.topIssue : (trendingTopics[0]?.keyword || '...'),
      change: trendingTopics[0] ? `${Math.round(trendingTopics[0].growth_rate * 100)}%` : '32%',
      icon: Target,
      color: 'text-purple-600',
    },
    {
      label: 'Constituencies Covered',
      value: metrics ? metrics.constituenciesCovered.toString() : '264',
      change: 'TN+PY',
      icon: Globe,
      color: 'text-orange-600',
    },
  ];

  // Tamil Nadu Districts Map Data - from real Supabase data
  const tamilNaduMapData = locations.length > 0 ? locations : [
    // Fallback data if no real data available
    { id: 'TN-Loading', title: 'Loading...', value: 50, sentiment: 0.5, constituencies: 0 },
  ];

  // Show loading state while fetching data
  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MobileNavigation />
      <ResponsiveContainer>
        <div className="space-responsive pt-16 lg:pt-0">
          <div className="mobile-header lg:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-responsive-xl font-bold text-gray-900">Pulse of People Dashboard</h1>
                <p className="text-responsive-sm text-gray-600">Real-time political intelligence and sentiment analysis</p>
              </div>
              <div className="flex space-x-2 lg:space-x-3">
                <ExportManager className="inline-block" />
                <MobileButton
                  onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                  variant={showAdvancedFeatures ? 'primary' : 'outline'}
                  size="default"
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  AI Features
                </MobileButton>
              </div>
            </div>
          </div>

          <MobileStats stats={kpis.map((kpi, index) => {
            const liveValue = liveMetrics && index === 0 ? `${liveMetrics.overallSentiment}%` :
                            liveMetrics && index === 1 ? liveMetrics.activeConversations?.toLocaleString() :
                            liveMetrics && index === 2 ? liveMetrics.criticalAlerts?.toString() :
                            kpi.value;
            
            return {
              label: kpi.label,
              value: liveValue,
              icon: kpi.icon,
              color: kpi.color.includes('green') ? 'bg-green-100' :
                     kpi.color.includes('blue') ? 'bg-blue-100' :
                     kpi.color.includes('red') ? 'bg-red-100' :
                     kpi.color.includes('purple') ? 'bg-purple-100' :
                     'bg-gray-100',
              trend: { direction: kpi.change.includes('+') ? 'up' : 'down', value: kpi.change }
            };
          })} />

          {/* AI-Powered Features Section */}
          {showAdvancedFeatures && (
            <MobileCard className="border-2 border-purple-200 bg-purple-50" padding="default">
              <div className="space-responsive">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-purple-900">AI-Powered Intelligence</h2>
          </div>
          
                <ResponsiveGrid cols={{ sm: 1, lg: 2, xl: 3 }}>
                  {/* Crisis Alerts */}
                  {activeAlerts.length > 0 && (
                    <MobileCard className="border-red-200" padding="default">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="text-responsive-sm font-semibold text-red-900">Crisis Detection</h3>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {activeAlerts.slice(0, 3).map((alert, index) => (
                          <div key={index} className={`p-2 rounded text-responsive-xs ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-xs opacity-75">{alert.description}</div>
                          </div>
                        ))}
                      </div>
                    </MobileCard>
                  )}
            
                  {/* AI Recommendations */}
                  {recommendations.length > 0 && (
                    <MobileCard className="border-blue-200" padding="default">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h3 className="text-responsive-sm font-semibold text-blue-900">AI Recommendations</h3>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className={`p-2 rounded text-responsive-xs ${
                            rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            <div className="font-medium">{rec.title}</div>
                            <div className="text-xs opacity-75">{rec.description}</div>
                            <div className="text-xs mt-1 font-medium">Impact: {rec.estimated_impact} | Confidence: {Math.round(rec.confidence_score * 100)}%</div>
                          </div>
                        ))}
                      </div>
                    </MobileCard>
                  )}
            
                  {/* Trending Topics */}
                  {trendingTopics.length > 0 && (
                    <MobileCard className="border-green-200" padding="default">
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="w-5 h-5 text-green-600" />
                        <h3 className="text-responsive-sm font-semibold text-green-900">Trending Topics</h3>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {trendingTopics.slice(0, 5).map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded text-responsive-xs">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-green-800 truncate">{topic.keyword}</div>
                              <div className="text-green-600 truncate">Volume: {topic.volume} | Growth: +{Math.round(topic.growth_rate * 100)}%</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                              topic.sentiment_score > 0.1 ? 'bg-green-200 text-green-800' :
                              topic.sentiment_score < -0.1 ? 'bg-red-200 text-red-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {topic.sentiment_score > 0.1 ? '😊' : topic.sentiment_score < -0.1 ? '😟' : '😐'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </MobileCard>
                  )}
                </ResponsiveGrid>
          
                {/* Advanced Visualizations */}
                <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
                  {liveMetrics?.trendingTopics && (
                    <AdvancedChart
                      type="doughnut"
                      title="Platform Distribution"
                      subtitle="Posts by social media platform"
                      data={{
                        labels: ['Twitter', 'Facebook', 'Instagram', 'YouTube', 'News'],
                        datasets: [{
                          label: 'Posts',
                          data: [
                            liveMetrics.engagement?.twitter || 0,
                            liveMetrics.engagement?.facebook || 0,
                            liveMetrics.engagement?.instagram || 0,
                            liveMetrics.engagement?.youtube || 0,
                            liveMetrics.engagement?.news || 0
                          ],
                          backgroundColor: [
                            '#1DA1F2',
                            '#4267B2', 
                            '#E4405F',
                            '#FF0000',
                            '#6B7280'
                          ]
                        }]
                      }}
                      height={250}
                      showExport={true}
                    />
                  )}
                  
                  {recentPosts.length > 0 && (
                    <MobileCard padding="default">
                      <div className="flex items-center space-x-2 mb-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <h3 className="text-responsive-sm font-semibold text-gray-900">Recent Social Media Activity</h3>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {recentPosts.slice(0, 5).map((post) => (
                          <div key={post.id} className="p-2 bg-gray-50 rounded text-responsive-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800 truncate flex-1 capitalize">
                                {post.platform || 'Social Media'}
                              </span>
                              <span className={`px-1 py-0.5 rounded text-xs flex-shrink-0 ${
                                post.sentiment_polarity === 'positive' ? 'bg-green-200 text-green-800' :
                                post.sentiment_polarity === 'negative' ? 'bg-red-200 text-red-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {post.sentiment_polarity || 'neutral'}
                              </span>
                            </div>
                            <div className="text-gray-600 line-clamp-2">
                              {post.content?.substring(0, 100) || 'Sample social media content'}...
                            </div>
                            <div className="text-gray-500 mt-1 text-xs flex items-center gap-3">
                              <span>👍 {post.likes || 0}</span>
                              <span>🔄 {post.shares || 0}</span>
                              <span>💬 {post.comments || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </MobileCard>
                  )}
                </ResponsiveGrid>
              </div>
            </MobileCard>
          )}

          <div className="w-full">
            <MapboxTamilNadu height="600px" onConstituencyClick={handleConstituencyClick} />
          </div>

          <ResponsiveGrid cols={{ sm: 1, lg: 2, xl: 3 }}>
            <SentimentByIssue />
            <SentimentTrends />
            <SentimentDistribution />
            <IssueImportance />
            <CompetitorComparison />
            <SentimentHeatmap />
          </ResponsiveGrid>

          <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
            <InfluencerTracking />
            <AlertsPanel />
          </ResponsiveGrid>
      
          {/* Enhanced Analytics Section */}
          {showAdvancedFeatures && liveMetrics && (
            <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
          <AdvancedChart
            type="line"
            title="Real-time Sentiment Trends"
            subtitle="Multi-language sentiment analysis over time"
            data={{
              labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
              datasets: [{
                label: 'Overall Sentiment',
                data: [0.65, 0.62, 0.68, 0.70, 0.67, 0.69, liveMetrics.overallSentiment / 100],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }}
            height={300}
            showExport={true}
            showFilters={true}
            showZoom={true}
          />
          
          <AdvancedChart
            type="bar"
            title="Issue Sentiment Distribution"
            subtitle="Sentiment analysis by key political issues"
            data={{
              labels: ['Jobs', 'Healthcare', 'Education', 'Infrastructure', 'Law & Order'],
              datasets: [{
                label: 'Positive Sentiment',
                data: [45, 72, 60, 55, 48],
                backgroundColor: '#10B981'
              }, {
                label: 'Negative Sentiment', 
                data: [35, 18, 25, 30, 42],
                backgroundColor: '#EF4444'
              }, {
                label: 'Neutral Sentiment',
                data: [20, 10, 15, 15, 10],
                backgroundColor: '#6B7280'
              }]
            }}
            height={300}
            showExport={true}
          />
            </ResponsiveGrid>
          )}
        </div>
      </ResponsiveContainer>
    </>
  )
}