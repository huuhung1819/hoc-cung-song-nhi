'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TokenProgress } from '@/components/TokenProgress'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/authClient'
import { useAuth } from '@/lib/authContext'
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  User, 
  HelpCircle,
  X,
  LogOut,
  FileText,
  Clock,
  Key
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Trang chủ',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Bài học',
    href: '/dashboard/lessons',
    icon: BookOpen
  },
  {
    title: 'Tiến độ',
    href: '/dashboard/progress',
    icon: TrendingUp
  },
  {
    title: 'Tài khoản',
    href: '/dashboard/account',
    icon: User
  },
  {
    title: 'Hỗ trợ',
    href: '/dashboard/support',
    icon: HelpCircle
  }
]

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState({
    name: 'Đang tải...',
    plan: 'Gói Miễn Phí',
    unlocksUsed: 0,
    unlocksQuota: 10,
    isAtLimit: false,
    isNearLimit: false
  })
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadUserInfo = useCallback(async () => {
    if (!authUser?.id) return
    
    setIsLoadingUser(true)
    try {
      const response = await fetch(`/api/user/info?userId=${authUser.id}`)
      const data = await response.json()
      
      if (data.success && data.user) {
        setUser({
          name: data.user.name || 'Người dùng',
          plan: data.user.plan || 'Gói Miễn Phí',
          unlocksUsed: data.user.unlocksUsed || 0,
          unlocksQuota: data.user.unlocksQuota || 10,
          isAtLimit: (data.user.unlocksUsed || 0) >= (data.user.unlocksQuota || 10),
          isNearLimit: (data.user.unlocksUsed || 0) >= (data.user.unlocksQuota || 10) * 0.8
        })
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    } finally {
      setIsLoadingUser(false)
    }
  }, [authUser])

  useEffect(() => {
    loadUserInfo()

    // Listen for user info updates
    const handleUserInfoUpdate = () => {
      loadUserInfo()
    }
    window.addEventListener('userInfoUpdated', handleUserInfoUpdate)
    
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
    }
  }, [loadUserInfo])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLinkClick = () => {
    onClose() // Close drawer when navigating
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=32&h=32&fit=crop&crop=face&auto=format" 
                  alt="2 bé hoạt hình" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                HỌC CÙNG SONG NHI
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                      <div className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-blue-100 text-blue-700" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>

            {/* Token Progress */}
            <div className="px-4 pb-4">
              <TokenProgress
                usagePercentage={Math.round((user.unlocksUsed / user.unlocksQuota) * 100)}
                isNearLimit={user.isNearLimit}
                isAtLimit={user.isAtLimit}
                label="Số câu hỏi hôm nay"
                isLoading={isLoadingUser}
              />
            </div>

            {/* Stats Cards */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Thống kê</h3>
              <div className="space-y-2">
                {/* Bài tập đã làm */}
                <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">Bài tập đã làm</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{Math.floor(Math.random() * 20 + 5)} bài</div>
                </div>

                {/* Thời gian học hôm nay */}
                <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">Thời gian học</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{Math.floor(Math.random() * 60 + 30)} phút</div>
                </div>

                {/* Lượt mở khóa */}
                <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <Key className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-gray-700">Lượt mở khóa</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{user.unlocksUsed}/{user.unlocksQuota}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-600 mb-2">
                  {user.name}
                  <br />
                  <span className="font-medium text-gray-800">{user.plan}</span>
                </div>
                {(user.plan === 'Gói Cơ Bản' || user.plan === 'Gói Miễn Phí') && (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs py-1 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => window.open('/pricing', '_blank')}
                  >
                    Nâng cấp gói
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-start text-gray-700 hover:bg-gray-100 px-3"
              >
                <LogOut className="w-4 h-4 mr-3" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
