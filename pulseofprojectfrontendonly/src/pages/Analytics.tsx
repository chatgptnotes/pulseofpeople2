import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, Activity, Calendar, Users, MessageCircle, Eye, Brain, Target, Zap, Database, UserCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SocialMediaMonitoring from '../components/SocialMediaMonitoring';
import CompetitorTracking from '../components/CompetitorTracking';
import AIInsightsEngine from '../components/AIInsightsEngine';
import VoterDatabase from '../components/VoterDatabase';
import FieldWorkerManagement from '../components/FieldWorkerManagement';
import { useSentimentData, useTrendData } from '../hooks/useSentimentData';
import { calculateSentimentTrend, getTopIssues, formatNumber } from '../utils/dataProcessing';
import { CHART_COLORS } from '../utils/constants';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeChart, setActiveChart] = useState('sentiment-overview');
  const [activeTab, setActiveTab] = useState('traditional');

  const { data: sentimentData } = useSentimentData();
  const { data: trendData } = useTrendData(timeRange);
  // const { data: influencerData } = useInfluencerData();

  const sentimentTrends = trendData ? calculateSentimentTrend(trendData) : [];
  const topIssues = sentimentData ? getTopIssues(sentimentData) : [];

  const engagementData = [
    { platform: 'Twitter', engagement: 85, reach: 25000, sentiment: 0.68 },
    { platform: 'Facebook', engagement: 72, reach: 32000, sentiment: 0.54 },
    { platform: 'Instagram', engagement: 78, reach: 18000, sentiment: 0.72 },
    { platform: 'YouTube', engagement: 65, reach: 22000, sentiment: 0.58 },
    { platform: 'LinkedIn', engagement: 68, reach: 15000, sentiment: 0.71 }
  ];

  const demographicData = [
    { age: '18-25', sentiment: 0.62, count: 1200 },
    { age: '26-35', sentiment: 0.58, count: 1800 },
    { age: '36-45', sentiment: 0.65, count: 2100 },
    { age: '46-55', sentiment: 0.71, count: 1600 },
    { age: '55+', sentiment: 0.68, count: 1400 }
  ];

  const correlationData = [
    { issue: 'Jobs', sentiment: 0.65, importance: 0.85, volume: 1200 },
    { issue: 'Health', sentiment: 0.72, importance: 0.78, volume: 980 },
    { issue: 'Infrastructure', sentiment: 0.52, importance: 0.65, volume: 856 },
    { issue: 'Education', sentiment: 0.58, importance: 0.72, volume: 1100 },
    { issue: 'Law & Order', sentiment: 0.54, importance: 0.58, volume: 642 }
  ];

  const chartTypes = [
    { id: 'sentiment-overview', label: 'Sentiment Overview', icon: BarChart3 },
    { id: 'trend-analysis', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'engagement-metrics', label: 'Engagement Metrics', icon: Activity },
    { id: 'demographic-breakdown', label: 'Demographics', icon: Users },
    { id: 'correlation-analysis', label: 'Correlation Analysis', icon: Eye }
  ];

  const kpis = [
    { 
      label: 'Avg Sentiment', 
      value: sentimentData ? `${Math.round(sentimentData.reduce((sum, item) => sum + item.sentiment, 0) / sentimentData.length * 100)}%` : '0%',
      change: '+3.2%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { 
      label: 'Total Mentions', 
      value: formatNumber(8450),
      change: '+12%',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    { 
      label: 'Reach', 
      value: formatNumber(125000),
      change: '+8%',
      icon: Users,
      color: 'text-purple-600'
    },
    { 
      label: 'Engagement Rate', 
      value: '4.2%',
      change: '+0.8%',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  const tabs = [
    { id: 'traditional', label: 'Traditional Analytics', icon: BarChart3 },
    { id: 'social-media', label: 'Social Media Monitoring', icon: MessageCircle },
    { id: 'competitor', label: 'Competitor Tracking', icon: Target },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'voter-database', label: 'Voter Database', icon: Database },
    { id: 'field-workers', label: 'Field Workers', icon: UserCheck }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advanced Analytics Suite"
        description="Comprehensive political intelligence and competitive analysis"
        showBackButton={true}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'traditional' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className={`text-sm ${kpi.color}`}>{kpi.change}</p>
              </div>
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Types</h3>
            <div className="space-y-2">
              {chartTypes.map(chart => (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeChart === chart.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <chart.icon className="w-4 h-4 mr-3" />
                  {chart.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {activeChart === 'sentiment-overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Issue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="issue" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    <Tooltip formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Sentiment']} />
                    <Bar dataKey="sentiment" fill={CHART_COLORS.PRIMARY} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === 'trend-analysis' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trends Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    <Tooltip formatter={(value: any, name: string) => [`${Math.round(value * 100)}%`, name]} />
                    <Line type="monotone" dataKey="jobs" stroke={CHART_COLORS.PRIMARY} strokeWidth={2} />
                    <Line type="monotone" dataKey="health" stroke={CHART_COLORS.SUCCESS} strokeWidth={2} />
                    <Line type="monotone" dataKey="infrastructure" stroke={CHART_COLORS.WARNING} strokeWidth={2} />
                    <Line type="monotone" dataKey="education" stroke={CHART_COLORS.INFO} strokeWidth={2} />
                    <Line type="monotone" dataKey="lawOrder" stroke={CHART_COLORS.DANGER} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === 'engagement-metrics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Engagement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill={CHART_COLORS.PRIMARY} />
                    <Bar dataKey="reach" fill={CHART_COLORS.SUCCESS} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === 'demographic-breakdown' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment by Age Group</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographicData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    <Tooltip formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Sentiment']} />
                    <Bar dataKey="sentiment" fill={CHART_COLORS.INFO} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeChart === 'correlation-analysis' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment vs Importance Correlation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="sentiment" 
                      domain={[0, 1]} 
                      tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      label={{ value: 'Sentiment', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="importance" 
                      domain={[0, 1]} 
                      tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      label={{ value: 'Importance', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'volume' ? value : `${Math.round(value * 100)}%`, 
                        name
                      ]}
                      labelFormatter={(value, payload) => payload?.[0]?.payload?.issue || value}
                    />
                    <Scatter dataKey="volume" fill={CHART_COLORS.PRIMARY} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Issues</h3>
          <div className="space-y-3">
            {topIssues.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{issue.issue}</div>
                  <div className="text-sm text-gray-600 capitalize">{issue.polarity} • {issue.emotion}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{Math.round(issue.sentiment * 100)}%</div>
                  <div className="text-sm text-gray-600">Sentiment</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trends</h3>
          <div className="space-y-3">
            {sentimentTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    trend.trend === 'up' ? 'bg-green-500' : 
                    trend.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="font-medium text-gray-900">{trend.issue}</div>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    trend.trend === 'up' ? 'text-green-600' : 
                    trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→'} {Math.abs(trend.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>
      )}

      {activeTab === 'social-media' && <SocialMediaMonitoring />}
      
      {activeTab === 'competitor' && <CompetitorTracking />}
      
      {activeTab === 'ai-insights' && <AIInsightsEngine />}
      
      {activeTab === 'voter-database' && <VoterDatabase />}
      
      {activeTab === 'field-workers' && <FieldWorkerManagement />}
    </div>
  );
}