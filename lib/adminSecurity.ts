/**
 * Admin Security Module
 * 
 * Provides security features for admin routes:
 * - Rate limiting
 * - Activity logging
 * - Session management
 */

import { createClient } from '@/lib/supabaseServer'
import { NextRequest } from 'next/server'

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.ADMIN_RATE_LIMIT || '10')
const SESSION_TIMEOUT = parseInt(process.env.ADMIN_SESSION_TIMEOUT || '900000') // 15 minutes
const ENABLE_LOGGING = process.env.ADMIN_ENABLE_LOGGING !== 'false'

// =============================================
// RATE LIMITING
// =============================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check rate limit for admin user
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string = 'admin'
): Promise<RateLimitResult> {
  const supabase = createClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW)

  try {
    // Cleanup old records first
    await supabase
      .from('admin_rate_limits')
      .delete()
      .lt('window_start', windowStart.toISOString())

    // Get current count
    const { data: existingRecords, error: fetchError } = await supabase
      .from('admin_rate_limits')
      .select('request_count, window_start')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Rate limit check error:', fetchError)
      // Allow request if we can't check (fail open)
      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS,
        resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW)
      }
    }

    const currentRecord = existingRecords?.[0]

    if (!currentRecord) {
      // No record found, create new one
      const { error: insertError } = await supabase
        .from('admin_rate_limits')
        .insert({
          user_id: userId,
          endpoint,
          request_count: 1,
          window_start: now.toISOString()
        })

      if (insertError) {
        console.error('Rate limit insert error:', insertError)
      }

      return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - 1,
        resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW)
      }
    }

    // Check if limit exceeded
    if (currentRecord.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date(currentRecord.window_start).getTime() + RATE_LIMIT_WINDOW)
      }
    }

    // Increment count
    const { error: updateError } = await supabase
      .from('admin_rate_limits')
      .update({
        request_count: currentRecord.request_count + 1
      })
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .eq('window_start', currentRecord.window_start)

    if (updateError) {
      console.error('Rate limit update error:', updateError)
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - currentRecord.request_count - 1,
      resetAt: new Date(new Date(currentRecord.window_start).getTime() + RATE_LIMIT_WINDOW)
    }

  } catch (error) {
    console.error('Rate limit error:', error)
    // Allow request on error (fail open)
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW)
    }
  }
}

/**
 * Rate limit middleware wrapper
 */
export async function withRateLimit(
  userId: string,
  endpoint: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimit = await checkRateLimit(userId, endpoint)

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetAt: rateLimit.resetAt.toISOString()
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
        }
      }
    )
  }

  // Add rate limit headers to response
  const response = await handler()
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString())

  return response
}

// =============================================
// ACTIVITY LOGGING
// =============================================

export interface AdminActivityLog {
  userId: string
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  log: AdminActivityLog
): Promise<void> {
  if (!ENABLE_LOGGING) {
    return
  }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        user_id: log.userId,
        action: log.action,
        details: log.details || {},
        ip_address: log.ipAddress,
        user_agent: log.userAgent
      })

    if (error) {
      console.error('Failed to log admin activity:', error)
    }
  } catch (error) {
    console.error('Activity logging error:', error)
  }
}

/**
 * Log admin activity from request
 */
export async function logAdminActivityFromRequest(
  userId: string,
  action: string,
  request: NextRequest,
  details?: Record<string, any>
): Promise<void> {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  await logAdminActivity({
    userId,
    action,
    details,
    ipAddress,
    userAgent
  })
}

/**
 * Get admin activity logs
 */
export async function getAdminActivityLogs(
  userId?: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to get activity logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Get activity logs error:', error)
    return []
  }
}

// =============================================
// SESSION MANAGEMENT
// =============================================

interface SessionInfo {
  valid: boolean
  userId: string
  lastActivity: Date
  expiresAt: Date
}

/**
 * Check if admin session is valid
 */
export async function checkAdminSession(
  userId: string
): Promise<SessionInfo> {
  const supabase = createClient()

  try {
    // Get user's last activity from logs
    const { data: lastLog } = await supabase
      .from('admin_activity_logs')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastActivity = lastLog ? new Date(lastLog.created_at) : new Date()
    const now = new Date()
    const expiresAt = new Date(lastActivity.getTime() + SESSION_TIMEOUT)

    return {
      valid: now < expiresAt,
      userId,
      lastActivity,
      expiresAt
    }
  } catch (error) {
    console.error('Session check error:', error)
    // Default to valid on error (fail open)
    return {
      valid: true,
      userId,
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT)
    }
  }
}

/**
 * Update admin session activity
 */
export async function updateAdminSession(
  userId: string
): Promise<void> {
  // Log activity to update last activity timestamp
  await logAdminActivity({
    userId,
    action: 'session_activity',
    details: {
      timestamp: new Date().toISOString()
    }
  })
}

// =============================================
// SECURITY HELPERS
// =============================================

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.role === 'admin'
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}

/**
 * Require admin role (throws if not admin)
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)
  
  if (!admin) {
    throw new Error('Unauthorized: Admin role required')
  }
}

/**
 * Get security stats for admin dashboard
 */
export async function getSecurityStats(userId: string): Promise<{
  totalLogs: number
  recentActivities: number
  rateLimitStatus: RateLimitResult
  sessionInfo: SessionInfo
}> {
  const supabase = createClient()

  try {
    // Get total logs
    const { count: totalLogs } = await supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get recent activities (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const { count: recentActivities } = await supabase
      .from('admin_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo.toISOString())

    // Get rate limit status
    const rateLimitStatus = await checkRateLimit(userId, 'dashboard')

    // Get session info
    const sessionInfo = await checkAdminSession(userId)

    return {
      totalLogs: totalLogs || 0,
      recentActivities: recentActivities || 0,
      rateLimitStatus,
      sessionInfo
    }
  } catch (error) {
    console.error('Get security stats error:', error)
    return {
      totalLogs: 0,
      recentActivities: 0,
      rateLimitStatus: {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS,
        resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW)
      },
      sessionInfo: {
        valid: true,
        userId,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TIMEOUT)
      }
    }
  }
}

// =============================================
// CLEANUP UTILITIES
// =============================================

/**
 * Cleanup old rate limit records
 */
export async function cleanupRateLimits(): Promise<number> {
  const supabase = createClient()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  try {
    const { count } = await supabase
      .from('admin_rate_limits')
      .delete()
      .lt('window_start', oneHourAgo.toISOString())

    return count || 0
  } catch (error) {
    console.error('Cleanup rate limits error:', error)
    return 0
  }
}

/**
 * Cleanup old activity logs (keep last 90 days)
 */
export async function cleanupActivityLogs(daysToKeep: number = 90): Promise<number> {
  const supabase = createClient()
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

  try {
    const { count } = await supabase
      .from('admin_activity_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    return count || 0
  } catch (error) {
    console.error('Cleanup activity logs error:', error)
    return 0
  }
}

