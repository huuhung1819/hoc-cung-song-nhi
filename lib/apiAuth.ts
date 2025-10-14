/**
 * API Route Protection Utilities
 * Enhanced security for API endpoints with permission-based access control
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission, Role } from '@/lib/permissions'

interface AuthResult {
  user: any
  role: Role
  isAuthenticated: boolean
  error?: string
}

/**
 * Extract user authentication from request
 */
export async function getAuthFromRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createServerClient()
    
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        user: null,
        role: 'parent' as Role,
        isAuthenticated: false,
        error: 'Unauthenticated'
      }
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return {
        user,
        role: 'parent' as Role,
        isAuthenticated: true,
        error: 'User role not found'
      }
    }

    return {
      user,
      role: userData.role as Role,
      isAuthenticated: true
    }
  } catch (error) {
    console.error('Auth extraction error:', error)
    return {
      user: null,
      role: 'parent' as Role,
      isAuthenticated: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Require authentication for API route
 */
export function requireAuth() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return null // Allow request to continue
  }
}

/**
 * Require specific role for API route
 */
export function requireRole(requiredRole: Role) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (auth.role !== requiredRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(requiredRoles: Role[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!requiredRoles.includes(auth.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

/**
 * Require specific permission
 */
export function requirePermission(permission: Permission) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasPermission(auth.role, permission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasAnyPermission(auth.role, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

/**
 * Require all of the specified permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasAllPermissions(auth.role, permissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return null
  }
}

/**
 * Admin-only access
 */
export const requireAdmin = requireRole('admin')

/**
 * Teacher or Admin access
 */
export const requireTeacherOrAdmin = requireAnyRole(['teacher', 'admin'])

/**
 * Parent or Student access
 */
export const requireParentOrStudent = requireAnyRole(['parent', 'student'])

/**
 * Higher-order function to wrap API handlers with auth
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<NextResponse>,
  authCheck?: (request: NextRequest) => Promise<NextResponse | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Run custom auth check if provided
    if (authCheck) {
      const authError = await authCheck(request)
      if (authError) {
        return authError
      }
    }

    // Get auth info
    const auth = await getAuthFromRequest(request)
    
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Call the original handler with auth info
    return handler(request, auth)
  }
}

/**
 * Rate limiting for API routes
 */
export async function checkApiRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // This would integrate with your existing rate limiting system
  // For now, return a simple implementation
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: Date.now() + windowMs
  }
}

/**
 * Log API access for security monitoring
 */
export async function logApiAccess(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  metadata?: Record<string, any>
) {
  try {
    // This would integrate with your logging system
    console.log(`API Access: ${method} ${endpoint} - User: ${userId} - Status: ${statusCode}`, metadata)
  } catch (error) {
    console.error('Error logging API access:', error)
  }
}

/**
 * Validate request body for required fields
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null || body[field] === ''
  )

  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '')
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}
