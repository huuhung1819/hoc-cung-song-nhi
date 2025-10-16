import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  try {
    console.log('Checking if daily_exercise_usage table exists...')
    
    // Try to select from the table
    const { data, error } = await supabase
      .from('daily_exercise_usage')
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table does not exist')
        console.log('\nPlease create the table manually in Supabase Dashboard:')
        console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
        console.log('2. Run the SQL from: sql/migrations/20250113_create_daily_exercise_usage.sql')
      } else {
        console.log('Error:', error)
      }
    } else {
      console.log('✅ Table exists!')
      console.log('Sample data:', data)
    }
    
  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkTable()
