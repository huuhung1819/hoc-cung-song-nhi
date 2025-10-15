'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TokenProgress } from '@/components/TokenProgress'
import { PlanDisplay } from '@/components/PlanDisplay'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/authClient'
import { useAuth } from '@/lib/authContext'
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  User, 
  HelpCircle,
  Menu,
  X,
  LogOut,
  FileText,
  Users,
  ClipboardList,
  PenTool,
  ClipboardCheck,
  CheckCircle,
  Key
} from 'lucide-react'

// Menu items for different user roles
const getSidebarItems = (userRole: string) => {
  const basePath = userRole === 'teacher' ? '/teacher' : '/dashboard'
  
  if (userRole === 'teacher') {
    return [
      {
        title: 'Trang chủ',
        href: '/teacher',
        icon: Home
      },
      {
        title: 'Quản lý học sinh',
        href: '/teacher/students',
        icon: Users
      },
      {
        title: 'Mã mời lớp',
        href: '/teacher/class-codes',
        icon: Key
      },
      {
        title: 'Soạn giáo án',
        href: '/teacher/lesson-planner',
        icon: PenTool
      },
      {
        title: 'Sinh bài tập',
        href: '/teacher/exercise-generator',
        icon: FileText
      },
      {
        title: 'Giao bài tập',
        href: '/teacher/assignments',
        icon: ClipboardList
      },
      {
        title: 'Chấm bài',
        href: '/teacher/grading',
        icon: CheckCircle
      },
      {
        title: 'Bài kiểm tra',
        href: '/teacher/tests',
        icon: ClipboardCheck
      },
      {
        title: 'Tiến độ',
        href: '/teacher/progress',
        icon: TrendingUp
      },
      {
        title: 'Tài khoản',
        href: '/teacher/account',
        icon: User
      },
      {
        title: 'Hỗ trợ',
        href: '/teacher/support',
        icon: HelpCircle
      }
    ]
  }
  
  // Parent/Student menu
  return [
    {
      title: 'Trang chủ',
      href: basePath,
      icon: Home
    },
    {
      title: 'Bài tập cô giao',
      href: `${basePath}/assignments`,
      icon: BookOpen
    },
    {
      title: 'Bài kiểm tra',
      href: `${basePath}/tests`,
      icon: ClipboardCheck
    },
    {
      title: 'Tiến độ',
      href: `${basePath}/progress`,
      icon: TrendingUp
    },
    {
      title: 'Tài khoản',
      href: `${basePath}/account`,
      icon: User
    },
    {
      title: 'Hỗ trợ',
      href: `${basePath}/support`,
      icon: HelpCircle
    }
  ]
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [user, setUser] = useState({
    name: 'Đang tải...',
    plan: 'Gói Cơ Bản',
    role: 'parent' // Default role
  })
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, signOut } = useAuth()
  const profileRef = useRef<HTMLDivElement>(null)

  // Load user info
  const loadUserInfo = useCallback(async () => {
    if (!authUser?.id) return
    
    setIsLoadingUser(true)
    try {
      const response = await fetch(`/api/user/info?userId=${authUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Fallback to auth user data if API fails
        if (authUser) {
          setUser(prev => ({
            ...prev,
            name: authUser.user_metadata?.name || authUser.email || 'Người dùng',
            email: authUser.email || ''
          }))
        }
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

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      await authClient.signOut()
      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if logout fails
      router.push('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300",
        "fixed md:relative inset-y-0 left-0 z-50",
        "md:translate-x-0 flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="relative" ref={profileRef}>
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Học sinh</p>
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
                    
                    <div className="relative group">
                      <button
                        disabled
                        className="w-full px-4 py-2 text-left text-gray-500 cursor-not-allowed opacity-60"
                      >
                        <TrendingUp className="w-4 h-4 inline mr-3" />
                        Tiến độ học tập
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Đang chờ cập nhật từ hệ thống
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                    
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
          )}
          <div className="flex items-center gap-2 ml-auto">
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* Collapse button for desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {getSidebarItems(user.role).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isProgressItem = item.title === 'Tiến độ'

            return (
                <li key={item.href}>
                  {isProgressItem ? (
                    // Tiến độ tab - không click được, có tooltip
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        disabled
                        className={cn(
                          "w-full justify-start cursor-not-allowed opacity-60",
                          isCollapsed ? "px-2" : "px-3",
                          "text-gray-500"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                        {!isCollapsed && item.title}
                      </Button>
                      
                      {/* Tooltip */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Đang chờ cập nhật từ hệ thống
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    // Các tab khác - bình thường
                    <Link href={item.href} onClick={() => setIsMobileOpen(false)}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isCollapsed ? "px-2" : "px-3",
                          isActive ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                        {!isCollapsed && item.title}
                      </Button>
                    </Link>
                  )}
                </li>
            )
          })}
        </ul>
      </nav>

      {/* Credit Progress */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <TokenProgress 
            userId={authUser?.id || ''}
            label="Credit còn lại"
            className="w-full"
          />
        </div>
      )}


      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="space-y-1.5 w-full">
              <PlanDisplay 
                plan={user.plan} 
                className="w-full" 
                showUserName={true}
                userName={user.name}
              />
              {(user.plan === 'Gói Cơ Bản' || user.plan === 'Gói Miễn Phí') && (
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs py-1.5 px-2 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => window.open('/pricing', '_blank')}
                >
                  <span className="block truncate">Nâng cấp gói</span>
                </Button>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "w-full justify-start text-gray-700 hover:bg-gray-100",
              isCollapsed ? "px-2" : "px-3",
              isLoggingOut && "opacity-50 cursor-not-allowed"
            )}
          >
            <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && (isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất")}
          </Button>
        </div>
      </div>
      </div>
    </>
  )
}
