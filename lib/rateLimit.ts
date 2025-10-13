import { createServerClientForAPI } from './supabaseServer'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

// Default rate limit configs
export const RATE_LIMITS = {
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30 // 30 requests per minute
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  }
}

/**
 * Rate limiter using Supabase as storage
 * Tracks requests per user/IP in memory with cleanup
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, data] of Array.from(this.requests.entries())) {
        if (now > data.resetAt) {
          this.requests.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request should be rate limited
   * Returns { allowed: boolean, remaining: number, resetAt: number }
   */
  async check(
    identifier: string, // userId or IP address
    config: RateLimitConfig = RATE_LIMITS.api
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number; retryAfter?: number }> {
    const now = Date.now()
    const key = `${identifier}_${Math.floor(now / config.windowMs)}`
    
    let data = this.requests.get(key)
    
    if (!data || now > data.resetAt) {
      // Create new window
      data = {
        count: 0,
        resetAt: now + config.windowMs
      }
      this.requests.set(key, data)
    }

    data.count++

    const allowed = data.count <= config.maxRequests
    const remaining = Math.max(0, config.maxRequests - data.count)
    const retryAfter = allowed ? undefined : Math.ceil((data.resetAt - now) / 1000)

    return {
      allowed,
      remaining,
      resetAt: data.resetAt,
      retryAfter
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    for (const key of Array.from(this.requests.keys())) {
      if (key.startsWith(identifier)) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.requests.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export { rateLimiter, RateLimiter }

/**
 * Middleware helper for Next.js API routes
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.api
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await rateLimiter.check(identifier, config)

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  }

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return {
    allowed: result.allowed,
    headers
  }
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try to get real IP from headers (works with proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}

