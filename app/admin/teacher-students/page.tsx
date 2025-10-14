'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  GraduationCap,
  BookOpen,
  Loader2
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  studentCount: number
}

interface Student {
  id: string
  name: string
  email: string
  grade: string
}

interface TeacherStudent {
  teacherId: string
  studentId: string
  studentName: string
  studentEmail: string
  studentGrade: string
  assignedAt: string
}

export default function TeacherStudentManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [searchStudent, setSearchStudent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  // Fetch real data from API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Fetch teachers
      const teachersRes = await fetch('/api/admin/users/list?role=teacher')
      const teachersData = await teachersRes.json()
      
      if (teachersData.success) {
        // Count students for each teacher
        const teachersWithCount = await Promise.all(
          teachersData.users.map(async (teacher: any) => {
            const relRes = await fetch(`/api/admin/teacher-students?teacherId=${teacher.id}`)
            const relData = await relRes.json()
            return {
              id: teacher.id,
              name: teacher.name || teacher.email,
              email: teacher.email,
              studentCount: relData.success ? relData.relationships.length : 0
            }
          })
        )
        setTeachers(teachersWithCount)
      }

      // Fetch all students (in this system, students have role=parent)
      const studentsRes = await fetch('/api/admin/users/list?role=parent')
      const studentsData = await studentsRes.json()
      
      if (studentsData.success) {
        setStudents(studentsData.users.map((s: any) => ({
          id: s.id,
          name: s.name || s.email,
          email: s.email,
          grade: s.grade || 'Chưa xác định'
        })))
      }

      // Fetch teacher-student relationships
      const relRes = await fetch('/api/admin/teacher-students')
      const relData = await relRes.json()
      
      if (relData.success) {
        setTeacherStudents(relData.relationships.map((rel: any) => ({
          teacherId: rel.teacher_id,
          studentId: rel.student_id,
          studentName: rel.student?.name || rel.student?.email || 'Unknown',
          studentEmail: rel.student?.email || '',
          studentGrade: rel.student?.grade || 'Chưa xác định',
          assignedAt: rel.assigned_at.split('T')[0]
        })))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Có lỗi khi tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = selectedTeacher
    ? teacherStudents.filter(ts => ts.teacherId === selectedTeacher)
    : []

  const availableStudents = students.filter(student => {
    const alreadyAssigned = teacherStudents.some(
      ts => ts.teacherId === selectedTeacher && ts.studentId === student.id
    )
    const matchesSearch = student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchStudent.toLowerCase())
    return !alreadyAssigned && matchesSearch
  })

  const handleAddStudent = async () => {
    if (!selectedTeacher || !selectedStudent) {
      alert('Vui lòng chọn giáo viên và học sinh')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/teacher-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          teacherId: selectedTeacher, 
          studentId: selectedStudent 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student')
      }

      // Reload data
      await loadData()

      setShowAddModal(false)
      setSelectedStudent('')
      setSearchStudent('')
      alert('✅ Đã thêm học sinh vào lớp thành công!')
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa học sinh này khỏi lớp?')) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/teacher-students', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          teacherId: selectedTeacher, 
          studentId 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove student')
      }

      // Reload data
      await loadData()

      alert('✅ Đã xóa học sinh khỏi lớp')
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Giáo viên - Học sinh</h1>
        <p className="text-gray-600 mt-1">
          Quản lý mối quan hệ giữa giáo viên và học sinh
        </p>
      </div>

      {/* Teachers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            className={`cursor-pointer transition-all ${
              selectedTeacher === teacher.id
                ? 'ring-2 ring-blue-600 border-blue-600'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTeacher(teacher.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4" />
                <span className="font-medium">{teacher.studentCount}</span>
                <span className="text-sm">học sinh</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Students Management */}
      {selectedTeacher && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Học sinh của {teachers.find(t => t.id === selectedTeacher)?.name}
                </CardTitle>
                <CardDescription>
                  Quản lý danh sách học sinh trong lớp
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm học sinh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Chưa có học sinh nào trong lớp</p>
                <p className="text-sm mt-1">Click "Thêm học sinh" để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((ts) => (
                  <div
                    key={ts.studentId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{ts.studentName}</p>
                        <p className="text-sm text-gray-600">{ts.studentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{ts.studentGrade}</p>
                        <p className="text-xs text-gray-500">
                          Thêm vào: {new Date(ts.assignedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStudent(ts.studentId)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm học sinh vào lớp</DialogTitle>
            <DialogDescription>
              Chọn học sinh để thêm vào lớp của{' '}
              {teachers.find(t => t.id === selectedTeacher)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Tìm kiếm học sinh</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nhập tên hoặc email..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              <Label>Chọn học sinh ({availableStudents.length} có sẵn)</Label>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p>Không có học sinh phù hợp</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedStudent === student.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {student.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setSelectedStudent('')
                setSearchStudent('')
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={isLoading || !selectedStudent}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm học sinh
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

