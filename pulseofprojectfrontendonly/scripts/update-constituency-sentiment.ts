#!/usr/bin/env tsx
/**
 * AI-Powered Constituency Sentiment Updater
 *
 * This script:
 * 1. Searches for latest news about each constituency/district
 * 2. Uses OpenAI to analyze sentiment towards the party (TVK)
 * 3. Updates sentiment scores in the database
 * 4. Runs daily via cron job
 *
 * RED (0-49): Party needs urgent attention - Issues, protests, negative coverage
 * YELLOW (50-69): Neutral/Mixed - Some concerns but manageable
 * GREEN (70-100): Party is doing well - Positive sentiment, happy people
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Environment setup
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Major districts to track (can expand to all 234 constituencies)
const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Tirunelveli',
  'Kancheepuram', 'Villupuram', 'Kanniyakumari', 'Theni', 'Dindigul',
  'Cuddalore', 'Nagapattinam', 'Karur', 'Pudukkottai', 'Ramanathapuram',
  'Virudhunagar', 'Sivaganga', 'Tiruvannamalai', 'Dharmapuri', 'Krishnagiri',
  'Namakkal', 'Perambalur', 'Ariyalur', 'Nilgiris', 'Tenkasi',
  'Tirupattur', 'Ranipet', 'Kallakurichi', 'Chengalpattu', 'Tiruvallur',
  'Mayiladuthurai', 'Kanyakumari'
];

interface SentimentAnalysis {
  district: string;
  overallScore: number; // 0-100
  reasoning: string;
  keyIssues: string[];
  partyStrength: 'weak' | 'moderate' | 'strong';
  actionNeeded: string;
  newsSnippets: string[];
}

/**
 * Search for recent news about a district
 * Uses multiple sources: Google News, Twitter trends, local Tamil news
 */
async function searchDistrictNews(district: string): Promise<string[]> {
  console.log(`🔍 Searching news for ${district}...`);

  // Simulated news search - In production, integrate with:
  // - Google News API
  // - Twitter API for #TVK mentions
  // - Tamil news aggregators (Dinamalar, The Hindu Tamil, etc.)
  // - Social media monitoring tools

  const searchQuery = `${district} Tamil Nadu TVK party news politics sentiment`;

  // For now, return simulated recent news headlines
  // TODO: Replace with actual API calls
  const simulatedNews = [
    `TVK party rally in ${district} draws large crowd - The Hindu`,
    `${district} residents demand better infrastructure, TVK responds`,
    `Employment concerns raised in ${district} town hall meeting`,
    `TVK announces new healthcare initiative for ${district} district`,
    `Local farmers in ${district} protest agricultural policies`,
  ];

  return simulatedNews;
}

/**
 * Use OpenAI to analyze sentiment from news
 */
async function analyzeSentimentWithAI(
  district: string,
  newsArticles: string[]
): Promise<SentimentAnalysis> {
  console.log(`🤖 Analyzing sentiment for ${district} with AI...`);

  const prompt = `You are a political sentiment analyst for TVK (Tamilaga Vettri Kazhagam) party in Tamil Nadu.

Analyze the following recent news about ${district} district and determine:

1. Overall Sentiment Score (0-100):
   - 0-49 (RED): Critical issues, protests, negative sentiment - Party needs URGENT action
   - 50-69 (YELLOW): Mixed sentiment, some concerns - Party should monitor closely
   - 70-100 (GREEN): Positive sentiment, people happy - Party doing well

2. Party Strength in the area (weak/moderate/strong)

3. Key issues affecting sentiment (list 3-5 main concerns)

4. Specific action needed by the party (if any)

Recent news about ${district}:
${newsArticles.map((news, i) => `${i + 1}. ${news}`).join('\n')}

Context: TVK is a new political party led by actor Vijay, focused on:
- Jobs & youth employment
- Quality education
- Better healthcare
- Infrastructure development
- Social justice
- Anti-corruption

Respond in JSON format:
{
  "overallScore": <number 0-100>,
  "partyStrength": "<weak|moderate|strong>",
  "keyIssues": ["issue1", "issue2", "issue3"],
  "reasoning": "<brief explanation>",
  "actionNeeded": "<what party should do>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        {
          role: 'system',
          content: 'You are an expert political analyst specializing in Tamil Nadu politics. Provide objective, data-driven sentiment analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Low temperature for consistency
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      district,
      overallScore: analysis.overallScore || 65,
      reasoning: analysis.reasoning || 'No specific data available',
      keyIssues: analysis.keyIssues || [],
      partyStrength: analysis.partyStrength || 'moderate',
      actionNeeded: analysis.actionNeeded || 'Continue monitoring',
      newsSnippets: newsArticles,
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${district}:`, error);
    return {
      district,
      overallScore: 65, // Default neutral
      reasoning: 'Analysis failed, using default',
      keyIssues: [],
      partyStrength: 'moderate',
      actionNeeded: 'Manual review needed',
      newsSnippets: newsArticles,
    };
  }
}

