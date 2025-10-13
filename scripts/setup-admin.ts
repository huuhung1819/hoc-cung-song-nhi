/**
 * Admin Account Setup Script
 * 
 * This script creates an admin account in Supabase Auth
 * and ensures proper security measures are in place.
 * 
 * Usage:
 *   npm run setup-admin
 *   or
 *   npx tsx scripts/setup-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Password strength validation
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Prompt user for input
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// Hidden password input
function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    // Hide input
    const stdin = process.stdin as any
    stdin.setRawMode?.(true)
    
    let password = ''
    
    console.log(question)
    
    stdin.on('data', (char: Buffer) => {
      const c = char.toString('utf8')
      
      switch (c) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          stdin.setRawMode?.(false)
          rl.close()
          console.log('') // New line
          resolve(password)
          break
        case '\u0003': // Ctrl+C
          process.exit()
          break
        case '\u007f': // Backspace
          password = password.slice(0, -1)
          process.stdout.write('\b \b')
          break
        default:
          password += c
          process.stdout.write('*')
          break
      }
    })
  })
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', colors.cyan)
  log('║     Admin Account Setup - Secure Setup       ║', colors.cyan)
  log('╚════════════════════════════════════════════════╝\n', colors.cyan)

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const defaultAdminEmail = process.env.ADMIN_EMAIL || 'huuhung20182019@gmail.com'

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing Supabase credentials', colors.red)
    log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', colors.yellow)
    process.exit(1)
  }

  log('📋 Configuration:', colors.blue)
  log(`   Supabase URL: ${supabaseUrl}`, colors.reset)
  log(`   Default Email: ${defaultAdminEmail}\n`, colors.reset)

  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Step 1: Get admin email
    log('Step 1: Admin Email', colors.green)
    const useDefault = await prompt(`Use default email (${defaultAdminEmail})? [Y/n]: `)
    
    let adminEmail = defaultAdminEmail
    if (useDefault.toLowerCase() === 'n') {
      adminEmail = await prompt('Enter admin email: ')
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(adminEmail)) {
        log('❌ Invalid email format', colors.red)
        process.exit(1)
      }
    }

    log(`✅ Using email: ${adminEmail}\n`, colors.green)

    // Step 2: Check if user exists in database
    log('Step 2: Checking existing records...', colors.green)
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single()

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      throw userCheckError
    }

    if (existingUser) {
      log(`✅ User found in database: ${existingUser.email}`, colors.green)
      log(`   Current role: ${existingUser.role}`, colors.reset)
      
      if (existingUser.role === 'admin') {
        log('⚠️  User is already an admin', colors.yellow)
        const proceed = await prompt('Do you want to reset password? [y/N]: ')
        if (proceed.toLowerCase() !== 'y') {
          log('👋 Exiting...', colors.blue)
          process.exit(0)
        }
      } else {
        log('⚠️  User exists with different role. Will be elevated to admin.', colors.yellow)
      }
    } else {
      log('ℹ️  User not found in database. Will be created.\n', colors.yellow)
    }

    // Step 3: Get password
    log('\nStep 3: Set Password', colors.green)
    log('Password requirements:', colors.yellow)
    log('  • Minimum 12 characters', colors.reset)
    log('  • At least 1 uppercase letter', colors.reset)
    log('  • At least 1 lowercase letter', colors.reset)
    log('  • At least 1 number', colors.reset)
    log('  • At least 1 special character\n', colors.reset)

    let password = ''
    let passwordValid = false

    while (!passwordValid) {
      password = await promptPassword('Enter password: ')
      const confirmPassword = await promptPassword('Confirm password: ')

      if (password !== confirmPassword) {
        log('❌ Passwords do not match. Please try again.\n', colors.red)
        continue
      }

      const validation = validatePassword(password)
      if (!validation.valid) {
        log('❌ Password does not meet requirements:', colors.red)
        validation.errors.forEach(error => log(`   • ${error}`, colors.red))
        log('', colors.reset)
        continue
      }

      passwordValid = true
    }

    log('✅ Password validated\n', colors.green)

    // Step 4: Create or update auth user
    log('Step 4: Creating/Updating Supabase Auth user...', colors.green)

    // Check if auth user exists
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }

    const existingAuthUser = authUsers.users.find(u => u.email === adminEmail)

    let authUserId: string

    if (existingAuthUser) {
      log(`✅ Auth user exists: ${existingAuthUser.id}`, colors.green)
      
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        { 
          password,
          email_confirm: true // Auto-confirm email
        }
      )

      if (updateError) {
        throw updateError
      }

      authUserId = existingAuthUser.id
      log('✅ Password updated', colors.green)
    } else {
      // Create new auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: 'System Administrator',
          role: 'admin'
        }
      })

      if (createError) {
        throw createError
      }

      if (!newUser.user) {
        throw new Error('Failed to create user')
      }

      authUserId = newUser.user.id
      log(`✅ Auth user created: ${authUserId}`, colors.green)
    }

    // Step 5: Create/Update database record
    log('\nStep 5: Updating database record...', colors.green)

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          id: authUserId, // Sync with auth user ID
          role: 'admin',
          plan: 'enterprise',
          token_quota: 999999,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail)

      if (updateError) {
        throw updateError
      }

      log('✅ User elevated to admin', colors.green)
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: adminEmail,
          name: 'System Administrator',
          role: 'admin',
          plan: 'enterprise',
          token_quota: 999999,
          token_used_today: 0,
          is_active: true
        })

      if (insertError) {
        throw insertError
      }

      log('✅ Database record created', colors.green)
    }

    // Step 6: Log activity
    log('\nStep 6: Logging setup activity...', colors.green)
    
    const { error: logError } = await supabase
      .from('admin_activity_logs')
      .insert({
        user_id: authUserId,
        action: 'admin_setup_completed',
        details: {
          email: adminEmail,
          method: 'setup_script',
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      log('⚠️  Warning: Could not log activity (table may not exist yet)', colors.yellow)
    } else {
      log('✅ Activity logged', colors.green)
    }

    // Success!
    log('\n╔════════════════════════════════════════════════╗', colors.green)
    log('║        ✅ Admin Account Setup Complete!       ║', colors.green)
    log('╚════════════════════════════════════════════════╝\n', colors.green)

    log('📧 Admin Email: ' + adminEmail, colors.cyan)
    log('🔑 Password: ********** (securely set)', colors.cyan)
    log('👤 Role: admin', colors.cyan)
    log('📦 Plan: enterprise', colors.cyan)
    log('🎫 Token Quota: 999999 (unlimited)\n', colors.cyan)

    log('🚀 Next Steps:', colors.blue)
    log('   1. Visit your app at: /auth/login', colors.reset)
    log('   2. Login with the admin credentials', colors.reset)
    log('   3. Navigate to: /admin', colors.reset)
    log('   4. Change password after first login (recommended)\n', colors.reset)

    log('🔒 Security Reminders:', colors.yellow)
    log('   • Keep your admin credentials secure', colors.reset)
    log('   • Change password regularly', colors.reset)
    log('   • Enable 2FA if available', colors.reset)
    log('   • Monitor admin activity logs\n', colors.reset)

  } catch (error: any) {
    log('\n❌ Error during setup:', colors.red)
    log(error.message || error, colors.red)
    log('\nPlease check your configuration and try again.\n', colors.yellow)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)

