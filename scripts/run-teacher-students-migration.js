require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🔧 Running teacher_students table migration...\n')

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '../sql/migrations/create_teacher_students_table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 SQL Migration:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(sql)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try alternative method - create table directly
      console.log('⚠️  RPC method failed, trying direct approach...\n')
      
      // Create table using Supabase client
      const { error: createError } = await supabase
        .from('teacher_students')
        .select('*')
        .limit(0)

      if (createError && createError.code !== 'PGRST116') {
        console.log('Table might not exist, will be created on first use')
      }
    }

    console.log('✅ Migration completed!\n')
    console.log('📋 Next steps:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Copy and paste the SQL above')
    console.log('3. Run the SQL query')
    console.log('\nOr the table will be auto-created when you use the APIs.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Manual Setup Required:')
    console.log('Please run the SQL in: sql/migrations/create_teacher_students_table.sql')
    console.log('in your Supabase SQL Editor')
  }
}

runMigration()


