#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * Run this before starting the application
 */

require('dotenv').config({ path: '.env.local' })

// Simple validation function (duplicate of lib/validateEnv.ts but in JS for pre-build check)
function validateEnv() {
  const errors = []
  const warnings = []

  // Required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
  ]

  // Check required variables
  for (const key of required) {
    const value = process.env[key]
    if (!value || value.includes('your_')) {
      errors.push(`❌ ${key} is not set or using placeholder value`)
    }
  }

  // Check API key format
  if (process.env.OPENAI_API_KEY) {
    if (process.env.OPENAI_API_KEY.length < 20) {
      errors.push(`❌ OPENAI_API_KEY appears to be invalid (too short)`)
    }
  }

  // Recommended variables
  const recommended = [
    'OPENAI_WORKFLOW_ID',
    'SUPABASE_SERVICE_ROLE_KEY',
    'UNLOCK_CODE_SECRET',
  ]

  for (const key of recommended) {
    const value = process.env[key]
    if (!value || value.includes('your_')) {
      warnings.push(`⚠️  ${key} is not set (recommended for production)`)
    }
  }

  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    // In production, all recommended vars should be set
    for (const key of recommended) {
      const value = process.env[key]
      if (!value || value.includes('your_')) {
        errors.push(`❌ ${key} is required in production environment`)
      }
    }

    // Check if using default secret
    if (process.env.UNLOCK_CODE_SECRET === 'your_secure_random_secret_key_here' || 
        process.env.UNLOCK_CODE_SECRET === 'default-secret-key-change-in-production') {
      errors.push(`❌ UNLOCK_CODE_SECRET must be changed in production`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Run validation
console.log('\n🔍 Checking Environment Variables...\n')

const result = validateEnv()

if (result.errors.length > 0) {
  console.error('❌ ERRORS:\n')
  result.errors.forEach(error => console.error(`   ${error}`))
  console.error('\n')
}

if (result.warnings.length > 0) {
  console.warn('⚠️  WARNINGS:\n')
  result.warnings.forEach(warning => console.warn(`   ${warning}`))
  console.warn('\n')
}

if (result.isValid && result.warnings.length === 0) {
  console.log('✅ All environment variables are properly configured\n')
  process.exit(0)
} else if (result.isValid) {
  console.log('✅ Required environment variables are set (with some warnings)\n')
  process.exit(0)
} else {
  console.error('❌ Environment validation failed. Please check .env.local file.\n')
  console.error('💡 Tip: Copy env.example to .env.local and fill in your values:\n')
  console.error('   cp env.example .env.local\n')
  
  if (process.env.NODE_ENV === 'production') {
    console.error('🚫 Cannot start in production with invalid environment.\n')
    process.exit(1)
  } else {
    console.warn('⚠️  Continuing in development mode, but app may not work correctly.\n')
    process.exit(0)
  }
}

