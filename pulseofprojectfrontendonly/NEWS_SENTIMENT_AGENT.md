# News Sentiment Analysis Agent for TVK Party

## Overview

The News Sentiment Analysis Agent is an autonomous system that analyzes news articles to track sentiment about the TVK (Tamilaga Vettri Kazhagam) party. It automatically processes articles, detects TVK mentions, performs sentiment analysis, and generates comprehensive reports.

## Features

- **Autonomous Operation**: Runs automatically on a configurable schedule
- **TVK Detection**: Identifies mentions of TVK party and its leaders
- **Sentiment Analysis**: Analyzes overall and TVK-specific sentiment
- **Multilingual Support**: Handles Tamil and English content
- **Real-time Monitoring**: Continuous analysis of incoming articles
- **Report Generation**: Creates daily/weekly/monthly sentiment reports
- **Alert System**: Notifies of significant sentiment changes
- **Historical Tracking**: Monitors sentiment trends over time

## Architecture

### Core Components

1. **newsService.ts** - CRUD operations and TVK detection
2. **newsAgent.ts** - Autonomous sentiment analysis agent
3. **useNewsSentiment.ts** - React hook for UI integration
4. **Database Tables** - news_articles, tvk_sentiment_reports, news_sources

### Database Schema

```sql
-- News articles with sentiment scores
news_articles
  - id, title, content, source, published_at
  - sentiment_score, sentiment_polarity, emotion, confidence
  - tvk_mentioned, tvk_mention_count, tvk_sentiment_score

-- Aggregated TVK sentiment reports
tvk_sentiment_reports
  - report_date, period_type (daily/weekly/monthly)
  - overall_sentiment_score, sentiment_distribution
  - trending_topics, top_sources, alert_level

-- News source configuration
news_sources
  - name, url, credibility_score, is_active
  - language, region, fetch_frequency
```

## Setup & Installation

### 1. Database Migration

Run the migration to create required tables:

```bash
# Apply migration
supabase db push

# Or manually run the migration file
psql -h your-db-host -U your-user -d your-db -f supabase/migrations/03_news_sentiment_tables.sql
```

### 2. Environment Configuration

Add to your `.env` file:

```bash
# News API (choose one)
VITE_NEWS_API_KEY=your-news-api-key
VITE_NEWS_API_ENDPOINT=https://newsapi.org/v2

# Agent Configuration
VITE_NEWS_AGENT_ENABLED=true
VITE_NEWS_AGENT_INTERVAL=900000  # 15 minutes
VITE_NEWS_AGENT_BATCH_SIZE=50
VITE_NEWS_AGENT_MIN_CONFIDENCE=0.6

# TVK Detection
VITE_TVK_ORG_ID=11111111-1111-1111-1111-111111111111
VITE_TVK_ALERT_THRESHOLD=0.3
```

### 3. Import Agent in Your App

```typescript
import { tvkNewsAgent } from './services/newsAgent';

// Start the agent
tvkNewsAgent.start();
```

## Usage

### Using the React Hook

The easiest way to integrate news sentiment analysis in your UI:

```typescript
import { useNewsSentiment } from './hooks/useNewsSentiment';

function NewsSentimentDashboard() {
  const {
    // Data
    articles,
    tvkArticles,
    latestReport,

    // Loading states
    loadingArticles,
    loadingReports,

    // Agent status
    agentStatus,

    // Actions
    runAnalysis,
    generateReport,
    startAgent,
    stopAgent,
    refreshData
  } = useNewsSentiment({
    autoFetch: true,
    autoFetchInterval: 60000  // Refresh every minute
  });

  return (
    <div>
      <h1>TVK News Sentiment Analysis</h1>

      {/* Agent Status */}
      <div>
        Status: {agentStatus.isRunning ? 'Running' : 'Stopped'}
        Articles Analyzed: {agentStatus.articlesAnalyzed}
        Last Run: {agentStatus.lastRunTime?.toLocaleString()}
      </div>

      {/* Latest Report */}
      {latestReport && (
        <div>
          <h2>Latest Sentiment Report</h2>
          <p>Overall Sentiment: {latestReport.overall_sentiment_score.toFixed(2)}</p>
          <p>Polarity: {latestReport.overall_sentiment_polarity}</p>
          <p>TVK Articles: {latestReport.tvk_mentioned_articles}</p>
          <p>Positive: {latestReport.positive_percentage.toFixed(1)}%</p>
          <p>Negative: {latestReport.negative_percentage.toFixed(1)}%</p>
          <p>Neutral: {latestReport.neutral_percentage.toFixed(1)}%</p>
        </div>
      )}

      {/* TVK Articles */}
      <div>
        <h2>TVK-Related Articles</h2>
        {tvkArticles.map(article => (
          <div key={article.id}>
            <h3>{article.title}</h3>
            <p>Source: {article.source}</p>
            <p>Sentiment: {article.tvk_sentiment_score?.toFixed(2)}
               ({article.tvk_sentiment_polarity})</p>
            <p>Mentions: {article.tvk_mention_count}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button onClick={() => runAnalysis({ generateReport: true })}>
        Analyze Now
      </button>
      <button onClick={generateReport}>
        Generate Report
      </button>
    </div>
  );
}
```

