import { createClient, createServerClientForAPI } from './supabaseServer'

export const tokenManager = {
  /**
   * Create demo user if not exists
   */
  async createDemoUser(userId: string) {
    const supabase = createServerClientForAPI()

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Generate proper UUID for demo user
      const demoUserId = userId.includes('demo') ? 
        `550e8400-e29b-41d4-a716-446655440000` : // Fixed UUID for demo
        userId
      
      const { error } = await supabase
        .from('users')
        .insert({
          id: demoUserId,
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'parent',
          token_quota: 10000,
          token_used_today: 0,
          last_reset: today,
          plan: 'basic',
          created_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Could not create demo user:', error)
      }
    } catch (error) {
      console.warn('Error creating demo user:', error)
    }
  },

  /**
   * Check if user has token quota remaining
   */
  async checkTokenQuota(userId: string): Promise<{ hasQuota: boolean; remaining: number; total: number }> {
    const supabase = createServerClientForAPI()

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('token_quota, token_used_today, last_reset')
        .eq('id', userId)
        .single()

      if (error || !user) {
        // Tạo demo user nếu chưa có
        await this.createDemoUser(userId)
        return {
          hasQuota: true,
          remaining: 10000, // Demo quota
          total: 10000
        }
      }

      // Check if tokens need to be reset (daily reset)
      const today = new Date().toISOString().split('T')[0]
      if (user.last_reset !== today) {
        await this.resetDailyTokens(userId)
        return {
          hasQuota: true,
          remaining: user.token_quota,
          total: user.token_quota
        }
      }

      const remaining = user.token_quota - user.token_used_today

      return {
        hasQuota: remaining > 0,
        remaining,
        total: user.token_quota
      }
    } catch (error) {
      console.error('Error checking token quota:', error)
      throw new Error('Không thể kiểm tra quota token')
    }
  },

  /**
   * Get detailed token information for user
   */
  async getTokenInfo(userId: string) {
    const supabase = createServerClientForAPI()

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('token_quota, token_used_today, last_reset, plan, name, email')
        .eq('id', userId)
        .single()

      if (error || !user) {
        // If user doesn't exist, create a default user record
        console.log('User not found, creating default user record for:', userId)
        
        // Create default user info (can't access auth context in server-side)
        const userEmail = 'user@example.com'
        const userName = 'New User'
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail,
            name: userName,
            phone: null,
            role: 'parent',
            plan: 'basic',
            token_quota: 10000,
            token_used_today: 0,
            last_reset: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select('token_quota, token_used_today, last_reset, plan, name, email')
          .single()

        if (createError || !newUser) {
          console.error('Error creating user:', createError)
          throw new Error(`Không thể tạo thông tin người dùng: ${createError?.message || 'Unknown error'}`)
        }

        return {
          quota: newUser.token_quota,
          used: newUser.token_used_today,
          remaining: newUser.token_quota,
          plan: newUser.plan,
          lastReset: newUser.last_reset,
          name: newUser.name,
          email: newUser.email,
          needsReset: false
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const remaining = user.token_quota - user.token_used_today

      return {
        quota: user.token_quota,
        used: user.token_used_today,
        remaining: Math.max(0, remaining),
        plan: user.plan,
        lastReset: user.last_reset,
        name: user.name,
        email: user.email,
        needsReset: user.last_reset !== today
      }
    } catch (error) {
      console.error('Error getting token info:', error)
      throw new Error('Không thể lấy thông tin token')
    }
  },

  /**
   * Deduct tokens from user's daily quota
   */
  async deductTokens(userId: string, tokensToDeduct: number) {
    const supabase = createServerClientForAPI()

    try {
      const { error } = await supabase
        .from('users')
        .update({
          token_used_today: tokensToDeduct // Simplified for now
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deducting tokens:', error)
      throw new Error('Không thể trừ token')
    }
  },

  /**
   * Reset daily tokens for a user
   */
  async resetDailyTokens(userId: string) {
    const supabase = createServerClientForAPI()

    try {
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('users')
        .update({
          token_used_today: 0,
          last_reset: today
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error resetting daily tokens:', error)
      throw new Error('Không thể reset token hàng ngày')
    }
  },

  /**
   * Reset daily tokens for all users (cron job)
   */
  async resetAllDailyTokens() {
    const supabase = createServerClientForAPI()

    try {
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('users')
        .update({
          token_used_today: 0,
          last_reset: today
        })
        .neq('last_reset', today) // Only update users who haven't been reset today

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error resetting all daily tokens:', error)
      throw new Error('Không thể reset token cho tất cả người dùng')
    }
  },

  /**
   * Add tokens to user (admin function)
   */
  async addTokens(userId: string, tokensToAdd: number) {
    const supabase = createServerClientForAPI()

    try {
      const { error } = await supabase
        .from('users')
        .update({
          token_quota: tokensToAdd // Simplified for now
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error adding tokens:', error)
      throw new Error('Không thể thêm token')
    }
  },

  /**
   * Set token quota for user (admin function)
   */
  async setTokenQuota(userId: string, newQuota: number) {
    const supabase = createServerClientForAPI()

    try {
      const { error } = await supabase
        .from('users')
        .update({
          token_quota: newQuota
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error setting token quota:', error)
      throw new Error('Không thể cập nhật quota token')
    }
  },

  /**
   * Log token usage for analytics
   */
  async logTokenUsage(userId: string, totalTokens: number, usage?: any, mode?: string, hasImage?: boolean) {
    const supabase = createServerClientForAPI()

    try {
      const { error } = await supabase
        .from('token_logs')
        .insert({
          user_id: userId,
          total_tokens: totalTokens,
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0
        })

      if (error) {
        console.warn('Could not log token usage:', error)
        // Don't throw error for logging failures
      }
    } catch (error) {
      console.warn('Error logging token usage:', error)
      // Don't throw error for logging failures
    }
  },

  /**
   * Get token usage statistics
   */
  async getTokenStats(period: 'day' | 'week' | 'month' = 'day') {
    const supabase = createServerClientForAPI()

    try {
      let dateFilter = ''
      switch (period) {
        case 'day':
          dateFilter = "timestamp >= CURRENT_DATE"
          break
        case 'week':
          dateFilter = "timestamp >= CURRENT_DATE - INTERVAL '7 days'"
          break
        case 'month':
          dateFilter = "timestamp >= CURRENT_DATE - INTERVAL '30 days'"
          break
      }

      const { data, error } = await supabase
        .from('token_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - (period === 'day' ? 86400000 : period === 'week' ? 604800000 : 2592000000)).toISOString())

      if (error) {
        throw error
      }

      const totalTokens = data?.reduce((sum: number, log: any) => sum + log.total_tokens, 0) || 0
      const totalRequests = data?.length || 0

      return {
        totalTokens,
        totalRequests,
        averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
        period
      }
    } catch (error) {
      console.error('Error getting token stats:', error)
      throw new Error('Không thể lấy thống kê token')
    }
  },

  /**
   * Reset quota for demo user (for testing)
   */
  async resetDemoUserQuota() {
    const supabase = createServerClientForAPI()
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000'
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          token_used_today: 0,
          last_reset: new Date().toISOString().split('T')[0]
        })
        .eq('id', demoUserId)

      if (error) {
        console.error('Error resetting demo user quota:', error)
      } else {
        console.log('Demo user quota reset successfully')
      }
    } catch (error) {
      console.error('Error resetting demo user quota:', error)
    }
  }
}
