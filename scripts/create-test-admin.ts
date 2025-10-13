import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestAdmin() {
  try {
    console.log('🚀 Creating test admin account...')
    
    const testAdminEmail = 'admin-test@example.com'
    const testAdminPassword = 'TestAdmin123!'
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testAdminEmail,
      password: testAdminPassword,
      email_confirm: true
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    console.log('✅ Auth user created:', authData.user?.id)
    
    // 2. Create user record in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        email: testAdminEmail,
        name: 'Test Admin',
        role: 'admin',
        plan: 'enterprise',
        token_quota: 10000,
        is_active: true
      })
      .select()
    
    if (userError) {
      console.error('❌ Database error:', userError)
      return
    }
    
    console.log('✅ Database user created:', userData)
    
    console.log('\n🎯 Test Admin Account Created:')
    console.log('Email:', testAdminEmail)
    console.log('Password:', testAdminPassword)
    console.log('ID:', authData.user!.id)
    console.log('\n🔗 Login at: http://localhost:3001/auth/login')
    console.log('🔗 Admin dashboard: http://localhost:3001/admin')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createTestAdmin()
