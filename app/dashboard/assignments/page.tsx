'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  Play,
  Eye,
  Calendar,
  Bell
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { useNotifications } from '@/lib/hooks/useNotifications'

interface Assignment {
  id: string
  assignmentId: string
  title: string
  subject: string
  gradeLevel: string
  topic: string
  deadline: string
  questions: any[]
  teacherName: string
  status: 'assigned' | 'submitted' | 'graded'
  submittedAt: string | null
  score: number | null
  feedback: string | null
  assignedAt: string
  isOverdue: boolean
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Use real-time notifications hook
  const { notifications, unreadCount: totalUnreadCount } = useNotifications(user?.id || null)
  
  // Filter only assignment notifications for this page
  const assignmentNotifications = notifications.filter(n => 
    n.data && n.data.assignment_id
  )
  const unreadCount = assignmentNotifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (user?.id) {
      loadAssignments()
    }
  }, [user])

  const loadAssignments = async () => {
    try {
      const response = await fetch(`/api/student/assignments?studentId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive">Quá hạn</Badge>
    }
    
    switch (status) {
      case 'assigned':
        return <Badge variant="default">Chưa làm</Badge>
      case 'submitted':
        return <Badge variant="secondary">Đã nộp</Badge>
      case 'graded':
        return <Badge variant="outline">Đã chấm</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Không giới hạn'
    return new Date(deadline).toLocaleDateString('vi-VN')
  }

  const pendingAssignments = assignments.filter(a => a.status === 'assigned')
  const completedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải bài tập...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Bài tập cô giao
          </h1>
          <p className="text-gray-600 mt-1">
            Bài tập từ giáo viên và tiến độ học tập
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{unreadCount} thông báo mới</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{pendingAssignments.length}</p>
                <p className="text-sm text-gray-600">Bài tập chờ làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{completedAssignments.length}</p>
                <p className="text-sm text-gray-600">Bài tập đã hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingAssignments.filter(a => a.isOverdue).length}
                </p>
                <p className="text-sm text-gray-600">Bài tập quá hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bài tập chờ làm */}
      {pendingAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Bài tập chờ làm ({pendingAssignments.length})
            </CardTitle>
            <CardDescription>
              Các bài tập giáo viên giao cho bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      {getStatusBadge(assignment.status, assignment.isOverdue)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>GV: {assignment.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{assignment.subject} - {assignment.topic}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Hạn: {formatDeadline(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{assignment.questions.length} câu hỏi</span>
                      </div>
                    </div>

                    {assignment.isOverdue && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                        <p className="text-red-700 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Bài tập này đã quá hạn nộp
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/assignments/${assignment.assignmentId}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/assignments/${assignment.assignmentId}`}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Làm bài ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bài tập đã hoàn thành */}
      {completedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Bài tập đã hoàn thành ({completedAssignments.length})
            </CardTitle>
            <CardDescription>
              Các bài tập bạn đã nộp và kết quả
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      {getStatusBadge(assignment.status, false)}
                      {assignment.score && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Điểm: {assignment.score}/10
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>GV: {assignment.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{assignment.subject} - {assignment.topic}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Nộp: {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{assignment.questions.length} câu hỏi</span>
                      </div>
                    </div>

                    {assignment.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-blue-900 text-sm font-medium mb-1">Nhận xét của giáo viên:</p>
                        <p className="text-blue-700 text-sm">{assignment.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/assignments/${assignment.assignmentId}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem kết quả
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có bài tập nào
            </h3>
            <p className="text-gray-600">
              Giáo viên sẽ giao bài tập cho bạn ở đây
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
