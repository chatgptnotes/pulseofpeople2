import { SentimentData, TrendData, CompetitorData, HeatmapData, InfluencerData, AlertData } from '../types';
import { 
  mockSentimentData, 
  mockTrendData, 
  mockCompetitorData, 
  mockHeatmapData, 
  mockInfluencerData, 
  mockAlertData,
  overallSentimentDistribution,
  issueImportanceShare
} from '../data/mockData';

const API_BASE_URL = '/api';
const USE_MOCK_DATA = false; // Changed to false - use real dashboardService instead

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private async mockRequest<T>(data: T, delayMs: number = 500): Promise<T> {
    await delay(delayMs);
    if (Math.random() < 0.05) {
      throw new Error('Network error simulation');
    }
    return data;
  }

  async getSentimentData(): Promise<SentimentData[]> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(mockSentimentData);
    }
    
    const response = await fetch(`${API_BASE_URL}/sentiment`);
    if (!response.ok) throw new Error('Failed to fetch sentiment data');
    return response.json();
  }

  async getTrendData(timeRange?: string): Promise<TrendData[]> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(mockTrendData);
    }
    
    const url = timeRange ? `${API_BASE_URL}/trends?range=${timeRange}` : `${API_BASE_URL}/trends`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch trend data');
    return response.json();
  }

  async getCompetitorData(): Promise<CompetitorData[]> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(mockCompetitorData);
    }
    
    const response = await fetch(`${API_BASE_URL}/competitors`);
    if (!response.ok) throw new Error('Failed to fetch competitor data');
    return response.json();
  }

  async getHeatmapData(issue?: string): Promise<HeatmapData[]> {
    if (USE_MOCK_DATA) {
      const data = issue 
        ? mockHeatmapData.filter(item => item.issue === issue)
        : mockHeatmapData;
      return this.mockRequest(data);
    }
    
    const url = issue ? `${API_BASE_URL}/heatmap?issue=${issue}` : `${API_BASE_URL}/heatmap`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch heatmap data');
    return response.json();
  }

  async getInfluencerData(): Promise<InfluencerData[]> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(mockInfluencerData);
    }
    
    const response = await fetch(`${API_BASE_URL}/influencers`);
    if (!response.ok) throw new Error('Failed to fetch influencer data');
    return response.json();
  }

  async getAlertData(): Promise<AlertData[]> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(mockAlertData);
    }
    
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alert data');
    return response.json();
  }

  async getSentimentDistribution(): Promise<typeof overallSentimentDistribution> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(overallSentimentDistribution);
    }
    
    const response = await fetch(`${API_BASE_URL}/sentiment-distribution`);
    if (!response.ok) throw new Error('Failed to fetch sentiment distribution');
    return response.json();
  }

  async getIssueImportance(): Promise<typeof issueImportanceShare> {
    if (USE_MOCK_DATA) {
      return this.mockRequest(issueImportanceShare);
    }
    
    const response = await fetch(`${API_BASE_URL}/issue-importance`);
    if (!response.ok) throw new Error('Failed to fetch issue importance');
    return response.json();
  }

  async exportReport(format: 'pdf' | 'excel' | 'csv', filters?: any): Promise<Blob> {
    if (USE_MOCK_DATA) {
      await delay(2000);
      return new Blob(['Mock export data'], { type: 'text/plain' });
    }
    
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, filters })
    });
    
    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  }

  async updateAlertSettings(settings: any): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/settings/alerts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) throw new Error('Failed to update alert settings');
  }

  async getDashboardConfig(): Promise<any> {
    if (USE_MOCK_DATA) {
      return this.mockRequest({
        refreshInterval: 300000,
        defaultTimeRange: '30d',
        enableRealTime: true,
        theme: 'light'
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/config/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard config');
    return response.json();
  }
}

export const apiService = new ApiService();