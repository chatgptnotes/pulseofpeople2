-- =====================================================
-- PULSE OF PEOPLE - COMPLETE DATABASE SCHEMA
-- Fresh Supabase Project Setup
-- Django Backend Migration to Supabase
-- Generated: 2025-01-11
-- =====================================================
-- This migration creates all 35+ tables from the Django backend
-- Includes: Auth, Geography, Political Platform, Campaigns, WhatsApp Bot
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- 1. ORGANIZATIONS (Multi-tenancy support)
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    logo TEXT,
    organization_type VARCHAR(20) CHECK (organization_type IN ('party', 'campaign', 'ngo', 'other')) DEFAULT 'campaign',

    -- Contact Info
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    website TEXT,
    social_media_links JSONB DEFAULT '{}'::jsonb,

    -- Subscription
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expires_at TIMESTAMPTZ,
    max_users INTEGER DEFAULT 10,

    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- 2. PERMISSIONS (Granular RBAC)
-- =====================================================

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('users', 'data', 'analytics', 'settings', 'system')) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_name ON permissions(name);

-- =====================================================
-- 3. USERS (Extended user profile with Django UserProfile fields)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Link to Supabase Auth (auth.users)
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    phone VARCHAR(20),

    -- Role
    role VARCHAR(20) CHECK (role IN ('superadmin', 'admin', 'manager', 'analyst', 'user', 'viewer', 'volunteer')) DEFAULT 'user' NOT NULL,

    -- Organization
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Profile
    bio TEXT,
    avatar TEXT,
    date_of_birth DATE,

    -- Password management
    must_change_password BOOLEAN DEFAULT false,

    -- Two-Factor Authentication
    is_2fa_enabled BOOLEAN DEFAULT false,
    totp_secret VARCHAR(32),

    -- Location assignments for political roles
    assigned_state_id UUID, -- Will reference states table
    assigned_district_id UUID, -- Will reference districts table
    city VARCHAR(100),
    constituency VARCHAR(200),

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_auth_user ON users(auth_user_id);

-- =====================================================
-- 4. ROLE PERMISSIONS (Maps roles to permissions)
-- =====================================================

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) CHECK (role IN ('superadmin', 'admin', 'manager', 'analyst', 'user', 'viewer', 'volunteer')) NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(role, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- =====================================================
-- 5. USER PERMISSIONS (User-specific permission overrides)
-- =====================================================

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    granted BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, permission_id)
);

CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission_id);
CREATE INDEX idx_user_permissions_granted ON user_permissions(granted);

-- =====================================================
-- 6. AUDIT LOGS (Track all user actions)
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'permission_change', 'role_change')) NOT NULL,
    target_model VARCHAR(100),
    target_id VARCHAR(100),
    changes JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_model, target_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- =====================================================
-- 7. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(20) CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'task', 'user', 'system')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Link to related object
    related_model VARCHAR(100),
    related_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- =====================================================
-- 8. TWO-FACTOR BACKUP CODES
-- =====================================================

CREATE TABLE two_factor_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_2fa_codes_user ON two_factor_backup_codes(user_id, is_used);

-- =====================================================
-- 9. UPLOADED FILES (Track files in Supabase Storage)
-- =====================================================

CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Storage info
    storage_path VARCHAR(500) NOT NULL,
    storage_url TEXT NOT NULL,
    bucket_id VARCHAR(100) DEFAULT 'user-files',

    -- Category
    file_category VARCHAR(50) CHECK (file_category IN ('document', 'image', 'video', 'audio', 'archive', 'other')) DEFAULT 'document',

    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id, created_at DESC);
CREATE INDEX idx_uploaded_files_category ON uploaded_files(file_category);

-- =====================================================
-- 10. STATES (Indian states)
-- =====================================================

CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    capital VARCHAR(100),
    region VARCHAR(50),
    total_districts INTEGER DEFAULT 0,
    total_constituencies INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_states_code ON states(code);
CREATE INDEX idx_states_name ON states(name);

-- =====================================================
-- 11. DISTRICTS
-- =====================================================

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    headquarters VARCHAR(100),
    population INTEGER,
    area_sq_km DECIMAL(10, 2),
    total_wards INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(state_id, name)
);

