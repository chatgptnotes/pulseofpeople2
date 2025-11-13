import React, { useRef, useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  TimeScale,
  RadialLinearScale,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut, Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Download, Filter, ZoomIn, Share2, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  RadialLinearScale,
  ArcElement,
  Filler
);

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
  }[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  interaction?: any;
  scales?: any;
  plugins?: any;
  elements?: any;
  animation?: any;
}

interface AdvancedChartProps {
  type: 'line' | 'bar' | 'radar' | 'doughnut' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  title: string;
  subtitle?: string;
  height?: number;
  showExport?: boolean;
  showFilters?: boolean;
  showZoom?: boolean;
  className?: string;
  onDataPointClick?: (dataPoint: any) => void;
  onFilterChange?: (filters: any) => void;
}

export default function AdvancedChart({
  type,
  data,
  options = {},
  title,
  subtitle,
  height = 400,
  showExport = true,
  showFilters = false,
  showZoom = false,
  className = '',
  onDataPointClick,
  onFilterChange
}: AdvancedChartProps) {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    sentiment: 'all',
    platform: 'all'
  });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Enhanced chart options with animations and interactions
  const enhancedOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return `${title} - ${context[0].label}`;
          },
          afterBody: function(context: any) {
            if (type === 'line' && context[0]) {
              const dataIndex = context[0].dataIndex;
              const trend = dataIndex > 0 ? 
                (context[0].raw > data.datasets[0].data[dataIndex - 1] ? '📈 Trending Up' : '📉 Trending Down') : 
                '📊 Data Point';
              return trend;
            }
            return '';
          }
        }
      },
      ...(options.plugins || {})
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        },
        beginAtZero: true
      },
      ...(options.scales || {})
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0 && onDataPointClick) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        onDataPointClick({
          dataset: data.datasets[datasetIndex],
          dataIndex,
          value: data.datasets[datasetIndex].data[dataIndex],
          label: data.labels[dataIndex]
        });
      }
    },
    ...options
  };

  // Export functionality
  const exportChart = async (format: 'png' | 'jpg' | 'pdf' | 'csv') => {
    if (!containerRef.current) return;
    
    setIsExporting(true);
    
    try {
      switch (format) {
        case 'png':
        case 'jpg':
          const canvas = await html2canvas(containerRef.current, {
            backgroundColor: '#ffffff',
            scale: 2
          });
          const link = document.createElement('a');
          link.download = `${title.replace(/\s+/g, '_')}_chart.${format}`;
          link.href = canvas.toDataURL(`image/${format}`);
          link.click();
          break;
          
        case 'csv':
          exportToCSV();
          break;
          
        case 'pdf':
          // Would integrate with jsPDF for PDF export
          console.log('PDF export functionality would be implemented here');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Label', ...data.datasets.map(d => d.label)];
    const rows = data.labels.map((label, index) => [
      label,
      ...data.datasets.map(dataset => dataset.data[index])
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_data.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const shareChart = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `${title}_chart.png`, { type: 'image/png' });
          await navigator.share({
            title: title,
            text: subtitle || 'Sentiment Analysis Chart',
            files: [file]
          });
        } else {
          // Fallback: copy image to clipboard
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert('Chart copied to clipboard!');
            }
          });
        }
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  // Filter handling
  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Zoom functionality
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    let newZoom = zoomLevel;
    
    switch (direction) {
      case 'in':
        newZoom = Math.min(zoomLevel * 1.2, 3);
        break;
      case 'out':
        newZoom = Math.max(zoomLevel / 1.2, 0.5);
        break;
      case 'reset':
        newZoom = 1;
        break;
    }
    
    setZoomLevel(newZoom);
    
    if (chartRef.current) {
      chartRef.current.zoom(newZoom);
    }
  };

  // Chart component selection
  const ChartComponent = {
    line: Line,
    bar: Bar,
    radar: Radar,
    doughnut: Doughnut,
    scatter: Scatter
  }[type];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} ref={containerRef}>
      {/* Chart Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            {showZoom && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleZoom('in')}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomIn className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}
            
            {showFilters && (
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={shareChart}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Share Chart"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {showExport && (
              <div className="relative group">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
                
                {/* Export Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-1">
                    <button
                      onClick={() => exportChart('png')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      disabled={isExporting}
                    >
                      Export as PNG
                    </button>
                    <button
                      onClick={() => exportChart('jpg')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      disabled={isExporting}
                    >
                      Export as JPG
                    </button>
                    <button
                      onClick={() => exportChart('csv')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      disabled={isExporting}
                    >
                      Export as CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-3 flex items-center space-x-4">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <select
              value={filters.sentiment}
              onChange={(e) => handleFilterChange('sentiment', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            
            <select
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Chart Container */}
      <div className="p-4">
        <div style={{ height: `${height}px`, transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
          <ChartComponent
            ref={chartRef}
            data={data}
            options={enhancedOptions}
          />
        </div>
      </div>
      
      {/* Chart Footer with Insights */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          {data.datasets.length > 0 && (
            <span>
              Total data points: {data.datasets[0].data.length}
            </span>
          )}
        </div>
      </div>
      
      {/* Export Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Exporting...</span>
          </div>
        </div>
      )}
    </div>
  );
}