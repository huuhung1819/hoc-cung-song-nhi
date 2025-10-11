import { createClient } from './supabaseClient'

export const authClient = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error('Đăng nhập thất bại')
    }
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string, role: string) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (error) {
        throw error
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error('Đăng ký thất bại')
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error('Đăng xuất thất bại')
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const supabase = createClient()

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }

      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    const supabase = createClient()

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return session
    } catch (error) {
      console.error('Get current session error:', error)
      return null
    }
  },

  /**
   * Get user profile from users table
   */
  async getUserProfile(userId: string) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Get user profile error:', error)
      throw new Error('Không thể lấy thông tin người dùng')
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: any) {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Update user profile error:', error)
      throw new Error('Không thể cập nhật thông tin người dùng')
    }
  },

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId)
      return profile.role === role
    } catch (error) {
      return false
    }
  },

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'admin')
  },

  /**
   * Check if user is teacher
   */
  async isTeacher(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'teacher')
  },

  /**
   * Check if user is parent/student
   */
  async isParent(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'parent')
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error('Không thể gửi email đặt lại mật khẩu')
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Update password error:', error)
      throw new Error('Không thể cập nhật mật khẩu')
    }
  }
}
