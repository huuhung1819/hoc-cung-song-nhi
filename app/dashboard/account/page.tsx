'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, CreditCard, Bell, Shield } from 'lucide-react'

export default function AccountPage() {
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    avatar: '',
    plan: 'Gói Cơ Bản',
    tokenQuota: 500,
    tokenUsed: 150,
    joinedDate: '2024-01-01'
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    lessonReminders: true,
    progressReports: false,
    promotions: false
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Save user data logic here
    setIsEditing(false)
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
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>Lưu thay đổi</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                  <h3 className="font-semibold text-lg">{user.plan}</h3>
                  <p className="text-gray-600">
                    Token: {user.tokenUsed}/{user.tokenQuota} (reset hàng ngày)
                  </p>
                  <p className="text-sm text-gray-500">
                    Tham gia từ: {new Date(user.joinedDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <Button variant="outline">
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
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
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
                <div className="text-2xl font-bold text-blue-600">18</div>
                <div className="text-sm text-gray-600">Bài học hoàn thành</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12.5h</div>
                <div className="text-sm text-gray-600">Thời gian học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">8.5</div>
                <div className="text-sm text-gray-600">Điểm trung bình</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
