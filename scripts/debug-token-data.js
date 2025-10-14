require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

async function debugTokenData() {
  console.log('🔍 DEBUGGING TOKEN DATA...\n')

  try {
    // Get all users with token data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role, token_quota, token_used_today, last_reset, plan')
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`📊 Found ${users.length} users:`)
    console.log('=' .repeat(80))

    users.forEach((user, index) => {
      const percentage = user.token_quota > 0 ? (user.token_used_today / user.token_quota) * 100 : 0
      const remaining = Math.max(0, user.token_quota - user.token_used_today)
      
      console.log(`\n👤 User ${index + 1}:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Plan: ${user.plan}`)
      console.log(`   Token Quota: ${user.token_quota?.toLocaleString() || 'N/A'}`)
      console.log(`   Token Used: ${user.token_used_today?.toLocaleString() || 'N/A'}`)
      console.log(`   Remaining: ${remaining.toLocaleString()}`)
      console.log(`   Percentage: ${percentage.toFixed(1)}%`)
      console.log(`   Last Reset: ${user.last_reset || 'N/A'}`)
    })

    // Check for any recent token usage logs
    console.log('\n📝 Recent Token Usage Logs:')
    console.log('=' .repeat(80))

    const { data: logs, error: logsError } = await supabase
      .from('token_usage_logs')
      .select('user_id, tokens_used, created_at, mode')
      .order('created_at', { ascending: false })
      .limit(5)

    if (logsError) {
      console.error('❌ Error fetching logs:', logsError.message)
    } else if (logs && logs.length > 0) {
      logs.forEach((log, index) => {
        console.log(`\n📋 Log ${index + 1}:`)
        console.log(`   User ID: ${log.user_id}`)
        console.log(`   Tokens Used: ${log.tokens_used}`)
        console.log(`   Mode: ${log.mode || 'N/A'}`)
        console.log(`   Created: ${new Date(log.created_at).toLocaleString('vi-VN')}`)
      })
    } else {
      console.log('   No token usage logs found')
    }

    // Check for any reset calls
    console.log('\n🔄 Checking for Reset Activity:')
    console.log('=' .repeat(80))

    const today = new Date().toISOString().split('T')[0]
    const resetUsers = users.filter(user => user.last_reset === today)
    
    if (resetUsers.length > 0) {
      console.log(`⚠️  Found ${resetUsers.length} users reset today:`)
      resetUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name || 'N/A'})`)
      })
    } else {
      console.log('✅ No users were reset today')
    }

    console.log('\n🎯 SUMMARY:')
    console.log('=' .repeat(80))
    console.log(`Total Users: ${users.length}`)
    console.log(`Users with tokens > 0: ${users.filter(u => u.token_used_today > 0).length}`)
    console.log(`Users near quota (>80%): ${users.filter(u => (u.token_used_today / u.token_quota) > 0.8).length}`)
    console.log(`Users at quota (100%): ${users.filter(u => (u.token_used_today / u.token_quota) >= 1).length}`)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    process.exit(0)
  }
}

debugTokenData()
