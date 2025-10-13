/**
 * Test Supabase Connection & Database Tables
 * Run: node scripts/test-db.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
dotenv.config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
}

async function testSupabaseConnection() {
  log.header('🔍 TESTING SUPABASE CONNECTION & DATABASE')

  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables...')
  if (!SUPABASE_URL) {
    log.error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
    return false
  }
  if (!SUPABASE_ANON_KEY) {
    log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local')
    return false
  }
  log.success(`Supabase URL: ${SUPABASE_URL}`)
  log.success(`Anon Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...`)

  // Step 2: Create Supabase client
  console.log('\n📋 Step 2: Creating Supabase Client...')
  let supabase
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    log.success('Supabase client created successfully')
  } catch (error) {
    log.error(`Failed to create Supabase client: ${error.message}`)
    return false
  }

  // Step 3: Test connection by checking tables
  console.log('\n📋 Step 3: Testing Database Tables...')
  
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
  ]

  const results = {}

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
    } catch (error) {
      results[table] = { exists: false, count: 0, error: error.message }
      log.error(`Table "${table}": ${error.message}`)
    }
  }

  // Step 4: Test a simple query
  console.log('\n📋 Step 4: Testing Sample Query...')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(3)

    if (error) {
      log.warning(`Could not fetch users: ${error.message}`)
    } else if (data && data.length > 0) {
      log.success(`Found ${data.length} users`)
      data.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`)
      })
    } else {
      log.info('No users found in database')
    }
  } catch (error) {
    log.warning(`Could not query users: ${error.message}`)
  }

  // Step 5: Test lessons table
  console.log('\n📋 Step 5: Testing Lessons Data...')
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, grade, subject')
      .limit(5)

    if (error) {
      log.warning(`Could not fetch lessons: ${error.message}`)
    } else if (data && data.length > 0) {
      log.success(`Found ${data.length} lessons`)
      data.forEach(lesson => {
        console.log(`   - ${lesson.title} (Lớp ${lesson.grade} - ${lesson.subject})`)
      })
    } else {
      log.info('No lessons found in database')
    }
  } catch (error) {
    log.warning(`Could not query lessons: ${error.message}`)
  }

  // Summary
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
  if (missingTables.length > 0) {
    log.header('💡 RECOMMENDATIONS')
    console.log('\n🔧 Missing tables detected! To fix:')
    console.log('   1. Go to Supabase Dashboard → SQL Editor')
    console.log('   2. Open: ai-learning-platform/sql/schema.sql')
    console.log('   3. Copy and paste the entire schema')
    console.log('   4. Click "Run" to create all tables')
  }

  if (totalRows === 0 && existingTables.length > 0) {
    console.log('\n📝 Database is empty. To add sample data:')
    console.log('   1. Check if sql/sample-data.sql exists')
    console.log('   2. Run it in Supabase SQL Editor')
    console.log('   3. Or create users through registration')
  }

  console.log('\n✨ All checks completed!\n')
  
  return existingTables.length === tables.length
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log(`${colors.green}🎉 All tests passed! Supabase is ready to use.${colors.reset}\n`)
      process.exit(0)
    } else {
      console.log(`${colors.yellow}⚠️  Some issues detected. Please review above.${colors.reset}\n`)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error(`\n${colors.red}💥 Fatal error: ${error.message}${colors.reset}\n`)
    console.error(error.stack)
    process.exit(1)
  })

