-- Migration: Voter Sentiment Analysis with ElevenLabs Integration
-- Created: 2025-11-11
-- Description: Tables for storing call records, transcripts, and sentiment analysis

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: call_campaigns
-- Stores bulk calling campaign information
CREATE TABLE IF NOT EXISTS call_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paused', 'cancelled')),
    total_calls INTEGER DEFAULT 0,
    completed_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    max_concurrent_calls INTEGER DEFAULT 5,
    scheduled_start TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: voter_calls
-- Stores individual call records and transcripts
CREATE TABLE IF NOT EXISTS voter_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES call_campaigns(id) ON DELETE SET NULL,
    voter_id UUID REFERENCES voters(id) ON DELETE SET NULL,

    -- Call details
    call_id VARCHAR(255) UNIQUE, -- ElevenLabs call ID
    phone_number VARCHAR(20) NOT NULL,
    voter_name VARCHAR(255),

    -- Call status and metadata
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'initiated', 'ringing', 'in_progress', 'completed', 'failed', 'cancelled', 'no_answer', 'busy')),
    duration_seconds INTEGER,
    call_started_at TIMESTAMPTZ,
    call_ended_at TIMESTAMPTZ,

    -- Transcript and recording
    transcript TEXT,
    transcript_fetched_at TIMESTAMPTZ,

    -- ElevenLabs metadata
    elevenlabs_agent_id VARCHAR(255),
    elevenlabs_metadata JSONB DEFAULT '{}',
    error_message TEXT,

    -- Audit fields
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: call_sentiment_analysis
-- Stores analyzed sentiment data from call transcripts
CREATE TABLE IF NOT EXISTS call_sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES voter_calls(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Sentiment about previous government
    previous_govt_sentiment VARCHAR(20) CHECK (previous_govt_sentiment IN ('positive', 'negative', 'neutral', 'not_mentioned')),
    previous_govt_score FLOAT CHECK (previous_govt_score BETWEEN -1 AND 1),
    previous_govt_keywords TEXT[],
    previous_govt_summary TEXT,

    -- Sentiment about TVK (Vijay's party)
    tvk_sentiment VARCHAR(20) CHECK (tvk_sentiment IN ('support', 'against', 'undecided', 'not_mentioned')),
    tvk_score FLOAT CHECK (tvk_score BETWEEN -1 AND 1),
    tvk_keywords TEXT[],
    tvk_summary TEXT,

    -- Key issues discussed
    key_issues JSONB DEFAULT '[]', -- Array of {issue: string, sentiment: string, importance: number}
    top_concerns TEXT[],

    -- Voting intention
    voting_intention VARCHAR(100), -- Party name or 'undecided'
    voting_confidence VARCHAR(20) CHECK (voting_confidence IN ('very_confident', 'confident', 'unsure', 'not_mentioned')),

    -- Overall analysis
    overall_sentiment VARCHAR(20) CHECK (overall_sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    overall_summary TEXT,

    -- Analysis metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_model VARCHAR(100), -- e.g., 'gpt-4', 'claude-3'
    confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: call_csv_uploads
-- Tracks CSV files uploaded for mass calling
CREATE TABLE IF NOT EXISTS call_csv_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES call_campaigns(id) ON DELETE SET NULL,

    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    total_rows INTEGER,
    valid_rows INTEGER,
    invalid_rows INTEGER,

    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_voter_calls_organization ON voter_calls(organization_id);
CREATE INDEX idx_voter_calls_campaign ON voter_calls(campaign_id);
CREATE INDEX idx_voter_calls_voter ON voter_calls(voter_id);
CREATE INDEX idx_voter_calls_status ON voter_calls(status);
CREATE INDEX idx_voter_calls_call_id ON voter_calls(call_id);
CREATE INDEX idx_voter_calls_created_at ON voter_calls(created_at DESC);

CREATE INDEX idx_call_campaigns_organization ON call_campaigns(organization_id);
CREATE INDEX idx_call_campaigns_status ON call_campaigns(status);
CREATE INDEX idx_call_campaigns_created_at ON call_campaigns(created_at DESC);

CREATE INDEX idx_sentiment_call ON call_sentiment_analysis(call_id);
CREATE INDEX idx_sentiment_organization ON call_sentiment_analysis(organization_id);
CREATE INDEX idx_sentiment_previous_govt ON call_sentiment_analysis(previous_govt_sentiment);
CREATE INDEX idx_sentiment_tvk ON call_sentiment_analysis(tvk_sentiment);
CREATE INDEX idx_sentiment_voting_intention ON call_sentiment_analysis(voting_intention);

CREATE INDEX idx_csv_uploads_organization ON call_csv_uploads(organization_id);
CREATE INDEX idx_csv_uploads_campaign ON call_csv_uploads(campaign_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_call_campaigns_updated_at
    BEFORE UPDATE ON call_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voter_calls_updated_at
    BEFORE UPDATE ON voter_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_sentiment_analysis_updated_at
    BEFORE UPDATE ON call_sentiment_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE call_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_csv_uploads ENABLE ROW LEVEL SECURITY;

-- Policies for call_campaigns
CREATE POLICY "Users can view campaigns in their organization"
    ON call_campaigns FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create campaigns in their organization"
    ON call_campaigns FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update campaigns in their organization"
    ON call_campaigns FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Policies for voter_calls
CREATE POLICY "Users can view calls in their organization"
    ON voter_calls FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create calls in their organization"
    ON voter_calls FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update calls in their organization"
    ON voter_calls FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Policies for call_sentiment_analysis
CREATE POLICY "Users can view sentiment in their organization"
    ON call_sentiment_analysis FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create sentiment in their organization"
    ON call_sentiment_analysis FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update sentiment in their organization"
    ON call_sentiment_analysis FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Policies for call_csv_uploads
CREATE POLICY "Users can view uploads in their organization"
    ON call_csv_uploads FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create uploads in their organization"
    ON call_csv_uploads FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON call_campaigns TO authenticated;
GRANT ALL ON voter_calls TO authenticated;
GRANT ALL ON call_sentiment_analysis TO authenticated;
GRANT ALL ON call_csv_uploads TO authenticated;

-- Comments for documentation
COMMENT ON TABLE call_campaigns IS 'Stores bulk calling campaign information for voter outreach';
COMMENT ON TABLE voter_calls IS 'Individual call records with transcripts from ElevenLabs agent';
COMMENT ON TABLE call_sentiment_analysis IS 'AI-analyzed sentiment data extracted from call transcripts';
COMMENT ON TABLE call_csv_uploads IS 'Tracks CSV file uploads for mass calling campaigns';
