import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'
import { logAdminActivityFromRequest } from '@/lib/adminSecurity'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    // Check if user is admin
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log admin activity
    await logAdminActivityFromRequest(
      userId,
      'admin_stats_viewed',
      request
    )

    const supabase = createServiceClient()

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error getting total users:', usersError)
    }

    // Get active users (updated within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', sevenDaysAgo.toISOString())

    if (activeUsersError) {
      console.error('Error getting active users:', activeUsersError)
    }

    // Get total revenue from approved payments
    const { data: revenueData, error: revenueError } = await supabase
      .from('payment_requests')
      .select('amount')
      .eq('status', 'approved')

    let totalRevenue = 0
    let todayRevenue = 0

    if (!revenueError && revenueData) {
      totalRevenue = revenueData.reduce((sum, payment) => sum + payment.amount, 0)
      
      // Calculate today's revenue
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayData, error: todayError } = await supabase
        .from('payment_requests')
        .select('amount')
        .eq('status', 'approved')
        .gte('approved_at', today.toISOString())

      if (!todayError && todayData) {
        todayRevenue = todayData.reduce((sum, payment) => sum + payment.amount, 0)
      }
    }

    // Get pending payments count
    const { count: pendingPayments, error: pendingError } = await supabase
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingError) {
      console.error('Error getting pending payments:', pendingError)
    }

    // Get token usage stats
    const { data: tokenData, error: tokenError } = await supabase
      .from('users')
      .select('token_used_today')

    let totalTokens = 0
    let tokensToday = 0

    if (!tokenError && tokenData) {
      totalTokens = tokenData.reduce((sum, user) => sum + (user.token_used_today || 0), 0)
      tokensToday = totalTokens // For now, assume all tokens are today's usage
    }

    // Simple system health check
    let systemHealth: 'good' | 'warning' | 'critical' = 'good'
    
    if (pendingPayments && pendingPayments > 10) {
      systemHealth = 'warning'
    }
    
    if (!totalUsers || totalUsers === 0) {
      systemHealth = 'critical'
    }

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue,
      todayRevenue,
      pendingPayments: pendingPayments || 0,
      totalTokens,
      tokensToday,
      systemHealth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error getting admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
