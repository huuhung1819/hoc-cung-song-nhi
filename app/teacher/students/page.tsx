'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch students from API
  useEffect(() => {
    if (user?.id) {
      loadStudents()
    }
  }, [user])

  const loadStudents = async () => {
    setIsLoading(true)
    try {
      // Fetch teacher's students
      const response = await fetch(`/api/admin/teacher-students?teacherId=${user?.id}`)
      const data = await response.json()

      if (data.success) {
        // Map relationships to student objects
        const studentsList = data.relationships.map((rel: any) => ({
          id: rel.student_id,
          name: rel.student?.name || rel.student?.email || 'Unknown',
          avatar: '',
          email: rel.student?.email || '',
          grade: rel.student?.grade || 'Chưa xác định',
          // Mock additional data - can be fetched from separate API later
          lessonsCompleted: Math.floor(Math.random() * 15 + 5),
          totalLessons: 20,
          averageScore: (Math.random() * 2 + 7.5).toFixed(1),
          studyTime: `${Math.floor(Math.random() * 60 + 20)} phút`,
          lastActive: ['30 phút trước', '1 giờ trước', '2 giờ trước', '1 ngày trước'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 50 + 30)
        }))

        setStudents(studentsList)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade
    return matchesSearch && matchesGrade
  })

  const stats = {
    totalStudents: students.length,
    averageProgress: Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length),
    totalLessonsCompleted: students.reduce((acc, s) => acc + s.lessonsCompleted, 0),
    averageScore: (students.reduce((acc, s) => acc + s.averageScore, 0) / students.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải danh sách học sinh...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý học sinh</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi tiến độ học tập của các học sinh
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Gửi thông báo
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Thêm học sinh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-blue-600 mt-1">
              +2 so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiến độ trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <Progress value={stats.averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài học hoàn thành</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessonsCompleted}</div>
            <p className="text-xs text-green-600 mt-1">
              +15 so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-green-600 mt-1">
              +0.3 so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả lớp</option>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>{student.grade}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tiến độ học tập</span>
                  <span className="text-sm text-gray-600">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Bài học</div>
                  <div className="font-medium">{student.lessonsCompleted}/{student.totalLessons}</div>
                </div>
                <div>
                  <div className="text-gray-500">Điểm TB</div>
                  <div className="font-medium">{student.averageScore}/10</div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  Thời gian học: {student.studyTime}
                </div>
                <div>Hoạt động cuối: {student.lastActive}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Xem chi tiết
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Nhắn tin
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy học sinh nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
