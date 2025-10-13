'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TokenProgress } from '@/components/TokenProgress'
import { LessonCard } from '@/components/LessonCard'
import { ChatInterface } from '@/components/ChatInterface'
import { ExerciseGenerator } from '@/components/ExerciseGenerator'
import { useAuth } from '@/lib/authContext'

export default function DashboardPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState({
    name: 'Đang tải...',
    usagePercentage: 0,
    isNearLimit: false,
    isAtLimit: false,
    plan: 'Gói Cơ Bản',
    unlockCode: 'SOLVE123',
    unlocksUsed: 0,
    unlocksQuota: 10
  })
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const [isUnlockMode, setIsUnlockMode] = useState(false)
  
  // Ref to store sendExerciseToChat function from ChatInterface
  const sendExerciseToChatRef = useRef<((exercise: string, mode: 'coach' | 'solve') => void) | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Load unlock state from localStorage and listen for changes
  useEffect(() => {
    const savedUnlockState = localStorage.getItem('isUnlocked')
    if (savedUnlockState === 'true') {
      setIsUnlockMode(true)
    }

    // Listen for unlock state changes from navbar
    const handleUnlockStateChange = () => {
      const savedUnlockState = localStorage.getItem('isUnlocked')
      setIsUnlockMode(savedUnlockState === 'true')
    }

    window.addEventListener('unlockStateChanged', handleUnlockStateChange)
    return () => window.removeEventListener('unlockStateChanged', handleUnlockStateChange)
  }, [])

  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!authUser?.id) {
        console.log('No authUser.id found:', authUser)
        return
      }
      
      console.log('Loading user info for userId:', authUser.id)
      setIsLoadingUser(true)
      try {
        const response = await fetch(`/api/user/info?userId=${authUser.id}`)
        console.log('User info response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('User info data:', data)
          setUser(data.user)
        } else {
          console.error('Failed to load user info:', await response.text())
        }
      } catch (error) {
        console.error('Error loading user info:', error)
        // Fallback to auth user data if API fails
        if (authUser) {
          setUser(prev => ({
            ...prev,
            name: authUser.user_metadata?.name || authUser.email || 'Người dùng',
            email: authUser.email || ''
          }))
        }
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadUserInfo()
  }, [authUser?.id])

  // Function to refresh user info
  const refreshUserInfo = async () => {
    if (!authUser?.id) return
    
    try {
      const response = await fetch(`/api/user/info?userId=${authUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        
        // Notify other components to update
        window.dispatchEvent(new CustomEvent('userInfoUpdated'))
      }
    } catch (error) {
      console.error('Error refreshing user info:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              AI gia sư sẵn sàng hỗ trợ con học tập hôm nay!
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isUnlockMode 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isUnlockMode ? '🔓 Đã mở khóa' : '🔒 Đã đóng khóa'}
              </span>
              <span className="text-xs text-gray-500">
                {isUnlockMode ? 'Con có thể xem lời giải' : 'Con chỉ xem hướng dẫn'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Gói học hiện tại</p>
              <p className="font-semibold text-lg">{user.plan}</p>
            </div>
          </div>
        </div>
        
        {/* Questions Progress */}
        <div className="mt-6">
          <TokenProgress 
            usagePercentage={user.usagePercentage}
            isNearLimit={user.isNearLimit}
            isAtLimit={user.isAtLimit}
            label="Số câu hỏi hôm nay"
            isLoading={isLoadingUser}
          />
        </div>
      </div>

      {/* 🆕 AI Chat Interface - FULL WIDTH */}
      <Card ref={chatRef}>
        <CardHeader>
          <CardTitle>AI Gia sư hỗ trợ 🤖</CardTitle>
          <CardDescription>
            Gửi bài tập khó, AI sẽ hướng dẫn con học hiệu quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatInterface 
            userId={authUser?.id}
            isUnlockMode={isUnlockMode}
            onModeChange={(mode) => {
              // Handle mode change if needed
              console.log('Mode changed to:', mode)
            }}
            onNewMessage={() => {
              refreshUserInfo()
            }}
            onRegisterSendExercise={(sendFn) => {
              sendExerciseToChatRef.current = sendFn
            }}
            onRegisterMessagesRef={(ref) => {
              if (ref) {
                (chatMessagesRef as any).current = ref
              }
            }}
          />
        </CardContent>
      </Card>

             {/* 🆕 Exercise Generator - FULL WIDTH */}
             <ExerciseGenerator 
               isUnlockMode={isUnlockMode}
               userId={authUser?.id}
               onSendToChat={(exercise, mode) => {
          // Scroll to chat messages area smoothly
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            })
          }
          
          // Send exercise to chat
          if (sendExerciseToChatRef.current) {
            setTimeout(() => {
              sendExerciseToChatRef.current!(exercise, mode)
            }, 300) // Reduced delay for better UX
          }
        }}
      />

    </div>
  )
}