CREATE INDEX idx_districts_state ON districts(state_id, name);
CREATE INDEX idx_districts_code ON districts(code);

-- =====================================================
-- 12. CONSTITUENCIES (Electoral constituencies)
-- =====================================================

CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    constituency_type VARCHAR(20) CHECK (constituency_type IN ('assembly', 'parliamentary')) DEFAULT 'assembly',
    number INTEGER NOT NULL,
    reserved_for VARCHAR(20) CHECK (reserved_for IN ('general', 'sc', 'st')) DEFAULT 'general',
    total_voters INTEGER,
    total_wards INTEGER DEFAULT 0,
    total_booths INTEGER DEFAULT 0,
    area_sq_km DECIMAL(10, 2),
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    geojson_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(state_id, code)
);

CREATE INDEX idx_constituencies_state ON constituencies(state_id, constituency_type);
CREATE INDEX idx_constituencies_district ON constituencies(district_id);
CREATE INDEX idx_constituencies_code ON constituencies(code);

-- Add foreign key constraints for users table now that geography tables exist
ALTER TABLE users
    ADD CONSTRAINT fk_users_state FOREIGN KEY (assigned_state_id) REFERENCES states(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_users_district FOREIGN KEY (assigned_district_id) REFERENCES districts(id) ON DELETE SET NULL;

-- =====================================================
-- 13. POLLING BOOTHS
-- =====================================================

CREATE TABLE polling_booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE NOT NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE NOT NULL,

    booth_number VARCHAR(20) NOT NULL,
    name VARCHAR(300) NOT NULL,
    building_name VARCHAR(200),

    -- Location
    address TEXT,
    area VARCHAR(200),
    landmark VARCHAR(200),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Statistics
    total_voters INTEGER DEFAULT 0,
    male_voters INTEGER DEFAULT 0,
    female_voters INTEGER DEFAULT 0,
    other_voters INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_accessible BOOLEAN DEFAULT true,

    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(constituency_id, booth_number)
);

CREATE INDEX idx_polling_booths_constituency ON polling_booths(constituency_id, booth_number);
CREATE INDEX idx_polling_booths_district ON polling_booths(district_id);
CREATE INDEX idx_polling_booths_state ON polling_booths(state_id);
CREATE INDEX idx_polling_booths_active ON polling_booths(is_active);

-- =====================================================
-- 14. POLITICAL PARTIES
-- =====================================================

CREATE TABLE political_parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) UNIQUE NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    symbol VARCHAR(100),
    symbol_image TEXT,
    status VARCHAR(20) CHECK (status IN ('national', 'state', 'regional')) DEFAULT 'state',
    headquarters VARCHAR(200),
    website TEXT,
    founded_date DATE,
    ideology VARCHAR(200),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_political_parties_name ON political_parties(name);
CREATE INDEX idx_political_parties_short_name ON political_parties(short_name);

-- Many-to-many: political_parties <-> states
CREATE TABLE political_party_states (
    party_id UUID REFERENCES political_parties(id) ON DELETE CASCADE,
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    PRIMARY KEY (party_id, state_id)
);

-- =====================================================
-- 15. ISSUE CATEGORIES
-- =====================================================

CREATE TABLE issue_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES issue_categories(id) ON DELETE CASCADE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_issue_categories_parent ON issue_categories(parent_id);
CREATE INDEX idx_issue_categories_priority ON issue_categories(priority DESC);
CREATE INDEX idx_issue_categories_active ON issue_categories(is_active);

-- =====================================================
-- 16. VOTER SEGMENTS
-- =====================================================

CREATE TABLE voter_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    estimated_population INTEGER,
    priority_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_voter_segments_priority ON voter_segments(priority_level DESC);
CREATE INDEX idx_voter_segments_active ON voter_segments(is_active);

