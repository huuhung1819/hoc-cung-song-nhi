import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please check your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDailyUsageTable() {
  try {
    console.log('Creating daily_exercise_usage table...')
    
    // Read the migration file
    const migrationSQL = readFileSync('./sql/migrations/20250113_create_daily_exercise_usage.sql', 'utf8')
    
    console.log('Migration SQL loaded, executing...')
    console.log('Note: If this fails, please run the SQL manually in Supabase dashboard')
    
    // Try to execute the SQL
    const { data, error } = await supabase.rpc('exec', { sql: migrationSQL })
    
    if (error) {
      console.error('Error executing migration:', error)
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
      console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
      console.log('\nSQL to run:')
      console.log(migrationSQL)
    } else {
      console.log('✅ Migration executed successfully!')
    }
    
  } catch (error) {
    console.error('Setup failed:', error)
    console.log('\nManual setup required:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy and paste the content from: sql/migrations/20250113_create_daily_exercise_usage.sql')
    console.log('3. Run the SQL')
  }
}

createDailyUsageTable()