-- Create user_usage table for daily limit tracking
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    attempts INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON user_usage(date);

-- Create video_logs table for generation history
CREATE TABLE IF NOT EXISTS video_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    drive_file_id TEXT,
    drive_link TEXT,
    image_url TEXT NOT NULL,
    status INTEGER DEFAULT 0, -- 0 = failure, 1 = success
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for video_logs
CREATE INDEX IF NOT EXISTS idx_video_logs_user_id ON video_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_logs_created_at ON video_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_logs_status ON video_logs(status);

-- Create scrape_logs table for scraping analytics
CREATE TABLE IF NOT EXISTS scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for scrape_logs
CREATE INDEX IF NOT EXISTS idx_scrape_logs_user_id ON scrape_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_created_at ON scrape_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_usage
CREATE POLICY "Users can view own usage data"
    ON user_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data"
    ON user_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data"
    ON user_usage FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for video_logs
CREATE POLICY "Users can view own video logs"
    ON video_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video logs"
    ON video_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scrape_logs
CREATE POLICY "Users can view own scrape logs"
    ON scrape_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scrape logs"
    ON scrape_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_usage
CREATE TRIGGER update_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
