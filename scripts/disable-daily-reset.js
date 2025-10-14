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

async function disableDailyReset() {
  console.log('🚫 DISABLING DAILY RESET...\n')

  try {
    // Update all users to remove last_reset dependency
    const { data, error } = await supabase
      .from('users')
      .update({
        last_reset: null // Remove reset tracking
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all users

    if (error) {
      console.error('❌ Error updating users:', error.message)
      return
    }

    console.log('✅ Successfully disabled daily reset for all users')
    console.log('✅ Users will now use accumulative token tracking')
    
    // Verify the change
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('id, email, token_used_today, token_quota, last_reset')
      .limit(5)

    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError.message)
    } else {
      console.log('\n📊 Sample users after update:')
      users.forEach(user => {
        const percentage = user.token_quota > 0 ? (user.token_used_today / user.token_quota) * 100 : 0
        console.log(`   ${user.email}: ${user.token_used_today}/${user.token_quota} tokens (${percentage.toFixed(1)}%) - Reset: ${user.last_reset || 'NULL'}`)
      })
    }

    console.log('\n🎯 NEXT STEPS:')
    console.log('1. ✅ Daily reset is now disabled')
    console.log('2. ✅ Tokens will accumulate until quota exhausted')
    console.log('3. ✅ Real OpenAI usage will be tracked')
    console.log('4. ⚠️  Remove any external cron jobs calling /api/token/reset')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    process.exit(0)
  }
}

disableDailyReset()
