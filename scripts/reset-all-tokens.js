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

async function resetAllTokens() {
  console.log('🔄 RESETTING ALL USER TOKENS TO 0...\n')

  try {
    // Get all users first to show current status
    const { data: usersBefore, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, token_used_today, token_quota')
      .order('email')

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError.message)
      return
    }

    console.log('📊 CURRENT TOKEN STATUS:')
    console.log('=' .repeat(80))
    usersBefore.forEach((user, index) => {
      const percentage = user.token_quota > 0 ? (user.token_used_today / user.token_quota) * 100 : 0
      console.log(`${index + 1}. ${user.email}: ${user.token_used_today}/${user.token_quota} tokens (${percentage.toFixed(1)}%)`)
    })

    console.log(`\n🔄 Resetting tokens for ${usersBefore.length} users...`)

    // Reset all users' token_used_today to 0
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({
        token_used_today: 0,
        last_reset: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all users

    if (updateError) {
      console.error('❌ Error resetting tokens:', updateError.message)
      return
    }

    console.log('✅ Token reset completed successfully!')

    // Verify the reset
    const { data: usersAfter, error: verifyError } = await supabase
      .from('users')
      .select('id, email, name, token_used_today, token_quota, last_reset')
      .order('email')

    if (verifyError) {
      console.error('❌ Error verifying reset:', verifyError.message)
      return
    }

    console.log('\n📊 AFTER RESET STATUS:')
    console.log('=' .repeat(80))
    usersAfter.forEach((user, index) => {
      const percentage = user.token_quota > 0 ? (user.token_used_today / user.token_quota) * 100 : 0
      console.log(`${index + 1}. ${user.email}: ${user.token_used_today}/${user.token_quota} tokens (${percentage.toFixed(1)}%)`)
    })

    // Summary
    const totalUsers = usersAfter.length
    const totalQuota = usersAfter.reduce((sum, user) => sum + (user.token_quota || 0), 0)
    const totalUsed = usersAfter.reduce((sum, user) => sum + (user.token_used_today || 0), 0)

    console.log('\n🎯 RESET SUMMARY:')
    console.log('=' .repeat(80))
    console.log(`✅ Total users reset: ${totalUsers}`)
    console.log(`✅ Total quota available: ${totalQuota.toLocaleString()} tokens`)
    console.log(`✅ Total tokens used: ${totalUsed.toLocaleString()} tokens`)
    console.log(`✅ Reset timestamp: ${new Date().toLocaleString('vi-VN')}`)

    console.log('\n🚀 READY FOR TESTING:')
    console.log('1. All users now have 0 tokens used')
    console.log('2. Token progress bars will show 0%')
    console.log('3. Chat functionality ready for testing')
    console.log('4. Token tracking will start fresh')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    process.exit(0)
  }
}

resetAllTokens()
