-- =====================================================
-- TRENDING TOPICS TABLE
-- For tracking viral keywords, hashtags, and topics across social media
-- =====================================================

CREATE TABLE IF NOT EXISTS trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Topic Identification
    keyword VARCHAR(200) NOT NULL,
    keyword_normalized VARCHAR(200), -- Lowercase, normalized for deduplication

    -- Metrics
    volume INTEGER DEFAULT 0, -- Total mentions
    growth_rate FLOAT DEFAULT 0, -- Percentage growth (0-1 scale)
    sentiment_score FLOAT, -- Average sentiment (-1 to 1)

    -- Platform Distribution
    platforms JSONB DEFAULT '[]'::jsonb, -- ['twitter', 'facebook', 'instagram', 'news']
    platform_breakdown JSONB DEFAULT '{}'::jsonb, -- {'twitter': 150, 'facebook': 89, ...}

    -- Time Period
    time_period VARCHAR(10) DEFAULT '24h', -- '1h', '6h', '24h', '7d', '30d'
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,

    -- Geographic Distribution
    state_breakdown JSONB DEFAULT '{}'::jsonb,
    district_breakdown JSONB DEFAULT '{}'::jsonb,

    -- Related Keywords (co-occurrence)
    related_keywords TEXT[],

    -- TVK Specific
    tvk_related BOOLEAN DEFAULT false,
    tvk_context VARCHAR(20), -- 'support', 'opposition', 'neutral', 'mention'

    -- Tracking
    first_detected_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Auto-delete old trends

    -- Source Posts (for drill-down)
    sample_post_ids UUID[],

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_trending_topics_org ON trending_topics(organization_id);
CREATE INDEX idx_trending_topics_period ON trending_topics(time_period, last_updated_at DESC);
CREATE INDEX idx_trending_topics_volume ON trending_topics(volume DESC);
CREATE INDEX idx_trending_topics_keyword ON trending_topics(keyword_normalized);
CREATE INDEX idx_trending_topics_tvk ON trending_topics(tvk_related) WHERE tvk_related = true;
CREATE INDEX idx_trending_topics_expires ON trending_topics(expires_at) WHERE expires_at IS NOT NULL;

-- Composite index for common query pattern
CREATE INDEX idx_trending_topics_org_period_volume
ON trending_topics(organization_id, time_period, volume DESC);

-- Function to auto-expire old trends
CREATE OR REPLACE FUNCTION cleanup_expired_trends()
RETURNS void AS $$
BEGIN
    DELETE FROM trending_topics
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE trending_topics IS 'Tracks trending keywords, hashtags, and topics across social media and news';
COMMENT ON COLUMN trending_topics.keyword_normalized IS 'Lowercase normalized version for deduplication (e.g., "#TVK" → "tvk")';
COMMENT ON COLUMN trending_topics.growth_rate IS 'Percentage growth rate compared to previous period (0.15 = 15% growth)';
COMMENT ON COLUMN trending_topics.platform_breakdown IS 'Volume breakdown by platform: {"twitter": 150, "facebook": 89}';