### Using the Agent Directly

For programmatic control without React:

```typescript
import { createNewsAgent } from './services/newsAgent';

// Create agent instance
const agent = createNewsAgent('your-org-id', {
  analysisInterval: 15 * 60 * 1000,  // 15 minutes
  batchSize: 50,
  minConfidenceThreshold: 0.6,
  enableReportGeneration: true,
  alertThreshold: 0.3
});

// Start autonomous operation
agent.start();

// Manual analysis
const result = await agent.runManualAnalysis({
  generateReport: true
});

console.log(`Analyzed ${result.articlesAnalyzed} articles`);
console.log(`Found ${result.tvkArticlesFound} TVK mentions`);
console.log(`Average sentiment: ${result.averageSentiment}`);

// Generate custom report
const report = await agent.generateCustomReport(
  '2025-01-01',
  '2025-01-31'
);

// Get agent status
const status = agent.getStatus();
console.log('Is running:', status.isRunning);
console.log('Next run:', status.nextRunTime);

// Stop agent
agent.stop();
```

### Using the Service Directly

For low-level operations:

```typescript
import { newsService } from './services/newsService';

// Create a news article
const article = await newsService.createArticle({
  organization_id: 'your-org-id',
  title: 'TVK Party Announces New Initiative',
  content: 'Full article content here...',
  source: 'The Hindu',
  published_at: new Date().toISOString(),
  language: 'en'
});

// TVK detection happens automatically
console.log('TVK mentioned:', article.tvk_mentioned);
console.log('Mention count:', article.tvk_mention_count);

// Get TVK articles
const tvkArticles = await newsService.getTVKArticles({
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  sentimentPolarity: 'positive'
});

// Get latest report
const latestReport = await newsService.getLatestTVKReport('daily');

// Get report history
const reports = await newsService.getTVKReports(
  '2025-01-01',
  '2025-01-31',
  'daily'
);
```

## TVK Detection

The agent automatically detects TVK party mentions using these keywords:

### Party Names
- TVK
- தமிழக வெற்றி கழகம் (Tamil)
- Tamilaga Vettri Kazhagam
- தவக (abbreviation)

### Leader Names
- Vijay
- விஜய் (Tamil)
- Thalapathy
- தளபதி (Tamil)
- Thalapathy Vijay
- Actor Vijay

### Context Extraction
When TVK is mentioned, the agent extracts:
- Surrounding context (50 chars before/after)
- Specific sentiment about TVK
- Mention count and locations

## Sentiment Analysis

### Scoring System

- **Sentiment Score**: -1 (very negative) to +1 (very positive)
- **Polarity**: positive, negative, or neutral
- **Confidence**: 0 to 1 (how confident the analysis is)
- **Emotion**: anger, trust, fear, hope, pride, joy, sadness, surprise, disgust

### TVK-Specific Analysis

When TVK is mentioned, the agent performs dual analysis:
1. **Overall Article Sentiment**: How the entire article feels
2. **TVK-Specific Sentiment**: How TVK is portrayed in context

Example:
```
Article: "Economic crisis worsens, but TVK proposes innovative solutions"
Overall Sentiment: -0.4 (negative)
TVK Sentiment: +0.6 (positive)
```

## Report Generation

### Report Types

1. **Hourly Reports**: Real-time monitoring (for breaking news)
2. **Daily Reports**: Standard daily sentiment tracking
3. **Weekly Reports**: Week-over-week trend analysis
4. **Monthly Reports**: Long-term sentiment patterns

### Report Contents

Each report includes:
- Overall sentiment score and distribution
- TVK mention statistics
- Trending topics and keywords
- Top news sources
- Geographic distribution
- Sentiment trend direction
- Alert indicators

### Accessing Reports

```typescript
// Latest daily report
const report = await newsService.getLatestTVKReport('daily');

// Historical reports
const reports = await newsService.getTVKReports(
  '2025-01-01',
  '2025-12-31',
  'weekly'
);

// Generate custom report
const customReport = await agent.generateCustomReport(
  '2025-01-15',
  '2025-01-20'
);
```

## Alert System

The agent automatically generates alerts for:

### Alert Types
- **Sentiment Spike**: Sudden positive sentiment increase
- **Sentiment Drop**: Sudden negative sentiment decrease
- **Volume Spike**: Unusual increase in TVK mentions
- **Crisis Detection**: Negative sentiment + high volume

