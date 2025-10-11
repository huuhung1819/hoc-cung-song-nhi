'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Phone, Mail, Clock, CheckCircle } from 'lucide-react'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Submit form logic here
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const faqs = [
    {
      question: 'Làm thế nào để sử dụng AI học tập?',
      answer: 'Bạn có thể bắt đầu bằng cách chọn một bài học từ trang Bài học, sau đó sử dụng tính năng Chat để đặt câu hỏi với AI giáo viên.'
    },
    {
      question: 'Token được tính như thế nào?',
      answer: 'Mỗi câu hỏi gửi đến AI sẽ tiêu tốn một lượng token nhất định. Token sẽ được reset về 0 mỗi ngày theo gói đăng ký của bạn.'
    },
    {
      question: 'Làm sao để nâng cấp gói học?',
      answer: 'Bạn có thể nâng cấp gói học từ trang Tài khoản. Chọn "Nâng cấp gói" và làm theo hướng dẫn thanh toán.'
    },
    {
      question: 'Tôi quên mật khẩu thì làm sao?',
      answer: 'Tại trang đăng nhập, nhấn "Quên mật khẩu" và nhập email của bạn. Chúng tôi sẽ gửi link đặt lại mật khẩu.'
    },
    {
      question: 'Có thể sử dụng trên điện thoại không?',
      answer: 'Có, ứng dụng được tối ưu cho cả máy tính và điện thoại. Bạn có thể truy cập từ bất kỳ trình duyệt nào.'
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: 'Điện thoại',
      description: 'Gọi trực tiếp để được hỗ trợ nhanh nhất',
      contact: '1900-xxxx',
      available: '8:00 - 22:00 hàng ngày'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Gửi email và nhận phản hồi trong 24h',
      contact: 'support@ailearning.com',
      available: '24/7'
    },
    {
      icon: MessageCircle,
      title: 'Chat trực tuyến',
      description: 'Chat với nhân viên hỗ trợ ngay lập tức',
      contact: 'Bắt đầu chat',
      available: '8:00 - 22:00 hàng ngày'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hỗ trợ</h1>
        <p className="text-gray-600 mt-1">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{method.contact}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {method.available}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
            <CardDescription>
              Mô tả chi tiết vấn đề bạn đang gặp phải
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Yêu cầu đã được gửi!
                </h3>
                <p className="text-gray-600">
                  Chúng tôi sẽ phản hồi trong vòng 24 giờ
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Chung</option>
                    <option value="technical">Kỹ thuật</option>
                    <option value="billing">Thanh toán</option>
                    <option value="feature">Tính năng</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Mức độ ưu tiên</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Tiêu đề</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Mô tả ngắn gọn vấn đề"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Chi tiết</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Gửi yêu cầu hỗ trợ
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Câu hỏi thường gặp</CardTitle>
            <CardDescription>
              Tìm câu trả lời cho các câu hỏi phổ biến
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">
                Xem thêm câu hỏi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Help */}
      <Card>
        <CardHeader>
          <CardTitle>Trợ giúp nhanh</CardTitle>
          <CardDescription>
            Các tài liệu hướng dẫn và video tutorial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <div className="text-2xl">📖</div>
              <span className="text-sm">Hướng dẫn sử dụng</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <div className="text-2xl">🎥</div>
              <span className="text-sm">Video tutorial</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <div className="text-2xl">💡</div>
              <span className="text-sm">Mẹo học hiệu quả</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <div className="text-2xl">🔧</div>
              <span className="text-sm">Khắc phục sự cố</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
