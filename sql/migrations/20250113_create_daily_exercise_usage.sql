-- Create daily exercise usage table to track user's daily exercise generation limit
CREATE TABLE IF NOT EXISTS daily_exercise_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER DEFAULT 0 NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_exercise_usage_user_date ON daily_exercise_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_exercise_usage_date ON daily_exercise_usage(date);

-- Enable RLS
ALTER TABLE daily_exercise_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage" ON daily_exercise_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON daily_exercise_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON daily_exercise_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_daily_exercise_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_daily_exercise_usage_updated_at
    BEFORE UPDATE ON daily_exercise_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_exercise_usage_updated_at();
