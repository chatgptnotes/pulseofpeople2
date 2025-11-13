import { SocialPost, MediaSource, SentimentData, AlertData } from '../types';
import { sentimentEngine } from './sentimentAnalysis';

export interface MonitoringConfig {
  platforms: string[];
  keywords: string[];
  hashtags: string[];
  candidates: string[];
  refreshInterval: number;
  alertThresholds: {
    volume: number;
    sentiment_change: number;
    engagement: number;
  };
}

export interface TrendingTopic {
  keyword: string;
  volume: number;
  sentiment_score: number;
  growth_rate: number;
  platform_distribution: { [platform: string]: number };
  first_detected: Date;
}

export class SocialMediaMonitor {
  private config: MonitoringConfig;
  private isMonitoring: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private postsCache: Map<string, SocialPost> = new Map();
  private trendingTopics: Map<string, TrendingTopic> = new Map();
  private subscribers: ((data: any) => void)[] = [];

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  // Start real-time monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.fetchAndAnalyzePosts();
    }, this.config.refreshInterval);
    
    console.log('Social media monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Social media monitoring stopped');
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Fetch posts from all platforms
  private async fetchAndAnalyzePosts(): Promise<void> {
    try {
      const allPosts = await Promise.all([
        this.fetchTwitterPosts(),
        this.fetchFacebookPosts(),
        this.fetchInstagramPosts(),
        this.fetchYoutubePosts(),
        this.fetchNewsPosts()
      ]);

      const flatPosts = allPosts.flat();
      
      // Analyze sentiment for new posts
      const newPosts = flatPosts.filter(post => !this.postsCache.has(post.id));
      
      for (const post of newPosts) {
        post.sentiment = await sentimentEngine.analyzeSocialPost(post);
        this.postsCache.set(post.id, post);
      }

      // Update trending topics
      this.updateTrendingTopics(newPosts);

      // Check for alerts
      const alerts = this.checkForAlerts(newPosts);

      // Notify subscribers
      this.notifySubscribers({
        type: 'posts_update',
        data: {
          new_posts: newPosts,
          total_posts: this.postsCache.size,
          trending_topics: Array.from(this.trendingTopics.values()),
          alerts
        }
      });

    } catch (error) {
      console.error('Error in social media monitoring:', error);
    }
  }

  // Platform-specific fetch methods
  private async fetchTwitterPosts(): Promise<SocialPost[]> {
    // Mock Twitter API integration
    // In real implementation, use Twitter API v2
    const mockPosts: SocialPost[] = [
      {
        id: `twitter_${Date.now()}_1`,
        content: `तமिழ்நाடு में रोजगार की स्थिति बेहतर हो रही है। புதிய கொள்கைகள் का सकारात्मक प्रभाव दिख रहा है।`,
        language: 'hi',
        sentiment: {} as SentimentData, // Will be filled by sentiment analysis
        source: {
          platform: 'twitter',
          author: '@maharashtra_user',
          followers: 5000,
          engagement: 250,
          verified: false
        },
        timestamp: new Date(),
        engagement_metrics: {
          likes: 120,
          shares: 45,
          comments: 30,
          reach: 2500
        },
        hashtags: ['#TamilNadu', '#வேலைவாய்ப்பு', '#கொள்கை'],
        mentions: ['@CMOTamilNadu'],
        location: {
          coordinates: [19.0760, 72.8777],
          place_name: 'Chennai, Tamil Nadu'
        }
      }
    ];

    return this.simulateApiCall(mockPosts);
  }

  private async fetchFacebookPosts(): Promise<SocialPost[]> {
    // Mock Facebook Graph API integration
    const mockPosts: SocialPost[] = [
      {
        id: `facebook_${Date.now()}_1`,
        content: `Local infrastructure projects in my ward are making real difference. Better roads, improved water supply. #Development #LocalGov`,
        language: 'en',
        sentiment: {} as SentimentData,
        source: {
          platform: 'facebook',
          author: 'Local Resident Group',
          followers: 12000,
          engagement: 450,
          verified: false
        },
        timestamp: new Date(),
        engagement_metrics: {
          likes: 85,
          shares: 22,
          comments: 15,
          reach: 1200
        },
        hashtags: ['#Development', '#LocalGov'],
        mentions: [],
        location: {
          coordinates: [18.5204, 73.8567],
          place_name: 'Coimbatore, Tamil Nadu'
        }
      }
    ];

    return this.simulateApiCall(mockPosts);
  }

  private async fetchInstagramPosts(): Promise<SocialPost[]> {
    // Mock Instagram API integration
    const mockPosts: SocialPost[] = [
      {
        id: `instagram_${Date.now()}_1`,
        content: `Healthcare facilities in rural areas need urgent attention. #HealthForAll #RuralHealth`,
        language: 'en',
        sentiment: {} as SentimentData,
        source: {
          platform: 'instagram',
          author: '@health_activist',
          followers: 8500,
          engagement: 320,
          verified: true
        },
        timestamp: new Date(),
        engagement_metrics: {
          likes: 245,
          shares: 18,
          comments: 42,
          reach: 3200
        },
        hashtags: ['#HealthForAll', '#RuralHealth'],
        mentions: [],
        location: {
          coordinates: [16.7050, 74.2433],
          place_name: 'Madurai, Tamil Nadu'
        }
      }
    ];

    return this.simulateApiCall(mockPosts);
  }

  private async fetchYoutubePosts(): Promise<SocialPost[]> {
    // Mock YouTube Data API integration
    const mockPosts: SocialPost[] = [
      {
        id: `youtube_${Date.now()}_1`,
        content: `शिक्षा व्यवस्था में सुधार की जरूरत है। सरकारी स्कूलों में बेहतर सुविधाएं चाहिए।`,
        language: 'hi',
        sentiment: {} as SentimentData,
        source: {
          platform: 'youtube',
          author: 'Education Reform Channel',
          followers: 25000,
          engagement: 680,
          verified: true
        },
        timestamp: new Date(),
        engagement_metrics: {
          likes: 456,
          shares: 89,
          comments: 67,
          reach: 8900
        },
        hashtags: ['#शिक्षा', '#सुधार', '#सरकारी_स्कूल'],
        mentions: [],
        location: {
          coordinates: [19.9975, 73.7898],
          place_name: 'Tiruchirappalli, Tamil Nadu'
        }
      }
    ];

    return this.simulateApiCall(mockPosts);
  }

  private async fetchNewsPosts(): Promise<SocialPost[]> {
    // Mock news API integration
    const mockPosts: SocialPost[] = [
      {
        id: `news_${Date.now()}_1`,
        content: `State government announces new employment scheme targeting youth. Expected to create 50,000 jobs in next 6 months.`,
        language: 'en',
        sentiment: {} as SentimentData,
        source: {
          platform: 'news',
          url: 'https://news.example.com/employment-scheme',
          author: 'Tamil Nadu Times',
          followers: 150000,
          engagement: 1200,
          verified: true
        },
        timestamp: new Date(),
        engagement_metrics: {
          likes: 890,
          shares: 234,
          comments: 156,
          reach: 15000
        },
        hashtags: ['#Employment', '#YouthJobs', '#GovernmentScheme'],
        mentions: [],
        location: {
          coordinates: [19.0760, 72.8777],
          place_name: 'Chennai, Tamil Nadu'
        }
      }
    ];

    return this.simulateApiCall(mockPosts);
  }

  // Trending topics analysis
  private updateTrendingTopics(posts: SocialPost[]): void {
    const keywordCounts = new Map<string, number>();
    const keywordSentiments = new Map<string, number[]>();
    
    posts.forEach(post => {
      // Extract keywords from hashtags and content
      const keywords = [
        ...post.hashtags,
        ...this.extractKeywords(post.content)
      ];

      keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
        
        if (!keywordSentiments.has(keyword)) {
          keywordSentiments.set(keyword, []);
        }
        keywordSentiments.get(keyword)!.push(post.sentiment.sentiment);
      });
    });

    // Update trending topics
    keywordCounts.forEach((volume, keyword) => {
      const sentiments = keywordSentiments.get(keyword) || [];
      const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      
      const existing = this.trendingTopics.get(keyword);
      const growthRate = existing 
        ? (volume - existing.volume) / existing.volume 
        : 1;

      this.trendingTopics.set(keyword, {
        keyword,
        volume,
        sentiment_score: avgSentiment,
        growth_rate: growthRate,
        platform_distribution: this.calculatePlatformDistribution(posts, keyword),
        first_detected: existing?.first_detected || new Date()
      });
    });

    // Clean old trending topics
    this.cleanOldTrendingTopics();
  }

  // Alert checking
  private checkForAlerts(posts: SocialPost[]): AlertData[] {
    const alerts: AlertData[] = [];

    // Volume spike alert
    const recentVolume = posts.length;
    if (recentVolume > this.config.alertThresholds.volume) {
      alerts.push({
        id: `volume_alert_${Date.now()}`,
        title: 'High Volume Detected',
        description: `Unusual spike in social media activity: ${recentVolume} posts in last interval`,
        severity: recentVolume > this.config.alertThresholds.volume * 2 ? 'high' : 'medium',
        type: 'volume_surge',
        timestamp: new Date(),
        metrics: {
          current_value: recentVolume,
          previous_value: this.config.alertThresholds.volume,
          change_percentage: ((recentVolume - this.config.alertThresholds.volume) / this.config.alertThresholds.volume) * 100,
          threshold: this.config.alertThresholds.volume
        },
        status: 'active'
      });
    }

    // Sentiment change alert
    const avgSentiment = posts.reduce((sum, post) => sum + post.sentiment.sentiment, 0) / posts.length;
    const sentimentThreshold = this.config.alertThresholds.sentiment_change;
    
    if (Math.abs(avgSentiment) > sentimentThreshold) {
      alerts.push({
        id: `sentiment_alert_${Date.now()}`,
        title: 'Significant Sentiment Change',
        description: `${avgSentiment > 0 ? 'Positive' : 'Negative'} sentiment spike detected`,
        severity: Math.abs(avgSentiment) > sentimentThreshold * 1.5 ? 'high' : 'medium',
        type: 'sentiment_spike',
        timestamp: new Date(),
        metrics: {
          current_value: avgSentiment,
          previous_value: 0,
          change_percentage: avgSentiment * 100,
          threshold: sentimentThreshold
        },
        status: 'active',
        recommendations: this.generateSentimentRecommendations(avgSentiment, posts)
      });
    }

    // Crisis keywords detection
    const crisisKeywords = ['protest', 'riot', 'violence', 'emergency', 'crisis', 'विरोध', 'दंगा', 'हिंसा'];
    const crisisPosts = posts.filter(post => 
      crisisKeywords.some(keyword => 
        post.content.toLowerCase().includes(keyword) || 
        post.hashtags.some(tag => tag.toLowerCase().includes(keyword))
      )
    );

    if (crisisPosts.length > 0) {
      alerts.push({
        id: `crisis_alert_${Date.now()}`,
        title: 'Potential Crisis Detected',
        description: `${crisisPosts.length} posts contain crisis-related keywords`,
        severity: 'critical',
        type: 'crisis_detected',
        timestamp: new Date(),
        metrics: {
          current_value: crisisPosts.length,
          previous_value: 0,
          change_percentage: 100,
          threshold: 1
        },
        status: 'active',
        recommendations: [
          'Monitor situation closely',
          'Prepare official statement',
          'Alert crisis management team',
          'Track sentiment evolution'
        ]
      });
    }

    return alerts;
  }

  // Utility methods
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return words;
  }

  private calculatePlatformDistribution(posts: SocialPost[], keyword: string): { [platform: string]: number } {
    const distribution: { [platform: string]: number } = {};
    
    posts.forEach(post => {
      if (post.hashtags.includes(keyword) || post.content.includes(keyword)) {
        distribution[post.source.platform] = (distribution[post.source.platform] || 0) + 1;
      }
    });
    
    return distribution;
  }

  private cleanOldTrendingTopics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    this.trendingTopics.forEach((topic, keyword) => {
      if (topic.first_detected.getTime() < cutoffTime && topic.volume < 10) {
        this.trendingTopics.delete(keyword);
      }
    });
  }

  private generateSentimentRecommendations(sentiment: number, posts: SocialPost[]): string[] {
    const recommendations = [];
    
    if (sentiment < -0.5) {
      recommendations.push('Address negative sentiment with targeted communication');
      recommendations.push('Identify root causes from post analysis');
      recommendations.push('Consider public response or clarification');
    } else if (sentiment > 0.5) {
      recommendations.push('Amplify positive sentiment through official channels');
      recommendations.push('Engage with positive influencers');
      recommendations.push('Share success stories related to trending topics');
    }
    
    return recommendations;
  }

  private async simulateApiCall<T>(data: T): Promise<T> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return data;
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Public methods for external access
  getTrendingTopics(): TrendingTopic[] {
    return Array.from(this.trendingTopics.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }

  getRecentPosts(limit: number = 100): SocialPost[] {
    return Array.from(this.postsCache.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  searchPosts(query: string): SocialPost[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.postsCache.values())
      .filter(post => 
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        post.mentions.some(mention => mention.toLowerCase().includes(lowercaseQuery))
      );
  }

  getInfluencers(): MediaSource[] {
    const influencerMap = new Map<string, MediaSource>();
    
    this.postsCache.forEach(post => {
      const source = post.source;
      const key = `${source.platform}_${source.author}`;
      
      if (!influencerMap.has(key) || 
          (influencerMap.get(key)!.engagement || 0) < source.engagement) {
        influencerMap.set(key, source);
      }
    });
    
    return Array.from(influencerMap.values())
      .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
      .slice(0, 50);
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

// Export default configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  platforms: ['twitter', 'facebook', 'instagram', 'youtube', 'news'],
  keywords: [
    'தமிழ்நாடு', 'Tamil Nadu', 'சென்னை', 'Chennai', 'கோயம்புத்தூர்', 'Coimbatore',
    'வேலைவாய்ப்பு', 'employment', 'jobs', 'கல்வி', 'education',
    'சுகாதாரம்', 'health', 'தண்ணீர்', 'water', 'infrastructure', 'development'
  ],
  hashtags: [
    '#TamilNadu', '#Chennai', '#Coimbatore', '#Water', '#Development',
    '#Education', '#Health', '#Jobs', '#Infrastructure'
  ],
  candidates: [
    'candidate1', 'candidate2', 'party1', 'party2'
  ],
  refreshInterval: 30000, // 30 seconds
  alertThresholds: {
    volume: 50,
    sentiment_change: 0.3,
    engagement: 1000
  }
};