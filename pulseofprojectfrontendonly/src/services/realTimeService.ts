import { SentimentData, AlertData, SocialPost, TrendingTopic } from '../types';
import { mockSentimentData } from '../data/mockData';
import { SocialMediaMonitor, defaultMonitoringConfig } from './socialMediaMonitor';
import { sentimentEngine } from './sentimentAnalysis';

class RealTimeService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isConnected = false;
  private socialMonitor: SocialMediaMonitor;
  private recentAlerts: AlertData[] = [];
  private liveMetrics: any = {};
  private connectionRetryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.socialMonitor = new SocialMediaMonitor(defaultMonitoringConfig);
    this.setupSocialMonitorSubscription();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.isConnected = true;
          this.socialMonitor.startMonitoring();
          this.connectionRetryCount = 0;
          console.log('Real-time service connected with social media monitoring');
          resolve();
        }, 1000);
      } catch (error) {
        this.connectionRetryCount++;
        if (this.connectionRetryCount < this.maxRetries) {
          console.log(`Connection attempt ${this.connectionRetryCount} failed, retrying...`);
          setTimeout(() => this.connect().then(resolve).catch(reject), 2000);
        } else {
          reject(new Error('Failed to connect after maximum retries'));
        }
      }
    });
  }

  disconnect(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
    this.socialMonitor.stopMonitoring();
    this.isConnected = false;
    console.log('Real-time service disconnected');
  }

  subscribe<T>(channel: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    
    this.listeners.get(channel)!.add(callback);
    
    this.startChannelUpdates(channel);

    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(callback);
        if (channelListeners.size === 0) {
          this.stopChannelUpdates(channel);
          this.listeners.delete(channel);
        }
      }
    };
  }

  private startChannelUpdates(channel: string): void {
    if (this.intervals.has(channel)) return;

    const updateInterval = this.getUpdateInterval(channel);
    const interval = setInterval(() => {
      this.generateUpdate(channel);
    }, updateInterval);

    this.intervals.set(channel, interval);
  }

  private stopChannelUpdates(channel: string): void {
    const interval = this.intervals.get(channel);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(channel);
    }
  }

  private getUpdateInterval(channel: string): number {
    const intervals: Record<string, number> = {
      'sentiment-live': 5000,       // 5 seconds
      'alerts-live': 10000,         // 10 seconds
      'trends-live': 30000,         // 30 seconds
      'metrics-live': 15000,        // 15 seconds
      'influencers-live': 60000     // 1 minute
    };
    
    return intervals[channel] || 30000;
  }

  private generateUpdate(channel: string): void {
    const listeners = this.listeners.get(channel);
    if (!listeners || listeners.size === 0) return;

    let data: any;

    switch (channel) {
      case 'sentiment-live':
        data = this.generateSentimentUpdate();
        break;
      case 'alerts-live':
        data = this.generateAlertUpdate();
        break;
      case 'trends-live':
        data = this.generateTrendUpdate();
        break;
      case 'metrics-live':
        data = this.generateMetricsUpdate();
        break;
      case 'influencers-live':
        data = this.generateInfluencerUpdate();
        break;
      case 'social-media-live':
        // This is handled by the social monitor subscription
        return;
      default:
        return;
    }

    listeners.forEach(callback => callback(data));
  }

  private generateSentimentUpdate(): { type: 'sentiment-update'; data: SentimentData[] } {
    const updatedData = mockSentimentData.map(item => ({
      ...item,
      sentiment: Math.max(0, Math.min(1, item.sentiment + (Math.random() - 0.5) * 0.1)),
      intensity: Math.max(0, Math.min(1, item.intensity + (Math.random() - 0.5) * 0.15))
    }));

    return {
      type: 'sentiment-update',
      data: updatedData
    };
  }

  private generateAlertUpdate(): { type: 'new-alert'; data: AlertData } | null {
    // Return real alerts from social media monitoring
    if (this.recentAlerts.length > 0) {
      const alert = this.recentAlerts.shift()!;
      return {
        type: 'new-alert',
        data: alert
      };
    }
    
    return null;
  }

  private generateTrendUpdate(): { type: 'trend-update'; data: any } {
    const currentTime = new Date();
    const timeLabel = currentTime.toISOString().split('T')[0];
    
    return {
      type: 'trend-update',
      data: {
        date: timeLabel,
        jobs: 0.5 + Math.random() * 0.4,
        infrastructure: 0.4 + Math.random() * 0.4,
        health: 0.6 + Math.random() * 0.3,
        education: 0.5 + Math.random() * 0.3,
        lawOrder: 0.4 + Math.random() * 0.4
      }
    };
  }

  private generateMetricsUpdate(): { type: 'metrics-update'; data: any } {
    const recentPosts = this.socialMonitor.getRecentPosts(100);
    const avgSentiment = recentPosts.length > 0 
      ? recentPosts.reduce((sum, post) => sum + post.sentiment.sentiment, 0) / recentPosts.length
      : 0.6;
    
    const platformDistribution = recentPosts.reduce((acc, post) => {
      acc[post.source.platform] = (acc[post.source.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      type: 'metrics-update',
      data: {
        overallSentiment: Math.round(avgSentiment * 100),
        activeConversations: recentPosts.length * 10, // Approximate total conversations
        criticalAlerts: this.recentAlerts.filter(a => a.severity === 'critical').length,
        lastUpdate: new Date().toISOString(),
        engagement: {
          twitter: platformDistribution.twitter || 0,
          facebook: platformDistribution.facebook || 0,
          instagram: platformDistribution.instagram || 0,
          youtube: platformDistribution.youtube || 0,
          news: platformDistribution.news || 0
        },
        trendingTopics: this.socialMonitor.getTrendingTopics().slice(0, 5),
        totalPosts: recentPosts.length,
        avgEngagement: recentPosts.length > 0 
          ? Math.round(recentPosts.reduce((sum, post) => sum + post.source.engagement, 0) / recentPosts.length)
          : 0
      }
    };
  }

  private generateInfluencerUpdate(): { type: 'influencer-update'; data: any } {
    return {
      type: 'influencer-update',
      data: {
        id: `influencer-${Date.now()}`,
        activity: 'New post with high engagement',
        platform: ['Twitter', 'Facebook', 'Instagram'][Math.floor(Math.random() * 3)],
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        reach: Math.round(10000 + Math.random() * 50000),
        timestamp: new Date()
      }
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  simulateConnectionIssue(): void {
    this.isConnected = false;
    this.socialMonitor.stopMonitoring();
    setTimeout(() => {
      this.isConnected = true;
      this.socialMonitor.startMonitoring();
      console.log('Connection restored');
    }, 5000);
  }

  // New methods for enhanced functionality
  private setupSocialMonitorSubscription(): void {
    this.socialMonitor.subscribe((update) => {
      if (update.type === 'posts_update') {
        // Store alerts from social media monitoring
        if (update.data.alerts && update.data.alerts.length > 0) {
          this.recentAlerts.push(...update.data.alerts);
          // Keep only recent alerts (last 100)
          this.recentAlerts = this.recentAlerts.slice(-100);
        }

        // Update live metrics
        this.liveMetrics = {
          newPosts: update.data.new_posts?.length || 0,
          totalPosts: update.data.total_posts || 0,
          trendingTopics: update.data.trending_topics || [],
          lastUpdate: new Date()
        };

        // Notify listeners of social media updates
        this.notifyListeners('social-media-live', {
          type: 'social-media-update',
          data: update.data
        });
      }
    });
  }

  private notifyListeners(channel: string, data: any): void {
    const listeners = this.listeners.get(channel);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time listener callback:', error);
        }
      });
    }
  }

  // Public methods for external access
  getSocialMediaPosts(limit?: number): SocialPost[] {
    return this.socialMonitor.getRecentPosts(limit);
  }

  getTrendingTopics(): TrendingTopic[] {
    return this.socialMonitor.getTrendingTopics();
  }

  searchSocialMedia(query: string): SocialPost[] {
    return this.socialMonitor.searchPosts(query);
  }

  getInfluencers(): any[] {
    return this.socialMonitor.getInfluencers();
  }

  updateMonitoringConfig(config: any): void {
    this.socialMonitor.updateConfig(config);
  }

  getRecentAlerts(): AlertData[] {
    return this.recentAlerts.slice(-20); // Return last 20 alerts
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.recentAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
    }
  }

  resolveAlert(alertId: string, notes?: string): void {
    const alert = this.recentAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      if (notes) {
        alert.resolution_notes = notes;
      }
    }
  }

  // Analytics methods
  getSentimentTrends(timeWindow: 'hour' | 'day' | 'week' = 'day'): any {
    const posts = this.socialMonitor.getRecentPosts();
    const sentiments = posts.map(post => post.sentiment);
    return sentimentEngine.analyzeTrends(sentiments, timeWindow);
  }

  detectAnomalies(): any[] {
    const posts = this.socialMonitor.getRecentPosts();
    const sentiments = posts.map(post => post.sentiment);
    return sentimentEngine.detectAnomalies(sentiments);
  }

  getHealthStatus(): {
    connected: boolean;
    socialMonitoring: boolean;
    lastUpdate: Date;
    errorCount: number;
  } {
    return {
      connected: this.isConnected,
      socialMonitoring: this.socialMonitor ? true : false,
      lastUpdate: this.liveMetrics.lastUpdate || new Date(),
      errorCount: this.connectionRetryCount
    };
  }
}

export const realTimeService = new RealTimeService();