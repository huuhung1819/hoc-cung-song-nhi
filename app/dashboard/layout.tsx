'use client'

import { Sidebar } from '@/components/Sidebar'
import { NavbarPreview } from '@/components/NavbarPreview'
import { NotificationPopup, useNotificationPopup } from '@/components/NotificationPopup'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user: authUser } = useAuth()
  const isMobile = useIsMobile()
  const [userRole, setUserRole] = useState<string>('parent')
  const [userPlan, setUserPlan] = useState<string>('free')
  
  // Notification popup system
  const { currentNotification, hideNotification } = useNotificationPopup()

  useEffect(() => {
    if (authUser) {
      // Load user role and plan
      fetch(`/api/user/info?userId=${authUser.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.user.role) {
            setUserRole(data.user.role)
            setUserPlan(data.user.plan || 'free')
          }
        })
        .catch(error => console.error('Error loading user role:', error))
    }
  }, [authUser])

  // Listen for user info updates
  useEffect(() => {
    const handleUserInfoUpdate = () => {
      if (authUser) {
        fetch(`/api/user/info?userId=${authUser.id}`)
          .then(response => response.json())
          .then(data => {
            if (data.success && data.user) {
              setUserRole(data.user.role || 'parent')
              setUserPlan(data.user.plan || 'free')
            }
          })
          .catch(error => console.error('Error updating user info:', error))
      }
    }

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate)
    return () => window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
  }, [authUser])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always render, it handles mobile drawer internally */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 🆕 Sử dụng NavbarPreview thay vì Navbar cũ */}
        <NavbarPreview />
        
        {/* Upgrade Banner for Free Users (only for parents with free plan) */}
        {userRole === 'parent' && userPlan === 'free' && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 text-center text-sm">
            <p>
              🎉 Bạn đang dùng gói miễn phí. 
              <Link href="/pricing" className="font-bold underline hover:no-underline ml-1">
                Nâng cấp ngay
              </Link>
              {' '}để trải nghiệm đầy đủ tính năng!
            </p>
          </div>
        )}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 pt-16 md:pt-4">
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
            window.location.href = '/dashboard/assignments'
          } else if (notification.type === 'grade') {
            window.location.href = '/dashboard/assignments'
          } else {
            window.location.href = '/dashboard/assignments'
          }
        }}
      />
    </div>
  )
}
