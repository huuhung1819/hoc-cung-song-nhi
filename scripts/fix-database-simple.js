#!/usr/bin/env node

/**
 * Simple script to fix database by removing notification columns from API calls
 * This is a temporary fix until we can properly migrate the database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return false
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test connection by fetching users
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Sample user data:', data?.[0] || 'No users found')
    return true
    
  } catch (error) {
    console.error('💥 Database test failed:', error)
    return false
  }
}

// Run test
testDatabaseConnection()

