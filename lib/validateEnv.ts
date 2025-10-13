/**
 * Environment Variables Validation
 * Validates required environment variables on app startup
 */

interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate required environment variables
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
  ]

  // Check required variables
  for (const key of required) {
    const value = process.env[key]
    if (!value || value === `your_${key.toLowerCase().replace('next_public_', '')}` || value.includes('your_')) {
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

/**
 * Log validation results
 */
export function logEnvValidation(): boolean {
  const result = validateEnv()

  console.log('\n🔍 Environment Variables Validation\n')

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
  } else if (result.isValid) {
    console.log('✅ Required environment variables are set (with some warnings)\n')
  } else {
    console.error('❌ Environment validation failed. Please fix the errors above.\n')
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production. Cannot start application.')
    }
  }

  return result.isValid
}

/**
 * Get safe environment info (without exposing secrets)
 */
export function getSafeEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasOpenAIKey: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasWorkflowId: !!process.env.OPENAI_WORKFLOW_ID,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasUnlockSecret: !!process.env.UNLOCK_CODE_SECRET,
  }
}

