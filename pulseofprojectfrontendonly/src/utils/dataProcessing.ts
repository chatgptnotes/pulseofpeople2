import { SentimentData, TrendData, HeatmapData, AlertData } from '../types';

export function calculateSentimentTrend(data: TrendData[]): { 
  issue: string; 
  trend: 'up' | 'down' | 'stable'; 
  change: number 
}[] {
  if (data.length < 2) return [];

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const issues = ['jobs', 'infrastructure', 'health', 'education', 'lawOrder'] as const;
  
  return issues.map(issue => {
    const change = latest[issue] - previous[issue];
    const trend = Math.abs(change) < 0.05 ? 'stable' : change > 0 ? 'up' : 'down';
    
    return {
      issue: issue === 'lawOrder' ? 'Law & Order' : issue.charAt(0).toUpperCase() + issue.slice(1),
      trend,
      change: Math.round(change * 100)
    };
  });
}

export function aggregateSentimentByRegion(data: HeatmapData[]): {
  region: string;
  averageSentiment: number;
  issueCount: number;
}[] {
  const regionMap = new Map<string, { total: number; count: number }>();

  data.forEach(item => {
    const current = regionMap.get(item.ward) || { total: 0, count: 0 };
    regionMap.set(item.ward, {
      total: current.total + item.sentiment,
      count: current.count + 1
    });
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    averageSentiment: Math.round((stats.total / stats.count) * 100) / 100,
    issueCount: stats.count
  }));
}

export function getTopIssues(data: SentimentData[], limit: number = 5): SentimentData[] {
  return [...data]
    .sort((a, b) => b.sentiment - a.sentiment)
    .slice(0, limit);
}

export function filterAlertsBySeverity(alerts: AlertData[], severity: 'low' | 'medium' | 'high'): AlertData[] {
  return alerts.filter(alert => alert.severity === severity);
}

export function calculateSentimentScore(data: SentimentData[]): number {
  if (data.length === 0) return 0;
  
  const total = data.reduce((sum, item) => sum + item.sentiment, 0);
  return Math.round((total / data.length) * 100);
}

export function formatTimeRange(range: string): string {
  const ranges: Record<string, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 3 months',
    '1y': 'Last year',
    'all': 'All time'
  };
  
  return ranges[range] || range;
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getColorForSentiment(sentiment: number): string {
  if (sentiment >= 0.7) return 'text-green-600';
  if (sentiment >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

export function generateTimeLabels(days: number): string[] {
  const labels = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toISOString().split('T')[0]);
  }
  
  return labels;
}