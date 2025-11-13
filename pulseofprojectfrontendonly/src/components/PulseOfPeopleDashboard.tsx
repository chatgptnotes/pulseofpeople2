import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  AlertCircle,
  RefreshCw,
  Plus,
  Filter,
  Calendar,
  MapPin,
  BarChart3,
  Activity,
  Mic,
  Phone,
  Globe,
  Clock
} from 'lucide-react';

interface PulseData {
  id: string;
  timestamp: Date;
  source: 'survey' | 'social_media' | 'field_interview' | 'phone_poll' | 'online_feedback' | 'town_hall' | 'focus_group';
  location: string;
  demographic: string;
  sentiment: number;
  topic: string;
  rawFeedback: string;
  verified: boolean;
  weight: number;
}

interface PulseTrend {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  totalResponses: number;
}

export default function PulseOfPeopleDashboard() {
  const [activeTab, setActiveTab] = useState<'live' | 'collection' | 'analytics' | 'insights'>('live');
  const [realTimeData, setRealTimeData] = useState<PulseData[]>([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDemographic, setSelectedDemographic] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock real-time pulse data with Tamil Nadu-specific content
  const [pulseData, setPulseData] = useState<PulseData[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      source: 'social_media',
      location: 'Thiruvananthapuram',
      demographic: 'Youth (18-25)',
      sentiment: 0.8,
      topic: 'Employment Opportunities',
      rawFeedback: 'New IT parks bringing good jobs to our area! Finally seeing development.',
      verified: true,
      weight: 0.9
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: 'field_interview',
      location: 'Kochi',
      demographic: 'Middle-aged (35-50)',
      sentiment: 0.3,
      topic: 'Traffic & Infrastructure',
      rawFeedback: 'Roads are getting worse every year. Traffic jams everywhere during monsoon.',
      verified: true,
      weight: 1.0
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      source: 'phone_poll',
      location: 'Kozhikode',
      demographic: 'Senior (50+)',
      sentiment: 0.7,
      topic: 'Healthcare Services',
      rawFeedback: 'Government hospital services have improved. Medicine availability is better now.',
      verified: true,
      weight: 0.85
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      source: 'online_feedback',
      location: 'Kollam',
      demographic: 'Women (25-40)',
      sentiment: 0.6,
      topic: 'Education System',
      rawFeedback: 'School infrastructure is improving but need more teachers and resources.',
      verified: false,
      weight: 0.7
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: 'town_hall',
      location: 'Thrissur',
      demographic: 'Mixed Community',
      sentiment: 0.4,
      topic: 'Law & Order',
      rawFeedback: 'Safety concerns in evening hours. Need better street lighting and police patrol.',
      verified: true,
      weight: 1.0
    }
  ]);

  const [trendData, setTrendData] = useState<PulseTrend[]>([
    { date: '2024-08-26', positive: 45, negative: 25, neutral: 30, totalResponses: 1234 },
    { date: '2024-08-27', positive: 48, negative: 23, neutral: 29, totalResponses: 1456 },
    { date: '2024-08-28', positive: 52, negative: 20, neutral: 28, totalResponses: 1678 },
    { date: '2024-08-29', positive: 47, negative: 28, neutral: 25, totalResponses: 1543 },
    { date: '2024-08-30', positive: 51, negative: 24, neutral: 25, totalResponses: 1789 }
  ]);

  const getCurrentPulse = () => {
    const recent = pulseData.filter(d => d.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000));
    const weightedSentiment = recent.reduce((acc, d) => acc + (d.sentiment * d.weight), 0) / recent.reduce((acc, d) => acc + d.weight, 0);
    return {
      sentiment: weightedSentiment || 0,
      volume: recent.length,
      trend: recent.length > 5 ? 'increasing' : 'stable'
    };
  };

  const getDataSourceIcon = (source: string) => {
    switch (source) {
      case 'survey': return <BarChart3 className="h-4 w-4" />;
      case 'social_media': return <Globe className="h-4 w-4" />;
      case 'field_interview': return <Users className="h-4 w-4" />;
      case 'phone_poll': return <Phone className="h-4 w-4" />;
      case 'online_feedback': return <MessageSquare className="h-4 w-4" />;
      case 'town_hall': return <Mic className="h-4 w-4" />;
      case 'focus_group': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-600 bg-green-100';
    if (sentiment >= 0.5) return 'text-blue-600 bg-blue-100';
    if (sentiment >= 0.3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.7) return 'Very Positive';
    if (sentiment >= 0.5) return 'Positive';
    if (sentiment >= 0.3) return 'Neutral';
    return 'Negative';
  };

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Add new mock data point
    const newDataPoint: PulseData = {
      id: Date.now().toString(),
      timestamp: new Date(),
      source: 'social_media',
      location: 'Kochi',
      demographic: 'Youth (18-25)',
      sentiment: Math.random(),
      topic: 'Digital Infrastructure',
      rawFeedback: 'Internet connectivity is improving with fiber optic rollout.',
      verified: true,
      weight: 0.8
    };
    setPulseData([newDataPoint, ...pulseData.slice(0, -1)]);
    setRefreshing(false);
  };

  const currentPulse = getCurrentPulse();

  const filteredData = pulseData.filter(d => {
    if (selectedDemographic !== 'all' && !d.demographic.toLowerCase().includes(selectedDemographic.toLowerCase())) {
      return false;
    }
    if (selectedLocation !== 'all' && d.location !== selectedLocation) {
      return false;
    }
    return true;
  });

  const handleDataSubmit = (formData: any) => {
    const newDataPoint: PulseData = {
      id: Date.now().toString(),
      timestamp: new Date(),
      source: formData.source,
      location: formData.location,
      demographic: formData.demographic,
      sentiment: parseFloat(formData.sentiment),
      topic: formData.topic,
      rawFeedback: formData.feedback,
      verified: false,
      weight: 0.8
    };
    setPulseData([newDataPoint, ...pulseData]);
    setShowCollectionForm(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 h-6 w-6 text-blue-600" />
            Pulse of the People Dashboard
          </h3>
          <p className="text-sm text-gray-600 mt-1">Real-time sentiment monitoring and data collection from Tamil Nadu</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm disabled:opacity-50"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCollectionForm(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Data
          </button>
        </div>
      </div>

      {/* Current Pulse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {Math.round(currentPulse.sentiment * 100)}%
              </div>
              <div className="text-sm text-blue-700">Overall Pulse</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">{currentPulse.volume}</div>
              <div className="text-sm text-green-700">24h Responses</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(pulseData.reduce((acc, d) => acc + d.weight, 0) / pulseData.length * 100)}%
              </div>
              <div className="text-sm text-purple-700">Avg Confidence</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {currentPulse.trend === 'increasing' ? '↗' : currentPulse.trend === 'decreasing' ? '↘' : '→'}
              </div>
              <div className="text-sm text-orange-700 capitalize">{currentPulse.trend}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'live', label: 'Live Feed', icon: Activity },
              { key: 'collection', label: 'Data Collection', icon: Plus },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'insights', label: 'AI Insights', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Locations</option>
            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
            <option value="Kochi">Kochi</option>
            <option value="Kozhikode">Kozhikode</option>
            <option value="Kollam">Kollam</option>
            <option value="Thrissur">Thrissur</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedDemographic} 
            onChange={(e) => setSelectedDemographic(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All Demographics</option>
            <option value="youth">Youth (18-25)</option>
            <option value="middle">Middle-aged (35-50)</option>
            <option value="senior">Senior (50+)</option>
            <option value="women">Women</option>
          </select>
        </div>
      </div>

      {/* Live Feed */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredData.length} recent pulse readings
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center text-gray-600">
                        {getDataSourceIcon(item.source)}
                        <span className="ml-1 text-xs capitalize">{item.source.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </div>
                      <div className="text-gray-500 text-xs">{item.demographic}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentLabel(item.sentiment)}
                      </div>
                      {item.verified && (
                        <div className="text-green-600 text-xs bg-green-100 px-1 rounded">✓</div>
                      )}
                    </div>
                    <div className="text-gray-900 font-medium mb-1">{item.topic}</div>
                    <div className="text-gray-700 text-sm italic">\"{item.rawFeedback}\"</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {Math.round((Date.now() - item.timestamp.getTime()) / (1000 * 60))}m ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Collection */}
      {activeTab === 'collection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-blue-800">Active Collectors</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-green-800">Verification Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">234</div>
              <div className="text-sm text-purple-800">Today's Entries</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-orange-800">Pending Review</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Collection Methods</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm">Social Media Monitoring</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm">Field Interviews</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm">Phone Polling</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm">Online Feedback</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mic className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm">Town Halls</span>
                  </div>
                  <span className="text-yellow-600 text-sm font-medium">Scheduled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm">Surveys</span>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">7-Day Sentiment Trend</h4>
              <div className="space-y-2">
                {trendData.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.date.split('-').slice(1).join('/')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div 
                          className="bg-green-500 h-2 rounded" 
                          style={{ width: `${day.positive}px` }}
                        ></div>
                        <div 
                          className="bg-gray-400 h-2 rounded" 
                          style={{ width: `${day.neutral / 2}px` }}
                        ></div>
                        <div 
                          className="bg-red-500 h-2 rounded" 
                          style={{ width: `${day.negative}px` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{day.totalResponses}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Topic Breakdown</h4>
              <div className="space-y-3">
                {['Employment Opportunities', 'Healthcare Services', 'Traffic & Infrastructure', 'Education System', 'Law & Order'].map((topic, index) => {
                  const percentage = [25, 20, 18, 22, 15][index];
                  return (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{topic}</span>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-200 rounded-full h-2 w-20 relative">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              AI-Generated Insights
            </h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Employment Sentiment Rising</h5>
                    <p className="text-sm text-gray-600">Youth employment sentiment has increased by 15% over the last week, particularly in Thiruvananthapuram and Kochi areas.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Infrastructure Concerns</h5>
                    <p className="text-sm text-gray-600">Traffic and road quality issues are becoming more prominent in urban areas, especially during monsoon season.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Healthcare Satisfaction</h5>
                    <p className="text-sm text-gray-600">Government healthcare services showing consistent positive feedback, with 78% satisfaction rate among seniors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Collection Form Modal */}
      {showCollectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-96 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Submit Pulse Data</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleDataSubmit({
                source: formData.get('source'),
                location: formData.get('location'),
                demographic: formData.get('demographic'),
                sentiment: formData.get('sentiment'),
                topic: formData.get('topic'),
                feedback: formData.get('feedback')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                  <select name="source" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Source</option>
                    <option value="survey">Survey</option>
                    <option value="social_media">Social Media</option>
                    <option value="field_interview">Field Interview</option>
                    <option value="phone_poll">Phone Poll</option>
                    <option value="online_feedback">Online Feedback</option>
                    <option value="town_hall">Town Hall</option>
                    <option value="focus_group">Focus Group</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select name="location" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Location</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Kollam">Kollam</option>
                    <option value="Thrissur">Thrissur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Demographic</label>
                  <select name="demographic" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Demographic</option>
                    <option value="Youth (18-25)">Youth (18-25)</option>
                    <option value="Middle-aged (35-50)">Middle-aged (35-50)</option>
                    <option value="Senior (50+)">Senior (50+)</option>
                    <option value="Women (25-40)">Women (25-40)</option>
                    <option value="Mixed Community">Mixed Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input name="topic" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., Employment Opportunities" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment Score (0-1)</label>
                  <input name="sentiment" type="number" step="0.01" min="0" max="1" required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raw Feedback</label>
                  <textarea name="feedback" rows={3} required className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Direct quote or feedback summary..."></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCollectionForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}