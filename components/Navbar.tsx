'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, Settings, X, TrendingUp, HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TokenProgress } from './TokenProgress'
import { SettingsModal } from './SettingsModal'
import { useAuth } from '@/lib/authContext'

export function Navbar() {
  const { user: authUser, signOut } = useAuth()
  const [user, setUser] = useState({
    name: 'Demo User',
    avatar: '',
    notifications: 3,
    usagePercentage: 0,
    isNearLimit: false,
    isAtLimit: false
  })
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bài học mới',
      message: 'Có bài học mới "Khoa học: Thực vật xung quanh"',
      time: '2 phút trước',
      read: false,
      type: 'lesson'
    },
    {
      id: 2,
      title: 'Nhắc nhở học tập',
      message: 'Đã đến giờ học Toán rồi!',
      time: '1 giờ trước',
      read: false,
      type: 'reminder'
    },
    {
      id: 3,
      title: 'Hoàn thành bài học',
      message: 'Chúc mừng! Bạn đã hoàn thành bài "Tiếng Việt: Đọc và viết chữ cái"',
      time: '3 giờ trước',
      read: true,
      type: 'achievement'
    }
  ])
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load user info
  const loadUserInfo = async () => {
    if (!authUser) return
    
    setIsLoadingUser(true)
    try {
      const response = await fetch(`/api/user/info?userId=${authUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(prev => ({
          ...prev,
          name: data.user.name || authUser.email?.split('@')[0] || 'User',
          usagePercentage: data.user.usagePercentage,
          isNearLimit: data.user.isNearLimit,
          isAtLimit: data.user.isAtLimit
        }))
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  useEffect(() => {
    if (authUser) {
      loadUserInfo()
    }
  }, [authUser])

  // Listen for user info updates from other components
  useEffect(() => {
    const handleUserInfoUpdate = () => {
      loadUserInfo()
    }

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate)
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
    }
  }, [])

  // Handle search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    try {
      // Simulate API call - replace with actual search API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock search results
      const mockResults = [
        { id: 1, type: 'lesson', title: 'Toán lớp 1: Cộng trừ cơ bản', subject: 'Toán học' },
        { id: 2, type: 'lesson', title: 'Tiếng Việt: Đọc và viết chữ cái', subject: 'Tiếng Việt' },
        { id: 3, type: 'question', title: 'Câu hỏi về phép cộng', subject: 'Toán học' }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subject.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(mockResults)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle search result click
  const handleSearchResultClick = (result: any) => {
    if (result.type === 'lesson') {
      router.push(`/dashboard/lessons/${result.id}`)
    } else if (result.type === 'question') {
      router.push(`/dashboard/lessons/${result.id}/questions`)
    }
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    
    // Navigate based on notification type
    if (notification.type === 'lesson') {
      router.push('/dashboard/lessons')
    } else if (notification.type === 'achievement') {
      router.push('/dashboard/progress')
    }
    
    setShowNotifications(false)
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to search results page
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearchResults(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm bài học, câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery('')
                  setShowSearchResults(false)
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tìm kiếm...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{result.title}</p>
                            <p className="text-sm text-gray-500">{result.subject}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {result.type === 'lesson' ? 'Bài học' : 'Câu hỏi'}
                          </span>
                        </div>
                      </button>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
                          setShowSearchResults(false)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Xem tất cả kết quả cho "{searchQuery}"
                      </button>
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy kết quả nào
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Center - Questions Progress */}
        <div className="flex-1 max-w-sm mx-8">
          <TokenProgress 
            usagePercentage={user.usagePercentage}
            isNearLimit={user.isNearLimit}
            isAtLimit={user.isAtLimit}
            label="Số câu hỏi hôm nay"
            isLoading={isLoadingUser}
          />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Đánh dấu tất cả đã đọc
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'lesson' ? 'bg-blue-500' :
                            notification.type === 'reminder' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Không có thông báo nào
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/notifications')}
                    className="w-full text-blue-600 hover:text-blue-800"
                  >
                    Xem tất cả thông báo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Học sinh</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">Học sinh</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/dashboard/account')
                      setShowProfile(false)
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 inline mr-3" />
                    Tài khoản của tôi
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/dashboard/progress')
                      setShowProfile(false)
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                  >
                    <TrendingUp className="w-4 h-4 inline mr-3" />
                    Tiến độ học tập
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push('/dashboard/support')
                      setShowProfile(false)
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                  >
                    <HelpCircle className="w-4 h-4 inline mr-3" />
                    Hỗ trợ
                  </button>
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut()
                      setShowProfile(false)
                    }}
                    className="w-full text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </header>
  )
}
