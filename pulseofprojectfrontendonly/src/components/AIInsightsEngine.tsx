import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Lightbulb,
  BarChart3,
  Users,
  MessageCircle,
  Eye,
  Award,
  Activity,
  ArrowRight,
  Filter,
  Download,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function AIInsightsEngine() {
  const [activeTab, setActiveTab] = useState('insights');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  // Mock AI-generated insights
  const insights = [
    {
      id: 1,
      title: 'Emerging Youth Sentiment Shift',
      description: 'AI detected a 23% increase in positive sentiment among 18-25 demographic in swing districts over the past 48 hours.',
      category: 'sentiment',
      priority: 'high',
      confidence: 94,
      impact: 'high',
      actionable: true,
      timestamp: '12 minutes ago',
      source: 'Social Media Analytics',
      recommendations: [
        'Increase youth-focused content in next 72 hours',
        'Consider expanding digital ad spend in identified districts',
        'Schedule youth town halls in top 3 performing areas'
      ],
      metrics: {
        reach: '45,000+',
        engagement: '+156%',
        conversion: '+23%'
      }
    },
    {
      id: 2,
      title: 'Competitor Vulnerability Window',
      description: 'Competitor A showing decreased engagement and negative sentiment spike following recent policy announcement.',
      category: 'competitive',
      priority: 'high',
      confidence: 87,
      impact: 'medium',
      actionable: true,
      timestamp: '34 minutes ago',
      source: 'Competitor Tracking',
      recommendations: [
        'Prepare counter-narrative messaging',
        'Increase positive policy messaging',
        'Target competitor\'s weak demographics'
      ],
      metrics: {
        decline: '-18%',
        opportunity: '72 hours',
        districts: '12 swing'
      }
    },
    {
      id: 3,
      title: 'Media Narrative Trend Analysis',
      description: 'AI identified shift in media coverage patterns. Healthcare becoming dominant topic with 89% positive framing for our positions.',
      category: 'media',
      priority: 'medium',
      confidence: 91,
      impact: 'high',
      actionable: true,
      timestamp: '1 hour ago',
      source: 'Media Monitoring',
      recommendations: [
        'Amplify healthcare messaging',
        'Prepare healthcare policy brief',
        'Schedule healthcare-focused events'
      ],
      metrics: {
        coverage: '+234%',
        sentiment: '+89%',
        mentions: '1,247'
      }
    },
    {
      id: 4,
      title: 'Viral Content Prediction',
      description: 'AI predicts infrastructure post has 78% probability of viral success based on current engagement patterns.',
      category: 'content',
      priority: 'medium',
      confidence: 78,
      impact: 'medium',
      actionable: true,
      timestamp: '2 hours ago',
      source: 'Content Analytics',
      recommendations: [
        'Boost post with additional promotion',
        'Create follow-up content series',
        'Engage with high-influence commenters'
      ],
      metrics: {
        viralScore: '78%',
        shares: '+145%',
        comments: '+89%'
      }
    }
  ];

  // Mock predictive analytics
  const predictions = [
    {
      metric: 'Voter Turnout',
      current: 68,
      predicted: 72,
      confidence: 89,
      timeframe: '7 days',
      factors: ['Weather conditions', 'Event scheduling', 'Media coverage']
    },
    {
      metric: 'Sentiment Score',
      current: 74,
      predicted: 78,
      confidence: 92,
      timeframe: '5 days',
      factors: ['Policy announcements', 'Debate performance', 'Media coverage']
    },
    {
      metric: 'Social Engagement',
      current: 8.4,
      predicted: 9.2,
      confidence: 85,
      timeframe: '3 days',
      factors: ['Content strategy', 'Trending topics', 'Platform algorithms']
    }
  ];

  // Mock AI recommendations
  const recommendations = [
    {
      id: 1,
      type: 'strategic',
      title: 'Optimize Digital Campaign Timing',
      description: 'AI analysis suggests posting between 7-9 PM yields 34% higher engagement',
      priority: 'high',
      effort: 'low',
      impact: 'high',
      timeline: 'Immediate',
      confidence: 93
    },
    {
      id: 2,
      type: 'content',
      title: 'Infrastructure Focus Campaign',
      description: 'Data indicates infrastructure messaging resonates 67% better than general policy content',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      timeline: '1-2 weeks',
      confidence: 88
    },
    {
      id: 3,
      type: 'targeting',
      title: 'Suburban Demographic Expansion',
      description: 'Untapped opportunity in suburban areas showing 89% positive sentiment toward our positions',
      priority: 'medium',
      effort: 'high',
      impact: 'high',
      timeline: '2-4 weeks',
      confidence: 81
    }
  ];

  // Mock AI-powered metrics
  const aiMetrics = [
    { name: 'Prediction Accuracy', value: 94.2, trend: '+2.1%' },
    { name: 'Insight Generation', value: 156, trend: '+12%' },
    { name: 'Auto-Recommendations', value: 89, trend: '+8%' },
    { name: 'Pattern Detection', value: 97.8, trend: '+1.5%' }
  ];

  // Mock trend prediction data
  const trendData = [
    { week: 'Week 1', predicted: 65, actual: 67, confidence: 85 },
    { week: 'Week 2', predicted: 68, actual: 70, confidence: 87 },
    { week: 'Week 3', predicted: 72, actual: 71, confidence: 89 },
    { week: 'Week 4', predicted: 75, actual: null, confidence: 92 }
  ];

  const tabs = [
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 }
  ];

  const filteredInsights = insights.filter(insight => {
    const priorityMatch = priorityFilter === 'all' || insight.priority === priorityFilter;
    const confidenceMatch = confidenceFilter === 'all' || 
      (confidenceFilter === 'high' && insight.confidence >= 85) ||
      (confidenceFilter === 'medium' && insight.confidence >= 70 && insight.confidence < 85) ||
      (confidenceFilter === 'low' && insight.confidence < 70);
    return priorityMatch && confidenceMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sentiment': return Users;
      case 'competitive': return Target;
      case 'media': return MessageCircle;
      case 'content': return Eye;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            AI Insights Engine
          </h2>
          <p className="text-gray-600">Artificial intelligence-powered strategic recommendations and predictions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <div className="flex items-center space-x-2 text-green-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">AI Active</span>
          </div>
        </div>
      </div>

      {/* AI Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {aiMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}{metric.name.includes('Accuracy') || metric.name.includes('Detection') ? '%' : ''}</div>
                <div className="text-sm text-gray-600">{metric.name}</div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">{metric.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select 
              value={confidenceFilter} 
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (85%+)</option>
              <option value="medium">Medium (70-84%)</option>
                              <option value="low">Low (&lt;70%)</option>
            </select>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            {filteredInsights.map((insight) => {
              const CategoryIcon = getCategoryIcon(insight.category);
              return (
                <div key={insight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <CategoryIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">{insight.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}>
                            {insight.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Source: {insight.source}</span>
                          <span>•</span>
                          <span>Confidence: {insight.confidence}%</span>
                          <span>•</span>
                          <span>{insight.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-purple-500 rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{insight.confidence}%</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">AI Recommendations:</h4>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <ArrowRight className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {insight.actionable && (
                    <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors">
                      Take Action on This Insight
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Trend Predictions Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend Predictions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{prediction.metric}</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{prediction.confidence}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current</span>
                    <span className="text-xl font-bold text-gray-900">{prediction.current}{prediction.metric === 'Social Engagement' ? '' : '%'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Predicted ({prediction.timeframe})</span>
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-purple-600 mr-2">{prediction.predicted}{prediction.metric === 'Social Engagement' ? '' : '%'}</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Key Factors:</span>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">AI-Generated Strategic Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${rec.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{rec.confidence}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 capitalize">{rec.effort}</div>
                    <div className="text-xs text-gray-600">Effort</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 capitalize">{rec.impact}</div>
                    <div className="text-xs text-gray-600">Impact</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{rec.timeline}</div>
                    <div className="text-xs text-gray-600">Timeline</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 capitalize">{rec.type}</div>
                    <div className="text-xs text-gray-600">Type</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Implement Recommendation
                  </button>
                  <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* AI Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prediction Accuracy</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                    <span className="text-sm font-medium">94.2%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pattern Recognition</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '97.8%' }}></div>
                    </div>
                    <span className="text-sm font-medium">97.8%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <span className="text-sm font-medium">0.3s avg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Categories</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Sentiment Analysis', value: 35, color: '#3B82F6' },
                      { name: 'Competitive Intel', value: 28, color: '#10B981' },
                      { name: 'Content Optimization', value: 22, color: '#F59E0B' },
                      { name: 'Trend Prediction', value: 15, color: '#8B5CF6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Sentiment Analysis', value: 35, color: '#3B82F6' },
                      { name: 'Competitive Intel', value: 28, color: '#10B981' },
                      { name: 'Content Optimization', value: 22, color: '#F59E0B' },
                      { name: 'Trend Prediction', value: 15, color: '#8B5CF6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Processing Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Processing Statistics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2.4M</div>
                <div className="text-sm text-gray-600">Data Points/Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Insights Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600">Action Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0.3s</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">24/7</div>
                <div className="text-sm text-gray-600">Monitoring Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">12</div>
                <div className="text-sm text-gray-600">AI Models Running</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
