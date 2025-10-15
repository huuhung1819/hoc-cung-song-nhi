'use client'

import { Crown, Star, Zap } from 'lucide-react'

interface PlanDisplayProps {
  plan: string
  className?: string
  showUserName?: boolean
  userName?: string
}

export function PlanDisplay({ plan, className = '', showUserName = false, userName = '' }: PlanDisplayProps) {
  // Function to get plan styling based on plan name
  const getPlanStyle = (planName: string) => {
    const lowerPlan = planName.toLowerCase()
    
    if (lowerPlan.includes('cao cấp') || lowerPlan.includes('premium') || lowerPlan.includes('vip')) {
      return {
        container: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-0.5 rounded-md shadow-lg',
        content: 'bg-white rounded-sm px-1.5 py-1.5 flex items-center space-x-1.5',
        icon: <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />,
        text: 'font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate',
        glow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]'
      }
    }
    
    if (lowerPlan.includes('nâng cao') || lowerPlan.includes('advanced') || lowerPlan.includes('pro')) {
      return {
        container: 'bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 rounded-md shadow-md',
        content: 'bg-white rounded-sm px-1.5 py-1.5 flex items-center space-x-1.5',
        icon: <Star className="w-3 h-3 text-blue-500 flex-shrink-0" />,
        text: 'font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate',
        glow: 'shadow-[0_0_8px_rgba(59,130,246,0.2)]'
      }
    }
    
    // Default for basic plan
    return {
      container: 'bg-gray-100 p-0.5 rounded-md shadow-sm border',
      content: 'bg-white rounded-sm px-1.5 py-1 flex items-center space-x-1.5',
      icon: <Zap className="w-3 h-3 text-gray-600 flex-shrink-0" />,
      text: 'font-medium text-xs text-gray-700 truncate',
      glow: ''
    }
  }

  const style = getPlanStyle(plan)

  return (
    <div className={`${style.container} ${style.glow} ${className}`}>
      <div className={style.content}>
        {style.icon}
        <div className="text-right flex-1 min-w-0">
          {showUserName && userName && (
            <p className="text-[10px] text-gray-500 mb-0.5 truncate leading-tight">{userName}</p>
          )}
          {!showUserName && (
            <p className="text-[10px] text-gray-500 mb-0.5 leading-tight">Gói hiện tại</p>
          )}
          <p className={style.text}>{plan}</p>
        </div>
      </div>
    </div>
  )
}

// Additional component for plan comparison (if needed)
export function PlanBadge({ plan }: { plan: string }) {
  const lowerPlan = plan.toLowerCase()
  
  if (lowerPlan.includes('cao cấp') || lowerPlan.includes('premium')) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
        <Crown className="w-4 h-4 mr-1" />
        {plan}
      </span>
    )
  }
  
  if (lowerPlan.includes('nâng cao') || lowerPlan.includes('advanced')) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
        <Star className="w-4 h-4 mr-1" />
        {plan}
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
      <Zap className="w-4 h-4 mr-1" />
      {plan}
    </span>
  )
}
