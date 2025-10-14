'use client'

import { useState } from 'react'
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
  Send
} from 'lucide-react'

// Mock data - sẽ thay bằng data thật từ database
const mockStudents = [
  { id: '1', name: 'Nguyễn Văn A', grade: 'Lớp 3' },
  { id: '2', name: 'Trần Thị B', grade: 'Lớp 3' },
  { id: '3', name: 'Lê Văn C', grade: 'Lớp 3' },
  { id: '4', name: 'Phạm Thị D', grade: 'Lớp 4' },
  { id: '5', name: 'Hoàng Văn E', grade: 'Lớp 4' }
]

const mockAssignments = [
  {
    id: '1',
    title: 'Bài tập Toán: Phép cộng',
    subject: 'Toán',
    grade: 'Lớp 3',
    assignedTo: 3,
    completed: 2,
    deadline: '2025-10-20',
    status: 'active'
  },
  {
    id: '2',
    title: 'Bài tập Văn: Tả cảnh',
    subject: 'Tiếng Việt',
    grade: 'Lớp 4',
    assignedTo: 2,
    completed: 1,
    deadline: '2025-10-18',
    status: 'active'
  },
  {
    id: '3',
    title: 'Bài tập Tiếng Anh: Present Simple',
    subject: 'Tiếng Anh',
    grade: 'Lớp 5',
    assignedTo: 4,
    completed: 4,
    deadline: '2025-10-15',
    status: 'completed'
  }
]

export default function AssignmentsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [assignments] = useState(mockAssignments)

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === mockStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(mockStudents.map(s => s.id))
    }
  }

  const handleSubmit = () => {
    if (!title || !deadline || selectedStudents.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 học sinh')
      return
    }

    // TODO: Implement API call to create assignment
    alert(`Đã giao bài tập "${title}" cho ${selectedStudents.length} học sinh!`)
    
    // Reset form
    setTitle('')
    setDescription('')
    setDeadline('')
    setSelectedStudents([])
    setShowCreateForm(false)
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
                  {selectedStudents.length === mockStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {mockStudents.map((student) => (
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
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Đã chọn: <span className="font-medium">{selectedStudents.length}</span> học sinh
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Giao bài
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {assignment.subject} - {assignment.grade}
                    </CardDescription>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{assignment.assignedTo} học sinh</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{assignment.completed} hoàn thành</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
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
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Chấm điểm
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
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
      )}
    </div>
  )
}