/**
 * Update sentiment in Supabase database
 */
async function updateSentimentInDatabase(analysis: SentimentAnalysis) {
  console.log(`💾 Updating database for ${analysis.district}...`);

  try {
    // Update or insert sentiment data
    const { error } = await supabase
      .from('district_sentiment')
      .upsert({
        district: analysis.district,
        sentiment_score: analysis.overallScore,
        party_strength: analysis.partyStrength,
        key_issues: analysis.keyIssues,
        reasoning: analysis.reasoning,
        action_needed: analysis.actionNeeded,
        last_updated: new Date().toISOString(),
        news_snippets: analysis.newsSnippets,
      }, {
        onConflict: 'district'
      });

    if (error) {
      console.error(`❌ Database error for ${analysis.district}:`, error);
    } else {
      console.log(`✅ Updated ${analysis.district}: Score ${analysis.overallScore}`);
    }
  } catch (error) {
    console.error(`❌ Failed to update ${analysis.district}:`, error);
  }
}

/**
 * Generate summary report
 */
function generateReport(analyses: SentimentAnalysis[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DAILY SENTIMENT REPORT');
  console.log('='.repeat(80) + '\n');

  const critical = analyses.filter(a => a.overallScore < 50);
  const attention = analyses.filter(a => a.overallScore >= 50 && a.overallScore < 70);
  const positive = analyses.filter(a => a.overallScore >= 70);

  console.log('🔴 CRITICAL - Needs Urgent Action:', critical.length);
  critical.forEach(a => {
    console.log(`   ${a.district}: ${a.overallScore} - ${a.actionNeeded}`);
  });

  console.log('\n🟡 NEEDS ATTENTION:', attention.length);
  attention.forEach(a => {
    console.log(`   ${a.district}: ${a.overallScore} - ${a.keyIssues.join(', ')}`);
  });

  console.log('\n🟢 POSITIVE SENTIMENT:', positive.length);
  positive.forEach(a => {
    console.log(`   ${a.district}: ${a.overallScore} - ${a.partyStrength} strength`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Average Score: ${Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Daily Sentiment Update...\n');
  console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
  console.log(`⏰ Time: ${new Date().toLocaleTimeString()}\n`);

  const analyses: SentimentAnalysis[] = [];

  // Process districts in batches to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < DISTRICTS.length; i += BATCH_SIZE) {
    const batch = DISTRICTS.slice(i, i + BATCH_SIZE);

    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(DISTRICTS.length / BATCH_SIZE)}`);

    const batchPromises = batch.map(async (district) => {
      // 1. Search for news
      const news = await searchDistrictNews(district);

      // 2. Analyze with AI
      const analysis = await analyzeSentimentWithAI(district, news);

      // 3. Update database
      await updateSentimentInDatabase(analysis);

      return analysis;
    });

    const batchResults = await Promise.all(batchPromises);
    analyses.push(...batchResults);

    // Rate limiting - wait between batches
    if (i + BATCH_SIZE < DISTRICTS.length) {
      console.log('⏳ Waiting 2 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Generate and display report
  generateReport(analyses);

  console.log('✅ Daily sentiment update completed!');
  console.log('💡 Next run: Tomorrow at the same time\n');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { analyzeSentimentWithAI, searchDistrictNews };
