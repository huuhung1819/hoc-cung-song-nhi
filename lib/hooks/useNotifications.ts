'use client'

import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: any
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastNotification, setLastNotification] = useState<Notification | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!userId) return

    // Load initial notifications
    loadNotifications()

    // Set up polling for new notifications
    const pollInterval = setInterval(() => {
      loadNotifications()
    }, 3000) // Check every 3 seconds for real-time feel

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval)
      setIsConnected(false)
    }
  }, [userId])

  // Load notifications function
  const loadNotifications = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&type=info&is_read=false`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const newNotifications = data.notifications || []
          
          // Check for new notifications
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id))
            const newOnes = newNotifications.filter((n: Notification) => !existingIds.has(n.id))
            
            if (newOnes.length > 0) {
              const latest = newOnes[0]
              setLastNotification(latest)
              
              // Dispatch custom event for other components
              window.dispatchEvent(new CustomEvent('newNotification', { 
                detail: latest 
              }))
            }
            
            return newNotifications
          })
          
          setIsConnected(true)
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      setIsConnected(false)
    }
  }

  // Function to mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Function to mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      await Promise.all(
        unreadNotifications.map(n => 
          fetch(`/api/notifications/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_read: true })
          })
        )
      )

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return {
    notifications,
    unreadCount,
    isConnected,
    lastNotification,
    markAsRead,
    markAllAsRead,
    setNotifications
  }
}
