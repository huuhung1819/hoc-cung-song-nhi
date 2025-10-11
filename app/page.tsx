'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Users, Settings, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent' | null>(null)

  const roles = [
    {
      id: 'parent',
      title: 'Phụ huynh & Học sinh',
      description: 'Học cùng AI, theo dõi tiến độ, quản lý bài học',
      icon: GraduationCap,
      path: '/dashboard',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'teacher',
      title: 'Giáo viên',
      description: 'Quản lý học sinh, theo dõi tiến độ, phân tích kết quả',
      icon: Users,
      path: '/teacher',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'admin',
      title: 'Quản trị viên',
      description: 'Quản lý hệ thống, người dùng, token, nội dung học',
      icon: Settings,
      path: '/admin',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-4">
            <img 
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=80&h=80&fit=crop&crop=face&auto=format" 
              alt="2 bé hoạt hình" 
              className="w-16 h-16 rounded-full object-cover"
            />
            HỌC CÙNG SONG NHI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nền tảng học tập thông minh với AI, kết nối học sinh, giáo viên và phụ huynh
          </p>
        </div>

        {/* Role Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Chọn vai trò của bạn
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRole === role.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id as any)}
                >
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full ${role.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Link href="/auth/login">
                      <Button 
                        className={`w-full ${role.color} text-white`}
                      >
                        Vào hệ thống
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Tính năng nổi bật
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold mb-2">AI Giáo viên</h3>
              <p className="text-sm text-gray-600">Học cùng AI thông minh, giải đáp mọi thắc mắc</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Theo dõi tiến độ</h3>
              <p className="text-sm text-gray-600">Báo cáo chi tiết về quá trình học tập</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Quản lý Token</h3>
              <p className="text-sm text-gray-600">Hệ thống token thông minh, tiết kiệm chi phí</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-2">Đa vai trò</h3>
              <p className="text-sm text-gray-600">Phù hợp cho mọi đối tượng người dùng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
