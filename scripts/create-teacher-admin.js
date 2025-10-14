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

async function createTeacherWithAdminAPI() {
  console.log('👨‍🏫 Creating Teacher User via Admin API...\n')

  const teacherData = {
    email: 'teacherdemo@test.com',
    password: 'teacher123',
    name: 'Teacher Demo',
    role: 'teacher'
  }

  try {
    // 1. Create auth user using admin API
    console.log('🔐 Creating auth user via admin...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: teacherData.email,
      password: teacherData.password,
      user_metadata: {
        name: teacherData.name,
        role: teacherData.role
      },
      email_confirm: true // Skip email verification
    })

    if (authError) {
      console.error('❌ Admin auth creation failed:', authError.message)
      return
    }

    console.log('✅ Auth user created via admin:', authData.user.id)

    // 2. Create user profile using service role (bypasses RLS)
    console.log('👤 Creating user profile...')
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: teacherData.email,
        name: teacherData.name,
        role: teacherData.role,
        plan: 'basic',
        token_quota: 1000, // Teachers get more tokens
        token_used_today: 0,
        last_reset: new Date().toISOString().split('T')[0],
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      
      // Clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return
    }

    console.log('✅ User profile created:', profileData.id)

    // 3. Verify user creation
    console.log('\n🔍 Verifying user creation...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      console.log('✅ User verified:')
      console.log('  - ID:', verifyData.id)
      console.log('  - Email:', verifyData.email)
      console.log('  - Name:', verifyData.name)
      console.log('  - Role:', verifyData.role)
      console.log('  - Plan:', verifyData.plan)
      console.log('  - Active:', verifyData.is_active)
    }

    // 4. Test login
    console.log('\n🔑 Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: teacherData.email,
      password: teacherData.password
    })

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message)
    } else {
      console.log('✅ Login successful!')
      console.log('  - User ID:', loginData.user.id)
      console.log('  - Email:', loginData.user.email)
      
      // Verify role in session
      const userRole = loginData.user.user_metadata?.role
      console.log('  - Role from metadata:', userRole)
    }

    console.log('\n🎉 Teacher user created successfully!')
    console.log('\n📱 Test Instructions:')
    console.log(`1. Go to login page`)
    console.log(`2. Login with: ${teacherData.email} / ${teacherData.password}`)
    console.log('3. Should redirect to /teacher dashboard')
    console.log('4. Check that teacher features are available')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    process.exit(0)
  }
}

createTeacherWithAdminAPI()
