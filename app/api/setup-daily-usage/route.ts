import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Try to create the table using a simple insert/select approach
    // This will fail if table doesn't exist, which is what we want to detect
    
    const today = new Date().toISOString().split('T')[0]
    
    // First, try to select from the table to see if it exists
    const { data: testData, error: testError } = await supabase
      .from('daily_exercise_usage')
      .select('id')
      .limit(1)
    
    if (testError) {
      if (testError.code === 'PGRST205') {
        // Table doesn't exist, return instructions
        return NextResponse.json({
          success: false,
          error: 'Table does not exist',
          instructions: {
            message: 'Please create the daily_exercise_usage table manually',
            steps: [
              '1. Go to Supabase Dashboard > SQL Editor',
              '2. Copy and paste the SQL from: sql/migrations/20250113_create_daily_exercise_usage.sql',
              '3. Run the SQL to create the table'
            ],
            sql: `-- Create daily exercise usage table
CREATE TABLE IF NOT EXISTS daily_exercise_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER DEFAULT 0 NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes
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
    FOR UPDATE USING (auth.uid() = user_id);`
          }
        }, { status: 404 })
      } else {
        throw testError
      }
    }
    
    // Table exists, return success
    return NextResponse.json({
      success: true,
      message: 'Table exists and is ready to use'
    })
    
  } catch (error: any) {
    console.error('Setup check failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
