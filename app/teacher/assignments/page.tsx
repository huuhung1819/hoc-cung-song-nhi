'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock,
  XCircle,
  Send,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'

// Interface cho Assignment
interface Assignment {
  id: string
  title: string
  subject: string
  gradeLevel: string
  topic: string
  assignedTo: number
  completed: number
  deadline: string
  status: 'active' | 'completed' | 'overdue'
  created_at: string
}

// Interface cho Student
interface Student {
  id: string
  name: string
  grade: string
  email: string
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [topic, setTopic] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  // Load students and assignments when component mounts
  useEffect(() => {
    if (user?.id) {
      loadStudents()
      loadAssignments()
    }
  }, [user])

  const loadStudents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/teacher-students?teacherId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setStudents(data.students)
      }
    } catch (error) {
      console.error('Error loading students:', error)
      setError('Không thể tải danh sách học sinh')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAssignments = async () => {
    try {
      const response = await fetch(`/api/teacher/assignments?teacherId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setAssignments(data.assignments)
      } else {
        console.error('Failed to load assignments:', data.error)
        setError('Không thể tải danh sách bài tập')
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
      setError('Không thể tải danh sách bài tập')
    }
  }

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleSubmit = async () => {
    if (!title || !deadline || !subject || !gradeLevel || !topic || selectedStudents.length === 0) {
      setError('Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 học sinh')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      // Tạo bài tập mẫu (có thể tùy chỉnh sau)
      const sampleQuestions = [
        {
          question: `Hãy giải bài tập về ${topic}`,
          type: 'essay'
        }
      ]

      const assignmentData = {
        title,
        subject,
        grade: gradeLevel,
        topic,
        deadline,
        studentIds: selectedStudents,
        questionsForStudents: sampleQuestions,
        questionsWithAnswers: sampleQuestions
      }

      const response = await fetch('/api/teacher/create-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify(assignmentData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo bài tập')
      }

      // Success - reload assignments and reset form
      await loadAssignments()
      
      // Reset form
      setTitle('')
      setDescription('')
      setSubject('')
      setGradeLevel('')
      setTopic('')
      setDeadline('')
      setSelectedStudents([])
      setShowCreateForm(false)
      
      // Show success message
      alert(`Đã giao bài tập "${title}" cho ${selectedStudents.length} học sinh thành công!`)
      
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi tạo bài tập')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-blue-500">Đang diễn ra</Badge>
    } else if (status === 'completed') {
      return <Badge className="bg-green-500">Hoàn thành</Badge>
    } else {
      return <Badge className="bg-gray-500">Quá hạn</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-purple-600" />
            Giao Bài tập
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý và giao bài tập cho học sinh
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Giao bài mới
        </Button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Tạo bài tập mới</CardTitle>
            <CardDescription>
              Điền thông tin và chọn học sinh để giao bài
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>Tiêu đề bài tập *</Label>
                <Input
                  placeholder="Ví dụ: Bài tập Toán - Phép nhân"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Môn học *</Label>
                <Input
                  placeholder="Ví dụ: Toán học"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade Level */}
              <div className="space-y-2">
                <Label>Lớp *</Label>
                <Input
                  placeholder="Ví dụ: Lớp 3"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label>Chủ đề *</Label>
                <Input
                  placeholder="Ví dụ: Phép nhân"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deadline */}
              <div className="space-y-2">
                <Label>Hạn nộp *</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Mô tả / Hướng dẫn</Label>
              <Textarea
                placeholder="Nội dung bài tập, yêu cầu, gợi ý..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Select Students */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Chọn học sinh *</Label>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === students.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Đang tải danh sách học sinh...</span>
                  </div>
                ) : students.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Chưa có học sinh nào
                  </div>
                ) : (
                  students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentToggle(student.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStudents.includes(student.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedStudents.includes(student.id)
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedStudents.includes(student.id) && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.grade}</p>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-600">
                Đã chọn: <span className="font-medium">{selectedStudents.length}</span> học sinh
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isCreating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Giao bài
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Danh sách bài tập đã giao</h2>
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">Chưa có bài tập nào được giao</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài tập đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{assignment.title}</CardTitle>
                    <CardDescription className="mt-1 text-xs md:text-sm">
                      {assignment.subject} - {assignment.gradeLevel}
                    </CardDescription>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {getStatusBadge(assignment.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{assignment.assignedTo} học sinh</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{assignment.completed} hoàn thành</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                  <span className="text-gray-600">
                    Hạn nộp: <span className="font-medium">{assignment.deadline}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Tiến độ</span>
                    <span>{Math.round((assignment.completed / assignment.assignedTo) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(assignment.completed / assignment.assignedTo) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm">
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm">
                    Chấm điểm
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

