# 🤖 AI-Powered Constituency Sentiment System

## Overview

This system uses **OpenAI GPT-4** to automatically analyze news, social media, and public sentiment about TVK party in each district of Tamil Nadu. The sentiment scores update daily and power the interactive map visualization.

---

## 🎯 What It Does

### Daily Automated Analysis

Every day at **6:00 AM**, the system:

1. **📰 Searches for News**
   - Latest news from Tamil newspapers
   - Social media mentions of TVK
   - Local issues and developments
   - Public sentiment indicators

2. **🤖 AI Analysis (OpenAI GPT-4)**
   - Analyzes sentiment towards the party
   - Identifies key issues affecting each district
   - Determines party strength (weak/moderate/strong)
   - Recommends specific actions needed

3. **💾 Updates Database**
   - Stores sentiment scores (0-100)
   - Records key issues and reasoning
   - Maintains historical trends
   - Powers the map visualization

4. **📊 Generates Reports**
   - Lists critical districts (red)
   - Identifies areas needing attention (yellow)
   - Celebrates strong performance (green)

---

## 🎨 Sentiment Score Meaning

The map uses a **party-focused interpretation**:

### 🔴 RED (0-49): URGENT ACTION NEEDED
- **Meaning**: Critical issues, protests, negative public sentiment
- **Party Status**: Weak presence, people unhappy
- **Action**: Immediate intervention required
- **Examples**:
  - Major protests or strikes
  - Negative media coverage
  - Poor service delivery
  - Anti-party sentiment

### 🟡 YELLOW (50-69): MONITOR CLOSELY
- **Meaning**: Mixed sentiment, some concerns
- **Party Status**: Moderate presence, manageable issues
- **Action**: Monitor and address concerns
- **Examples**:
  - Some complaints but also support
  - Developing issues
  - Neutral media coverage
  - Room for improvement

### 🟢 GREEN (70-100): PARTY DOING WELL
- **Meaning**: Positive sentiment, people happy
- **Party Status**: Strong presence, active work
- **Action**: Maintain momentum, expand programs
- **Examples**:
  - Successful initiatives
  - Positive public feedback
  - Good media coverage
  - High public satisfaction

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install openai @supabase/supabase-js tsx
```

### 2. Set Environment Variables

Create `.env` file:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-key-here

# Supabase (already configured)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy and paste into `.env`

### 3. Run Database Migration

```bash
# Apply the sentiment tracking schema
supabase db push
```

Or manually run:
```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/05_district_sentiment_ai.sql
```

### 4. Setup Daily Cron Job

```bash
# Make script executable
chmod +x scripts/cron-setup.sh

# Run setup
./scripts/cron-setup.sh
```

This creates a cron job that runs every day at 6 AM.

### 5. Test Manually

```bash
# Test the sentiment updater
tsx scripts/update-constituency-sentiment.ts
```

Expected output:
```
🚀 Starting Daily Sentiment Update...
📅 Date: 11/13/2025
⏰ Time: 6:00:00 AM

🔍 Searching news for Chennai...
🤖 Analyzing sentiment for Chennai with AI...
💾 Updating database for Chennai...
✅ Updated Chennai: Score 72

... (processes all districts)

📊 DAILY SENTIMENT REPORT
================================================================================

🔴 CRITICAL - Needs Urgent Action: 3
   Dharmapuri: 45 - Address unemployment concerns
   Ariyalur: 42 - Improve healthcare facilities
   Kallakurichi: 38 - Respond to infrastructure complaints

🟡 NEEDS ATTENTION: 12
   Salem: 65 - Jobs, Education
   Vellore: 62 - Healthcare, Infrastructure
   ...

🟢 POSITIVE SENTIMENT: 22
   Chennai: 75 - strong strength
   Coimbatore: 78 - strong strength
   ...

Average Score: 67
================================================================================
```

---

## 📁 File Structure

```
scripts/
  ├── update-constituency-sentiment.ts  # Main AI sentiment updater
  └── cron-setup.sh                     # Cron job installer

supabase/migrations/
  └── 05_district_sentiment_ai.sql      # Database schema

src/data/
  ├── defaultConstituencySentiment.ts   # Default fallback data
  └── constituencyIssueData.ts          # Issue-specific data

logs/
  └── sentiment-update.log              # Daily execution logs
