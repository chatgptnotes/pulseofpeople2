#!/usr/bin/env node
/**
 * TAMIL NEWS SCRAPER
 * Scrapes Tamil news sources for TVK mentions and political sentiment
 *
 * Features:
 * - RSS feed parsing (Dinamalar, Dinakaran, etc.)
 * - Web scraping for sites without RSS
 * - OpenAI/Claude sentiment analysis
 * - Auto-stores in Supabase news_articles table
 *
 * Usage:
 *   node scripts/tamil-news-scraper.js
 *   node scripts/tamil-news-scraper.js --once  (single run, no loop)
 */

import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ================== CONFIGURATION ==================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_SECRET');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; PulseOfPeople/1.0; +https://pulseofpeople.com)'
  }
});

// Tamil Nadu News Sources
const NEWS_SOURCES = [
  {
    id: 'dinamalar',
    name: 'Dinamalar',
    language: 'ta',
    rss: 'https://www.dinamalar.com/rss/headlines_ta.xml',
    baseUrl: 'https://www.dinamalar.com',
    credibility: 0.85
  },
  {
    id: 'dinakaran',
    name: 'Dinakaran',
    language: 'ta',
    rss: 'https://www.dinakaran.com/feed/',
    baseUrl: 'https://www.dinakaran.com',
    credibility: 0.80
  },
  {
    id: 'puthiyathalaimurai',
    name: 'Puthiya Thalaimurai',
    language: 'ta',
    rss: 'https://www.puthiyathalaimurai.com/rss',
    baseUrl: 'https://www.puthiyathalaimurai.com',
    credibility: 0.82
  },
  {
    id: 'hindu-tamil',
    name: 'The Hindu Tamil',
    language: 'ta',
    rss: 'https://tamil.thehindu.com/news/feeder/default.rss',
    baseUrl: 'https://tamil.thehindu.com',
    credibility: 0.90
  },
  {
    id: 'news18-tamil',
    name: 'News18 Tamil Nadu',
    language: 'ta',
    rss: 'https://tamil.news18.com/rss/tamilnadu.xml',
    baseUrl: 'https://tamil.news18.com',
    credibility: 0.75
  },
  {
    id: 'thehindu',
    name: 'The Hindu',
    language: 'en',
    rss: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
    baseUrl: 'https://www.thehindu.com',
    credibility: 0.92
  },
  {
    id: 'toi-chennai',
    name: 'Times of India - Chennai',
    language: 'en',
    rss: 'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms',
    baseUrl: 'https://timesofindia.indiatimes.com',
    credibility: 0.78
  }
];

// TVK Keywords for detection
const TVK_KEYWORDS = {
  party: ['TVK', 'தமிழக வெற்றி கழகம்', 'Tamilaga Vettri Kazhagam', 'தவக', 'தமிழக வெற்றிக் கழகம்'],
  leader: ['Vijay', 'விஜய்', 'Thalapathy', 'தளபதி', 'Thalapathy Vijay', 'தளபதி விஜய்', 'Joseph Vijay', 'Actor Vijay'],
  related: ['TVK party', 'Vijay party', 'விஜய் கட்சி', 'தமிழக அரசியல்']
};

const ALL_TVK_KEYWORDS = [...TVK_KEYWORDS.party, ...TVK_KEYWORDS.leader, ...TVK_KEYWORDS.related];

// ================== HELPER FUNCTIONS ==================

function containsTVKMention(text) {
  if (!text) return false;
  return ALL_TVK_KEYWORDS.some(keyword => text.includes(keyword));
}

function countTVKMentions(text) {
  if (!text) return 0;
  let count = 0;
  ALL_TVK_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

function extractTVKContext(text) {
  if (!text) return null;

  // Find sentences containing TVK keywords
  const sentences = text.split(/[।.!?]+/);
  const tvkSentences = sentences.filter(s => containsTVKMention(s));

  if (tvkSentences.length === 0) return null;

  // Return first 3 sentences with TVK mention
  return tvkSentences.slice(0, 3).join('. ').trim();
}

async function analyzeSentimentWithAI(text, language) {
  if (!openai) {
    console.warn('⚠️  OpenAI not configured, using fallback keyword analysis');
    return keywordBasedSentiment(text);
  }

  try {
    const prompt = `Analyze the sentiment of this ${language === 'ta' ? 'Tamil' : 'English'} news article text.

Text: "${text}"

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "sentiment_score": <number between -1 and 1>,
  "sentiment_polarity": "<positive/negative/neutral>",
  "emotion": "<anger/trust/fear/hope/pride/joy/sadness/surprise/disgust/neutral>",
  "confidence": <number between 0 and 1>,
  "summary": "<2-3 sentence summary>"
}

Rules:
- sentiment_score: -1 (very negative) to +1 (very positive)
- confidence: How confident you are in the analysis
- If the text is about TVK/Vijay party, focus on sentiment towards them specifically`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a political sentiment analysis expert specializing in Tamil Nadu politics. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(jsonStr);

    return {
      sentiment_score: result.sentiment_score,
      sentiment_polarity: result.sentiment_polarity,
      emotion: result.emotion,
      confidence: result.confidence,
      summary: result.summary
    };
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return keywordBasedSentiment(text);
  }
}

function keywordBasedSentiment(text) {
  // Fallback: Simple keyword-based sentiment
  const positiveWords = ['good', 'great', 'excellent', 'success', 'win', 'அருமை', 'நல்ல', 'வெற்றி'];
  const negativeWords = ['bad', 'terrible', 'fail', 'corruption', 'scandal', 'கெட்ட', 'மோசம்', 'ஊழல்'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.some(p => word.includes(p))) score += 0.1;
    if (negativeWords.some(n => word.includes(n))) score -= 0.1;
  });

  score = Math.max(-1, Math.min(1, score));

  return {
    sentiment_score: score,
    sentiment_polarity: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
    emotion: 'neutral',
    confidence: 0.5
  };
}

