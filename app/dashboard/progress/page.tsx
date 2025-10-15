'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Calendar, Award, BookOpen, Loader2 } from 'lucide-react'

export default function ProgressPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [showUpdateMessage, setShowUpdateMessage] = useState(false)

  const progressData = {
    overall: {
      completionRate: 75,
      averageScore: 8.5,
      totalLessons: 24,
      completedLessons: 18,
      studyTime: '12 giờ 30 phút'
    },
    subjects: [
      {
        name: 'Toán học',
        progress: 85,
        completed: 12,
        total: 14,
        averageScore: 9.2,
        color: 'bg-blue-500'
      },
      {
        name: 'Tiếng Việt',
        progress: 70,
        completed: 8,
        total: 11,
        averageScore: 8.8,
        color: 'bg-green-500'
      },
      {
        name: 'Khoa học',
        progress: 60,
        completed: 6,
        total: 10,
        averageScore: 8.0,
        color: 'bg-purple-500'
      }
    ],
    weeklyData: [
      { day: 'T2', lessons: 3, time: '45 phút' },
      { day: 'T3', lessons: 2, time: '30 phút' },
      { day: 'T4', lessons: 4, time: '60 phút' },
      { day: 'T5', lessons: 3, time: '45 phút' },
      { day: 'T6', lessons: 2, time: '30 phút' },
      { day: 'T7', lessons: 1, time: '15 phút' },
      { day: 'CN', lessons: 0, time: '0 phút' }
    ],
    achievements: [
      {
        title: 'Người học chăm chỉ',
        description: 'Học liên tục 7 ngày',
        icon: Award,
        earned: true,
        date: '2024-01-15'
      },
      {
        title: 'Toán học xuất sắc',
        description: 'Đạt điểm 10 trong 5 bài kiểm tra',
        icon: TrendingUp,
        earned: true,
        date: '2024-01-12'
      },
      {
        title: 'Khám phá khoa học',
        description: 'Hoàn thành 10 bài khoa học',
        icon: BookOpen,
        earned: false,
        date: null
      }
    ]
  }

  const handleClick = () => {
    setShowUpdateMessage(true)
    setTimeout(() => setShowUpdateMessage(false), 3000) // Ẩn sau 3 giây
  }

  return (
    <div className="space-y-6 relative">
      {/* Overlay khi click */}
      {showUpdateMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-md mx-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📊 Tiến độ học tập
            </h3>
            <p className="text-lg text-gray-600">
              Đang chờ cập nhật từ hệ thống
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tiến độ học tập</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi quá trình học tập và thành tích của bạn
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onClick={handleClick}>
        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.completionRate}%</div>
            <Progress value={progressData.overall.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.averageScore}/10</div>
            <p className="text-xs text-green-600 mt-1">+0.3 so với tuần trước</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài học hoàn thành</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.overall.completedLessons}/{progressData.overall.totalLessons}
            </div>
            <p className="text-xs text-gray-600 mt-1">còn {progressData.overall.totalLessons - progressData.overall.completedLessons} bài</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.studyTime}</div>
            <p className="text-xs text-blue-600 mt-1">+2h so với tuần trước</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onClick={handleClick}>
        {/* Subject Progress */}
        <Card className="cursor-pointer">
          <CardHeader>
            <CardTitle>Tiến độ theo môn học</CardTitle>
            <CardDescription>
              Xem chi tiết tiến độ từng môn học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {progressData.subjects.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-sm text-gray-600">
                    {subject.completed}/{subject.total} bài
                  </span>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{subject.progress}% hoàn thành</span>
                  <span className="font-medium">ĐTB: {subject.averageScore}/10</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="cursor-pointer">
          <CardHeader>
            <CardTitle>Hoạt động tuần này</CardTitle>
            <CardDescription>
              Số bài học và thời gian học mỗi ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{day.day}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{day.lessons} bài</span>
                    <span className="text-sm text-gray-600">{day.time}</span>
                    <div className={`w-16 h-2 rounded-full ${
                      day.lessons > 0 ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="cursor-pointer" onClick={handleClick}>
        <CardHeader>
          <CardTitle>Thành tích và huy hiệu</CardTitle>
          <CardDescription>
            Những thành tích bạn đã đạt được
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progressData.achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-6 h-6 ${
                      achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold">{achievement.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  {achievement.earned && achievement.date && (
                    <p className="text-xs text-green-600">
                      Đạt được: {new Date(achievement.date).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
