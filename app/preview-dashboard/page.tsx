'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TokenProgress } from '@/components/TokenProgress'
import { BookOpen, Trophy, Clock, Users } from 'lucide-react'

export default function PreviewDashboardPage() {
  // Mock data - không cần auth
  const [user] = useState({
    name: 'Nguyễn Văn A',
    usagePercentage: 65,
    isNearLimit: false,
    isAtLimit: false,
    plan: 'Gói Cơ Bản',
    unlocksUsed: 3,
    unlocksQuota: 10
  })

  const [isUnlockMode, setIsUnlockMode] = useState(false)
  
  const [recentQuestions] = useState([
    {
      id: 1,
      title: 'Làm thế nào để giải phương trình bậc nhất?',
      subject: 'Toán học',
      grade: 'Lớp 8',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Phân tích câu: "Hôm nay trời đẹp quá"',
      subject: 'Tiếng Việt',
      grade: 'Lớp 6',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      title: 'Quá trình quang hợp ở thực vật',
      subject: 'Khoa học',
      grade: 'Lớp 7',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ])

  const stats = [
    {
      title: 'Trạng thái hỗ trợ',
      value: user.isAtLimit ? 'Hết lượt' : user.isNearLimit ? 'Gần hết' : 'Bình thường',
      icon: BookOpen,
      color: user.isAtLimit ? 'text-red-600' : user.isNearLimit ? 'text-yellow-600' : 'text-green-600',
      description: 'Tình trạng hỗ trợ hôm nay'
    },
    {
      title: 'Hiệu quả học tập',
      value: '85%',
      icon: Trophy,
      color: 'text-yellow-600',
      description: 'Con tự giải được mà không cần mở khóa'
    },
    {
      title: 'Thời gian hỗ trợ hôm nay',
      value: '45 phút',
      icon: Clock,
      color: 'text-green-600',
      description: 'Thời gian AI đã hỗ trợ'
    },
    {
      title: 'Lượt mở khóa hôm nay',
      value: `${user.unlocksUsed}/${user.unlocksQuota}`,
      icon: Users,
      color: 'text-purple-600',
      description: 'Lần xem lời giải chi tiết'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎨 Preview Banner - Sticky */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                👁️ DASHBOARD PREVIEW - GIAO DIỆN MỚI (Không cần đăng nhập)
              </h2>
              <p className="text-sm opacity-90 mt-1">
                🔓 Unlock code đã được chuyển lên Navbar (góc phải) • Chat AI giữ nguyên
              </p>
            </div>
            <div className="flex gap-2">
              <a 
                href="/"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
              >
                ← Về trang chủ
              </a>
              <a 
                href="/auth/login"
                className="px-4 py-2 bg-white text-purple-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
              >
                Đăng nhập để dùng thật
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header - ĐÃ XÓA NÚT UNLOCK CODE */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chào mừng, {user.name}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  AI gia sư sẵn sàng hỗ trợ con học tập hôm nay!
                </p>
                {/* Hiển thị trạng thái unlock */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isUnlockMode 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUnlockMode ? '🔓 Đã mở khóa' : '🔒 Đã đóng khóa'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isUnlockMode ? 'Con có thể xem lời giải' : 'Con chỉ xem hướng dẫn'}
                  </span>
                  <button
                    onClick={() => setIsUnlockMode(!isUnlockMode)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    (Click để thử đổi trạng thái)
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Gói học hiện tại</p>
                <p className="font-semibold text-lg">{user.plan}</p>
              </div>
            </div>
            
            {/* Questions Progress */}
            <div className="mt-6">
              <TokenProgress 
                usagePercentage={user.usagePercentage}
                isNearLimit={user.isNearLimit}
                isAtLimit={user.isAtLimit}
                label="Số câu hỏi hôm nay"
                isLoading={false}
              />
            </div>
          </div>

          {/* Instruction Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📌 Hướng dẫn xem Preview:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• <strong>Nút Unlock (🔓/🔒):</strong> ✅ Đã có ở góc phải navbar</li>
              <li>• <strong>Nút Nâng cấp (👑):</strong> ✅ Đã có bên cạnh nút unlock</li>
              <li>• <strong>Header Dashboard:</strong> ✅ Đã XÓA nút unlock code (gọn gàng hơn)</li>
              <li>• <strong>Chat AI:</strong> ✅ Đã chuyển thành FULL WIDTH (như hình bạn gửi)</li>
              <li>• <strong>Stats Cards:</strong> ✅ Hiển thị dưới Chat AI</li>
              <li>• <strong>Lịch sử câu hỏi:</strong> ✅ Hiển thị dưới Stats Cards</li>
            </ul>
          </div>

          {/* Main Content - CHAT AI FULL WIDTH */}
          <div className="space-y-6">
            {/* Chat Interface - FULL WIDTH */}
            <Card>
              <CardHeader>
                <CardTitle>AI Gia sư hỗ trợ 🤖</CardTitle>
                <CardDescription>
                  Gửi bài tập khó, AI sẽ hướng dẫn con học hiệu quả
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Chat AI Interface - FULL WIDTH
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Component chat AI sẽ hiển thị full width như hình bạn gửi.<br/>
                    Có 2 chế độ: "Chỉ hướng dẫn" và "Có lời giải"
                  </p>
                  <div className="bg-gray-100 rounded p-3 text-xs text-left space-y-1">
                    <p>💬 <strong>Demo:</strong> Chat bubble với AI response</p>
                    <p>📷 <strong>Demo:</strong> Upload ảnh bài tập</p>
                    <p>🔓 <strong>Demo:</strong> Chế độ "Có lời giải" khi unlock</p>
                    <p>📝 <strong>Demo:</strong> Input field với placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Câu hỏi gần đây</CardTitle>
                <CardDescription>
                  Các bài tập đã được AI hỗ trợ gần đây
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentQuestions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {question.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>{question.subject}</span>
                          <span>{question.grade}</span>
                          <span>{new Date(question.timestamp).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đã hoàn thành
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">📊 So sánh Cũ vs Mới</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Tiêu chí</th>
                    <th className="px-4 py-3 text-left font-semibold">Bản cũ</th>
                    <th className="px-4 py-3 text-left font-semibold">Bản mới (Preview)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-medium">Vị trí Unlock Code</td>
                    <td className="px-4 py-3">Header Dashboard</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">✅ Navbar (luôn hiện)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Cách mở khóa</td>
                    <td className="px-4 py-3">Chỉ mã 6 số</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">✅ Câu hỏi bảo mật + Mã</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Nút Nâng cấp</td>
                    <td className="px-4 py-3">Không có</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">✅ Có (Navbar)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Header Dashboard</td>
                    <td className="px-4 py-3">Đông đúc (nhiều nút)</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">✅ Gọn gàng</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Chat AI</td>
                    <td className="px-4 py-3">Sidebar (50% width)</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">✅ Full width (100%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Stats Cards</td>
                    <td className="px-4 py-3">Giữ nguyên</td>
                    <td className="px-4 py-3">Giữ nguyên</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Lưu ý:</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Đây là bản DEMO UI, chưa có backend thật</li>
              <li>• Để xem đầy đủ navbar với nút unlock + upgrade, cần implement NavbarPreview</li>
              <li>• Sau khi approve, tôi sẽ tạo database + APIs + áp dụng vào bản chính</li>
              <li>• Data hiện tại là mock data (fake) để demo giao diện</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

