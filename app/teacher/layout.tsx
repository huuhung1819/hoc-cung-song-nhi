'use client'

import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { NotificationPopup, useNotificationPopup } from '@/components/NotificationPopup'
import { useAuth } from '@/lib/authContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Notification popup system
  const { currentNotification, hideNotification } = useNotificationPopup()

  // Check user role and permissions
  useEffect(() => {
    const checkUserRole = async () => {
      if (!authUser?.id) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch(`/api/user/info?userId=${authUser.id}`)
        if (response.ok) {
          const data = await response.json()
          const role = data.user?.role
          setUserRole(role)
          
          // Check if user has teacher role
          if (role !== 'teacher') {
            console.warn(`Unauthorized access attempt: User ${authUser.id} with role ${role} tried to access teacher dashboard`)
            
            // Redirect based on role
            if (role === 'parent' || role === 'student') {
              router.push('/dashboard')
            } else {
              router.push('/auth/login')
            }
            return
          }
        } else {
          console.error('Failed to fetch user role')
          router.push('/auth/login')
          return
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        router.push('/auth/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkUserRole()
  }, [authUser?.id, router])

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Don't render if user doesn't have teacher role
  if (userRole !== 'teacher') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập vào trang này.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 py-8 pt-16 md:pt-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Notification Popup */}
      <NotificationPopup
        notification={currentNotification}
        onClose={hideNotification}
        onMarkAsRead={(notificationId) => {
          // Mark as read via API
          fetch(`/api/notifications/${notificationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_read: true })
          }).catch(console.error)
        }}
        onNavigate={(notification) => {
          // Navigate based on notification type
          if (notification.type === 'assignment') {
            window.location.href = '/teacher/assignments'
          } else if (notification.type === 'grade') {
            window.location.href = '/teacher/grading'
          } else {
            window.location.href = '/teacher'
          }
        }}
      />
    </div>
  )
}
