'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Activity,
  UserPlus,
  BookOpenCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week')

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalLessons: 156,
    creditUsage: 45892,
    revenue: 12500000,
    systemUptime: 99.9
  }

  const recentActivities = [
    {
      id: 1,
      type: 'user_signup',
      user: 'Nguyễn Văn A',
      action: 'đã đăng ký tài khoản',
      timestamp: '2 phút trước',
      icon: UserPlus,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'lesson_completed',
      user: 'Trần Thị B',
      action: 'hoàn thành bài học Toán lớp 1',
      timestamp: '5 phút trước',
      icon: BookOpenCheck,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'payment',
      user: 'Lê Văn C',
      action: 'nâng cấp lên gói Premium',
      timestamp: '12 phút trước',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      type: 'system',
      user: 'Hệ thống',
      action: 'credit reset hàng ngày hoàn thành',
      timestamp: '1 giờ trước',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'error',
      user: 'Hệ thống',
      action: 'API OpenAI timeout - đã khắc phục',
      timestamp: '2 giờ trước',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ]

  const topUsers = [
    { name: 'Nguyễn Văn A', lessons: 45, credits: 2340, score: 9.5 },
    { name: 'Trần Thị B', lessons: 42, credits: 2100, score: 9.2 },
    { name: 'Lê Văn C', lessons: 38, credits: 1890, score: 8.9 },
    { name: 'Phạm Thị D', lessons: 35, credits: 1750, score: 8.7 },
    { name: 'Hoàng Văn E', lessons: 32, credits: 1600, score: 8.5 }
  ]

  const systemHealth = [
    { name: 'API Response Time', value: 245, unit: 'ms', status: 'good', color: 'text-green-600' },
    { name: 'Database Performance', value: 98, unit: '%', status: 'excellent', color: 'text-green-600' },
    { name: 'OpenAI API Status', value: 100, unit: '%', status: 'excellent', color: 'text-green-600' },
    { name: 'Server CPU Usage', value: 45, unit: '%', status: 'good', color: 'text-yellow-600' },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', color: 'text-orange-600' },
    { name: 'Storage Usage', value: 34, unit: '%', status: 'good', color: 'text-green-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hệ thống và quản lý người dùng
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Báo cáo chi tiết
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Quản lý người dùng
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              +{Math.floor(stats.totalUsers * 0.05)} so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <Progress value={(stats.activeUsers / stats.totalUsers) * 100} className="flex-1 mr-2" />
              <span className="text-xs text-gray-600">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài học</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-blue-600 mt-1">
              +3 bài học mới tuần này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit đã sử dụng</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creditUsage.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">
              Tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(stats.revenue)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              +12% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime hệ thống</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemUptime}%</div>
            <p className="text-xs text-green-600 mt-1">
              Tháng này
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Người dùng hàng đầu</CardTitle>
            <CardDescription>
              Những người dùng tích cực nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {user.lessons} bài học • {user.credits} credit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.score}/10</p>
                    <p className="text-sm text-gray-600">Điểm TB</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>Tình trạng hệ thống</CardTitle>
          <CardDescription>
            Theo dõi hiệu suất và sức khỏe hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemHealth.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className={`text-sm font-bold ${metric.color}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metric.status === 'excellent' ? 'Tuyệt vời' :
                     metric.status === 'good' ? 'Tốt' :
                     metric.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
