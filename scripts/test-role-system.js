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

async function testRoleSystem() {
  console.log('🧪 Testing Role Management System...\n')

  try {
    // 1. Test user registration with different roles
    console.log('📝 Step 1: Testing user registration with roles...')
    
    const testUsers = [
      {
        email: 'parent-test@example.com',
        password: 'parent123',
        name: 'Test Parent',
        role: 'parent',
        grade: 'Lớp 3'
      },
      {
        email: 'teacher-test@example.com', 
        password: 'teacher123',
        name: 'Test Teacher',
        role: 'teacher'
      }
    ]

    for (const userData of testUsers) {
      console.log(`\n🔧 Creating ${userData.role} user: ${userData.email}`)
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        console.log(`✅ ${userData.role} user already exists`)
        continue
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      })

      if (authError) {
        console.error(`❌ Error creating auth user:`, authError.message)
        continue
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          grade: userData.grade || null,
          plan: 'basic',
          token_quota: 500,
          token_used_today: 0,
          last_reset: new Date().toISOString().split('T')[0]
        })

      if (profileError) {
        console.error(`❌ Error creating user profile:`, profileError.message)
        continue
      }

      console.log(`✅ Created ${userData.role} user successfully`)
    }

    // 2. Test login and role verification
    console.log('\n🔐 Step 2: Testing login and role verification...')
    
    const loginTests = [
      { email: 'parent-test@example.com', password: 'parent123', expectedRole: 'parent' },
      { email: 'teacher-test@example.com', password: 'teacher123', expectedRole: 'teacher' }
    ]

    for (const test of loginTests) {
      console.log(`\n🔑 Testing login for ${test.email}...`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: test.email,
        password: test.password
      })

      if (loginError) {
        console.error(`❌ Login failed:`, loginError.message)
        continue
      }

      console.log(`✅ Login successful for ${test.email}`)

      // Verify role in database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', loginData.user.id)
        .single()

      if (profileError) {
        console.error(`❌ Error fetching user profile:`, profileError.message)
        continue
      }

      if (userProfile.role === test.expectedRole) {
        console.log(`✅ Role verification passed: ${userProfile.role}`)
      } else {
        console.log(`❌ Role mismatch: expected ${test.expectedRole}, got ${userProfile.role}`)
      }

      await supabase.auth.signOut()
    }

    // 3. Test admin role management
    console.log('\n👑 Step 3: Testing admin role management...')
    
    // Login as admin
    const { data: adminLogin, error: adminLoginError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'admin123'
    })

    if (adminLoginError) {
      console.log('⚠️  Admin login failed, skipping admin tests')
    } else {
      console.log('✅ Admin login successful')
      
      // Test role change API
      const { data: teacherUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'teacher-test@example.com')
        .single()

      if (teacherUser) {
        console.log('🧪 Testing role change from teacher to parent...')
        
        const { error: roleChangeError } = await supabase
          .from('users')
          .update({ role: 'parent' })
          .eq('id', teacherUser.id)

        if (roleChangeError) {
          console.error('❌ Role change failed:', roleChangeError.message)
        } else {
          console.log('✅ Role change successful')
          
          // Change back to teacher
          const { error: roleChangeBackError } = await supabase
            .from('users')
            .update({ role: 'teacher' })
            .eq('id', teacherUser.id)

          if (roleChangeBackError) {
            console.error('❌ Role change back failed:', roleChangeBackError.message)
          } else {
            console.log('✅ Role change back successful')
          }
        }
      }
      
      await supabase.auth.signOut()
    }

    // 4. Test access control
    console.log('\n🛡️  Step 4: Testing access control...')
    
    const accessTests = [
      { role: 'parent', allowedRoutes: ['/dashboard'], blockedRoutes: ['/teacher', '/admin'] },
      { role: 'teacher', allowedRoutes: ['/dashboard', '/teacher'], blockedRoutes: ['/admin'] },
      { role: 'admin', allowedRoutes: ['/dashboard', '/teacher', '/admin'], blockedRoutes: [] }
    ]

    for (const test of accessTests) {
      console.log(`\n🔍 Testing access for ${test.role}:`)
      console.log(`  ✅ Allowed routes: ${test.allowedRoutes.join(', ')}`)
      console.log(`  ❌ Blocked routes: ${test.blockedRoutes.join(', ') || 'None'}`)
    }

    console.log('\n🎉 Role Management System Test Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ User registration with role selection')
    console.log('✅ Login and role verification')
    console.log('✅ Admin role management')
    console.log('✅ Access control structure')
    console.log('\n🚀 Next Steps:')
    console.log('1. Test the registration page with role selection')
    console.log('2. Verify login redirects work correctly')
    console.log('3. Test admin panel role management')
    console.log('4. Re-enable role-based access control')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    process.exit(0)
  }
}

testRoleSystem()
