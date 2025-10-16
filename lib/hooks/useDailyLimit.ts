import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/authContext'

interface DailyLimitData {
  todayUsage: number
  dailyLimit: number
  remaining: number
  canCreate: boolean
}

interface UseDailyLimitReturn {
  data: DailyLimitData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  incrementUsage: (count?: number) => Promise<{ success: boolean; error?: string }>
}

export function useDailyLimit(): UseDailyLimitReturn {
  const { user } = useAuth()
  const [data, setData] = useState<DailyLimitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDailyLimit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/daily-limit')
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Chưa đăng nhập')
        }
        throw new Error('Không thể kiểm tra giới hạn hàng ngày')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      console.error('Error fetching daily limit:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementUsage = useCallback(async (count: number = 1): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' }
    }
    
    try {
      const response = await fetch('/api/daily-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, count })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Không thể tăng số lượng sử dụng' }
      }
      
      // Update local state
      setData(result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định'
      return { success: false, error: errorMessage }
    }
  }, [user?.id])

  useEffect(() => {
    fetchDailyLimit()
  }, [fetchDailyLimit])

  return {
    data,
    loading,
    error,
    refresh: fetchDailyLimit,
    incrementUsage
  }
}
