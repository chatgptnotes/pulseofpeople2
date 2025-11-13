export interface SentimentData {
  issue: string;
  sentiment: number;
  polarity: 'positive' | 'negative' | 'neutral';
  intensity: number;
  emotion?: 'anger' | 'trust' | 'fear' | 'hope' | 'pride' | 'joy' | 'sadness' | 'surprise' | 'disgust';
  confidence: number;
  language: 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'gu' | 'kn' | 'ml' | 'or' | 'pa';
  source: 'social_media' | 'survey' | 'field_report' | 'news' | 'direct_feedback';
  timestamp: Date;
  location?: {
    state: string;
    district?: string;
    ward?: string;
    coordinates?: [number, number];
  };
  demographic?: {
    age_group?: '18-25' | '26-35' | '36-45' | '46-55' | '55+';
    gender?: 'male' | 'female' | 'other';
    education?: 'primary' | 'secondary' | 'graduate' | 'postgraduate';
    income?: 'low' | 'middle' | 'high';
  };
}

export interface TrendData {
  date: string;
  jobs: number;
  infrastructure: number;
  health: number;
  education: number;
  lawOrder: number;
}

export interface CompetitorData {
  issue: string;
  candidateA: number;
  candidateB: number;
}

export interface HeatmapData {
  ward: string;
  issue: string;
  sentiment: number;
}

export interface InfluencerData {
  id: string;
  name: string;
  type: 'positive' | 'neutral' | 'critical';
  engagement: number;
  reach: number;
  platform: string;
}

export interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'sentiment_spike' | 'volume_surge' | 'crisis_detected' | 'trend_change' | 'competitor_activity';
  timestamp: Date;
  ward?: string;
  issue?: string;
  metrics: {
    current_value: number;
    previous_value: number;
    change_percentage: number;
    threshold: number;
  };
  recommendations?: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  assignee?: string;
  resolution_notes?: string;
}

export interface MediaSource {
  platform: 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp' | 'news' | 'blog';
  url?: string;
  author: string;
  followers?: number;
  engagement: number;
  verified?: boolean;
}

export interface SocialPost {
  id: string;
  content: string;
  language: string;
  sentiment: SentimentData;
  source: MediaSource;
  timestamp: Date;
  engagement_metrics: {
    likes: number;
    shares: number;
    comments: number;
    reach?: number;
  };
  hashtags: string[];
  mentions: string[];
  location?: {
    coordinates: [number, number];
    place_name: string;
  };
}

export interface TrendingTopic {
  keyword: string;
  volume: number;
  growth_rate: number;
  sentiment_score: number;
  related_posts: string[];
  last_updated: Date;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_date: Date;
  target_demographics?: {
    age_groups: string[];
    locations: string[];
    sample_size: number;
  };
  results_summary?: {
    response_rate: number;
    confidence_level: number;
    margin_of_error: number;
  };
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'yes_no';
  options?: string[];
  required: boolean;
  sentiment_analysis?: boolean;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_id: string;
  answers: { [question_id: string]: any };
  submitted_date: Date;
  location?: string;
  demographic_info?: {
    age_group: string;
    gender: string;
    education: string;
  };
}

export interface Recommendation {
  id: string;
  type: 'event' | 'messaging' | 'resource_allocation' | 'outreach' | 'crisis_response';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence_score: number;
  rationale: string;
  suggested_actions: string[];
  estimated_impact: 'low' | 'medium' | 'high';
  timeline: string;
  resources_required?: string[];
  target_audience?: string[];
  location?: string;
  generated_date: Date;
  status: 'pending' | 'reviewed' | 'approved' | 'implemented' | 'rejected';
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'coordinator' | 'surveyor' | 'social_monitor' | 'truth_team' | 'data_collector';
  assigned_area: {
    state: string;
    district?: string;
    ward?: string;
  };
  performance_metrics: {
    reports_submitted: number;
    accuracy_score: number;
    last_active: Date;
    total_hours: number;
  };
  skills: string[];
  status: 'active' | 'inactive' | 'suspended';
  joined_date: Date;
}

