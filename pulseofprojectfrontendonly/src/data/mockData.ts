import { SentimentData, TrendData, CompetitorData, HeatmapData, InfluencerData, AlertData } from '../types';

export const mockSentimentData: SentimentData[] = [
  { issue: 'Jobs', sentiment: 0.65, polarity: 'positive', intensity: 0.8, emotion: 'hope', confidence: 0.85, language: 'en', source: 'social_media', timestamp: new Date() },
  { issue: 'Infrastructure', sentiment: 0.52, polarity: 'neutral', intensity: 0.6, emotion: 'trust', confidence: 0.78, language: 'en', source: 'social_media', timestamp: new Date() },
  { issue: 'Health', sentiment: 0.72, polarity: 'positive', intensity: 0.9, emotion: 'trust', confidence: 0.92, language: 'en', source: 'social_media', timestamp: new Date() },
  { issue: 'Education', sentiment: 0.58, polarity: 'neutral', intensity: 0.7, emotion: 'hope', confidence: 0.81, language: 'en', source: 'social_media', timestamp: new Date() },
  { issue: 'Law & Order', sentiment: 0.54, polarity: 'neutral', intensity: 0.6, emotion: 'fear', confidence: 0.75, language: 'en', source: 'social_media', timestamp: new Date() }
];

export const mockTrendData: TrendData[] = [
  { date: '2024-01', jobs: 0.55, infrastructure: 0.45, health: 0.62, education: 0.48, lawOrder: 0.52 },
  { date: '2024-02', jobs: 0.58, infrastructure: 0.52, health: 0.58, education: 0.55, lawOrder: 0.48 },
  { date: '2024-03', jobs: 0.62, infrastructure: 0.48, health: 0.65, education: 0.52, lawOrder: 0.55 },
  { date: '2024-04', jobs: 0.68, infrastructure: 0.55, health: 0.68, education: 0.58, lawOrder: 0.52 },
  { date: '2024-05', jobs: 0.72, infrastructure: 0.58, health: 0.72, education: 0.62, lawOrder: 0.58 },
  { date: '2024-06', jobs: 0.78, infrastructure: 0.62, health: 0.75, education: 0.65, lawOrder: 0.55 },
  { date: '2024-07', jobs: 0.75, infrastructure: 0.65, health: 0.78, education: 0.68, lawOrder: 0.58 },
  { date: '2024-08', jobs: 0.68, infrastructure: 0.68, health: 0.72, education: 0.62, lawOrder: 0.52 },
  { date: '2024-09', jobs: 0.72, infrastructure: 0.62, health: 0.68, education: 0.58, lawOrder: 0.48 },
  { date: '2024-10', jobs: 0.65, infrastructure: 0.58, health: 0.65, education: 0.55, lawOrder: 0.52 }
];

export const mockCompetitorData: CompetitorData[] = [
  { issue: 'Jobs', candidateA: 0.62, candidateB: 0.48 },
  { issue: 'Infrastructure', candidateA: 0.55, candidateB: 0.45 },
  { issue: 'Health', candidateA: 0.68, candidateB: 0.58 },
  { issue: 'Education', candidateA: 0.58, candidateB: 0.52 },
  { issue: 'Law & Order', candidateA: 0.52, candidateB: 0.42 }
];

export const mockHeatmapData: HeatmapData[] = [
  { ward: 'Ward 1', issue: 'Jobs', sentiment: 0.7 },
  { ward: 'Ward 1', issue: 'Infrastructure', sentiment: 0.6 },
  { ward: 'Ward 1', issue: 'Health', sentiment: 0.8 },
  { ward: 'Ward 1', issue: 'Education', sentiment: 0.5 },
  { ward: 'Ward 1', issue: 'Law & Order', sentiment: 0.4 },
  { ward: 'Ward 2', issue: 'Jobs', sentiment: 0.6 },
  { ward: 'Ward 2', issue: 'Infrastructure', sentiment: 0.8 },
  { ward: 'Ward 2', issue: 'Health', sentiment: 0.7 },
  { ward: 'Ward 2', issue: 'Education', sentiment: 0.6 },
  { ward: 'Ward 2', issue: 'Law & Order', sentiment: 0.3 },
  { ward: 'Ward 3', issue: 'Jobs', sentiment: 0.8 },
  { ward: 'Ward 3', issue: 'Infrastructure', sentiment: 0.9 },
  { ward: 'Ward 3', issue: 'Health', sentiment: 0.6 },
  { ward: 'Ward 3', issue: 'Education', sentiment: 0.7 },
  { ward: 'Ward 3', issue: 'Law & Order', sentiment: 0.5 },
  { ward: 'Ward 4', issue: 'Jobs', sentiment: 0.5 },
  { ward: 'Ward 4', issue: 'Infrastructure', sentiment: 0.7 },
  { ward: 'Ward 4', issue: 'Health', sentiment: 0.9 },
  { ward: 'Ward 4', issue: 'Education', sentiment: 0.8 },
  { ward: 'Ward 4', issue: 'Law & Order', sentiment: 0.4 },
  { ward: 'Ward 5', issue: 'Jobs', sentiment: 0.4 },
  { ward: 'Ward 5', issue: 'Infrastructure', sentiment: 0.6 },
  { ward: 'Ward 5', issue: 'Health', sentiment: 0.8 },
  { ward: 'Ward 5', issue: 'Education', sentiment: 0.9 },
  { ward: 'Ward 5', issue: 'Law & Order', sentiment: 0.7 }
];

export const mockInfluencerData: InfluencerData[] = [
  { id: '1', name: 'Dr. Rajesh Kumar', type: 'positive', engagement: 85, reach: 25000, platform: 'Twitter' },
  { id: '2', name: 'Priya Sharma', type: 'neutral', engagement: 72, reach: 18000, platform: 'Instagram' },
  { id: '3', name: 'Anil Singh', type: 'critical', engagement: 65, reach: 32000, platform: 'Facebook' },
  { id: '4', name: 'Meera Patel', type: 'positive', engagement: 78, reach: 22000, platform: 'YouTube' },
  { id: '5', name: 'Rohit Gupta', type: 'neutral', engagement: 68, reach: 15000, platform: 'LinkedIn' }
];

export const mockAlertData: AlertData[] = [
  {
    id: '1',
    title: 'Youth Unemployment Concerns Surge',
    description: 'Negative sentiment about jobs increased by 18% in Ward 5',
    severity: 'high',
    timestamp: new Date('2024-08-15T10:30:00'),
    ward: 'Ward 5',
    issue: 'Jobs'
  },
  {
    id: '2',
    title: 'Infrastructure Satisfaction Rising',
    description: 'Positive mentions of road development up 25%',
    severity: 'medium',
    timestamp: new Date('2024-08-15T08:15:00'),
    issue: 'Infrastructure'
  },
  {
    id: '3',
    title: 'Healthcare Discussion Peak',
    description: 'Healthcare-related conversations increased by 40%',
    severity: 'low',
    timestamp: new Date('2024-08-14T16:45:00'),
    issue: 'Health'
  }
];

export const overallSentimentDistribution = {
  positive: 40,
  negative: 20,
  neutral: 30,
  mixed: 10
};

export const issueImportanceShare = {
  Jobs: 25,
  Infrastructure: 20,
  Health: 15,
  Education: 25,
  'Law & Order': 15
};