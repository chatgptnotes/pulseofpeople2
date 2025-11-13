import React, { useState } from 'react';
import AdvancedChart from '../components/AdvancedChart';
import { BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';

export default function AdvancedCharts() {
  const [selectedChart, setSelectedChart] = useState('sentiment');

  // Sample data for different chart types
  const chartData = {
    sentiment: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Positive Sentiment',
          data: [65, 72, 68, 74, 78, 82],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Negative Sentiment',
          data: [25, 22, 28, 20, 18, 15],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Neutral Sentiment',
          data: [10, 6, 4, 6, 4, 3],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    demographics: {
      labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
      datasets: [
        {
          label: 'Voter Engagement (%)',
          data: [78, 85, 82, 75, 68, 62],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#EC4899'
          ]
        }
      ]
    },
    geographic: {
      labels: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha'],
      datasets: [
        {
          label: 'Support Level (%)',
          data: [68, 72, 65, 70, 63, 67],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3B82F6',
          borderWidth: 2
        }
      ]
    },
    issues: {
      labels: ['Employment', 'Healthcare', 'Education', 'Infrastructure', 'Environment', 'Security'],
      datasets: [
        {
          label: 'Priority Score',
          data: [85, 78, 82, 74, 68, 71],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10B981'
        }
      ]
    }
  };

  const chartConfigs = [
    {
      id: 'sentiment',
      title: 'Sentiment Analysis Over Time',
      subtitle: 'Monthly sentiment trends across all platforms',
      type: 'line' as const,
      icon: TrendingUp
    },
    {
      id: 'demographics',
      title: 'Voter Demographics Engagement',
      subtitle: 'Engagement levels by age groups',
      type: 'doughnut' as const,
      icon: Users
    },
    {
      id: 'geographic',
      title: 'Geographic Support Distribution',
      subtitle: 'Support levels across major cities',
      type: 'bar' as const,
      icon: MapPin
    },
    {
      id: 'issues',
      title: 'Key Issues Priority Analysis',
      subtitle: 'Voter priority scores for major policy areas',
      type: 'radar' as const,
      icon: BarChart3
    }
  ];

  const selectedConfig = chartConfigs.find(c => c.id === selectedChart);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Charts</h1>
        <p className="text-gray-600">
          Interactive data visualizations with advanced features including export, zoom, and filtering capabilities.
        </p>
      </div>

      {/* Chart Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Chart Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => setSelectedChart(config.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedChart === config.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <config.icon className="w-5 h-5" />
                <span className="font-medium">{config.title}</span>
              </div>
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Chart */}
      {selectedConfig && (
        <AdvancedChart
          type={selectedConfig.type}
          data={chartData[selectedChart as keyof typeof chartData]}
          title={selectedConfig.title}
          subtitle={selectedConfig.subtitle}
          height={500}
          showExport={true}
          showFilters={true}
          showZoom={true}
          onDataPointClick={(dataPoint) => {
            console.log('Data point clicked:', dataPoint);
          }}
          onFilterChange={(filters) => {
            console.log('Filters changed:', filters);
          }}
        />
      )}

      {/* Chart Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Options</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Export as PNG/JPG images</li>
            <li>• Export data as CSV</li>
            <li>• Share charts directly</li>
            <li>• Copy to clipboard</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interactive Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Zoom in/out capabilities</li>
            <li>• Click data points for details</li>
            <li>• Real-time filtering</li>
            <li>• Responsive animations</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Chart Types</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Line charts for trends</li>
            <li>• Bar charts for comparisons</li>
            <li>• Radar charts for multi-dimensional data</li>
            <li>• Doughnut charts for distributions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}