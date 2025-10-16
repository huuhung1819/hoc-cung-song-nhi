#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAutoGrade() {
  try {
    console.log('🧪 Testing auto-grade functionality...')
    
    // Get all users with their grades
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, grade')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }
    
    console.log(`\n📊 Current users and their grades:`)
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.grade || 'No grade set'}`)
    })
    
    // Test API endpoint with a real user
    const testUser = users[0]
    if (testUser) {
      console.log(`\n🔍 Testing API with user: ${testUser.email}`)
      
      const response = await fetch('http://localhost:3000/api/get-user-grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: testUser.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ API Response:`, data)
      } else {
        console.log(`❌ API Error:`, response.status, await response.text())
      }
    }
    
    console.log('\n🎯 Expected behavior:')
    console.log('1. User logs in → Frontend calls /api/get-user-grade')
    console.log('2. API returns grade from database')
    console.log('3. Frontend sets selectedGrade = user grade')
    console.log('4. Modal shows "Toán - [Grade]" automatically')
    console.log('5. Topic list updates based on grade')
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testAutoGrade()
