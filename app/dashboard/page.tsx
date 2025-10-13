'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TokenProgress } from '@/components/TokenProgress'
import { LessonCard } from '@/components/LessonCard'
import { ChatInterface } from '@/components/ChatInterface'
import { BookOpen, Trophy, Clock, Users, Key, Upload } from 'lucide-react'
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

  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockInput, setUnlockInput] = useState('')
  const [isUnlockMode, setIsUnlockMode] = useState(false)
  const [currentUnlockCode, setCurrentUnlockCode] = useState('123456')
  const [showChangeCodeModal, setShowChangeCodeModal] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [confirmCode, setConfirmCode] = useState('')

  // Load unlock code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem('unlockCode')
    if (savedCode) {
      setCurrentUnlockCode(savedCode)
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

  const handleUnlockCode = () => {
    if (unlockInput === currentUnlockCode) {
      setIsUnlockMode(true)
      setShowUnlockModal(false)
      setUnlockInput('')
      alert('Đã mở khóa! Con có thể xem lời giải chi tiết.')
    } else {
      alert('Mã mở khóa không đúng!')
    }
  }

  const handleLockCode = () => {
    setIsUnlockMode(false)
    alert('Đã đóng khóa! Con chỉ có thể xem hướng dẫn.')
  }

  const handleChangeCode = () => {
    if (newCode.length !== 6 || !/^\d{6}$/.test(newCode)) {
      alert('Mã phải có đúng 6 ký tự số!')
      return
    }
    if (newCode !== confirmCode) {
      alert('Mã xác nhận không khớp!')
      return
    }
    
    setCurrentUnlockCode(newCode)
    localStorage.setItem('unlockCode', newCode)
    setShowChangeCodeModal(false)
    setNewCode('')
    setConfirmCode('')
    alert('Đã đổi mã mở khóa thành công!')
  }

  const handleResetCode = () => {
    if (confirm('Bạn có chắc muốn reset mã về mặc định (123456)?')) {
      setCurrentUnlockCode('123456')
      localStorage.setItem('unlockCode', '123456')
      alert('Đã reset mã về mặc định!')
    }
  }

  const [recentQuestions, setRecentQuestions] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

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
            <div className="flex space-x-2">
              {isUnlockMode ? (
                <Button
                  onClick={handleLockCode}
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Đóng khóa
                </Button>
              ) : (
                <Button
                  onClick={() => setShowUnlockModal(true)}
                  variant="outline"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Nhập mã mở khóa
                </Button>
              )}
              <Button
                onClick={() => setShowChangeCodeModal(true)}
                variant="outline"
                size="sm"
              >
                Đổi mã
              </Button>
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
                  // Handle mode change if needed
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

      {/* Unlock Code Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isUnlockMode ? 'Đóng khóa' : 'Nhập mã mở khóa'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {isUnlockMode 
                  ? 'Hiện tại đã mở khóa. Con có thể xem lời giải chi tiết.'
                  : 'Nhập mã mở khóa để AI có thể đưa ra lời giải chi tiết cho bài tập'
                }
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Mã hiện tại: {currentUnlockCode} • 
                <button 
                  onClick={handleResetCode}
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  Reset về mặc định
                </button>
              </p>
              <div className="space-y-4">
                {!isUnlockMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã mở khóa
                      </label>
                      <input
                        type="password"
                        value={unlockInput}
                        onChange={(e) => setUnlockInput(e.target.value)}
                        placeholder="Nhập mã mở khóa..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleUnlockCode}
                        className="flex-1"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Mở khóa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowUnlockModal(false)
                          setUnlockInput('')
                        }}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-green-600 text-lg">
                      🔓 Đã mở khóa thành công!
                    </div>
                    <p className="text-sm text-gray-600">
                      Con có thể sử dụng chế độ "Có lời giải" để xem đáp án chi tiết.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleLockCode}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Đóng khóa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowUnlockModal(false)}
                        className="flex-1"
                      >
                        Đóng
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Code Modal */}
      {showChangeCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Đổi mã mở khóa
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Mã mở khóa phải có đúng 6 ký tự số (0-9)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã hiện tại
                  </label>
                  <input
                    type="text"
                    value={currentUnlockCode}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã mới (6 ký tự số)
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setNewCode(value)
                    }}
                    placeholder="Nhập 6 ký tự số..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mã mới
                  </label>
                  <input
                    type="text"
                    value={confirmCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setConfirmCode(value)
                    }}
                    placeholder="Nhập lại 6 ký tự số..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleChangeCode}
                    className="flex-1"
                    disabled={newCode.length !== 6 || confirmCode.length !== 6}
                  >
                    Đổi mã
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChangeCodeModal(false)
                      setNewCode('')
                      setConfirmCode('')
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
