#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserData() {
  try {
    console.log('🔍 Checking user data in database...')
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, grade, plan, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }

    console.log(`📊 Found ${users.length} users:`)
    console.log('=' * 80)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`)
      console.log(`   Name: ${user.name || 'NULL'}`)
      console.log(`   Email: ${user.email || 'NULL'}`)
      console.log(`   Phone: ${user.phone || 'NULL'}`)
      console.log(`   Grade: ${user.grade || 'NULL'}`)
      console.log(`   Plan: ${user.plan || 'NULL'}`)
      console.log(`   Role: ${user.role || 'NULL'}`)
      console.log(`   Created: ${user.created_at}`)
      console.log('-'.repeat(50))
    })

    // Check if any users have NULL names
    const nullNameUsers = users.filter(user => !user.name)
    if (nullNameUsers.length > 0) {
      console.log(`⚠️  Found ${nullNameUsers.length} users with NULL names:`)
      nullNameUsers.forEach(user => {
        console.log(`   - ${user.id} (${user.email})`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkUserData()


