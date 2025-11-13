-- News Sentiment Analysis Tables
-- Migration for storing news articles and TVK sentiment reports

-- =====================================================
-- 1. NEWS ARTICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Article Basic Information
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  image_url TEXT,

  -- Source Information
  source VARCHAR(200) NOT NULL,
  author VARCHAR(200),
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Geographic Relevance
  state_id UUID REFERENCES states(id),
  district_id UUID REFERENCES districts(id),
  constituency_id UUID REFERENCES constituencies(id),

  -- Language and Category
  language VARCHAR(10) DEFAULT 'ta', -- Tamil by default
  category VARCHAR(100),
  tags TEXT[],

  -- Sentiment Analysis Results
  sentiment_score FLOAT, -- -1 (negative) to 1 (positive)
  sentiment_polarity VARCHAR(20), -- 'positive', 'negative', 'neutral'
  emotion VARCHAR(50), -- anger, joy, trust, fear, etc.
  confidence FLOAT, -- 0 to 1
  analyzed_at TIMESTAMPTZ,

  -- TVK Party Specific Analysis
  tvk_mentioned BOOLEAN DEFAULT false,
  tvk_mention_count INTEGER DEFAULT 0,
  tvk_context TEXT, -- How TVK is mentioned in the article
  tvk_sentiment_score FLOAT, -- TVK-specific sentiment (-1 to 1)
  tvk_sentiment_polarity VARCHAR(20), -- TVK-specific polarity

  -- Article Metadata
  word_count INTEGER,
  reading_time_minutes INTEGER,
  credibility_score FLOAT, -- 0 to 1
  is_verified BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_news_articles_org ON news_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_tvk_mentioned ON news_articles(tvk_mentioned) WHERE tvk_mentioned = true;
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment_polarity);
CREATE INDEX IF NOT EXISTS idx_news_articles_state ON news_articles(state_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_district ON news_articles(district_id);

-- Full text search on title and content
CREATE INDEX IF NOT EXISTS idx_news_articles_search ON news_articles USING gin(to_tsvector('english', title || ' ' || content));

-- =====================================================
-- 2. TVK SENTIMENT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tvk_sentiment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Report Period
  report_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Article Statistics
  total_articles INTEGER DEFAULT 0,
  tvk_mentioned_articles INTEGER DEFAULT 0,
  analyzed_articles INTEGER DEFAULT 0,

  -- Overall TVK Sentiment
  overall_sentiment_score FLOAT, -- -1 to 1
  overall_sentiment_polarity VARCHAR(20), -- positive, negative, neutral
  sentiment_confidence FLOAT, -- 0 to 1

  -- Sentiment Distribution
  positive_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,

  positive_percentage FLOAT DEFAULT 0,
  neutral_percentage FLOAT DEFAULT 0,
  negative_percentage FLOAT DEFAULT 0,

  -- Emotion Analysis
  dominant_emotion VARCHAR(50),
  emotion_scores JSONB, -- {anger: 0.2, joy: 0.5, trust: 0.8, etc.}

  -- Source Breakdown
  source_distribution JSONB, -- {source1: count, source2: count, etc.}
  top_sources TEXT[],

  -- Geographic Distribution
  state_distribution JSONB,
  district_distribution JSONB,

  -- Key Topics and Keywords
  trending_topics TEXT[],
  top_keywords TEXT[],
  tvk_contexts TEXT[], -- Common contexts in which TVK is mentioned

  -- Sentiment Trend
  sentiment_change FLOAT, -- Change from previous period
  trend_direction VARCHAR(20), -- improving, declining, stable

  -- Alert Indicators
  has_crisis BOOLEAN DEFAULT false,
  has_anomaly BOOLEAN DEFAULT false,
  alert_level VARCHAR(20) DEFAULT 'normal', -- normal, warning, critical
  alert_message TEXT,

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for TVK sentiment reports
CREATE INDEX IF NOT EXISTS idx_tvk_reports_org ON tvk_sentiment_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_tvk_reports_date ON tvk_sentiment_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_tvk_reports_period ON tvk_sentiment_reports(period_type, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_tvk_reports_sentiment ON tvk_sentiment_reports(overall_sentiment_polarity);

-- =====================================================
-- 3. NEWS SOURCES TABLE (for managing news outlets)
-- =====================================================
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Source Information
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50),
  url TEXT,
  rss_feed_url TEXT,

  -- Source Characteristics
  language VARCHAR(10) DEFAULT 'ta',
  region VARCHAR(100), -- Tamil Nadu, India, etc.
  source_type VARCHAR(50) DEFAULT 'news', -- news, blog, magazine, etc.

  -- Credibility and Status
  credibility_score FLOAT DEFAULT 0.5, -- 0 to 1
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,

  -- Statistics
  total_articles_fetched INTEGER DEFAULT 0,
  last_fetched_at TIMESTAMPTZ,

  -- Configuration
  fetch_frequency_minutes INTEGER DEFAULT 60, -- How often to check this source
  priority_level INTEGER DEFAULT 1, -- 1 (low) to 5 (high)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for news sources
CREATE INDEX IF NOT EXISTS idx_news_sources_org ON news_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_news_sources_name ON news_sources(name);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tvk_sentiment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;

-- News Articles Policies
CREATE POLICY "Users can view news articles for their organization"
  ON news_articles FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can insert news articles for their organization"
  ON news_articles FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can update news articles for their organization"
  ON news_articles FOR UPDATE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can delete news articles for their organization"
  ON news_articles FOR DELETE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- TVK Sentiment Reports Policies
CREATE POLICY "Users can view TVK reports for their organization"
  ON tvk_sentiment_reports FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can insert TVK reports for their organization"
  ON tvk_sentiment_reports FOR INSERT
  WITH CHECK (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can update TVK reports for their organization"
  ON tvk_sentiment_reports FOR UPDATE
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- News Sources Policies
CREATE POLICY "Users can view news sources for their organization"
  ON news_sources FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Admins can manage news sources"
  ON news_sources FOR ALL
  USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_sources_updated_at
  BEFORE UPDATE ON news_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. SEED DATA - Default News Sources for Tamil Nadu
-- =====================================================

-- Insert default Tamil Nadu news sources
-- Note: Using a specific organization_id (TVK org) - adjust as needed
INSERT INTO news_sources (organization_id, name, short_name, url, language, region, credibility_score, is_verified)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dinamalar', 'Dinamalar', 'https://www.dinamalar.com', 'ta', 'Tamil Nadu', 0.85, true),
  ('11111111-1111-1111-1111-111111111111', 'Dinakaran', 'Dinakaran', 'https://www.dinakaran.com', 'ta', 'Tamil Nadu', 0.80, true),
  ('11111111-1111-1111-1111-111111111111', 'The Hindu Tamil', 'Hindu Tamil', 'https://tamil.thehindu.com', 'ta', 'Tamil Nadu', 0.90, true),
  ('11111111-1111-1111-1111-111111111111', 'Puthiya Thalaimurai', 'Puthiya Thalaimurai', 'https://www.puthiyathalaimurai.com', 'ta', 'Tamil Nadu', 0.82, true),
  ('11111111-1111-1111-1111-111111111111', 'News18 Tamil Nadu', 'News18 TN', 'https://tamil.news18.com', 'ta', 'Tamil Nadu', 0.75, true),
  ('11111111-1111-1111-1111-111111111111', 'The Hindu', 'The Hindu', 'https://www.thehindu.com', 'en', 'India', 0.92, true),
  ('11111111-1111-1111-1111-111111111111', 'Times of India', 'TOI', 'https://timesofindia.indiatimes.com', 'en', 'India', 0.78, true),
  ('11111111-1111-1111-1111-111111111111', 'Indian Express', 'IE', 'https://indianexpress.com', 'en', 'India', 0.88, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE news_articles IS 'Stores news articles fetched from various sources with sentiment analysis';
COMMENT ON TABLE tvk_sentiment_reports IS 'Aggregated sentiment reports for TVK party mentions in news';
COMMENT ON TABLE news_sources IS 'Configuration and management of news sources/outlets';

COMMENT ON COLUMN news_articles.tvk_sentiment_score IS 'Sentiment score specifically for how TVK party is portrayed (-1 to 1)';
COMMENT ON COLUMN tvk_sentiment_reports.sentiment_change IS 'Change in sentiment from previous period (positive = improving, negative = declining)';
