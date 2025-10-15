'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TokenProgressProps {
  userId: string
  className?: string
  label?: string
}

export function TokenProgress({ userId, className, label = "Credit còn lại" }: TokenProgressProps) {
  const [tokenData, setTokenData] = useState({
    used: 0,
    quota: 5000,
    remaining: 5000,
    percentage: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchTokenData = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/token?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        const used = data.used || data.token_used_today || 0
        const quota = data.quota || data.token_quota || 5000
        const percentage = quota > 0 ? (used / quota) * 100 : 0
        
        setTokenData({
          used: Number(used) || 0,
          quota: Number(quota) || 5000,
          remaining: Math.max(0, (Number(quota) || 5000) - (Number(used) || 0)),
          percentage: Math.min(100, Math.max(0, percentage))
        })
      } else {
        console.error('Failed to fetch token data:', response.status)
        // Set default values on error
        setTokenData({
          used: 0,
          quota: 5000,
          remaining: 5000,
          percentage: 0
        })
      }
    } catch (error) {
      console.error('Error fetching token data:', error)
      // Set default values on error
      setTokenData({
        used: 0,
        quota: 5000,
        remaining: 5000,
        percentage: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokenData()

    // Listen for credit updates
    const handleTokenUpdate = () => {
      console.log('🔄 Credit update event received, refreshing...')
      fetchTokenData()
    }

    // Listen for custom events
    window.addEventListener('tokenUpdated', handleTokenUpdate)
    window.addEventListener('userInfoUpdated', handleTokenUpdate)

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchTokenData, 10000)

    return () => {
      window.removeEventListener('tokenUpdated', handleTokenUpdate)
      window.removeEventListener('userInfoUpdated', handleTokenUpdate)
      clearInterval(interval)
    }
  }, [userId])

  const isNearLimit = tokenData.percentage >= 80
  const isAtLimit = tokenData.percentage >= 100
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
        <span className={cn("text-sm font-medium", getTextColor(tokenData.percentage))}>
          {isLoading ? '...' : `${tokenData.percentage.toFixed(1)}%`}
        </span>
      </div>

      {/* Credit Count */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{(tokenData.used || 0).toLocaleString()} credit</span>
        <span>/ {(tokenData.quota || 5000).toLocaleString()}</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={tokenData.percentage} 
          className="h-2"
        />
      </div>

      {/* Remaining Credits */}
      <div className="text-xs text-gray-500">
        Còn: {(tokenData.remaining || 5000).toLocaleString()} credit
      </div>

      {/* Status Message */}
      {isNearLimit && !isAtLimit && (
        <div className="text-xs text-yellow-600 font-medium">
          ⚠️ Gần hết credit! Cân nhắc nâng cấp gói
        </div>
      )}
      
      {isAtLimit && (
        <div className="text-xs text-red-600 font-medium">
          ❌ Đã hết credit! Vui lòng nâng cấp gói
        </div>
      )}

      {!isNearLimit && !isAtLimit && (
        <div className="text-xs text-green-600 font-medium">
          ✅ Còn nhiều credit để sử dụng
        </div>
      )}
    </div>
  )
}
