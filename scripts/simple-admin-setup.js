/**
 * Simple Admin Password Setup
 * Non-interactive version for setting admin password
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupAdminPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = process.env.ADMIN_EMAIL || 'huuhung20182019@gmail.com'

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  console.log('🔐 Setting up admin password...')
  console.log(`📧 Email: ${adminEmail}`)

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Set a default strong password
    const defaultPassword = 'AdminPass123!'

    // Check if auth user exists
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }

    const existingAuthUser = authUsers.users.find(u => u.email === adminEmail)

    if (existingAuthUser) {
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        { 
          password: defaultPassword,
          email_confirm: true
        }
      )

      if (updateError) {
        throw updateError
      }

      console.log('✅ Password updated for existing user')
    } else {
      // Create new auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: 'System Administrator',
          role: 'admin'
        }
      })

      if (createError) {
        throw createError
      }

      console.log('✅ Auth user created')
    }

    // Update database record
    const { error: updateDbError } = await supabase
      .from('users')
      .update({
        role: 'admin',
        plan: 'enterprise',
        token_quota: 999999,
        updated_at: new Date().toISOString()
      })
      .eq('email', adminEmail)

    if (updateDbError) {
      console.warn('⚠️ Warning: Could not update database record:', updateDbError.message)
    } else {
      console.log('✅ Database record updated')
    }

    console.log('\n🎉 Admin setup completed!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', defaultPassword)
    console.log('\n🚀 Next steps:')
    console.log('1. Visit: http://localhost:3000/auth/login')
    console.log('2. Login with the credentials above')
    console.log('3. Navigate to: http://localhost:3000/admin')
    console.log('\n⚠️ IMPORTANT: Change password after first login!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setupAdminPassword()
