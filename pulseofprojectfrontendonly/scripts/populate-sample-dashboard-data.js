#!/usr/bin/env node
/**
 * Populate realistic sample data for dashboard cards
 * This creates sentiment_data, social_posts, alerts, and trending_topics
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🚀 Populating Dashboard with Sample Data...\n');

// Get IDs we need
async function getIds() {
  const { data: districts } = await supabase.from('districts').select('id, name');
  const { data: constituencies } = await supabase.from('constituencies').select('id, name');
  const { data: issues } = await supabase.from('issue_categories').select('id, name');

  return { districts, constituencies, issues };
}

// 1. Create sentiment_data (for the metrics)
async function createSentimentData({ districts, constituencies, issues }) {
  console.log('1️⃣  Creating sentiment data (500 records)...');

  const sentimentRecords = [];
  const now = new Date();

  // Create 500 sentiment records over the last 7 days
  for (let i = 0; i < 500; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const district = districts[Math.floor(Math.random() * districts.length)];
    const constituency = constituencies[Math.floor(Math.random() * constituencies.length)];
    const issue = issues[Math.floor(Math.random() * issues.length)];

    // TVK tends to have slightly positive sentiment (55-75%)
    const sentimentScore = 0.55 + Math.random() * 0.20;
    const polarity = sentimentScore > 0.6 ? 'positive' : sentimentScore < 0.5 ? 'negative' : 'neutral';

    sentimentRecords.push({
      source_type: ['social_media', 'field_report', 'news'][Math.floor(Math.random() * 3)],
      source_id: crypto.randomUUID(),
      issue_id: issue.id,
      sentiment_score: sentimentScore,
      polarity,
      confidence: 0.7 + Math.random() * 0.25,
      district_id: district.id,
      constituency_id: constituency.id,
      timestamp: timestamp.toISOString()
    });
  }

  // Insert in batches of 100
  for (let i = 0; i < sentimentRecords.length; i += 100) {
    const batch = sentimentRecords.slice(i, i + 100);
    const { error } = await supabase.from('sentiment_data').insert(batch);
    if (error) console.error('  ❌ Error:', error.message);
  }

  console.log('  ✅ Created 500 sentiment records\n');
}

// 2. Create social media posts
async function createSocialPosts({ constituencies }) {
  console.log('2️⃣  Creating social media posts (100 records)...');

  const platforms = ['twitter', 'facebook', 'instagram', 'youtube'];
  const posts = [];
  const now = new Date();

  const tvkContent = [
    'தளபதி விஜய் மக்களுக்காக குரல் கொடுக்கிறார் #TVK #TamilNadu',
    'TVK party symbol whistle approved! Ready for 2026 #VijayForTN',
    'வேலை வாய்ப்பு, கல்வி, சுகாதாரம் - TVK முக்கிய கவனம் #ChangeIsComing',
    'Youth unemployment is our top priority - TVK manifesto #Jobs2026',
    'தமிழ்நாட்டின் எதிர்காலம் பிரகாசமானது #TVK #Vijay2026'
  ];

  for (let i = 0; i < 100; i++) {
    const hoursAgo = Math.floor(Math.random() * 24);
    const posted_at = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    const isTVK = Math.random() > 0.6; // 40% TVK related
    const sentiment = isTVK ? 0.6 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;

    posts.push({
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      post_content: isTVK ? tvkContent[Math.floor(Math.random() * tvkContent.length)] :
        'General Tamil Nadu political discussion...',
      posted_at: posted_at.toISOString(),
      reach: Math.floor(Math.random() * 50000) + 1000,
      impressions: Math.floor(Math.random() * 100000) + 5000,
      engagement_count: Math.floor(Math.random() * 5000) + 100,
      likes: Math.floor(Math.random() * 3000) + 50,
      shares: Math.floor(Math.random() * 500) + 10,
      comments_count: Math.floor(Math.random() * 200) + 5,
      sentiment_score: sentiment,
      sentiment_polarity: sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral'
    });
  }

  const { error } = await supabase.from('social_posts').insert(posts);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log('  ✅ Created 100 social media posts\n');
}

// 3. Create alerts
async function createAlerts({ districts }) {
  console.log('3️⃣  Creating alerts (5 critical alerts)...');

  const alerts = [
    {
      alert_type: 'critical',
      title: 'High Volume Spike in Chennai',
      message: 'Unusual spike in social media activity detected: 2,500 posts in last hour mentioning TVK',
      district_id: districts.find(d => d.name === 'Chennai')?.id,
      priority: 'critical',
      is_read: false,
      action_required: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      alert_type: 'urgent',
      title: 'Negative Sentiment Trend - Coimbatore',
      message: 'Sentiment score dropped by 15% in Coimbatore district. Requires immediate attention.',
      district_id: districts.find(d => d.name === 'Coimbatore')?.id,
      priority: 'high',
      is_read: false,
      action_required: true,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      alert_type: 'warning',
      title: 'Jobs & Employment Issue Trending',
      message: 'Youth unemployment concerns increasing by 25% across 8 districts',
      priority: 'medium',
      is_read: false,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error } = await supabase.from('alerts').insert(alerts);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log('  ✅ Created 3 critical alerts\n');
}

// 4. Create trending topics
async function createTrendingTopics() {
  console.log('4️⃣  Creating trending topics (15 topics)...');

  const topics = [
    { keyword: '#TVK2026', volume: 2847, growth_rate: 0.45, sentiment_score: 0.72, platforms: ['twitter', 'facebook'] },
    { keyword: '#VijayForTamilNadu', volume: 1923, growth_rate: 0.38, sentiment_score: 0.68, platforms: ['twitter', 'instagram'] },
    { keyword: 'Jobs', volume: 1654, growth_rate: 0.15, sentiment_score: 0.42, platforms: ['twitter', 'facebook', 'youtube'] },
    { keyword: 'வேலை வாய்ப்பு', volume: 1432, growth_rate: 0.22, sentiment_score: 0.45, platforms: ['twitter', 'facebook'] },
    { keyword: '#Whistle', volume: 1289, growth_rate: 0.52, sentiment_score: 0.75, platforms: ['twitter', 'instagram'] },
    { keyword: 'Education', volume: 987, growth_rate: 0.08, sentiment_score: 0.58, platforms: ['facebook', 'youtube'] },
    { keyword: '#TamilNaduElections', volume: 876, growth_rate: 0.18, sentiment_score: 0.55, platforms: ['twitter', 'facebook'] },
    { keyword: 'Healthcare', volume: 743, growth_rate: 0.12, sentiment_score: 0.52, platforms: ['facebook'] },
    { keyword: 'தளபதி', volume: 698, growth_rate: 0.35, sentiment_score: 0.70, platforms: ['twitter', 'instagram'] },
    { keyword: 'Infrastructure', volume: 567, growth_rate: 0.05, sentiment_score: 0.48, platforms: ['twitter'] },
    { keyword: '#ChangeIsComing', volume: 498, growth_rate: 0.28, sentiment_score: 0.65, platforms: ['twitter', 'instagram'] },
    { keyword: 'Agriculture', volume: 456, growth_rate: 0.10, sentiment_score: 0.50, platforms: ['facebook', 'youtube'] },
    { keyword: 'Social Justice', volume: 389, growth_rate: 0.15, sentiment_score: 0.62, platforms: ['twitter'] },
    { keyword: '#Youth', volume: 345, growth_rate: 0.20, sentiment_score: 0.58, platforms: ['instagram'] },
    { keyword: 'Law & Order', volume: 298, growth_rate: -0.05, sentiment_score: 0.38, platforms: ['twitter', 'facebook'] }
  ];

  const topicsWithMeta = topics.map(t => ({
    ...t,
    time_period: '24h',
    first_detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    last_updated_at: new Date().toISOString(),
    tvk_related: ['#TVK2026', '#VijayForTamilNadu', '#Whistle', 'தளபதி', '#ChangeIsComing'].includes(t.keyword)
  }));

  const { error } = await supabase.from('trending_topics').insert(topicsWithMeta);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log('  ✅ Created 15 trending topics\n');
}

// Main execution
async function main() {
  const ids = await getIds();

  await createSentimentData(ids);
  await createSocialPosts(ids);
  await createAlerts(ids);
  await createTrendingTopics();

  console.log('═'.repeat(60));
  console.log('✅ Dashboard data populated successfully!');
  console.log('\n📊 Summary:');
  console.log('  • 500 sentiment records (last 7 days)');
  console.log('  • 100 social media posts (last 24 hours)');
  console.log('  • 3 critical alerts');
  console.log('  • 15 trending topics');
  console.log('\n🎉 Refresh your dashboard - cards should now show real data!');
  console.log('═'.repeat(60) + '\n');
}

main().catch(console.error);
