'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  ClipboardList,
  PenTool,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function TeacherDashboard() {
  // Mock stats
  const stats = {
    totalStudents: 45,
    activeAssignments: 8,
    completedToday: 23,
    averageScore: 8.5,
    lessonPlans: 12,
    exerciseSets: 28
  }

  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      title: 'Bài tập Toán - Phép nhân',
      time: '10 phút trước',
      status: 'completed',
      student: 'Nguyễn Văn A'
    },
    {
      id: 2,
      type: 'lesson',
      title: 'Giáo án Ngữ văn - Tả cảnh',
      time: '1 giờ trước',
      status: 'created'
    },
    {
      id: 3,
      type: 'exercise',
      title: 'Bài tập Tiếng Anh - Present Simple',
      time: '2 giờ trước',
      status: 'generated'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          👋 Chào mừng, Giáo viên!
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý lớp học và hỗ trợ học sinh hiệu quả với AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng số học sinh
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">Đang theo dõi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bài tập đang giao
            </CardTitle>
            <ClipboardList className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.activeAssignments}</div>
            <p className="text-xs text-gray-500 mt-1">Bài tập hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hoàn thành hôm nay
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            <p className="text-xs text-gray-500 mt-1">Bài tập đã nộp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm trung bình
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.averageScore}/10</div>
            <p className="text-xs text-gray-500 mt-1">Của tất cả học sinh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Giáo án đã soạn
            </CardTitle>
            <PenTool className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.lessonPlans}</div>
            <p className="text-xs text-gray-500 mt-1">Giáo án có sẵn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bộ bài tập đã tạo
            </CardTitle>
            <FileText className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{stats.exerciseSets}</div>
            <p className="text-xs text-gray-500 mt-1">Bài tập đã sinh</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các công cụ thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/teacher/lesson-planner">
              <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col gap-2">
                <PenTool className="w-6 h-6" />
                <span>Soạn giáo án</span>
              </Button>
            </Link>
            <Link href="/teacher/exercise-generator">
              <Button className="w-full h-20 bg-green-600 hover:bg-green-700 flex flex-col gap-2">
                <FileText className="w-6 h-6" />
                <span>Sinh bài tập</span>
              </Button>
            </Link>
            <Link href="/teacher/assignments">
              <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 flex flex-col gap-2">
                <ClipboardList className="w-6 h-6" />
                <span>Giao bài tập</span>
              </Button>
            </Link>
            <Link href="/teacher/students">
              <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Quản lý học sinh</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các thao tác và cập nhật mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'assignment' ? 'bg-purple-100' :
                  activity.type === 'lesson' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {activity.type === 'assignment' && <ClipboardList className="w-5 h-5 text-purple-600" />}
                  {activity.type === 'lesson' && <PenTool className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'exercise' && <FileText className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  {activity.student && (
                    <p className="text-sm text-gray-600">Học sinh: {activity.student}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
                <div>
                  {activity.status === 'completed' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Hoàn thành
                    </span>
                  )}
                  {activity.status === 'created' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Đã tạo
                    </span>
                  )}
                  {activity.status === 'generated' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Đã sinh
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
