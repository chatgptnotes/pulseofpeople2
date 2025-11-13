import { SentimentData, SocialPost, FieldReport } from '../types';

export interface SentimentAnalysisConfig {
  enableEmotionDetection: boolean;
  supportedLanguages: string[];
  confidenceThreshold: number;
  useAdvancedNLP: boolean;
}

export class SentimentAnalysisEngine {
  private config: SentimentAnalysisConfig;
  private modelCache: Map<string, any> = new Map();

  constructor(config: SentimentAnalysisConfig) {
    this.config = config;
  }

  // Language detection for Indian languages
  async detectLanguage(text: string): Promise<string> {
    // Implement language detection logic
    const hindiPattern = /[\u0900-\u097F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const marathiPattern = /[\u0900-\u097F]/; // Same as Hindi, need context
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    
    if (hindiPattern.test(text)) return 'hi';
    if (bengaliPattern.test(text)) return 'bn';
    if (tamilPattern.test(text)) return 'ta';
    if (teluguPattern.test(text)) return 'te';
    if (gujaratiPattern.test(text)) return 'gu';
    
    return 'en'; // Default to English
  }

  // Enhanced sentiment analysis with emotion detection
  async analyzeSentiment(text: string, language?: string): Promise<SentimentData> {
    const detectedLanguage = language || await this.detectLanguage(text);
    
    // Mock implementation - replace with actual ML model
    const sentiment = this.calculateSentiment(text, detectedLanguage);
    const emotion = this.detectEmotion(text, detectedLanguage);
    const intensity = this.calculateIntensity(text);
    const confidence = this.calculateConfidence(text, sentiment);

    return {
      issue: this.extractMainIssue(text),
      sentiment: sentiment.score,
      polarity: sentiment.polarity,
      intensity,
      emotion,
      confidence,
      language: detectedLanguage as any,
      source: 'social_media',
      timestamp: new Date()
    };
  }

  // Batch processing for multiple texts
  async analyzeBatch(texts: string[]): Promise<SentimentData[]> {
    const results = await Promise.all(
      texts.map(text => this.analyzeSentiment(text))
    );
    return results;
  }

  // Analyze social media post
  async analyzeSocialPost(post: SocialPost): Promise<SentimentData> {
    const sentiment = await this.analyzeSentiment(post.content, post.language);
    
    return {
      ...sentiment,
      source: 'social_media',
      location: post.location ? {
        state: this.getStateFromCoordinates(post.location.coordinates),
        coordinates: post.location.coordinates
      } : undefined
    };
  }

  // Analyze field report
  async analyzeFieldReport(report: FieldReport): Promise<SentimentData[]> {
    const allContent = [
      ...report.content.positive_reactions,
      ...report.content.negative_reactions,
      ...report.content.key_issues,
      ...(report.content.quotes || [])
    ];

    const sentiments = await this.analyzeBatch(allContent);
    
    return sentiments.map(sentiment => ({
      ...sentiment,
      source: 'field_report' as const,
      location: {
        state: this.getStateFromWard(report.location.ward),
        ward: report.location.ward,
        coordinates: report.location.coordinates
      }
    }));
  }

  // Trend analysis
  analyzeTrends(sentiments: SentimentData[], timeWindow: 'hour' | 'day' | 'week'): any {
    const grouped = this.groupByTime(sentiments, timeWindow);
    
    return {
      overall_trend: this.calculateTrend(grouped),
      issue_trends: this.calculateIssueTrends(grouped),
      emotion_trends: this.calculateEmotionTrends(grouped),
      geographic_trends: this.calculateGeographicTrends(grouped)
    };
  }

  // Anomaly detection
  detectAnomalies(sentiments: SentimentData[]): any[] {
    const baseline = this.calculateBaseline(sentiments);
    const anomalies = [];

    // Detect sentiment spikes
    const recentSentiments = sentiments.filter(s => 
      Date.now() - s.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    for (const issue of this.getUniqueIssues(sentiments)) {
      const issueSentiments = recentSentiments.filter(s => s.issue === issue);
      const avgSentiment = issueSentiments.reduce((sum, s) => sum + s.sentiment, 0) / issueSentiments.length;
      
      if (Math.abs(avgSentiment - baseline[issue]) > 0.3) {
        anomalies.push({
          type: 'sentiment_spike',
          issue,
          current_value: avgSentiment,
          baseline_value: baseline[issue],
          severity: Math.abs(avgSentiment - baseline[issue]) > 0.5 ? 'high' : 'medium'
        });
      }
    }

    return anomalies;
  }

  // Private helper methods
  private calculateSentiment(text: string, language: string): { score: number; polarity: 'positive' | 'negative' | 'neutral' } {
    // Implement actual sentiment calculation
    // This is a simplified mock
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy', 'अच्छा', 'ভাল', 'நல்ல'];
    const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'sad', 'बुरा', 'খারাপ', 'கெட்ட'];
    
    const words = text.toLowerCase().split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    let polarity: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.1) polarity = 'positive';
    if (score < -0.1) polarity = 'negative';
    
    return { score, polarity };
  }

