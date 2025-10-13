'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UpgradeButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/pricing')}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group"
      size="sm"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      
      {/* Icon with animation */}
      <Crown className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
      
      {/* Text */}
      <span className="font-semibold">NÂNG CẤP</span>
      
      {/* Sparkle effect */}
      <Sparkles className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
    </Button>
  )
}

