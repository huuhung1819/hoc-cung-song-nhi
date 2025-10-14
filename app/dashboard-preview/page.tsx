'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TokenProgress } from '@/components/TokenProgress'
import { ChatInterface } from '@/components/ChatInterface'
import { BookOpen, Trophy, Clock, Users } from 'lucide-react'
import { useAuth } from '@/lib/authContext'

export default function DashboardPreviewPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState({
    name: 'Đang tải...',
    usagePercentage: 0,
    isNearLimit: false,
    isAtLimit: false,
    plan: 'Gói Cơ Bản',
    unlocksUsed: 0,
    unlocksQuota: 10
  })
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  // Load unlock state from localStorage
  const [isUnlockMode, setIsUnlockMode] = useState(false)
  
  useEffect(() => {
    const saved = localStorage.getItem('isUnlocked')
    if (saved === 'true') {
      setIsUnlockMode(true)
    }
    
    // Listen for unlock state changes
    const handleStorage = () => {
      const newState = localStorage.getItem('isUnlocked')
      setIsUnlockMode(newState === 'true')
    }
    
    window.addEventListener('storage', handleStorage)
    // Also listen to custom event for same-tab updates
    window.addEventListener('unlockStateChanged', handleStorage)
    
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('unlockStateChanged', handleStorage)
    }
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

  // Load recent chat history
  const [recentQuestions, setRecentQuestions] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    const loadRecentQuestions = async () => {
      if (!authUser?.id) return
      
      setIsLoadingHistory(true)
      try {
        const response = await fetch(`/api/chat/history?userId=${authUser.id}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setRecentQuestions(data.questions || [])
        }
      } catch (error) {
        console.error('Error loading recent questions:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadRecentQuestions()
  }, [authUser?.id])

  // Function to refresh recent questions
  const refreshRecentQuestions = async () => {
    if (!authUser?.id) return
    
    try {
      const response = await fetch(`/api/chat/history?userId=${authUser.id}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setRecentQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error refreshing recent questions:', error)
    }
  }

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

  const stats = [
    {
      title: 'Trạng thái hỗ trợ',
      value: isLoadingUser ? '...' : (user.isAtLimit ? 'Hết lượt' : user.isNearLimit ? 'Gần hết' : 'Bình thường'),
      icon: BookOpen,
      color: user.isAtLimit ? 'text-red-600' : user.isNearLimit ? 'text-yellow-600' : 'text-green-600',
      description: 'Tình trạng hỗ trợ hôm nay'
    },
    {
      title: 'Hiệu quả học tập',
      value: '85%',
      icon: Trophy,
      color: 'text-yellow-600',
      description: 'Con tự giải được mà không cần mở khóa'
    },
    {
      title: 'Thời gian hỗ trợ hôm nay',
      value: '45 phút',
      icon: Clock,
      color: 'text-green-600',
      description: 'Thời gian AI đã hỗ trợ'
    },
    {
      title: 'Lượt mở khóa hôm nay',
      value: `${user.unlocksUsed}/${user.unlocksQuota}`,
      icon: Users,
      color: 'text-purple-600',
      description: 'Lần xem lời giải chi tiết'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 🎨 Preview Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              👁️ DASHBOARD PREVIEW - GIAO DIỆN MỚI
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Đây là bản xem trước. Unlock code đã được chuyển lên Navbar. 
              Nút unlock (🔓) ở góc phải trên navbar.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Test URL:</p>
            <code className="text-xs bg-white/20 px-2 py-1 rounded">/dashboard-preview</code>
          </div>
        </div>
      </div>

      {/* Header - ĐÃ XÓA NÚT UNLOCK CODE */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chào mừng, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              AI gia sư sẵn sàng hỗ trợ con học tập hôm nay!
            </p>
            {/* Hiển thị trạng thái unlock (từ navbar) */}
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
          <div className="text-right">
            <p className="text-sm text-gray-500">Gói học hiện tại</p>
            <p className="font-semibold text-lg">{user.plan}</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Questions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi gần đây</CardTitle>
              <CardDescription>
                Các bài tập đã được AI hỗ trợ gần đây
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingHistory ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Đang tải lịch sử...</div>
                </div>
              ) : recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>{question.subject}</span>
                          <span>{question.grade}</span>
                          <span>{new Date(question.timestamp).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đã hoàn thành
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">Chưa có câu hỏi nào</div>
                  <div className="text-sm text-gray-400">Hãy bắt đầu chat với AI để xem lịch sử ở đây</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Gia sư hỗ trợ 🤖</CardTitle>
              <CardDescription>
                Gửi bài tập khó, AI sẽ hướng dẫn con học hiệu quả
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <ChatInterface 
                userId={authUser?.id}
                isUnlockMode={isUnlockMode}
                onModeChange={(mode) => {
                  console.log('Mode changed to:', mode)
                }}
                onNewMessage={() => {
                  refreshRecentQuestions()
                  refreshUserInfo()
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


