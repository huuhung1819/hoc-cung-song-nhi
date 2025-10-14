/**
 * Debug login issues
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugLogin() {
  console.log('🔍 Debugging login issues...\n')
  
  // Check environment variables
  console.log('📋 Environment check:')
  console.log('  - Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('  - Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing')
  console.log('  - Key length:', supabaseKey?.length || 0)
  
  // Test accounts to try
  const testAccounts = [
    { email: 'demogv@gmail.com', password: '123456', name: 'Demo Teacher' },
    { email: 'teacher@test.com', password: 'teacher123', name: 'Test Teacher' },
    { email: 'parent@test.com', password: 'parent123', name: 'Test Parent' },
    { email: 'giaovien@gmail.com', password: 'giaovien123', name: 'Original Teacher' }
  ]
  
  console.log('\n🔐 Testing login with different accounts...\n')
  
  for (const account of testAccounts) {
    console.log(`Testing: ${account.name} (${account.email})`)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (error) {
        console.log(`  ❌ Failed: ${error.message}`)
        console.log(`  📋 Error code: ${error.code || 'N/A'}`)
        console.log(`  📋 Status: ${error.status || 'N/A'}`)
      } else {
        console.log(`  ✅ Success!`)
        console.log(`  📋 User ID: ${data.user?.id}`)
        console.log(`  📋 Email: ${data.user?.email}`)
        console.log(`  📋 Session expires: ${data.session?.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString('vi-VN') : 'N/A'}`)
        
        // Sign out for next test
        await supabase.auth.signOut()
        console.log(`  🔄 Signed out for next test`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    console.log('')
  }
  
  // Test with service role key
  console.log('🔧 Testing with service role key...')
  const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })
  
  try {
    const { data: users, error } = await serviceSupabase.auth.admin.listUsers()
    
    if (error) {
      console.log(`  ❌ Service role test failed: ${error.message}`)
    } else {
      console.log(`  ✅ Service role works! Found ${users.users.length} users`)
      
      // List all users
      console.log('\n📋 All users in system:')
      users.users.forEach(user => {
        console.log(`  - ${user.email} (${user.id}) - Last sign in: ${user.last_sign_in_at || 'Never'}`)
      })
    }
  } catch (err) {
    console.log(`  ❌ Service role exception: ${err.message}`)
  }
  
  // Test network connectivity
  console.log('\n🌐 Testing network connectivity...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('  ✅ Network connectivity OK')
    } else {
      console.log(`  ❌ Network issue: ${response.status} ${response.statusText}`)
    }
  } catch (err) {
    console.log(`  ❌ Network error: ${err.message}`)
  }
  
  console.log('\n🎯 Recommendations:')
  console.log('1. Clear browser cache and cookies')
  console.log('2. Try incognito/private browsing mode')
  console.log('3. Check if any browser extensions are blocking requests')
  console.log('4. Try different browser')
  console.log('5. Check network firewall/proxy settings')
}

debugLogin()