// ================== SCRAPING FUNCTIONS ==================

async function scrapeRSSFeed(source) {
  console.log(`📰 Scraping ${source.name} (${source.language.toUpperCase()})...`);

  try {
    const feed = await rssParser.parseURL(source.rss);
    const articles = [];

    for (const item of feed.items.slice(0, 20)) { // Latest 20 articles
      const tvkMentioned = containsTVKMention(item.title + ' ' + (item.contentSnippet || item.content || ''));

      // Only process articles with TVK mention OR major political news
      if (!tvkMentioned && !item.title.toLowerCase().includes('tamil nadu')) {
        continue;
      }

      const content = item.contentSnippet || item.content || item.summary || '';
      const fullText = item.title + ' ' + content;

      console.log(`  📄 ${item.title.substring(0, 80)}...`);

      // Analyze sentiment
      const sentiment = await analyzeSentimentWithAI(fullText, source.language);

      // TVK-specific analysis if mentioned
      let tvkSentiment = null;
      if (tvkMentioned) {
        const tvkContext = extractTVKContext(fullText);
        if (tvkContext) {
          tvkSentiment = await analyzeSentimentWithAI(tvkContext, source.language);
        }
      }

      articles.push({
        title: item.title,
        content: content,
        summary: sentiment.summary || content.substring(0, 300),
        url: item.link,
        source: source.name,
        author: item.creator || item.author || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),

        // Sentiment
        sentiment_score: sentiment.sentiment_score,
        sentiment_polarity: sentiment.sentiment_polarity,
        emotion: sentiment.emotion,
        confidence: sentiment.confidence,

        // TVK Specific
        tvk_mentioned: tvkMentioned,
        tvk_mention_count: tvkMentioned ? countTVKMentions(fullText) : 0,
        tvk_context: tvkMentioned ? extractTVKContext(fullText) : null,
        tvk_sentiment_score: tvkSentiment?.sentiment_score || null,
        tvk_sentiment_polarity: tvkSentiment?.sentiment_polarity || null,

        language: source.language,
        credibility_score: source.credibility,
        analyzed_at: new Date().toISOString()
      });

      // Rate limiting (OpenAI has 3 RPM limit on free tier)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`  ✅ Scraped ${articles.length} articles from ${source.name}`);
    return articles;

  } catch (error) {
    console.error(`  ❌ Error scraping ${source.name}:`, error.message);
    return [];
  }
}

async function saveArticlesToDatabase(articles) {
  if (articles.length === 0) {
    console.log('ℹ️  No articles to save');
    return { inserted: 0, skipped: 0 };
  }

  console.log(`💾 Saving ${articles.length} articles to database...`);

  let inserted = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      // Check if article already exists by URL
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert new article
      const { error } = await supabase
        .from('news_articles')
        .insert([article]);

      if (error) {
        console.error(`  ❌ Error inserting article:`, error.message);
      } else {
        inserted++;
        if (article.tvk_mentioned) {
          console.log(`  ✅ Saved TVK article: ${article.title.substring(0, 60)}...`);
        }
      }

    } catch (error) {
      console.error(`  ❌ Database error:`, error.message);
    }
  }

  console.log(`  📊 Results: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  return { inserted, skipped };
}

// ================== MAIN SCRAPING LOOP ==================

async function scrapeAllSources() {
  console.log('🚀 Starting Tamil News Scraper...');
  console.log(`⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);

  const allArticles = [];

  for (const source of NEWS_SOURCES) {
    const articles = await scrapeRSSFeed(source);
    allArticles.push(...articles);

    // Wait between sources to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save all articles to database
  const stats = await saveArticlesToDatabase(allArticles);

  console.log('\n📈 SUMMARY:');
  console.log(`  Total articles scraped: ${allArticles.length}`);
  console.log(`  TVK mentions: ${allArticles.filter(a => a.tvk_mentioned).length}`);
  console.log(`  Inserted: ${stats.inserted}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Avg sentiment: ${(allArticles.reduce((sum, a) => sum + a.sentiment_score, 0) / allArticles.length).toFixed(2)}`);

  const tvkArticles = allArticles.filter(a => a.tvk_mentioned);
  if (tvkArticles.length > 0) {
    const tvkAvgSentiment = tvkArticles.reduce((sum, a) => sum + (a.tvk_sentiment_score || 0), 0) / tvkArticles.length;
    console.log(`  TVK avg sentiment: ${tvkAvgSentiment.toFixed(2)} (${tvkAvgSentiment > 0 ? 'Positive' : 'Negative'})`);
  }

  console.log('\n✅ Scraping complete!\n');
}

// ================== SCHEDULER ==================

async function main() {
  const runOnce = process.argv.includes('--once');

  if (runOnce) {
    console.log('📍 Running in single-run mode\n');
    await scrapeAllSources();
    process.exit(0);
  }

  // Continuous mode: Run every 15 minutes
  console.log('🔄 Running in continuous mode (every 15 minutes)');
  console.log('   Press Ctrl+C to stop\n');

  await scrapeAllSources();

  setInterval(async () => {
    console.log('\n' + '='.repeat(60));
    await scrapeAllSources();
  }, 15 * 60 * 1000); // 15 minutes
}

// Start scraper
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