export interface FieldReport {
  id: string;
  volunteer_id: string;
  timestamp: Date;
  location: {
    coordinates: [number, number];
    address: string;
    ward: string;
  };
  report_type: 'daily_summary' | 'event_feedback' | 'issue_report' | 'competitor_activity';
  content: {
    positive_reactions: string[];
    negative_reactions: string[];
    key_issues: string[];
    crowd_size?: number;
    media_attachments?: string[];
    quotes?: string[];
  };
  verification_status: 'pending' | 'verified' | 'disputed';
  verified_by?: string;
  sentiment_analysis?: SentimentData;
}

// Voter Call & Sentiment Analysis Types (ElevenLabs Integration)

export interface CallCampaign {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  total_calls: number;
  completed_calls: number;
  successful_calls: number;
  failed_calls: number;
  max_concurrent_calls: number;
  scheduled_start?: Date;
  started_at?: Date;
  completed_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VoterCall {
  id: string;
  organization_id: string;
  campaign_id?: string;
  voter_id?: string;

  // Call details
  call_id?: string; // ElevenLabs call ID
  phone_number: string;
  voter_name?: string;

  // Call status and metadata
  status: 'pending' | 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'no_answer' | 'busy';
  duration_seconds?: number;
  call_started_at?: Date;
  call_ended_at?: Date;

  // Transcript
  transcript?: string;
  transcript_fetched_at?: Date;

  // ElevenLabs metadata
  elevenlabs_agent_id?: string;
  elevenlabs_metadata?: Record<string, any>;
  error_message?: string;

  // Audit fields
  created_by?: string;
  created_at: Date;
  updated_at: Date;

  // Joined data (not in DB)
  sentiment_analysis?: CallSentimentAnalysis;
  campaign?: CallCampaign;
}

export interface CallSentimentAnalysis {
  id: string;
  call_id: string;
  organization_id: string;

  // Sentiment about previous government
  previous_govt_sentiment?: 'positive' | 'negative' | 'neutral' | 'not_mentioned';
  previous_govt_score?: number; // -1 to 1
  previous_govt_keywords?: string[];
  previous_govt_summary?: string;

  // Sentiment about TVK (Vijay's party)
  tvk_sentiment?: 'support' | 'against' | 'undecided' | 'not_mentioned';
  tvk_score?: number; // -1 to 1
  tvk_keywords?: string[];
  tvk_summary?: string;

  // Key issues discussed
  key_issues?: Array<{
    issue: string;
    sentiment: string;
    importance: number;
  }>;
  top_concerns?: string[];

  // Voting intention
  voting_intention?: string; // Party name or 'undecided'
  voting_confidence?: 'very_confident' | 'confident' | 'unsure' | 'not_mentioned';

  // Overall analysis
  overall_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  overall_summary?: string;

  // Analysis metadata
  analyzed_at: Date;
  analysis_model?: string;
  confidence_score?: number; // 0 to 1

  created_at: Date;
  updated_at: Date;
}

export interface CallCSVUpload {
  id: string;
  organization_id: string;
  campaign_id?: string;

  filename: string;
  file_size?: number;
  total_rows?: number;
  valid_rows?: number;
  invalid_rows?: number;

  uploaded_by?: string;
  uploaded_at: Date;
  processed_at?: Date;
}

// ElevenLabs API Types

export interface ElevenLabsCallRequest {
  agent_id: string;
  phone_number: string;
  metadata?: Record<string, any>;
}

export interface ElevenLabsCallResponse {
  call_id: string;
  status: string;
  message?: string;
}

export interface ElevenLabsTranscript {
  call_id: string;
  transcript: string;
  duration_seconds: number;
  status: string;
  metadata?: Record<string, any>;
}

// UI Component Types

export interface CallListFilters {
  status?: VoterCall['status'][];
  campaign_id?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
  sentiment?: CallSentimentAnalysis['overall_sentiment'][];
}

export interface SentimentStats {
  total_calls: number;
  analyzed_calls: number;

  previous_govt: {
    positive: number;
    negative: number;
    neutral: number;
    not_mentioned: number;
  };

  tvk: {
    support: number;
    against: number;
    undecided: number;
    not_mentioned: number;
  };

  voting_intention: Record<string, number>;

  top_issues: Array<{
    issue: string;
    count: number;
    avg_sentiment: number;
  }>;
}

export interface CallAnalytics {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  avg_duration: number;
  total_duration: number;
  sentiment_stats: SentimentStats;
  by_date: Array<{
    date: string;
    calls: number;
    successful: number;
    failed: number;
  }>;
  by_constituency?: Record<string, number>;
}