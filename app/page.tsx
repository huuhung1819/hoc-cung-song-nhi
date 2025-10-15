'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Users, ArrowRight, BookOpen, Brain, Star } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'parent' | null>(null)

  const roles = [
    {
      id: 'parent',
      title: 'Phụ huynh & Học sinh',
      description: 'Học cùng AI thông minh, theo dõi tiến độ học tập, quản lý bài học cá nhân',
      icon: GraduationCap,
      path: '/dashboard',
      color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      features: ['AI Gia sư thông minh', 'Theo dõi tiến độ', 'Bài tập cá nhân hóa']
    },
    {
      id: 'teacher',
      title: 'Giáo viên',
      description: 'Quản lý lớp học, theo dõi tiến độ học sinh, tạo bài tập và phân tích kết quả',
      icon: Users,
      path: '/teacher',
      color: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      features: ['Quản lý học sinh', 'Tạo bài tập AI', 'Báo cáo chi tiết']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            {/* Logo với hình ảnh hai con gái */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <img 
                  src="/images/song-nhi-girls.jpg" 
                  alt="Hai bé gái Song Nhi" 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover object-center shadow-lg border-4 border-white"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-3 h-3 md:w-5 md:h-5 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  HỌC CÙNG SONG NHI
                </h1>
                <p className="text-base md:text-lg text-gray-600 font-medium">
                  Nền tảng học tập thông minh với AI
                </p>
              </div>
            </div>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Kết nối học sinh, giáo viên và phụ huynh trong một môi trường học tập hiện đại, 
              nơi AI trở thành người bạn đồng hành thông minh của mọi em nhỏ.
            </p>
          </div>

          {/* Role Selection */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Chọn vai trò của bạn
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <Card 
                    key={role.id}
                    className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      selectedRole === role.id ? 'ring-4 ring-purple-300 shadow-2xl' : 'shadow-lg'
                    } ${role.bgColor} border-0`}
                    onClick={() => setSelectedRole(role.id as any)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold mb-3">{role.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Features */}
                      <div className="space-y-3">
                        {role.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${role.textColor} bg-current`}></div>
                            <span className={`text-sm font-medium ${role.textColor}`}>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Button */}
                      <Link href="/auth/login">
                        <Button 
                          className={`w-full bg-gradient-to-r ${role.color} text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                        >
                          Vào hệ thống
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Features Highlight */}
          <div className="max-w-6xl mx-auto mt-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">AI Thông Minh</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gia sư AI hiểu từng em nhỏ, tạo bài tập phù hợp theo lớp học
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Học Tập Cá Nhân</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI chỉ hướng dẫn không có lời giải cho học sinh
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Theo Dõi Tiến Độ</h3>
                <p className="text-gray-600 leading-relaxed">
                  Phụ huynh và giáo viên luôn biết em đang học gì và tiến bộ ra sao
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
