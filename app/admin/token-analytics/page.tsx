'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { AdminOnly } from '@/components/PermissionGate'

interface TokenAnalytics {
  totalTokensToday: number
  openaiCost: number
  activeUsers: number
  byRole: {
    parents: { tokens: number; cost: number }
    teachers: { tokens: number; cost: number }
    admin: { tokens: number; cost: number }
  }
  topUsers: Array<{
    email: string
    name: string
    tokens: number
    role: string
  }>
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
  }>
  hourlyChart: Array<{
    hour: string
    tokens: number
    cost: number
  }>
}

export default function TokenAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      
      // Get user email for admin bypass
      const userEmail = localStorage.getItem('userEmail') || 'huuhung20182019@gmail.com'
      
      const response = await fetch('/api/admin/token-analytics', {
        headers: {
          'x-user-email': userEmail
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setLastUpdated(new Date())
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch analytics:', errorData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <AdminOnly fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600">Chỉ admin mới có thể xem trang này.</p>
        </div>
      </div>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              🔥 <span className="ml-3">REAL-TIME TOKEN ANALYTICS</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Theo dõi sử dụng token và chi phí OpenAI theo thời gian thực
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
            </div>
            <Button 
              onClick={fetchAnalytics}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {isLoading && !analytics ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : analytics ? (
          <>
            {/* Today's Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  📄 Today's Usage
                </CardTitle>
                <CardDescription>
                  Tổng quan sử dụng token và chi phí hôm nay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.totalTokensToday.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 mr-1" />
                      {analytics.openaiCost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">OpenAI Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.activeUsers}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* By Role Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  👥 By Role
                </CardTitle>
                <CardDescription>
                  Phân tích sử dụng token theo vai trò người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Parents
                      </Badge>
                      <span className="font-medium">{analytics.byRole.parents.tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${analytics.byRole.parents.cost.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Teachers
                      </Badge>
                      <span className="font-medium">{analytics.byRole.teachers.tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${analytics.byRole.teachers.cost.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Admin
                      </Badge>
                      <span className="font-medium">{analytics.byRole.admin.tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${analytics.byRole.admin.cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  📊 Token Usage Chart
                </CardTitle>
                <CardDescription>
                  Biểu đồ đường theo giờ/ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p>Chart visualization sẽ được implement</p>
                    <p className="text-sm">Dữ liệu: {analytics.hourlyChart.length} data points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  🎯 Top Users
                </CardTitle>
                <CardDescription>
                  Những người dùng sử dụng token nhiều nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topUsers.map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-600">{user.name} • {user.role}</div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        {user.tokens.toLocaleString()} tokens
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  ⚠️ Alerts
                </CardTitle>
                <CardDescription>
                  Cảnh báo và thông báo quan trọng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.alerts.length > 0 ? (
                    analytics.alerts.map((alert, index) => (
                      <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>Không có cảnh báo nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                <p className="text-gray-600 mb-4">Đã xảy ra lỗi khi tải analytics.</p>
                <Button onClick={fetchAnalytics}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminOnly>
  )
}
