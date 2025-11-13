import React, { useState, Fragment } from 'react';
import { Plus, Upload, Download, Filter, RefreshCw, MapPin, BarChart3, Users, TrendingUp } from 'lucide-react';

interface HeatmapData {
  ward: string;
  issue: string;
  sentiment: number;
  dataSource: 'survey' | 'social_media' | 'field_worker' | 'feedback' | 'manual';
  timestamp: Date;
  sampleSize: number;
  confidence: number;
}

interface RawDataPoint {
  id: string;
  ward: string;
  issue: string;
  sentiment: number;
  source: string;
  timestamp: Date;
  details: string;
  verified: boolean;
}

export default function EnhancedWardHeatmap() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'data-collection' | 'analytics'>('heatmap');
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [showDataForm, setShowDataForm] = useState(false);
  const [rawDataPoints, setRawDataPoints] = useState<RawDataPoint[]>([]);

  // Enhanced mock data with more realistic Tamil Nadu wards
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([
    { ward: 'Thiruvananthapuram Central', issue: 'Jobs', sentiment: 0.7, dataSource: 'survey', timestamp: new Date(), sampleSize: 150, confidence: 0.85 },
    { ward: 'Thiruvananthapuram Central', issue: 'Infrastructure', sentiment: 0.6, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 89, confidence: 0.78 },
    { ward: 'Thiruvananthapuram Central', issue: 'Health', sentiment: 0.8, dataSource: 'social_media', timestamp: new Date(), sampleSize: 234, confidence: 0.92 },
    { ward: 'Thiruvananthapuram Central', issue: 'Education', sentiment: 0.5, dataSource: 'feedback', timestamp: new Date(), sampleSize: 67, confidence: 0.71 },
    { ward: 'Thiruvananthapuram Central', issue: 'Law & Order', sentiment: 0.4, dataSource: 'survey', timestamp: new Date(), sampleSize: 123, confidence: 0.82 },
    { ward: 'Kochi Marine Drive', issue: 'Jobs', sentiment: 0.6, dataSource: 'social_media', timestamp: new Date(), sampleSize: 198, confidence: 0.88 },
    { ward: 'Kochi Marine Drive', issue: 'Infrastructure', sentiment: 0.8, dataSource: 'survey', timestamp: new Date(), sampleSize: 145, confidence: 0.91 },
    { ward: 'Kochi Marine Drive', issue: 'Health', sentiment: 0.7, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 76, confidence: 0.75 },
    { ward: 'Kochi Marine Drive', issue: 'Education', sentiment: 0.6, dataSource: 'feedback', timestamp: new Date(), sampleSize: 112, confidence: 0.83 },
    { ward: 'Kochi Marine Drive', issue: 'Law & Order', sentiment: 0.3, dataSource: 'social_media', timestamp: new Date(), sampleSize: 167, confidence: 0.79 },
    { ward: 'Kozhikode Beach', issue: 'Jobs', sentiment: 0.8, dataSource: 'survey', timestamp: new Date(), sampleSize: 201, confidence: 0.94 },
    { ward: 'Kozhikode Beach', issue: 'Infrastructure', sentiment: 0.9, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 93, confidence: 0.87 },
    { ward: 'Kozhikode Beach', issue: 'Health', sentiment: 0.6, dataSource: 'social_media', timestamp: new Date(), sampleSize: 156, confidence: 0.81 },
    { ward: 'Kozhikode Beach', issue: 'Education', sentiment: 0.7, dataSource: 'feedback', timestamp: new Date(), sampleSize: 134, confidence: 0.86 },
    { ward: 'Kozhikode Beach', issue: 'Law & Order', sentiment: 0.5, dataSource: 'survey', timestamp: new Date(), sampleSize: 178, confidence: 0.89 },
    { ward: 'Kollam Port', issue: 'Jobs', sentiment: 0.5, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 87, confidence: 0.73 },
    { ward: 'Kollam Port', issue: 'Infrastructure', sentiment: 0.7, dataSource: 'social_media', timestamp: new Date(), sampleSize: 143, confidence: 0.85 },
    { ward: 'Kollam Port', issue: 'Health', sentiment: 0.9, dataSource: 'survey', timestamp: new Date(), sampleSize: 189, confidence: 0.92 },
    { ward: 'Kollam Port', issue: 'Education', sentiment: 0.8, dataSource: 'feedback', timestamp: new Date(), sampleSize: 95, confidence: 0.80 },
    { ward: 'Kollam Port', issue: 'Law & Order', sentiment: 0.4, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 67, confidence: 0.69 },
    { ward: 'Thrissur Round', issue: 'Jobs', sentiment: 0.4, dataSource: 'social_media', timestamp: new Date(), sampleSize: 167, confidence: 0.77 },
    { ward: 'Thrissur Round', issue: 'Infrastructure', sentiment: 0.6, dataSource: 'survey', timestamp: new Date(), sampleSize: 134, confidence: 0.84 },
    { ward: 'Thrissur Round', issue: 'Health', sentiment: 0.8, dataSource: 'field_worker', timestamp: new Date(), sampleSize: 98, confidence: 0.81 },
    { ward: 'Thrissur Round', issue: 'Education', sentiment: 0.9, dataSource: 'feedback', timestamp: new Date(), sampleSize: 156, confidence: 0.90 },
    { ward: 'Thrissur Round', issue: 'Law & Order', sentiment: 0.7, dataSource: 'survey', timestamp: new Date(), sampleSize: 123, confidence: 0.86 }
  ]);

  const wards = [...new Set(heatmapData.map(d => d.ward))].sort();
  const issues = [...new Set(heatmapData.map(d => d.issue))];

  const getHeatmapValue = (ward: string, issue: string) => {
    const data = heatmapData.find(d => d.ward === ward && d.issue === issue);
    return data ? data.sentiment : 0;
  };

  const getDataInfo = (ward: string, issue: string) => {
    const data = heatmapData.find(d => d.ward === ward && d.issue === issue);
    return data;
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-700';
    if (value >= 0.6) return 'bg-green-500';
    if (value >= 0.4) return 'bg-yellow-400';
    if (value >= 0.2) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getTextColor = (value: number) => {
    return value >= 0.5 ? 'text-white' : 'text-gray-900';
  };

  const getDataSourceIcon = (source: string) => {
    switch (source) {
      case 'survey': return '📊';
      case 'social_media': return '📱';
      case 'field_worker': return '👥';
      case 'feedback': return '💬';
      case 'manual': return '✏️';
      default: return '📄';
    }
  };

  const handleDataSubmit = (formData: any) => {
    const newDataPoint: RawDataPoint = {
      id: Date.now().toString(),
      ward: formData.ward,
      issue: formData.issue,
      sentiment: parseFloat(formData.sentiment),
      source: formData.source,
      timestamp: new Date(),
      details: formData.details,
      verified: false
    };
    setRawDataPoints([...rawDataPoints, newDataPoint]);
    setShowDataForm(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(heatmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ward-sentiment-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Enhanced Ward-Level Sentiment Heatmap
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowDataForm(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Data
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'heatmap', label: 'Heatmap View', icon: BarChart3 },
              { key: 'data-collection', label: 'Data Collection', icon: Upload },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp }
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

      {/* Heatmap View */}
      {activeTab === 'heatmap' && (
        <div>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-6 gap-1 text-xs">
                <div className="p-3 font-semibold text-center bg-gray-100 rounded-tl-lg">Ward / Issue</div>
                {wards.map(ward => (
                  <div key={ward} className="p-3 font-semibold text-center bg-gray-100 text-gray-800 max-w-32 truncate" title={ward}>
                    {ward.split(' ')[0]}
                  </div>
                ))}
                
                {issues.map(issue => (
                  <Fragment key={issue}>
                    <div className="p-3 font-semibold text-right bg-gray-100 text-gray-800">
                      {issue}
                    </div>
                    {wards.map(ward => {
                      const value = getHeatmapValue(ward, issue);
                      const dataInfo = getDataInfo(ward, issue);
                      return (
                        <div
                          key={`${ward}-${issue}`}
                          className={`p-3 text-center font-medium cursor-pointer hover:scale-105 transition-transform ${getHeatmapColor(value)} ${getTextColor(value)} relative group`}
                          title={`${ward} - ${issue}: ${value.toFixed(2)} (${dataInfo?.sampleSize} samples, ${Math.round((dataInfo?.confidence || 0) * 100)}% confidence)`}
                          onClick={() => setSelectedWard(`${ward}-${issue}`)}
                        >
                          <div className="text-sm font-bold">{value.toFixed(2)}</div>
                          <div className="text-xs opacity-80">
                            {getDataSourceIcon(dataInfo?.dataSource || 'manual')}
                          </div>
                          <div className="absolute invisible group-hover:visible bg-black text-white p-2 rounded text-xs -mt-8 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                            Samples: {dataInfo?.sampleSize}<br/>
                            Confidence: {Math.round((dataInfo?.confidence || 0) * 100)}%<br/>
                            Source: {dataInfo?.dataSource}
                          </div>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sentiment Score:</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-xs">0.0</span>
                <div className="flex space-x-1 mx-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-green-700 rounded"></div>
                </div>
                <span className="text-xs">1.0</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <span className="mr-1">📊</span>
                <span>Survey</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">📱</span>
                <span>Social Media</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">👥</span>
                <span>Field Worker</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">💬</span>
                <span>Feedback</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Collection View */}
      {activeTab === 'data-collection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{rawDataPoints.length}</div>
                  <div className="text-sm text-blue-700">Raw Data Points</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{heatmapData.length}</div>
                  <div className="text-sm text-green-700">Processed Entries</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(heatmapData.reduce((acc, d) => acc + d.confidence, 0) / heatmapData.length * 100)}%
                  </div>
                  <div className="text-sm text-purple-700">Avg Confidence</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Raw Data Submissions</h4>
            {rawDataPoints.length === 0 ? (
              <p className="text-gray-500">No raw data points submitted yet. Click "Add Data" to start collecting.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rawDataPoints.slice(-10).reverse().map((point) => (
                  <div key={point.id} className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{point.ward}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-700">{point.issue}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`font-semibold ${point.sentiment >= 0.6 ? 'text-green-600' : point.sentiment >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {point.sentiment.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{point.details}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {point.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Data Source Distribution</h4>
              <div className="space-y-2">
                {['survey', 'social_media', 'field_worker', 'feedback'].map(source => {
                  const count = heatmapData.filter(d => d.dataSource === source).length;
                  const percentage = Math.round((count / heatmapData.length) * 100);
                  return (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{getDataSourceIcon(source)}</span>
                        <span className="capitalize text-sm text-gray-700">{source.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-200 rounded-full h-2 w-16 relative">
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

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Ward Performance Overview</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {wards.map(ward => {
                  const wardData = heatmapData.filter(d => d.ward === ward);
                  const avgSentiment = wardData.reduce((acc, d) => acc + d.sentiment, 0) / wardData.length;
                  return (
                    <div key={ward} className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 truncate max-w-32" title={ward}>
                        {ward.split(' ')[0]}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          avgSentiment >= 0.6 ? 'bg-green-100 text-green-800' :
                          avgSentiment >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {avgSentiment.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Submission Modal */}
      {showDataForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Submit Raw Data Point</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleDataSubmit({
                ward: formData.get('ward'),
                issue: formData.get('issue'),
                sentiment: formData.get('sentiment'),
                source: formData.get('source'),
                details: formData.get('details')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                  <select name="ward" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                  <select name="issue" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Issue</option>
                    {issues.map(issue => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment Score (0-1)</label>
                  <input 
                    name="sentiment" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="1" 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                  <select name="source" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select Source</option>
                    <option value="survey">Survey</option>
                    <option value="social_media">Social Media</option>
                    <option value="field_worker">Field Worker</option>
                    <option value="feedback">Feedback</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <textarea 
                    name="details" 
                    rows={3} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Additional context or notes..."
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDataForm(false)}
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