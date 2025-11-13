#!/usr/bin/env node
/**
 * Apply news_articles and trending_topics tables directly via SQL
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🚀 Creating news_articles and related tables...\n');

// Create news_articles table
const createNewsArticlesSQL = `
-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    url TEXT,
    source VARCHAR(200) NOT NULL,
    author VARCHAR(200),
    published_at TIMESTAMPTZ,

    -- Sentiment Analysis
    sentiment_score FLOAT,
    sentiment_polarity VARCHAR(20),
    emotion VARCHAR(50),
    confidence FLOAT,
    analyzed_at TIMESTAMPTZ,

    -- TVK Party Specific
    tvk_mentioned BOOLEAN DEFAULT false,
    tvk_mention_count INTEGER DEFAULT 0,
    tvk_context TEXT,
    tvk_sentiment_score FLOAT,
    tvk_sentiment_polarity VARCHAR(20),

    language VARCHAR(10) DEFAULT 'en',
    credibility_score FLOAT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_articles_tvk ON news_articles(tvk_mentioned) WHERE tvk_mentioned = true;
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url);
`;

// Create trending_topics table
const createTrendingTopicsSQL = `
CREATE TABLE IF NOT EXISTS trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    keyword VARCHAR(200) NOT NULL,
    volume INTEGER DEFAULT 0,
    growth_rate FLOAT DEFAULT 0,
    sentiment_score FLOAT,
    platforms JSONB DEFAULT '[]'::jsonb,
    time_period VARCHAR(10) DEFAULT '24h',

    first_detected_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trending_topics_volume ON trending_topics(volume DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_period ON trending_topics(time_period, last_updated_at DESC);
`;

async function applyMigrations() {
  try {
    // Apply news_articles table
    console.log('1️⃣  Creating news_articles table...');
    const { error: newsError } = await supabase.rpc('exec_sql', {
      sql: createNewsArticlesSQL
    }).catch(async () => {
      // Fallback: Try direct SQL
      const { error } = await supabase.from('_sql').insert({ query: createNewsArticlesSQL });
      return { error };
    });

    if (newsError) {
      console.log('  ⚠️  Note: Table may already exist or need manual creation');
      console.log('  SQL to run in Supabase SQL Editor:');
      console.log(createNewsArticlesSQL);
    } else {
      console.log('  ✅ news_articles table created');
    }

    // Apply trending_topics table
    console.log('\n2️⃣  Creating trending_topics table...');
    const { error: trendingError } = await supabase.rpc('exec_sql', {
      sql: createTrendingTopicsSQL
    }).catch(async () => {
      const { error } = await supabase.from('_sql').insert({ query: createTrendingTopicsSQL });
      return { error };
    });

    if (trendingError) {
      console.log('  ⚠️  Note: Table may already exist or need manual creation');
      console.log('  SQL to run in Supabase SQL Editor:');
      console.log(createTrendingTopicsSQL);
    } else {
      console.log('  ✅ trending_topics table created');
    }

    console.log('\n✅ Migration complete!');
    console.log('\nℹ️  If tables weren\'t created automatically, please:');
    console.log('1. Go to: https://supabase.com/dashboard/project/eepwbydlfecosaqdysho/sql/new');
    console.log('2. Copy the SQL from above');
    console.log('3. Run it in the SQL Editor');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual SQL to run in Supabase SQL Editor:\n');
    console.log(createNewsArticlesSQL);
    console.log('\n');
    console.log(createTrendingTopicsSQL);
  }
}

applyMigrations();
