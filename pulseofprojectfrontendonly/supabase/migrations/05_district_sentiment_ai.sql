-- AI-Powered District Sentiment Tracking
-- Stores daily sentiment updates from OpenAI analysis

-- Create district_sentiment table
CREATE TABLE IF NOT EXISTS public.district_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) UNIQUE NOT NULL,
  sentiment_score INTEGER NOT NULL CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  party_strength VARCHAR(20) CHECK (party_strength IN ('weak', 'moderate', 'strong')),
  key_issues JSONB DEFAULT '[]'::jsonb,
  reasoning TEXT,
  action_needed TEXT,
  news_snippets JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_district_sentiment_district ON public.district_sentiment(district);
CREATE INDEX IF NOT EXISTS idx_district_sentiment_score ON public.district_sentiment(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_district_sentiment_updated ON public.district_sentiment(last_updated);

-- Enable Row Level Security
ALTER TABLE public.district_sentiment ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read sentiment data
CREATE POLICY "Allow public read access to district sentiment"
  ON public.district_sentiment
  FOR SELECT
  USING (true);

-- Policy: Only authenticated admins can insert/update
CREATE POLICY "Allow admin insert/update to district sentiment"
  ON public.district_sentiment
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'manager'
  );

-- Create sentiment history table for tracking changes over time
CREATE TABLE IF NOT EXISTS public.sentiment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  sentiment_score INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sentiment_history_district ON public.sentiment_history(district);
CREATE INDEX IF NOT EXISTS idx_sentiment_history_date ON public.sentiment_history(recorded_at);

-- Function to automatically record history when sentiment updates
CREATE OR REPLACE FUNCTION record_sentiment_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.sentiment_history (district, sentiment_score, notes)
  VALUES (NEW.district, NEW.sentiment_score, NEW.reasoning);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-record history
DROP TRIGGER IF EXISTS sentiment_update_trigger ON public.district_sentiment;
CREATE TRIGGER sentiment_update_trigger
  AFTER INSERT OR UPDATE OF sentiment_score ON public.district_sentiment
  FOR EACH ROW
  EXECUTE FUNCTION record_sentiment_history();

-- Create view for dashboard consumption
CREATE OR REPLACE VIEW public.district_sentiment_dashboard AS
SELECT
  ds.district,
  ds.sentiment_score,
  ds.party_strength,
  ds.key_issues,
  ds.action_needed,
  ds.last_updated,
  CASE
    WHEN ds.sentiment_score >= 70 THEN 'positive'
    WHEN ds.sentiment_score >= 50 THEN 'neutral'
    ELSE 'critical'
  END as sentiment_category,
  CASE
    WHEN ds.sentiment_score >= 70 THEN '🟢 Party Strong'
    WHEN ds.sentiment_score >= 50 THEN '🟡 Monitor Closely'
    ELSE '🔴 Urgent Action Needed'
  END as status_label
FROM public.district_sentiment ds;

-- Grant permissions
GRANT SELECT ON public.district_sentiment_dashboard TO anon, authenticated;

COMMENT ON TABLE public.district_sentiment IS 'AI-analyzed sentiment data for each district, updated daily';
COMMENT ON TABLE public.sentiment_history IS 'Historical tracking of sentiment score changes';
COMMENT ON VIEW public.district_sentiment_dashboard IS 'Dashboard-ready view of district sentiment with categorization';
