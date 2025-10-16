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

async function updateUserGrade() {
  try {
    console.log('🔍 Fetching all users...')
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, grade')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
      return
    }
    
    console.log(`📊 Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ${user.email}: ${user.grade || 'No grade set'}`)
    })
    
    // Ask for input
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const question = (query) => new Promise((resolve) => rl.question(query, resolve))
    
    const email = await question('\n📧 Enter email to update (or press Enter to skip): ')
    
    if (!email) {
      console.log('⏭️ Skipped updating user grade')
      rl.close()
      return
    }
    
    const grade = await question('🎓 Enter new grade (e.g., "Lớp 3"): ')
    
    if (!grade) {
      console.log('❌ Grade is required')
      rl.close()
      return
    }
    
    // Update user grade
    const { data, error } = await supabase
      .from('users')
      .update({ grade })
      .eq('email', email)
      .select()
    
    if (error) {
      console.error('❌ Error updating user grade:', error.message)
    } else if (data && data.length > 0) {
      console.log(`✅ Successfully updated ${email} to ${grade}`)
    } else {
      console.log(`❌ No user found with email: ${email}`)
    }
    
    rl.close()
    
  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

updateUserGrade()
