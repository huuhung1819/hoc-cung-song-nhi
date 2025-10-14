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
        container: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-1 rounded-xl shadow-lg',
        content: 'bg-white rounded-lg px-4 py-3 flex items-center space-x-3',
        icon: <Crown className="w-6 h-6 text-yellow-500" />,
        text: 'font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
      }
    }
    
    if (lowerPlan.includes('nâng cao') || lowerPlan.includes('advanced') || lowerPlan.includes('pro')) {
      return {
        container: 'bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-xl shadow-md',
        content: 'bg-white rounded-lg px-4 py-3 flex items-center space-x-3',
        icon: <Star className="w-5 h-5 text-blue-500" />,
        text: 'font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
      }
    }
    
    // Default for basic plan
    return {
      container: 'bg-gray-100 p-1 rounded-lg shadow-sm border',
      content: 'bg-white rounded-md px-3 py-2 flex items-center space-x-2',
      icon: <Zap className="w-4 h-4 text-gray-600" />,
      text: 'font-medium text-base text-gray-700',
      glow: ''
    }
  }

  const style = getPlanStyle(plan)

  return (
    <div className={`${style.container} ${style.glow} ${className}`}>
      <div className={style.content}>
        {style.icon}
        <div className="text-right flex-1">
          {showUserName && userName && (
            <p className="text-xs text-gray-500 mb-1">{userName}</p>
          )}
          {!showUserName && (
            <p className="text-xs text-gray-500 mb-1">Gói học hiện tại</p>
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
