-- Create token_usage_logs table for tracking real OpenAI usage
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  usage_data JSONB, -- Store OpenAI usage object (prompt_tokens, completion_tokens, total_tokens)
  model TEXT DEFAULT 'gpt-4o-mini',
  mode TEXT, -- 'coach', 'solve', 'chat', etc.
  has_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_id ON token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON token_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_mode ON token_usage_logs(mode);

-- Enable RLS
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own token usage logs" ON token_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token usage logs" ON token_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can view all logs
CREATE POLICY "Admins can view all token usage logs" ON token_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_token_usage_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER token_usage_logs_updated_at
  BEFORE UPDATE ON token_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_token_usage_logs_updated_at();

-- Grant permissions
GRANT ALL ON token_usage_logs TO authenticated;
GRANT ALL ON token_usage_logs TO service_role;
