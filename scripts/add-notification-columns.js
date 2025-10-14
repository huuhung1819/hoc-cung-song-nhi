#!/usr/bin/env node

/**
 * Script to add notification columns to users table
 * This script connects directly to Supabase and adds the required columns
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function addNotificationColumns() {
  console.log('🔄 Adding notification columns to users table...')
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Check if columns already exist
    console.log('🔍 Checking existing columns...')
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .in('column_name', ['email_updates', 'lesson_reminders', 'progress_reports', 'promotions', 'avatar'])
    
    if (checkError) {
      console.error('❌ Error checking existing columns:', checkError)
      process.exit(1)
    }
    
    const existingColumnNames = existingColumns?.map(col => col.column_name) || []
    console.log('📊 Existing columns:', existingColumnNames)
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'email_updates', type: 'BOOLEAN', default: 'true' },
      { name: 'lesson_reminders', type: 'BOOLEAN', default: 'true' },
      { name: 'progress_reports', type: 'BOOLEAN', default: 'false' },
      { name: 'promotions', type: 'BOOLEAN', default: 'false' },
      { name: 'avatar', type: 'TEXT', default: "''" }
    ]
    
    const missingColumns = columnsToAdd.filter(col => !existingColumnNames.includes(col.name))
    
    if (missingColumns.length === 0) {
      console.log('✅ All notification columns already exist!')
      return
    }
    
    console.log(`📝 Adding ${missingColumns.length} missing columns...`)
    
    for (const column of missingColumns) {
      try {
        console.log(`➕ Adding column: ${column.name}`)
        
        // Use raw SQL to add columns
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} DEFAULT ${column.default};`
        })
        
        if (error) {
          console.error(`❌ Error adding column ${column.name}:`, error)
        } else {
          console.log(`✅ Successfully added column: ${column.name}`)
        }
      } catch (error) {
        console.error(`❌ Error adding column ${column.name}:`, error)
      }
    }
    
    // Update existing users with default values
    console.log('🔄 Updating existing users with default values...')
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_updates: true,
        lesson_reminders: true,
        progress_reports: false,
        promotions: false,
        avatar: ''
      })
      .is('email_updates', null)
    
    if (updateError) {
      console.error('❌ Error updating existing users:', updateError)
    } else {
      console.log('✅ Updated existing users with default values')
    }
    
    console.log('🎉 Migration completed successfully!')
    console.log('📊 Added columns:')
    missingColumns.forEach(col => {
      console.log(`   - ${col.name} (${col.type}, default: ${col.default})`)
    })
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
addNotificationColumns()


