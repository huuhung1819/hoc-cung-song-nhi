'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/authClient'
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  User, 
  HelpCircle,
  Menu,
  X,
  LogOut
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

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=32&h=32&fit=crop&crop=face&auto=format" 
                alt="2 bé hoạt hình" 
                className="w-8 h-8 rounded-full object-cover"
              />
              HỌC CÙNG SONG NHI
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed ? "px-2" : "px-3",
                      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && item.title}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="text-xs text-gray-500 mb-2">
              Nguyễn Văn A
              <br />
              Gói Cơ Bản
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
  )
}
