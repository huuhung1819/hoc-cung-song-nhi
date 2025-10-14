'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Bell, BookOpen, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: any
}

interface NotificationPopupProps {
  notification: Notification | null
  onClose: () => void
  onMarkAsRead?: (notificationId: string) => void
  onNavigate?: (notification: Notification) => void
  className?: string
}

export function NotificationPopup({ 
  notification, 
  onClose, 
  onMarkAsRead,
  onNavigate,
  className 
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const soundRef = useRef<HTMLAudioElement | null>(null)

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="w-5 h-5 text-blue-500" />
      case 'grade':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  // Get notification color scheme
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'assignment':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'bg-blue-100',
          button: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'grade':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'bg-green-100',
          button: 'bg-green-500 hover:bg-green-600'
        }
      case 'alert':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'bg-red-100',
          button: 'bg-red-500 hover:bg-red-600'
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'bg-gray-100',
          button: 'bg-gray-500 hover:bg-gray-600'
        }
    }
  }

  // Show notification when it changes
  useEffect(() => {
    if (notification && !isVisible) {
      setIsVisible(true)
      setIsExiting(false)
      
      // Play sound
      playNotificationSound()
      
      // Auto-hide after 5 seconds
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, 5000)
    }
  }, [notification])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)
      onClose()
    }, 300) // Match animation duration
  }

  const handleClick = () => {
    if (onMarkAsRead && notification) {
      onMarkAsRead(notification.id)
    }
    if (onNavigate && notification) {
      onNavigate(notification)
    }
    handleClose()
  }

  if (!notification || !isVisible) {
    return null
  }

  const style = getNotificationStyle(notification.type)

  return (
    <div className={cn(
      "fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-in-out",
      isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
      className
    )}>
      <div className={cn(
        "bg-white rounded-lg shadow-lg border-l-4 border-l-blue-500 p-4 max-w-sm w-full",
        style.bg
      )} ref={popupRef}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-full", style.icon)}>
              {getNotificationIcon(notification.type)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {notification.message}
        </p>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleClick}
            className={cn("text-white text-xs px-3 py-1", style.button)}
          >
            Xem chi tiết
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs px-3 py-1 text-gray-500 hover:text-gray-700"
          >
            Đóng
          </Button>
        </div>

        {/* Progress bar for auto-hide */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full animate-pulse"
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Hook to manage notification popups globally
export function useNotificationPopup() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)
  const [isPopupVisible, setIsPopupVisible] = useState(false)

  const showNotification = (notification: Notification) => {
    setCurrentNotification(notification)
    setIsPopupVisible(true)
  }

  const hideNotification = () => {
    setIsPopupVisible(false)
    setTimeout(() => {
      setCurrentNotification(null)
    }, 300) // Wait for animation to complete
  }

  // Listen for new notifications
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail
      showNotification(notification)
    }

    window.addEventListener('newNotification', handleNewNotification as EventListener)
    
    return () => {
      window.removeEventListener('newNotification', handleNewNotification as EventListener)
    }
  }, [])

  return {
    currentNotification: isPopupVisible ? currentNotification : null,
    hideNotification,
    showNotification
  }
}
