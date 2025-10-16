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

async function setGradeLop3() {
  try {
    console.log('🎓 Setting grade to "Lớp 3" for common test accounts...')
    
    // List of common test emails to update
    const testEmails = [
      'user@example.com',
      'giaovien@gmail.com', 
      'admin@test.com',
      'teacher@test.com',
      'huuhung20182019@gmail.com',
      'taytay@gmail.com',
      'bangbang01@gmail.com'
    ]
    
    for (const email of testEmails) {
      const { data, error } = await supabase
        .from('users')
        .update({ grade: 'Lớp 3' })
        .eq('email', email)
        .select()
      
      if (error) {
        console.error(`❌ Error updating ${email}:`, error.message)
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${email} to Lớp 3`)
      } else {
        console.log(`⚠️ No user found with email: ${email}`)
      }
    }
    
    console.log('\n🎉 Done! Now check your app - it should show "Lớp 3"')
    
  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

setGradeLop3()
