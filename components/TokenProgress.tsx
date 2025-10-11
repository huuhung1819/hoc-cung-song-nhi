'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TokenProgressProps {
  usagePercentage: number
  isNearLimit?: boolean
  isAtLimit?: boolean
  className?: string
  label?: string
  isLoading?: boolean
}

export function TokenProgress({ usagePercentage, isNearLimit = false, isAtLimit = false, className, label = "Số câu hỏi hôm nay", isLoading = false }: TokenProgressProps) {
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
        <span className={cn("text-sm font-medium", getTextColor(usagePercentage))}>
          {isLoading ? '...' : `${usagePercentage}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={usagePercentage} 
          className="h-2"
        />
      </div>

      {/* Status Message */}
      {isNearLimit && !isAtLimit && (
        <div className="text-xs text-yellow-600 font-medium">
          ⚠️ Gần hết lượt hỗ trợ! Cân nhắc nâng cấp gói
        </div>
      )}
      
      {isAtLimit && (
        <div className="text-xs text-red-600 font-medium">
          ❌ Đã hết lượt hỗ trợ! Vui lòng quay lại vào ngày mai
        </div>
      )}

      {!isNearLimit && !isAtLimit && (
        <div className="text-xs text-green-600 font-medium">
          ✅ Còn nhiều lượt hỗ trợ hôm nay
        </div>
      )}
    </div>
  )
}
