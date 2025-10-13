/**
 * Test Supabase Connection & Database Tables
 * Run: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`),
}

async function testSupabaseConnection() {
  log.header('🔍 TESTING SUPABASE CONNECTION & DATABASE')

  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables...')
  if (!SUPABASE_URL) {
    log.error('NEXT_PUBLIC_SUPABASE_URL is not set')
    return false
  }
  if (!SUPABASE_ANON_KEY) {
    log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    return false
  }
  log.success(`Supabase URL: ${SUPABASE_URL}`)
  log.success(`Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`)

  // Step 2: Create Supabase client
  console.log('\n📋 Step 2: Creating Supabase Client...')
  let supabase
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    log.success('Supabase client created successfully')
  } catch (error: any) {
    log.error(`Failed to create Supabase client: ${error.message}`)
    return false
  }

  // Step 3: Test connection by checking tables
  console.log('\n📋 Step 3: Testing Database Connection...')
  
  const tables = [
    'users',
    'lessons',
    'students',
    'conversations',
    'messages',
    'token_logs',
    'lesson_progress',
    'notifications',
    'system_settings',
    'agents',
    'agent_conversations'
  ]

  const results: { [key: string]: { exists: boolean; count: number; error?: string } } = {}

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        results[table] = { exists: false, count: 0, error: error.message }
        log.error(`Table "${table}": ${error.message}`)
      } else {
        results[table] = { exists: true, count: count || 0 }
        log.success(`Table "${table}": ${count || 0} rows`)
      }
    } catch (error: any) {
      results[table] = { exists: false, count: 0, error: error.message }
      log.error(`Table "${table}": ${error.message}`)
    }
  }

  // Step 4: Check migrations
  console.log('\n📋 Step 4: Checking Recent Migrations...')
  try {
    // Check if unlock_code column exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('unlock_code')
      .limit(1)

    if (userError) {
      log.warning('unlock_code column may not exist in users table')
    } else {
      log.success('Migration: unlock_code column exists in users table')
    }
  } catch (error: any) {
    log.warning(`Could not check migrations: ${error.message}`)
  }

  // Step 5: Test authentication
  console.log('\n📋 Step 5: Testing Authentication...')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      log.warning(`Auth check: ${error.message} (Expected if not logged in)`)
    } else if (data.session) {
      log.success(`Auth: Logged in as ${data.session.user.email}`)
    } else {
      log.info('Auth: No active session (Expected)')
    }
  } catch (error: any) {
    log.warning(`Could not check auth: ${error.message}`)
  }

  // Summary
  console.log('\n')
  log.header('📊 SUMMARY')
  
  const existingTables = Object.entries(results).filter(([_, v]) => v.exists)
  const missingTables = Object.entries(results).filter(([_, v]) => !v.exists)
  const totalRows = existingTables.reduce((sum, [_, v]) => sum + v.count, 0)

  console.log(`\n${colors.green}✅ Tables Found: ${existingTables.length}/${tables.length}${colors.reset}`)
  existingTables.forEach(([table, info]) => {
    console.log(`   - ${table}: ${info.count} rows`)
  })

  if (missingTables.length > 0) {
    console.log(`\n${colors.red}❌ Tables Missing: ${missingTables.length}${colors.reset}`)
    missingTables.forEach(([table, info]) => {
      console.log(`   - ${table}: ${info.error || 'Not found'}`)
    })
  }

  console.log(`\n${colors.cyan}📈 Total Rows: ${totalRows}${colors.reset}`)

  // Recommendations
  console.log('\n')
  log.header('💡 RECOMMENDATIONS')

  if (missingTables.length > 0) {
    console.log('\n🔧 Missing tables detected! To fix:')
    console.log('   1. Go to Supabase Dashboard → SQL Editor')
    console.log('   2. Open: ai-learning-platform/sql/schema.sql')
    console.log('   3. Copy and paste the entire schema')
    console.log('   4. Click "Run" to create all tables')
  }

  if (totalRows === 0 && existingTables.length > 0) {
    console.log('\n📝 No data in database. To add sample data:')
    console.log('   1. Open: ai-learning-platform/sql/sample-data.sql')
    console.log('   2. Run in Supabase SQL Editor')
  }

  console.log('\n✨ All checks completed!')
  
  return existingTables.length === tables.length
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log(`\n${colors.green}🎉 All tests passed! Supabase is ready to use.${colors.reset}\n`)
      process.exit(0)
    } else {
      console.log(`\n${colors.yellow}⚠️  Some issues detected. Please review the recommendations above.${colors.reset}\n`)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Fatal error: ${error.message}${colors.reset}\n`)
    process.exit(1)
  })

