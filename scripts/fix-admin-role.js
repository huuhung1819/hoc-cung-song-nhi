/**
 * Fix Admin Role Script
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function fixAdminRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = 'huuhung20182019@gmail.com'

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔍 Checking admin user...')
    
    // Check current role
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id, email, role, plan, token_quota')
      .eq('email', adminEmail)
      .single()

    if (checkError) {
      throw checkError
    }

    console.log('Current user info:')
    console.log('  Email:', user.email)
    console.log('  Role:', user.role)
    console.log('  Plan:', user.plan)
    console.log('  Token Quota:', user.token_quota)

    if (user.role !== 'admin') {
      console.log('\n🔧 Fixing admin role...')
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          plan: 'enterprise',
          token_quota: 999999,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Admin role fixed!')
    } else {
      console.log('✅ User is already admin')
    }

    // Verify
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, plan, token_quota')
      .eq('email', adminEmail)
      .single()

    if (verifyError) {
      throw verifyError
    }

    console.log('\n📊 Updated user info:')
    console.log('  Email:', updatedUser.email)
    console.log('  Role:', updatedUser.role)
    console.log('  Plan:', updatedUser.plan)
    console.log('  Token Quota:', updatedUser.token_quota)

    console.log('\n🎉 Admin role setup complete!')
    console.log('Now try accessing: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixAdminRole()