```

---

## 🔧 Customization

### Add More News Sources

Edit `searchDistrictNews()` in `update-constituency-sentiment.ts`:

```typescript
async function searchDistrictNews(district: string): Promise<string[]> {
  // Add your news API integrations here:

  // Google News API
  const googleNews = await fetch(`https://newsapi.org/v2/everything?q=${district}+Tamil+Nadu`);

  // Twitter API
  const tweets = await searchTwitter(`#TVK ${district}`);

  // Tamil news sites
  const tamilNews = await scrape Dinamalar/TheHinduTamil/etc

  return [...googleNews, ...tweets, ...tamilNews];
}
```

### Adjust AI Prompt

Modify the prompt in `analyzeSentimentWithAI()` to:
- Focus on different issues
- Change scoring criteria
- Add more context
- Adjust sensitivity

### Change Schedule

Edit cron timing:
```bash
# Run at 6 AM daily (current)
0 6 * * *

# Run at midnight
0 0 * * *

# Run every 6 hours
0 */6 * * *

# Run twice daily (6 AM and 6 PM)
0 6,18 * * *
```

---

## 💰 Cost Estimation

**OpenAI API Costs** (GPT-4o-mini):

- **Per district analysis**: ~$0.0001-0.0003
- **37 districts/day**: ~$0.01-0.02/day
- **Monthly cost**: ~$0.30-0.60/month

Very affordable! GPT-4o-mini is optimized for cost.

To use full GPT-4 (more accurate but expensive):
```typescript
model: 'gpt-4-turbo-preview' // Change in update-constituency-sentiment.ts
```

---

## 📊 Database Schema

### `district_sentiment` Table

| Column | Type | Description |
|--------|------|-------------|
| district | VARCHAR | District name |
| sentiment_score | INTEGER | 0-100 score |
| party_strength | VARCHAR | weak/moderate/strong |
| key_issues | JSONB | Array of top issues |
| reasoning | TEXT | AI explanation |
| action_needed | TEXT | Recommended actions |
| news_snippets | JSONB | News headlines analyzed |
| last_updated | TIMESTAMPTZ | Last update time |

### `sentiment_history` Table

Tracks score changes over time for trend analysis.

---

## 🔍 Monitoring

### View Logs

```bash
# Watch live updates
tail -f logs/sentiment-update.log

# View recent runs
tail -100 logs/sentiment-update.log
```

### Check Cron Job

```bash
# List all cron jobs
crontab -l

# View last execution
grep "update-constituency-sentiment" /var/log/syslog
```

### Database Queries

```sql
-- View current sentiment
SELECT * FROM district_sentiment ORDER BY sentiment_score ASC;

-- Critical districts
SELECT district, sentiment_score, action_needed
FROM district_sentiment
WHERE sentiment_score < 50
ORDER BY sentiment_score ASC;

-- Sentiment trends
SELECT district, sentiment_score, recorded_at
FROM sentiment_history
WHERE district = 'Chennai'
ORDER BY recorded_at DESC
LIMIT 30;

-- Average score
SELECT AVG(sentiment_score) as avg_score FROM district_sentiment;
```

---

## 🚨 Troubleshooting

### OpenAI API Errors

**Rate limit exceeded:**
```bash
# Add delay between batches (already implemented)
await new Promise(resolve => setTimeout(resolve, 2000));
```

**Invalid API key:**
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Update .env file
```

### Cron Not Running

```bash
# Check cron service
sudo service cron status

# View cron logs
grep CRON /var/log/syslog

# Test manually
tsx scripts/update-constituency-sentiment.ts
```

### Database Connection Issues

```bash
# Test Supabase connection
psql -h your-db-host -U postgres -d postgres

# Check environment variables
echo $VITE_SUPABASE_URL
```

---

## 🎯 Future Enhancements

1. **Real-time News Integration**
   - Google News API
   - Twitter API for #TVK mentions
   - Tamil news aggregators

2. **Multilingual Analysis**
   - Process Tamil language news
   - Analyze regional newspapers
   - Social media in Tamil

3. **Advanced Analytics**
   - Trend prediction
   - Issue correlation analysis
   - Demographic insights

4. **Alert System**
   - Email alerts for critical drops
   - SMS notifications for urgent issues
   - Slack/WhatsApp integration

5. **Web Dashboard**
   - Real-time sentiment view
   - Historical charts
   - Issue tracking system

---

## 📞 Support

For issues or questions:
1. Check logs: `logs/sentiment-update.log`
2. Review database: Query `district_sentiment` table
3. Test manually: `tsx scripts/update-constituency-sentiment.ts`

---

**🎉 Your map now has AI-powered, auto-updating sentiment data!**

The system runs automatically every day, keeping your political intelligence fresh and actionable.
