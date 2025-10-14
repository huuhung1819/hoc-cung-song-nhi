import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, logAdminActivityFromRequest, checkAdminSession } from '@/lib/adminSecurity'
import { canAccessRoute, hasPermission, ROUTE_PERMISSIONS, Permission } from '@/lib/permissions'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user role for middleware logic
  let currentUserRole = 'parent' // default role
  if (user) {
    // Prefer role from DB
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // Debug logs removed for security

      if (!profileError && userProfile?.role) {
        currentUserRole = userProfile.role
      } else {
        // Fallback to cookie role if DB query fails
        const cookieRole = request.cookies.get('user-role')?.value
        if (cookieRole) currentUserRole = cookieRole
      }
    } catch (error) {
      console.error('Error getting user role:', error)
      const cookieRole = request.cookies.get('user-role')?.value
      if (cookieRole) currentUserRole = cookieRole
    }

    // Add user ID to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', currentUserRole)
    const newResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    // Copy cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach(cookie => {
      newResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        expires: cookie.expires,
        maxAge: cookie.maxAge,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      })
    })

    // Set user-role cookie for client-side layouts (not httpOnly so client can read)
    newResponse.cookies.set('user-role', currentUserRole, {
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    })

    supabaseResponse = newResponse
  }

  // Preview routes - public access (no auth required)
  const publicPreviewRoutes = ['/preview-dashboard', '/test-ui']
  const isPublicPreview = publicPreviewRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  
  // Allow public preview routes without authentication
  if (isPublicPreview) {
    return supabaseResponse
  }

  // Protected routes with role-based access
  const protectedRoutes = ['/dashboard', '/teacher', '/admin']
  const adminOnlyRoutes = ['/admin']
  const teacherOnlyRoutes = ['/teacher']
  const authRoutes = ['/auth/login', '/auth/register']
  const allowedAuthRoutes = ['/auth/callback', '/auth/reset-password', '/auth/forgot-password']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminOnlyRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isTeacherRoute = teacherOnlyRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAllowedAuthRoute = allowedAuthRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Check if this is a password recovery flow
  const isPasswordRecovery = request.nextUrl.searchParams.get('type') === 'recovery' || 
                              request.nextUrl.searchParams.get('next') === 'reset-password' ||
                              request.nextUrl.searchParams.get('recovery') === 'true'

  // Allow callback and reset-password pages without redirect
  if (isAllowedAuthRoute) {
    return supabaseResponse
  }

  // Allow reset-password page even if user is logged in (for password recovery)
  if (user && request.nextUrl.pathname.startsWith('/auth/reset-password')) {
    return supabaseResponse
  }

  // If user is not signed in and trying to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Role-based access control for authenticated users
  if (user && isProtectedRoute) {
    // Use the role resolved above from the database
    const userRole = currentUserRole

    // Enhanced permission-based access control
    const currentPath = request.nextUrl.pathname
    
    // Check if user can access the current route
    if (!canAccessRoute(userRole, currentPath)) {
      console.warn(`Unauthorized access attempt: User ${user.id} with role ${userRole} tried to access ${currentPath}`)
      
      // Log unauthorized access attempt
      try {
        await logAdminActivityFromRequest(
          user.id,
          'unauthorized_access_attempt',
          request,
          { 
            attemptedRoute: currentPath,
            userRole: userRole,
            timestamp: new Date().toISOString()
          }
        )
      } catch (error) {
        console.error('Error logging unauthorized access:', error)
      }
      
      // Redirect based on role
      const url = request.nextUrl.clone()
      if (userRole === 'admin') {
        url.pathname = '/admin'
      } else if (userRole === 'teacher') {
        url.pathname = '/teacher'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Enhanced security for admin routes
    if (isAdminRoute && userRole === 'admin') {
      try {
        // Check rate limit
        const rateLimit = await checkRateLimit(user.id, request.nextUrl.pathname)
        
        if (!rateLimit.allowed) {
          // Rate limit exceeded
          await logAdminActivityFromRequest(
            user.id,
            'admin_rate_limit_exceeded',
            request,
            { endpoint: request.nextUrl.pathname }
          )
          
          return new NextResponse(
            JSON.stringify({
              error: 'Too many requests',
              message: 'Rate limit exceeded. Please try again later.',
              resetAt: rateLimit.resetAt.toISOString()
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
              }
            }
          )
        }

        // Check session timeout
        const session = await checkAdminSession(user.id)
        
        if (!session.valid) {
          // Session expired
          await logAdminActivityFromRequest(
            user.id,
            'admin_session_expired',
            request,
            { lastActivity: session.lastActivity.toISOString() }
          )
          
          const url = request.nextUrl.clone()
          url.pathname = '/auth/login'
          url.searchParams.set('reason', 'session_expired')
          return NextResponse.redirect(url)
        }

        // Log admin access
        await logAdminActivityFromRequest(
          user.id,
          'admin_route_access',
          request,
          { 
            endpoint: request.nextUrl.pathname,
            method: request.method
          }
        )

        // Add rate limit headers to response
        supabaseResponse.headers.set('X-RateLimit-Limit', '10')
        supabaseResponse.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
        supabaseResponse.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString())
        
      } catch (error) {
        console.error('Admin security check error:', error)
        // Continue on error (fail open for availability)
      }
    }

    // Check admin route access
    if (isAdminRoute && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // Redirect to dashboard if not admin
      return NextResponse.redirect(url)
    }

    // Check teacher route access
    if (isTeacherRoute && userRole !== 'teacher' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // Redirect to dashboard if not teacher/admin
      return NextResponse.redirect(url)
    }
  }

  // If user is signed in and trying to access login/register
  // BUT allow if this is a password recovery flow
  // ALSO allow reset-password page during recovery flow
  // Remove middleware redirect for auth routes - let login page handle it
  // if (user && isAuthRoute && !isPasswordRecovery && !request.nextUrl.pathname.startsWith('/auth/reset-password')) {
  //   const url = request.nextUrl.clone()
  //   // Redirect admin users to admin dashboard, others to user dashboard
  //   
  //   console.log('🔍 Middleware Redirect Debug:', {
  //     userId: user.id,
  //     userRole: currentUserRole,
  //     redirectTo: currentUserRole === 'admin' ? '/admin' : '/dashboard',
  //     currentPath: request.nextUrl.pathname
  //   })
  //   
  //   url.pathname = currentUserRole === 'admin' ? '/admin' : '/dashboard'
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
