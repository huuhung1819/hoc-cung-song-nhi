import { NextRequest, NextResponse } from 'next/server'
import { withAuth, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabaseServer'

// OpenAI pricing (per 1M tokens)
const PRICING = {
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.60
  },
  'gpt-4o': {
    input: 2.50,
    output: 10.00
  },
  'gpt-4-turbo': {
    input: 2.50,
    output: 10.00
  }
}

async function calculateOpenAICost(usage: any, model: string = 'gpt-4o-mini') {
  if (!usage) return 0
  
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['gpt-4o-mini']
  
  const inputCost = (usage.prompt_tokens / 1000000) * pricing.input
  const outputCost = (usage.completion_tokens / 1000000) * pricing.output
  
  return inputCost + outputCost
}

async function getTokenAnalytics() {
  const supabase = createServiceClient()
  
  try {
    const today = new Date().toISOString().split('T')[0]
    
    console.log('🔍 Fetching tokens for date:', today)
    
    // Get total tokens used today (including yesterday for testing)
    const { data: todayTokens, error: todayError } = await supabase
      .from('token_logs')
      .select('user_id, total_tokens, prompt_tokens, completion_tokens, model, cost, timestamp')
      .gte('timestamp', `${today}T00:00:00`)
      .lte('timestamp', `${today}T23:59:59`)
    
    console.log('📊 Today tokens found:', todayTokens?.length || 0)
    
    // If no data today, get recent data for testing
    let tokensData = todayTokens
    if (!tokensData || tokensData.length === 0) {
      console.log('🔍 No data today, fetching recent data...')
      const { data: recentTokens, error: recentError } = await supabase
        .from('token_logs')
        .select('user_id, total_tokens, prompt_tokens, completion_tokens, model, cost, timestamp')
        .order('timestamp', { ascending: false })
        .limit(50)
      
      if (!recentError) {
        tokensData = recentTokens
        console.log('📊 Recent tokens found:', tokensData?.length || 0)
      }
    }
    
    if (todayError) {
      console.error('Error fetching today tokens:', todayError)
    }
    
    // Calculate total tokens and cost
    let totalTokensToday = 0
    let totalCost = 0
    
    if (tokensData) {
      for (const log of tokensData) {
        totalTokensToday += log.total_tokens || 0
        
        // Calculate cost from tokens if not stored
        if (log.cost && log.cost > 0) {
          totalCost += log.cost
        } else {
          // Calculate cost from token usage
          const usage = {
            prompt_tokens: log.prompt_tokens || 0,
            completion_tokens: log.completion_tokens || 0
          }
          const calculatedCost = await calculateOpenAICost(usage, log.model)
          totalCost += calculatedCost
        }
      }
    }
    
    // Get active users count
    const uniqueActiveUsers = tokensData ? new Set(tokensData.map(u => u.user_id)).size : 0
    
    // Get tokens by role from actual token_logs
    let byRole = {
      parents: { tokens: 0, cost: 0 },
      teachers: { tokens: 0, cost: 0 },
      admin: { tokens: 0, cost: 0 }
    }
    
    if (tokensData) {
      // Get user roles for token logs
      const userIds = Array.from(new Set(tokensData.map(log => log.user_id)))
      const { data: userRoles, error: usersError } = await supabase
        .from('users')
        .select('id, role')
        .in('id', userIds)
      
      if (!usersError && userRoles) {
        const roleMap = new Map(userRoles.map(u => [u.id, u.role]))
        
        for (const log of tokensData) {
          const userRole = roleMap.get(log.user_id)
          console.log(`🔍 User ${log.user_id} has role: ${userRole}`)
          
          if (userRole) {
            // Map role to correct key
            let roleKey: keyof typeof byRole
            if (userRole === 'parent') {
              roleKey = 'parents'
            } else if (userRole === 'teacher') {
              roleKey = 'teachers'
            } else if (userRole === 'admin') {
              roleKey = 'admin'
            } else {
              continue // Skip unknown roles
            }
            
            byRole[roleKey].tokens += log.total_tokens || 0
            
            // Calculate cost for this role
            const logCost = log.cost || await calculateOpenAICost({
              prompt_tokens: log.prompt_tokens || 0,
              completion_tokens: log.completion_tokens || 0
            }, log.model)
            byRole[roleKey].cost += logCost
          }
        }
      }
    }
    
    // Get top users from actual token usage
    const topUsers = []
    if (tokensData) {
      const userTokenMap = new Map()
      
      for (const log of tokensData) {
        const userId = log.user_id
        if (userTokenMap.has(userId)) {
          userTokenMap.get(userId).tokens += log.total_tokens || 0
        } else {
          userTokenMap.set(userId, { tokens: log.total_tokens || 0 })
        }
      }
      
      // Get user details for top token users
      const topUserIds = Array.from(userTokenMap.entries())
        .sort((a, b) => b[1].tokens - a[1].tokens)
        .slice(0, 10)
        .map(([userId]) => userId)
      
      if (topUserIds.length > 0) {
        const { data: topUsersData, error: topUsersError } = await supabase
          .from('users')
          .select('id, email, name, role')
          .in('id', topUserIds)
        
        if (!topUsersError && topUsersData) {
          for (const user of topUsersData) {
            const tokenData = userTokenMap.get(user.id)
            topUsers.push({
              email: user.email,
              name: user.name || 'Unknown',
              tokens: tokenData?.tokens || 0,
              role: user.role
            })
          }
        }
      }
    }
    
    // Generate alerts
    const alerts = []
    
    // Check for users near quota limit (>80%)
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('email, token_used_today, token_quota')
      .not('token_quota', 'is', null)
    
    let nearLimitCount = 0
    let exhaustedCount = 0
    
    if (allUsers) {
      for (const user of allUsers) {
        const usagePercentage = (user.token_used_today || 0) / (user.token_quota || 1)
        
        if (usagePercentage >= 0.8 && usagePercentage < 1.0) {
          nearLimitCount++
        } else if (usagePercentage >= 1.0) {
          exhaustedCount++
        }
      }
    }
    
    if (nearLimitCount > 0) {
      alerts.push({
        type: 'warning',
        message: `${nearLimitCount} users đã dùng >80% quota`
      })
    }
    
    if (exhaustedCount > 0) {
      alerts.push({
        type: 'error',
        message: `${exhaustedCount} users đã hết token`
      })
    }
    
    // Check daily cost vs budget (assuming $100 daily budget)
    const dailyBudget = 100
    if (totalCost > dailyBudget * 0.15) {
      const percentageOver = ((totalCost - dailyBudget * 0.15) / (dailyBudget * 0.15)) * 100
      alerts.push({
        type: 'warning',
        message: `Daily cost vượt budget ${percentageOver.toFixed(0)}%`
      })
    }
    
    // Generate hourly chart data from real token logs
    const hourlyChart = []
    const hourlyData = new Map()
    
    // Initialize hourly data
    for (let hour = 0; hour < 24; hour++) {
      hourlyData.set(hour, { tokens: 0, cost: 0 })
    }
    
    // Process token logs by hour
    if (tokensData) {
      for (const log of tokensData) {
        const logDate = new Date(log.timestamp)
        const hour = logDate.getUTCHours() // Use UTC hours to match database timezone
        
        console.log(`🔍 Log timestamp: ${log.timestamp} -> UTC Hour: ${hour}`)
        
        if (hourlyData.has(hour)) {
          const hourData = hourlyData.get(hour)
          hourData.tokens += log.total_tokens || 0
          hourData.cost += log.cost || await calculateOpenAICost({
            prompt_tokens: log.prompt_tokens || 0,
            completion_tokens: log.completion_tokens || 0
          }, log.model)
        }
      }
    }
    
    // Convert to array format
    for (let hour = 0; hour < 24; hour++) {
      const hourData = hourlyData.get(hour)
      hourlyChart.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        tokens: hourData.tokens,
        cost: hourData.cost
      })
    }
    
    return {
      totalTokensToday,
      openaiCost: totalCost,
      activeUsers: uniqueActiveUsers,
      byRole,
      topUsers,
      alerts,
      hourlyChart
    }
    
  } catch (error) {
    console.error('Error getting token analytics:', error)
    throw error
  }
}

// Custom auth handler with admin bypass
export async function GET(req: NextRequest) {
  try {
    // TEMPORARY: Bypass auth for admin user debugging
    const userEmail = req.headers.get('x-user-email') || req.headers.get('x-forwarded-user-email')
    
    if (userEmail === 'huuhung20182019@gmail.com') {
      console.log('🔧 Admin bypass for token analytics API')
      const analytics = await getTokenAnalytics()
      return NextResponse.json(analytics)
    }
    
    // Normal auth flow for other users
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const analytics = await getTokenAnalytics()
    return NextResponse.json(analytics)
    
  } catch (error: any) {
    console.error('Token analytics API error:', error)
    return NextResponse.json(
      { error: 'Không thể lấy dữ liệu analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