  private detectEmotion(text: string, language: string): 'anger' | 'trust' | 'fear' | 'hope' | 'pride' | 'joy' | 'sadness' | 'surprise' | 'disgust' | undefined {
    // Implement emotion detection
    const emotionKeywords = {
      anger: ['angry', 'furious', 'mad', 'गुस्सा', 'রাগ', 'கோபம்'],
      trust: ['trust', 'believe', 'faith', 'विश्वास', 'বিশ্বাস', 'நம்பிக்கை'],
      fear: ['afraid', 'scared', 'worry', 'डर', 'ভয়', 'பயம்'],
      hope: ['hope', 'optimistic', 'positive', 'आशा', 'আশা', 'நம்பிக்கை'],
      pride: ['proud', 'achievement', 'गर्व', 'গর্ব', 'பெருமை'],
      joy: ['happy', 'joyful', 'excited', 'खुश', 'আনন্দ', 'மகிழ்ச்சி'],
      sadness: ['sad', 'depressed', 'upset', 'दुखी', 'দুঃখ', 'துக்கம்'],
      surprise: ['surprised', 'shocked', 'amazed', 'आश्चर्य', 'অবাক', 'ஆச்சரியம்'],
      disgust: ['disgusted', 'revolting', 'awful', 'घृणा', 'ঘৃণা', 'வெறுப்பு']
    };

    const words = text.toLowerCase().split(' ');
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return emotion as any;
      }
    }
    
    return undefined;
  }

  private calculateIntensity(text: string): number {
    // Calculate sentiment intensity based on text features
    const intensifiers = ['very', 'extremely', 'completely', 'totally', 'बहुत', 'খুব', 'மிகவும்'];
    const words = text.toLowerCase().split(' ');
    
    let intensity = 0.5; // Base intensity
    
    // Check for intensifiers
    intensifiers.forEach(intensifier => {
      if (words.includes(intensifier)) intensity += 0.2;
    });
    
    // Check for punctuation
    if (text.includes('!')) intensity += 0.1;
    if (text.includes('!!')) intensity += 0.2;
    if (text.includes('???')) intensity += 0.1;
    
    // Check for caps
    if (text === text.toUpperCase()) intensity += 0.3;
    
    return Math.min(1, intensity);
  }

  private calculateConfidence(text: string, sentiment: any): number {
    // Calculate confidence score based on text clarity and length
    const words = text.split(' ').length;
    let confidence = 0.5;
    
    // More words generally mean higher confidence
    if (words > 10) confidence += 0.2;
    if (words > 20) confidence += 0.2;
    
    // Clear sentiment indicators increase confidence
    if (Math.abs(sentiment.score) > 0.3) confidence += 0.2;
    
    return Math.min(1, confidence);
  }

  private extractMainIssue(text: string): string {
    // Extract main issue/topic from text
    const issueKeywords = {
      'jobs': ['job', 'employment', 'unemployment', 'work', 'career', 'नौकरी', 'কাজ', 'வேலை'],
      'infrastructure': ['road', 'bridge', 'transport', 'infrastructure', 'सड़क', 'রাস্তা', 'சாலை'],
      'health': ['health', 'hospital', 'medicine', 'doctor', 'स्वास्थ्य', 'স্বাস্থ্য', 'ஆரோக்கியம்'],
      'education': ['education', 'school', 'college', 'teacher', 'शिक्षा', 'শিক্ষা', 'கல்வி'],
      'law_order': ['police', 'crime', 'safety', 'security', 'पुलिस', 'পুলিশ', 'காவல்துறை']
    };

    const words = text.toLowerCase().split(' ');
    
    for (const [issue, keywords] of Object.entries(issueKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return issue;
      }
    }
    
    return 'general';
  }

  private getStateFromCoordinates(coordinates: [number, number]): string {
    // Implement coordinate to state mapping
    // This would use a proper geolocation service
    return 'Tamil Nadu'; // Placeholder
  }

  private getStateFromWard(ward: string): string {
    // Extract state from ward information
    return 'Tamil Nadu'; // Placeholder
  }

  private groupByTime(sentiments: SentimentData[], timeWindow: string): any {
    // Group sentiments by time window
    const grouped = new Map();
    
    sentiments.forEach(sentiment => {
      const key = this.getTimeKey(sentiment.timestamp, timeWindow);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(sentiment);
    });
    
    return grouped;
  }

  private getTimeKey(date: Date, window: string): string {
    const d = new Date(date);
    switch (window) {
      case 'hour':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case 'day':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case 'week':
        const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      default:
        return date.toISOString();
    }
  }

  private calculateTrend(grouped: Map<string, SentimentData[]>): any {
    // Calculate overall trend
    const timePoints = Array.from(grouped.keys()).sort();
    const values = timePoints.map(key => {
      const sentiments = grouped.get(key) || [];
      return sentiments.reduce((sum, s) => sum + s.sentiment, 0) / sentiments.length;
    });
    
    if (values.length < 2) return { direction: 'stable', slope: 0 };
    
    const slope = (values[values.length - 1] - values[0]) / values.length;
    const direction = slope > 0.05 ? 'improving' : slope < -0.05 ? 'declining' : 'stable';
    
    return { direction, slope, values };
  }

  private calculateIssueTrends(grouped: Map<string, SentimentData[]>): any {
    // Calculate trends by issue
    const issues = new Set<string>();
    grouped.forEach(sentiments => {
      sentiments.forEach(s => issues.add(s.issue));
    });
    
    const trends = {};
    issues.forEach(issue => {
      const issueData = new Map();
      grouped.forEach((sentiments, key) => {
        const issueSentiments = sentiments.filter(s => s.issue === issue);
        if (issueSentiments.length > 0) {
          const avg = issueSentiments.reduce((sum, s) => sum + s.sentiment, 0) / issueSentiments.length;
          issueData.set(key, avg);
        }
      });
      trends[issue] = this.calculateTrend(new Map([[...issueData.entries()].map(([k, v]) => [k, [{sentiment: v} as SentimentData]])]));
    });
    
    return trends;
  }

  private calculateEmotionTrends(grouped: Map<string, SentimentData[]>): any {
    // Calculate emotion distribution over time
    const emotions = ['anger', 'trust', 'fear', 'hope', 'pride', 'joy', 'sadness', 'surprise', 'disgust'];
    const trends = {};
    
    emotions.forEach(emotion => {
      const emotionData = [];
      grouped.forEach(sentiments => {
        const emotionCount = sentiments.filter(s => s.emotion === emotion).length;
        const total = sentiments.length;
        emotionData.push(total > 0 ? emotionCount / total : 0);
      });
      trends[emotion] = emotionData;
    });
    
    return trends;
  }

  private calculateGeographicTrends(grouped: Map<string, SentimentData[]>): any {
    // Calculate geographic distribution of sentiment
    const states = new Set<string>();
    grouped.forEach(sentiments => {
      sentiments.forEach(s => {
        if (s.location?.state) states.add(s.location.state);
      });
    });
    
    const trends = {};
    states.forEach(state => {
      const stateData = [];
      grouped.forEach(sentiments => {
        const stateSentiments = sentiments.filter(s => s.location?.state === state);
        if (stateSentiments.length > 0) {
          const avg = stateSentiments.reduce((sum, s) => sum + s.sentiment, 0) / stateSentiments.length;
          stateData.push(avg);
        } else {
          stateData.push(null);
        }
      });
      trends[state] = stateData;
    });
    
    return trends;
  }

  private calculateBaseline(sentiments: SentimentData[]): any {
    // Calculate baseline sentiment for each issue
    const baseline = {};
    const issues = this.getUniqueIssues(sentiments);
    
    issues.forEach(issue => {
      const issueSentiments = sentiments.filter(s => s.issue === issue);
      baseline[issue] = issueSentiments.reduce((sum, s) => sum + s.sentiment, 0) / issueSentiments.length;
    });
    
    return baseline;
  }

  private getUniqueIssues(sentiments: SentimentData[]): string[] {
    return [...new Set(sentiments.map(s => s.issue))];
  }
}

// Export singleton instance
export const sentimentEngine = new SentimentAnalysisEngine({
  enableEmotionDetection: true,
  supportedLanguages: ['en', 'hi', 'bn', 'mr', 'ta', 'te', 'gu', 'kn', 'ml', 'or', 'pa'],
  confidenceThreshold: 0.6,
  useAdvancedNLP: true
});