-- Many-to-many: voter_segments <-> issue_categories
CREATE TABLE voter_segment_issues (
    segment_id UUID REFERENCES voter_segments(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issue_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (segment_id, issue_id)
);

-- =====================================================
-- 17. DIRECT FEEDBACK (Citizen feedback submissions)
-- =====================================================

CREATE TABLE direct_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Citizen Info
    citizen_name VARCHAR(200) NOT NULL,
    citizen_age INTEGER CHECK (citizen_age >= 18 AND citizen_age <= 120),
    citizen_phone VARCHAR(20),
    citizen_email VARCHAR(255),

    -- Location
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    ward VARCHAR(100),
    booth_number VARCHAR(20),
    detailed_location TEXT,

    -- Feedback Content
    issue_category_id UUID REFERENCES issue_categories(id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    expectations TEXT,
    voter_segment_id UUID REFERENCES voter_segments(id) ON DELETE SET NULL,

    -- Media
    audio_file_url TEXT,
    video_file_url TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    transcription TEXT,

    -- AI Analysis
    ai_summary TEXT,
    ai_sentiment_score DECIMAL(4, 2) CHECK (ai_sentiment_score >= 0 AND ai_sentiment_score <= 1),
    ai_sentiment_polarity VARCHAR(20) CHECK (ai_sentiment_polarity IN ('positive', 'negative', 'neutral')),
    ai_extracted_issues JSONB DEFAULT '[]'::jsonb,
    ai_urgency VARCHAR(20) CHECK (ai_urgency IN ('low', 'medium', 'high', 'urgent')),
    ai_confidence DECIMAL(4, 2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_analysis_metadata JSONB DEFAULT '{}'::jsonb,

    -- Workflow
    status VARCHAR(20) CHECK (status IN ('pending', 'analyzing', 'analyzed', 'reviewed', 'escalated', 'resolved')) DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,

    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    analyzed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_direct_feedback_status ON direct_feedback(status);
CREATE INDEX idx_direct_feedback_ward ON direct_feedback(ward);
CREATE INDEX idx_direct_feedback_constituency ON direct_feedback(constituency_id);
CREATE INDEX idx_direct_feedback_submitted ON direct_feedback(submitted_at DESC);
CREATE INDEX idx_direct_feedback_assigned ON direct_feedback(assigned_to);

-- =====================================================
-- 18. FIELD REPORTS (Ground-level reports from party workers)
-- =====================================================

CREATE TABLE field_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    volunteer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Location
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    ward VARCHAR(100) NOT NULL,
    booth_number VARCHAR(20),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address TEXT,

    -- Report Content
    report_type VARCHAR(50) CHECK (report_type IN ('daily_summary', 'event_feedback', 'issue_report', 'competitor_activity', 'booth_report')) NOT NULL,
    title VARCHAR(200),
    positive_reactions JSONB DEFAULT '[]'::jsonb,
    negative_reactions JSONB DEFAULT '[]'::jsonb,
    crowd_size INTEGER,
    quotes JSONB DEFAULT '[]'::jsonb,
    notes TEXT,

    -- Competitor Activity
    competitor_party_id UUID REFERENCES political_parties(id) ON DELETE SET NULL,
    competitor_activity_description TEXT,

    -- Media
    media_urls JSONB DEFAULT '[]'::jsonb,

    -- Verification
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'disputed')) DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,

    report_date DATE DEFAULT CURRENT_DATE,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_field_reports_volunteer ON field_reports(volunteer_id, timestamp DESC);
CREATE INDEX idx_field_reports_ward ON field_reports(ward);
CREATE INDEX idx_field_reports_constituency ON field_reports(constituency_id);
CREATE INDEX idx_field_reports_verification ON field_reports(verification_status);
CREATE INDEX idx_field_reports_type ON field_reports(report_type);
CREATE INDEX idx_field_reports_date ON field_reports(report_date DESC);

-- Many-to-many: field_reports <-> issue_categories
CREATE TABLE field_report_issues (
    report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issue_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, issue_id)
);

