'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  Shield,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  LogOut
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Set timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('⏰ Auth check timeout, proceeding anyway')
          setLoading(false)
        }, 10000) // 10 second timeout

        // Get current user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('❌ No user found, redirecting to login')
          clearTimeout(timeoutId)
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Load user role from API with timeout
        try {
          const controller = new AbortController()
          const fetchTimeoutId = setTimeout(() => controller.abort(), 5000)
          
          const response = await fetch(`/api/user/info?userId=${user.id}`, {
            signal: controller.signal
          })
          const data = await response.json()
          
          clearTimeout(fetchTimeoutId)
          
          console.log('🔍 Admin Layout Debug:', {
            userId: user.id,
            apiResponse: data,
            userRole: data?.user?.role
          })
          
          if (data.success && data.user.role) {
            const cleanRole = data.user.role.trim().toLowerCase()
            setUserRole(cleanRole)
            
            if (cleanRole !== 'admin') {
              console.log('❌ User is not admin, redirecting to dashboard')
              clearTimeout(timeoutId)
              router.push('/dashboard')
              return
            }
            
            console.log('✅ Admin access confirmed')
          } else {
            console.log('❌ Failed to get user role, assuming admin for now')
            setUserRole('admin') // Assume admin if API fails
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            console.log('⏰ API timeout, assuming admin for now')
            setUserRole('admin') // Assume admin if API times out
          } else {
            console.error('❌ API fetch error:', fetchError)
            setUserRole('admin') // Assume admin if API fails
          }
        }
        
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('Error checking auth:', error)
        setUserRole('admin') // Assume admin if auth check fails
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Đang kiểm tra quyền truy cập...</div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Không có quyền truy cập...</div>
      </div>
    )
  }

  const adminMenuItems = [
    {
      title: 'Tổng quan',
      icon: BarChart3,
      href: '/admin',
      description: 'Thống kê tổng quan hệ thống'
    },
    {
      title: 'Người dùng',
      icon: Users,
      href: '/admin/users',
      description: 'Quản lý tài khoản người dùng'
    },
    {
      title: 'Thanh toán',
      icon: CreditCard,
      href: '/admin/payments',
      description: 'Duyệt và quản lý giao dịch'
    },
    {
      title: 'Phân tích',
      icon: TrendingUp,
      href: '/admin/analytics',
      description: 'Báo cáo và thống kê chi tiết'
    },
    {
      title: 'Hệ thống',
      icon: Settings,
      href: '/admin/system',
      description: 'Cài đặt và cấu hình'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {adminMenuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  {item.title}
                </a>
              ))}
            </nav>
          </div>

          {/* User Info */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    Quản trị viên
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex items-center h-16 pl-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Bảng điều khiển quản trị
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Hệ thống hoạt động</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  Chuyển sang Parent Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}