### Alert Levels
- **Normal**: No significant changes
- **Warning**: Moderate sentiment shift (>30%)
- **Critical**: Major sentiment shift (>50%)

### Handling Alerts

```typescript
const report = latestReport;

if (report.has_anomaly) {
  console.log(`Alert: ${report.alert_level}`);
  console.log(report.alert_message);

  // Take action based on alert level
  if (report.alert_level === 'critical') {
    // Notify stakeholders
    // Generate detailed analysis
    // Trigger manual review
  }
}
```

## Best Practices

### 1. Article Data Management

```typescript
// Always verify articles before analysis
const articles = await newsService.getUnanalyzedArticles(50);

// Filter by confidence after analysis
const highConfidence = articles.filter(a =>
  a.confidence && a.confidence >= 0.7
);
```

### 2. Agent Configuration

```typescript
// Production: Less frequent, larger batches
const prodAgent = createNewsAgent(orgId, {
  analysisInterval: 60 * 60 * 1000,  // 1 hour
  batchSize: 100,
  minConfidenceThreshold: 0.7
});

// Development: More frequent, smaller batches
const devAgent = createNewsAgent(orgId, {
  analysisInterval: 5 * 60 * 1000,  // 5 minutes
  batchSize: 10,
  minConfidenceThreshold: 0.5
});
```

### 3. Error Handling

```typescript
const result = await agent.runManualAnalysis();

if (!result.success) {
  console.error('Analysis failed:', result.errors);

  // Retry logic
  if (result.articlesAnalyzed === 0) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    await agent.runManualAnalysis();
  }
}
```

### 4. Performance Optimization

```typescript
// Batch operations
const articleIds = [...]; // many IDs
const chunks = chunkArray(articleIds, 50);

for (const chunk of chunks) {
  await agent.analyzeArticlesByIds(chunk);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
}
```

## API Reference

### newsService

- `createArticle(article)` - Create new article with auto TVK detection
- `getArticles(filters)` - Get articles with filters
- `getTVKArticles(filters)` - Get only TVK-related articles
- `getUnanalyzedArticles(limit)` - Get articles needing analysis
- `updateArticle(id, updates)` - Update article
- `getLatestTVKReport(periodType)` - Get most recent report
- `getTVKReports(start, end, type)` - Get report history
- `createTVKReport(report)` - Create new report

### newsAgent

- `start()` - Start autonomous operation
- `stop()` - Stop autonomous operation
- `runManualAnalysis(options)` - Trigger analysis on-demand
- `generateDailyTVKReport()` - Generate today's report
- `generateCustomReport(start, end)` - Generate custom date range report
- `getStatus()` - Get current agent status
- `updateConfig(config)` - Update agent configuration

### useNewsSentiment Hook

Returns:
- `articles` - All articles
- `tvkArticles` - TVK-only articles
- `latestReport` - Most recent report
- `reports` - Report history
- `agentStatus` - Current agent status
- `runAnalysis()` - Trigger manual analysis
- `generateReport()` - Generate new report
- `startAgent()` - Start agent
- `stopAgent()` - Stop agent
- `refreshData()` - Refresh all data

## Troubleshooting

### Agent Not Running

```typescript
const status = agent.getStatus();
console.log('Is running:', status.isRunning);

if (!status.isRunning) {
  agent.start();
}
```

### No Articles Being Analyzed

Check:
1. Are there unanalyzed articles? `newsService.getUnanalyzedArticles()`
2. Is agent enabled? Check `VITE_NEWS_AGENT_ENABLED`
3. Is confidence threshold too high? Lower `minConfidenceThreshold`

### Low TVK Detection Rate

Adjust keywords in `newsService.ts`:
```typescript
export const TVK_KEYWORDS = {
  party_names: [
    'TVK',
    'தமிழக வெற்றி கழகம்',
    // Add more variations
  ],
  // ...
};
```

### Reports Not Generating

Ensure:
1. `enableReportGeneration: true` in agent config
2. Sufficient TVK articles exist for the period
3. Check database permissions for `tvk_sentiment_reports` table

## Next Steps

1. **Run Database Migration**: Apply `03_news_sentiment_tables.sql`
2. **Configure Environment**: Add News API keys and TVK settings to `.env`
3. **Add Articles**: Import existing articles or set up news fetching
4. **Start Agent**: Initialize and start the agent in your app
5. **Build UI**: Use `useNewsSentiment` hook to create dashboard
6. **Monitor**: Check reports and alerts regularly

## Support

For issues or questions:
- Check agent status: `agent.getStatus()`
- Review error logs in console
- Verify database tables exist
- Confirm environment variables are set
- Test with manual analysis first

## License

Part of the Pulse of People platform.
