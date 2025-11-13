import { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useSentimentData, useTrendData, useCompetitorData } from '../hooks/useSentimentData';
import { exportToCSV } from '../utils/dataProcessing';
import { apiService } from '../services/api';
import { TIME_RANGES, EXPORT_FORMATS } from '../utils/constants';

interface ReportFilters {
  timeRange: string;
  issues: string[];
  regions: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export default function Reports() {
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: '30d',
    issues: [],
    regions: [],
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState('sentiment');

  const { data: sentimentData } = useSentimentData();
  const { data: trendData } = useTrendData(filters.timeRange);
  const { data: competitorData } = useCompetitorData();

  const reportTypes = [
    {
      id: 'sentiment',
      title: 'Sentiment Analysis Report',
      description: 'Comprehensive analysis of public sentiment across all issues',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'trends',
      title: 'Trend Analysis Report', 
      description: 'Historical trends and patterns in sentiment over time',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'competitor',
      title: 'Competitive Analysis Report',
      description: 'Comparison with competitors across key issues',
      icon: PieChart,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'regional',
      title: 'Regional Analysis Report',
      description: 'Geographic breakdown of sentiment by region',
      icon: FileText,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      if (filters.format === 'csv') {
        let data: any[];
        switch (activeReport) {
          case 'sentiment':
            data = sentimentData || [];
            break;
          case 'trends':
            data = trendData || [];
            break;
          case 'competitor':
            data = competitorData || [];
            break;
          default:
            data = [] as any[];
        }
        exportToCSV(data, `${activeReport}-report-${new Date().toISOString().split('T')[0]}`);
      } else {
        const blob = await apiService.exportReport(filters.format, {
          reportType: activeReport,
          timeRange: filters.timeRange,
          issues: filters.issues,
          regions: filters.regions
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeReport}-report.${filters.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate detailed reports and export data</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Types</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    activeReport === report.id
                      ? report.color + ' border-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <report.icon className={`w-6 h-6 mr-3 mt-1 ${
                      activeReport === report.id ? '' : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Report Preview</h4>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                {activeReport === 'sentiment' && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Sentiment Analysis Summary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sentimentData?.slice(0, 4).map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {Math.round(item.sentiment * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">{item.issue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeReport === 'trends' && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Trend Analysis Summary</h5>
                    <div className="text-sm text-gray-600">
                      Analysis of sentiment trends over {TIME_RANGES[filters.timeRange as keyof typeof TIME_RANGES]?.label.toLowerCase() || 'selected period'}
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">↑ Improving: Health, Education</span>
                      <span className="text-red-600">↓ Declining: Jobs</span>
                      <span className="text-gray-600">→ Stable: Infrastructure</span>
                    </div>
                  </div>
                )}

                {activeReport === 'competitor' && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Competitive Analysis Summary</h5>
                    <div className="text-sm text-gray-600">
                      Head-to-head comparison across key political issues
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Leading Issues:</span>
                        <div className="text-green-600">Jobs, Health, Infrastructure</div>
                      </div>
                      <div>
                        <span className="font-medium">Areas for Improvement:</span>
                        <div className="text-orange-600">Education, Law & Order</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeReport === 'regional' && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Regional Analysis Summary</h5>
                    <div className="text-sm text-gray-600">
                      Geographic breakdown of sentiment across regions
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>Ward 1: <span className="text-green-600">72%</span></div>
                      <div>Ward 2: <span className="text-yellow-600">58%</span></div>
                      <div>Ward 3: <span className="text-green-600">81%</span></div>
                      <div>Ward 4: <span className="text-orange-600">65%</span></div>
                      <div>Ward 5: <span className="text-red-600">42%</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => updateFilter('timeRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TIME_RANGES).map(([key, range]) => (
                    <option key={key} value={key}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  {EXPORT_FORMATS.map(format => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={filters.format === format}
                        onChange={(e) => updateFilter('format', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issues
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Jobs', 'Infrastructure', 'Health', 'Education', 'Law & Order'].map(issue => (
                    <label key={issue} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.issues.includes(issue)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('issues', [...filters.issues, issue]);
                          } else {
                            updateFilter('issues', filters.issues.filter(i => i !== issue));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{issue}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regions
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'].map(region => (
                    <label key={region} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.regions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('regions', [...filters.regions, region]);
                          } else {
                            updateFilter('regions', filters.regions.filter(r => r !== region));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Reports</h4>
            <div className="space-y-3">
              {[
                { name: 'Monthly Sentiment Report', date: '2024-08-01', size: '2.3 MB' },
                { name: 'Q2 Trend Analysis', date: '2024-07-15', size: '1.8 MB' },
                { name: 'Regional Breakdown', date: '2024-07-10', size: '3.1 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.date} • {report.size}</div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}