-- Many-to-many: field_reports <-> voter_segments
CREATE TABLE field_report_segments (
    report_id UUID REFERENCES field_reports(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES voter_segments(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, segment_id)
);

-- =====================================================
-- 19. SENTIMENT DATA (Core sentiment analysis)
-- =====================================================

CREATE TABLE sentiment_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    source_type VARCHAR(50) CHECK (source_type IN ('direct_feedback', 'field_report', 'social_media', 'survey')) NOT NULL,
    source_id UUID NOT NULL,

    issue_id UUID REFERENCES issue_categories(id) ON DELETE CASCADE NOT NULL,
    sentiment_score DECIMAL(4, 2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1) NOT NULL,
    polarity VARCHAR(20) CHECK (polarity IN ('positive', 'negative', 'neutral')) NOT NULL,
    confidence DECIMAL(4, 2) CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,

    -- Location
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    ward VARCHAR(100),

    voter_segment_id UUID REFERENCES voter_segments(id) ON DELETE SET NULL,

    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sentiment_data_issue ON sentiment_data(issue_id, timestamp DESC);
CREATE INDEX idx_sentiment_data_polarity ON sentiment_data(polarity);
CREATE INDEX idx_sentiment_data_constituency ON sentiment_data(constituency_id, timestamp DESC);
CREATE INDEX idx_sentiment_data_district ON sentiment_data(district_id, timestamp DESC);
CREATE INDEX idx_sentiment_data_ward ON sentiment_data(ward);
CREATE INDEX idx_sentiment_data_timestamp ON sentiment_data(timestamp DESC);

-- =====================================================
-- 20. BOOTH AGENTS (Admin3 - Booth-level party workers)
-- =====================================================

CREATE TABLE booth_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    state_id UUID REFERENCES states(id) ON DELETE CASCADE NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE NOT NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE NOT NULL,

    assigned_wards JSONB DEFAULT '[]'::jsonb,
    assigned_booths JSONB DEFAULT '[]'::jsonb,

    -- Stats
    total_reports INTEGER DEFAULT 0,
    total_feedback_collected INTEGER DEFAULT 0,
    last_report_date DATE,

    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    joined_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_booth_agents_constituency ON booth_agents(constituency_id);
CREATE INDEX idx_booth_agents_district ON booth_agents(district_id);
CREATE INDEX idx_booth_agents_active ON booth_agents(is_active);

-- Many-to-many: booth_agents <-> voter_segments
CREATE TABLE booth_agent_segments (
    agent_id UUID REFERENCES booth_agents(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES voter_segments(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, segment_id)
);

-- =====================================================
-- 21. BULK UPLOAD JOBS
-- =====================================================

CREATE TABLE bulk_upload_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,

    status VARCHAR(20) CHECK (status IN ('pending', 'validating', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',

    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,

    validation_errors JSONB DEFAULT '[]'::jsonb,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bulk_jobs_created_by ON bulk_upload_jobs(created_by, created_at DESC);
CREATE INDEX idx_bulk_jobs_status ON bulk_upload_jobs(status);

-- =====================================================
-- 22. BULK UPLOAD ERRORS
-- =====================================================

CREATE TABLE bulk_upload_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES bulk_upload_jobs(id) ON DELETE CASCADE NOT NULL,
    row_number INTEGER NOT NULL,
    row_data JSONB NOT NULL,
    error_message TEXT NOT NULL,
    error_field VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bulk_errors_job ON bulk_upload_errors(job_id, row_number);

-- =====================================================
-- 23. VOTERS (Comprehensive voter database)
-- =====================================================

CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identity
    voter_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    date_of_birth DATE,
    age INTEGER CHECK (age >= 18 AND age <= 120),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    photo TEXT,

    -- Address
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    landmark VARCHAR(200),
    ward VARCHAR(100),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Political Data
    party_affiliation VARCHAR(20) CHECK (party_affiliation IN ('bjp', 'congress', 'aap', 'tvk', 'dmk', 'aiadmk', 'neutral', 'unknown', 'other')) DEFAULT 'unknown',
    voting_history JSONB DEFAULT '[]'::jsonb,
    sentiment VARCHAR(30) CHECK (sentiment IN ('strong_supporter', 'supporter', 'neutral', 'opposition', 'strong_opposition')) DEFAULT 'neutral',
    influence_level VARCHAR(20) CHECK (influence_level IN ('high', 'medium', 'low')) DEFAULT 'low',
    is_opinion_leader BOOLEAN DEFAULT false,

    -- Engagement
    last_contacted_at TIMESTAMPTZ,
    contact_frequency INTEGER DEFAULT 0,
    interaction_count INTEGER DEFAULT 0,
    positive_interactions INTEGER DEFAULT 0,
    negative_interactions INTEGER DEFAULT 0,
    preferred_communication VARCHAR(20) CHECK (preferred_communication IN ('phone', 'sms', 'whatsapp', 'email', 'door_to_door')) DEFAULT 'phone',

    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_voters_voter_id ON voters(voter_id);
CREATE INDEX idx_voters_constituency_ward ON voters(constituency_id, ward);
CREATE INDEX idx_voters_party ON voters(party_affiliation);
CREATE INDEX idx_voters_sentiment ON voters(sentiment);
CREATE INDEX idx_voters_phone ON voters(phone);
CREATE INDEX idx_voters_active ON voters(is_active);

-- =====================================================
-- 24. VOTER INTERACTIONS
-- =====================================================

CREATE TABLE voter_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    voter_id UUID REFERENCES voters(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(20) CHECK (interaction_type IN ('phone_call', 'door_visit', 'event_meeting', 'sms', 'email', 'whatsapp')) NOT NULL,
    contacted_by UUID REFERENCES users(id) ON DELETE SET NULL,

    interaction_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration_minutes INTEGER,
    sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',

    issues_discussed JSONB DEFAULT '[]'::jsonb,
    promises_made TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_voter_interactions_voter ON voter_interactions(voter_id, interaction_date DESC);
CREATE INDEX idx_voter_interactions_contacted_by ON voter_interactions(contacted_by);
CREATE INDEX idx_voter_interactions_type ON voter_interactions(interaction_type);
CREATE INDEX idx_voter_interactions_follow_up ON voter_interactions(follow_up_required);

-- =====================================================
-- 25. CAMPAIGNS
-- =====================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    campaign_name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(20) CHECK (campaign_type IN ('election', 'awareness', 'issue_based', 'door_to_door')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('planning', 'active', 'completed', 'cancelled')) DEFAULT 'planning',

    budget DECIMAL(12, 2) DEFAULT 0,
    spent_amount DECIMAL(12, 2) DEFAULT 0,

    target_constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    target_audience TEXT,

    campaign_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,

    goals JSONB DEFAULT '{}'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date DESC);
CREATE INDEX idx_campaigns_manager ON campaigns(campaign_manager_id);

-- Many-to-many: campaigns <-> users (team members)
CREATE TABLE campaign_team_members (
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, user_id)
);

-- =====================================================
-- 26. SOCIAL MEDIA POSTS
-- =====================================================

CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    platform VARCHAR(20) CHECK (platform IN ('facebook', 'twitter', 'instagram', 'whatsapp', 'youtube')) NOT NULL,
    post_content TEXT NOT NULL,
    post_url TEXT,
    post_id VARCHAR(200),

    posted_at TIMESTAMPTZ NOT NULL,
    scheduled_at TIMESTAMPTZ,

    -- Metrics
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_count INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    sentiment_score DECIMAL(4, 2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),

    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,

    is_published BOOLEAN DEFAULT false,
    is_promoted BOOLEAN DEFAULT false,

    hashtags JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_social_posts_platform ON social_media_posts(platform, posted_at DESC);
CREATE INDEX idx_social_posts_campaign ON social_media_posts(campaign_id);
CREATE INDEX idx_social_posts_published ON social_media_posts(is_published);

-- =====================================================
-- 27. ALERTS
-- =====================================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    alert_type VARCHAR(20) CHECK (alert_type IN ('info', 'warning', 'urgent', 'critical')) DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,

    target_role VARCHAR(20) CHECK (target_role IN ('superadmin', 'admin', 'manager', 'analyst', 'user', 'viewer', 'volunteer')),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,

    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    action_url TEXT,
    action_required BOOLEAN DEFAULT false,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_alerts_target_role ON alerts(target_role);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Many-to-many: alerts <-> users (target users)
CREATE TABLE alert_target_users (
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (alert_id, user_id)
);

-- =====================================================
-- 28. EVENTS
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(20) CHECK (event_type IN ('rally', 'meeting', 'door_to_door', 'booth_visit', 'town_hall')) NOT NULL,

    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,

    location VARCHAR(300) NOT NULL,
    ward VARCHAR(100),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    expected_attendance INTEGER DEFAULT 0,
    actual_attendance INTEGER DEFAULT 0,

    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    budget DECIMAL(10, 2) DEFAULT 0,
    expenses DECIMAL(10, 2) DEFAULT 0,

    status VARCHAR(20) CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')) DEFAULT 'planned',
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start ON events(start_datetime DESC);
CREATE INDEX idx_events_constituency ON events(constituency_id);

-- Many-to-many: events <-> users (volunteers)
CREATE TABLE event_volunteers (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- =====================================================
-- 29. VOLUNTEER PROFILES
-- =====================================================

CREATE TABLE volunteer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    volunteer_id VARCHAR(50) UNIQUE NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    availability JSONB DEFAULT '{}'::jsonb,

    assigned_ward VARCHAR(100),
    assigned_constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,

    tasks_completed INTEGER DEFAULT 0,
    hours_contributed DECIMAL(10, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),

    is_active BOOLEAN DEFAULT true,
    joined_at DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_volunteer_profiles_volunteer_id ON volunteer_profiles(volunteer_id);
CREATE INDEX idx_volunteer_profiles_constituency ON volunteer_profiles(assigned_constituency_id);
CREATE INDEX idx_volunteer_profiles_active ON volunteer_profiles(is_active);

-- =====================================================
-- 30. EXPENSES
-- =====================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    expense_type VARCHAR(20) CHECK (expense_type IN ('travel', 'materials', 'advertising', 'event', 'salary', 'other')) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    description TEXT NOT NULL,

    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    receipt_image TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,

    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
    paid_at TIMESTAMPTZ,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_expenses_type ON expenses(expense_type);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_campaign ON expenses(campaign_id);
CREATE INDEX idx_expenses_event ON expenses(event_id);

-- =====================================================
-- 31. WHATSAPP CONVERSATIONS
-- =====================================================

CREATE TABLE whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    phone_number VARCHAR(20) NOT NULL,
    user_name VARCHAR(255),
    user_location VARCHAR(255),

    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,

    language VARCHAR(5) CHECK (language IN ('ta', 'en', 'hi', 'te')) DEFAULT 'ta',
    channel VARCHAR(20) CHECK (channel IN ('whatsapp', 'web', 'telegram')) DEFAULT 'whatsapp',

    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    sentiment_score FLOAT DEFAULT 0.0,

    category VARCHAR(20) CHECK (category IN ('feedback', 'complaint', 'suggestion', 'inquiry', 'political')) DEFAULT 'inquiry',
    priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',

    topics JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    issues JSONB DEFAULT '[]'::jsonb,

    demographics JSONB DEFAULT '{}'::jsonb,
    political_lean VARCHAR(20) CHECK (political_lean IN ('left', 'center', 'right', 'neutral')),

    ai_confidence FLOAT DEFAULT 0.0,
    satisfaction_score INTEGER DEFAULT 0,
    resolved BOOLEAN DEFAULT false,
    human_handoff BOOLEAN DEFAULT false,

    session_id UUID DEFAULT uuid_generate_v4(),
    source_campaign VARCHAR(100),
    referral_code VARCHAR(50),

    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_conversations_started ON whatsapp_conversations(started_at DESC);
CREATE INDEX idx_whatsapp_conversations_sentiment ON whatsapp_conversations(sentiment);
CREATE INDEX idx_whatsapp_conversations_category ON whatsapp_conversations(category);
CREATE INDEX idx_whatsapp_conversations_resolved ON whatsapp_conversations(resolved);

-- =====================================================
-- 32. WHATSAPP MESSAGES
-- =====================================================

CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE NOT NULL,

    sender VARCHAR(10) CHECK (sender IN ('user', 'bot', 'human')) NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'voice', 'image', 'video', 'document', 'location')) DEFAULT 'text',
    content TEXT NOT NULL,
    media_url TEXT,

    whatsapp_message_id VARCHAR(255) UNIQUE,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- AI processing
    intent VARCHAR(100),
    confidence FLOAT DEFAULT 0.0,
    sentiment VARCHAR(20),
    entities JSONB DEFAULT '{}'::jsonb,
    language VARCHAR(5),

    processed BOOLEAN DEFAULT false,
    processing_error TEXT,

    -- Response metadata
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    model_used VARCHAR(50),

    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id, timestamp);
CREATE INDEX idx_whatsapp_messages_whatsapp_id ON whatsapp_messages(whatsapp_message_id);
CREATE INDEX idx_whatsapp_messages_processed ON whatsapp_messages(processed);

-- =====================================================
-- 33. VOTER PROFILES (WhatsApp-based aggregated profiles)
-- =====================================================

CREATE TABLE voter_profiles_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,

    name VARCHAR(255),
    preferred_language VARCHAR(5) DEFAULT 'ta',

    location_data JSONB DEFAULT '{}'::jsonb,
    demographics JSONB DEFAULT '{}'::jsonb,
    political_lean VARCHAR(20),

    interaction_count INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    avg_sentiment_score FLOAT DEFAULT 0.0,

    last_contacted TIMESTAMPTZ,
    first_contacted TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    topic_interests JSONB DEFAULT '{}'::jsonb,
    issues_raised JSONB DEFAULT '[]'::jsonb,
    sentiment_history JSONB DEFAULT '[]'::jsonb,

    referral_code VARCHAR(50) UNIQUE,
    referrals_made INTEGER DEFAULT 0,
    referred_by_id UUID REFERENCES voter_profiles_whatsapp(id) ON DELETE SET NULL,

    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_voter_profiles_wa_phone ON voter_profiles_whatsapp(phone_number);
CREATE INDEX idx_voter_profiles_wa_referral ON voter_profiles_whatsapp(referral_code);
CREATE INDEX idx_voter_profiles_wa_last_contact ON voter_profiles_whatsapp(last_contacted DESC);

-- =====================================================
-- 34. BOT CONFIGURATIONS
-- =====================================================

CREATE TABLE bot_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,

    personality VARCHAR(20) CHECK (personality IN ('formal', 'friendly', 'professional', 'casual')) DEFAULT 'friendly',
    languages JSONB DEFAULT '[]'::jsonb,
    channels JSONB DEFAULT '[]'::jsonb,

    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    system_prompt TEXT NOT NULL,
    custom_prompts JSONB DEFAULT '{}'::jsonb,
    knowledge_base JSONB DEFAULT '[]'::jsonb,

    response_time_target FLOAT DEFAULT 1.0,
    max_conversation_length INTEGER DEFAULT 50,
    auto_handoff_threshold FLOAT DEFAULT 0.3,

    active BOOLEAN DEFAULT true,

    total_conversations INTEGER DEFAULT 0,
    accuracy_rate FLOAT DEFAULT 0.0,
    satisfaction_rate FLOAT DEFAULT 0.0,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bot_configurations_active ON bot_configurations(active);
CREATE INDEX idx_bot_configurations_name ON bot_configurations(name);

-- =====================================================
-- 35. TASKS (Sample task model)
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tasks_owner ON tasks(owner_id, created_at DESC);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uploaded_files_updated_at BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_constituencies_updated_at BEFORE UPDATE ON constituencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polling_booths_updated_at BEFORE UPDATE ON polling_booths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_political_parties_updated_at BEFORE UPDATE ON political_parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_categories_updated_at BEFORE UPDATE ON issue_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voter_segments_updated_at BEFORE UPDATE ON voter_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_direct_feedback_updated_at BEFORE UPDATE ON direct_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_reports_updated_at BEFORE UPDATE ON field_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booth_agents_updated_at BEFORE UPDATE ON booth_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulk_upload_jobs_updated_at BEFORE UPDATE ON bulk_upload_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_posts_updated_at BEFORE UPDATE ON social_media_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_profiles_updated_at BEFORE UPDATE ON volunteer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_conversations_updated_at BEFORE UPDATE ON whatsapp_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voter_profiles_wa_updated_at BEFORE UPDATE ON voter_profiles_whatsapp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_configurations_updated_at BEFORE UPDATE ON bot_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- Total Tables Created: 35
-- Extensions Enabled: uuid-ossp, postgis, pg_trgm
-- Triggers Added: 24 updated_at triggers
-- =====================================================
