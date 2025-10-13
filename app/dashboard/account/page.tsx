'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, CreditCard, Bell, Shield, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  grade: string
  plan: string
  role: string
  avatar: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  completedLessons: number
  studyTimeHours: number
  averageScore: number
  totalQuizzes: number
  studySessions: number
}

interface NotificationSettings {
  emailUpdates: boolean
  lessonReminders: boolean
  progressReports: boolean
  promotions: boolean
}

export default function AccountPage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailUpdates: true,
    lessonReminders: true,
    progressReports: false,
    promotions: false
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/profile?userId=${authUser?.id}`)
      if (!response.ok) {
        throw new Error('Không thể tải thông tin tài khoản')
      }
      
      const data = await response.json()
      setUser(data.user)
      setStats(data.stats)
      setNotifications(data.notifications)
      
    } catch (error) {
      console.error('Error loading user profile:', error)
      setError(error instanceof Error ? error.message : 'Lỗi không xác định')
    } finally {
      setIsLoading(false)
    }
  }, [authUser?.id])

  // Load user profile data
  useEffect(() => {
    if (authUser?.id) {
      loadUserProfile()
    }
  }, [authUser?.id, loadUserProfile])

  const handleSave = async () => {
    if (!user || !authUser?.id) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authUser.id,
          name: user.name,
          phone: user.phone,
          grade: user.grade,
          notifications: notifications
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể cập nhật thông tin')
      }
      
      const result = await response.json()
      toast.success(result.message || 'Cập nhật thông tin thành công')
      setIsEditing(false)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(error instanceof Error ? error.message : 'Lỗi không xác định')
      toast.error('Không thể cập nhật thông tin')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!authUser?.id) return false
    
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authUser.id,
          currentPassword,
          newPassword
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể đổi mật khẩu')
      }
      
      const result = await response.json()
      toast.success(result.message || 'Đổi mật khẩu thành công')
      return true
      
    } catch (error) {
      console.error('Error changing password:', error)
      setError(error instanceof Error ? error.message : 'Lỗi không xác định')
      toast.error('Không thể đổi mật khẩu')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUserProfile}>Thử lại</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy thông tin tài khoản</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin cá nhân và cài đặt tài khoản
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Thay đổi ảnh đại diện
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG tối đa 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled={true}
                    className="bg-gray-50"
                    placeholder="Email không thể thay đổi"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Lớp học</Label>
                  <select
                    id="grade"
                    value={user.grade}
                    onChange={(e) => setUser({...user, grade: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="Lớp 1">Lớp 1</option>
                    <option value="Lớp 2">Lớp 2</option>
                    <option value="Lớp 3">Lớp 3</option>
                    <option value="Lớp 4">Lớp 4</option>
                    <option value="Lớp 5">Lớp 5</option>
                    <option value="Lớp 6">Lớp 6</option>
                    <option value="Lớp 7">Lớp 7</option>
                    <option value="Lớp 8">Lớp 8</option>
                    <option value="Lớp 9">Lớp 9</option>
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      Hủy
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Chỉnh sửa thông tin
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Gói đăng ký
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {user.plan === 'basic' ? 'Gói Cơ Bản' : 
                     user.plan === 'premium' ? 'Gói Premium' : 
                     user.plan === 'pro' ? 'Gói Pro' : 'Gói Cơ Bản'}
                  </h3>
                  <p className="text-gray-600">
                    Vai trò: {user.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tham gia từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cập nhật lần cuối: {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
                  Nâng cấp gói
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Thông báo
              </CardTitle>
              <CardDescription>
                Tùy chỉnh cách bạn nhận thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cập nhật qua email</Label>
                  <p className="text-sm text-gray-600">Nhận thông báo về tiến độ học tập</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailUpdates}
                  onChange={(e) => setNotifications({...notifications, emailUpdates: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nhắc nhở bài học</Label>
                  <p className="text-sm text-gray-600">Nhắc nhở học bài hàng ngày</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lessonReminders}
                  onChange={(e) => setNotifications({...notifications, lessonReminders: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Báo cáo tiến độ</Label>
                  <p className="text-sm text-gray-600">Báo cáo hàng tuần về tiến độ học tập</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.progressReports}
                  onChange={(e) => setNotifications({...notifications, progressReports: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Khuyến mãi</Label>
                  <p className="text-sm text-gray-600">Thông báo về ưu đãi và gói mới</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.promotions}
                  onChange={(e) => setNotifications({...notifications, promotions: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ChangePasswordButton onPasswordChange={handleChangePassword} disabled={isSaving} />
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Liên hệ hỗ trợ
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Hotline: 1900-xxxx
              </Button>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.completedLessons || 0}</div>
                <div className="text-sm text-gray-600">Bài học hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.studyTimeHours || 0}h</div>
                <div className="text-sm text-gray-600">Thời gian học (30 ngày)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats?.averageScore || 0}</div>
                <div className="text-sm text-gray-600">Điểm trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats?.totalQuizzes || 0}</div>
                <div className="text-sm text-gray-600">Bài kiểm tra</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Change Password Component
function ChangePasswordButton({ onPasswordChange, disabled }: { 
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<boolean>
  disabled: boolean 
}) {
  const [showModal, setShowModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const success = await onPasswordChange(currentPassword, newPassword)
    
    if (success) {
      setShowModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        <Shield className="w-4 h-4 mr-2" />
        Đổi mật khẩu
      </Button>

      {/* Change Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang đổi...
                    </>
                  ) : (
                    'Đổi mật khẩu'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
