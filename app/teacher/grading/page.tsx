'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  Calendar,
  Star,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'

interface Submission {
  id: string
  assignmentId: string
  assignmentTitle: string
  subject: string
  grade: string
  topic: string
  deadline: string
  questions: any[]
  correctAnswers: any[]
  studentId: string
  studentName: string
  studentEmail: string
  studentGrade: string
  status: 'submitted' | 'graded'
  submittedAt: string
  grade: number | null
  feedback: string | null
  studentAnswers: any
}

interface Student {
  id: string
  name: string
  email: string
  grade: string
  submissions: Submission[]
  totalSubmissions: number
  pendingSubmissions: number
  lastSubmissionDate: string | null
}

export default function GradingPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [questionGrades, setQuestionGrades] = useState<Record<number, 'correct' | 'incorrect' | null>>({})

  useEffect(() => {
    if (user?.id) {
      loadStudents()
    }
  }, [user])

  // Auto-calculate grade based on question grades
  useEffect(() => {
    if (selectedSubmission && selectedSubmission.questions) {
      const totalQuestions = selectedSubmission.questions.length
      const correctAnswers = Object.values(questionGrades).filter(grade => grade === 'correct').length
      
      if (totalQuestions > 0) {
        const calculatedGrade = (correctAnswers / totalQuestions) * 10
        setGrade(calculatedGrade.toFixed(1))
      }
    }
  }, [questionGrades, selectedSubmission])

  const loadStudents = async () => {
    try {
      // Load all submissions for the teacher
      const response = await fetch(`/api/teacher/submissions?teacherId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        const submissions = data.submissions
        
        // Group submissions by student
        const studentMap = new Map<string, Student>()
        
        submissions.forEach((submission: Submission) => {
          if (!studentMap.has(submission.studentId)) {
            studentMap.set(submission.studentId, {
              id: submission.studentId,
              name: submission.studentName,
              email: submission.studentEmail,
              grade: submission.studentGrade,
              submissions: [],
              totalSubmissions: 0,
              pendingSubmissions: 0,
              lastSubmissionDate: null
            })
          }
          
          const student = studentMap.get(submission.studentId)!
          student.submissions.push(submission)
          student.totalSubmissions++
          
          if (submission.status === 'submitted') {
            student.pendingSubmissions++
          }
          
          // Update last submission date
          if (!student.lastSubmissionDate || new Date(submission.submittedAt) > new Date(student.lastSubmissionDate)) {
            student.lastSubmissionDate = submission.submittedAt
          }
        })
        
        // Convert to array and sort by pending submissions (desc) then by last submission date (desc)
        const studentsArray = Array.from(studentMap.values()).sort((a, b) => {
          if (a.pendingSubmissions !== b.pendingSubmissions) {
            return b.pendingSubmissions - a.pendingSubmissions // More pending first
          }
          if (!a.lastSubmissionDate || !b.lastSubmissionDate) {
            return (b.lastSubmissionDate ? 1 : 0) - (a.lastSubmissionDate ? 1 : 0)
          }
          return new Date(b.lastSubmissionDate).getTime() - new Date(a.lastSubmissionDate).getTime()
        })
        
        setStudents(studentsArray)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !grade) return

    setIsGrading(true)
    try {
      const response = await fetch('/api/teacher/grade-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade: parseFloat(grade),
          feedback: feedback
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to grade assignment')
      }

      alert('✅ Đã chấm điểm thành công!')
      setSelectedSubmission(null)
      setGrade('')
      setFeedback('')
      loadStudents()
    } catch (error: any) {
      console.error('Error grading assignment:', error)
      alert('Lỗi khi chấm điểm. Vui lòng thử lại.')
    } finally {
      setIsGrading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải danh sách học sinh...</span>
      </div>
    )
  }

  // Calculate stats
  const totalPendingSubmissions = students.reduce((sum, student) => sum + student.pendingSubmissions, 0)
  const totalGradedSubmissions = students.reduce((sum, student) => 
    sum + student.submissions.filter(s => s.status === 'graded').length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-600" />
          Chấm bài tập
        </h1>
        <p className="text-gray-600 mt-1">
          Xem và chấm điểm bài tập học sinh đã nộp
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                <p className="text-sm text-gray-600">Tổng số học sinh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{totalPendingSubmissions}</p>
                <p className="text-sm text-gray-600">Bài tập chờ chấm</p>
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
                <p className="text-2xl font-bold text-green-600">{totalGradedSubmissions}</p>
                <p className="text-sm text-gray-600">Bài tập đã chấm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Danh sách học sinh ({students.length})
            </CardTitle>
            <CardDescription>
              Click vào học sinh để xem và chấm bài tập
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student)
                  // Auto-select the latest submission with answers
                  const latestSubmissionWithAnswers = student.submissions
                    .filter(s => s.studentAnswers && Object.keys(s.studentAnswers).length > 0)
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
                  
                  if (latestSubmissionWithAnswers) {
                    setSelectedSubmission(latestSubmissionWithAnswers)
                  } else {
                    // Fallback to latest submission
                    const latestSubmission = student.submissions
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
                    setSelectedSubmission(latestSubmission)
                  }
                  // Reset question grades when selecting new submission
                  setQuestionGrades({})
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      {student.pendingSubmissions > 0 && (
                        <Badge variant="destructive">
                          {student.pendingSubmissions} bài chờ chấm
                        </Badge>
                      )}
                      {student.pendingSubmissions === 0 && student.totalSubmissions > 0 && (
                        <Badge variant="outline">
                          Đã chấm hết
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Lớp: {student.grade}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Tổng: {student.totalSubmissions} bài</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Cuối: {student.lastSubmissionDate ? formatDate(student.lastSubmissionDate) : 'Chưa có'}</span>
                      </div>
                    </div>

                    {/* Show recent submissions */}
                    {student.submissions.slice(0, 2).map((submission) => (
                      <div key={submission.id} className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-1">
                        <span className="font-medium">{submission.assignmentTitle}</span> - 
                        <span className={`ml-1 ${
                          submission.status === 'submitted' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {submission.status === 'submitted' ? 'Chờ chấm' : 'Đã chấm'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedStudent(student)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    {student.pendingSubmissions > 0 && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStudent(student)
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Chấm bài ({student.pendingSubmissions})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    {selectedStudent.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedStudent.grade} • {selectedStudent.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null)
                    setSelectedSubmission(null)
                  }}
                >
                  ✕
                </Button>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalSubmissions}</p>
                  <p className="text-sm text-gray-600">Tổng bài tập</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedStudent.pendingSubmissions}</p>
                  <p className="text-sm text-gray-600">Chờ chấm</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedStudent.totalSubmissions - selectedStudent.pendingSubmissions}</p>
                  <p className="text-sm text-gray-600">Đã chấm</p>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bài tập của học sinh</h3>
                {selectedStudent.submissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{submission.assignmentTitle}</h4>
                          <Badge variant={submission.status === 'submitted' ? 'default' : 'outline'}>
                            {submission.status === 'submitted' ? 'Chờ chấm' : 'Đã chấm'}
                          </Badge>
                          {submission.grade && (
                            <Badge variant="secondary">
                              {submission.grade}/10
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {submission.subject} - {submission.topic} • Nộp: {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem bài
                        </Button>
                        {submission.status === 'submitted' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Chấm điểm
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                    Chấm điểm bài tập
                  </h2>
                  <p className="text-gray-600">
                    {selectedSubmission.assignmentTitle} • {selectedSubmission.studentName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(null)
                    setGrade('')
                    setFeedback('')
                  }}
                >
                  ✕
                </Button>
              </div>

              {/* Assignment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Thông tin bài tập</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Môn học:</span> {selectedSubmission.subject}
                  </div>
                  <div>
                    <span className="font-medium">Chủ đề:</span> {selectedSubmission.topic}
                  </div>
                  <div>
                    <span className="font-medium">Lớp:</span> {selectedSubmission.grade}
                  </div>
                  <div>
                    <span className="font-medium">Nộp lúc:</span> {formatDate(selectedSubmission.submittedAt)}
                  </div>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Câu hỏi và câu trả lời</h3>
                {selectedSubmission.questions && Array.isArray(selectedSubmission.questions) && selectedSubmission.questions.map((question: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">
                      Câu {index + 1}: {typeof question.question === 'string' ? question.question : JSON.stringify(question.question)}
                    </h4>
                    
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Các lựa chọn:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {question.options && Array.isArray(question.options) && question.options.map((option: any, optIndex: number) => (
                            <div key={optIndex} className="text-sm p-2 bg-gray-100 rounded">
                              {String.fromCharCode(65 + optIndex)}. {typeof option === 'string' ? option : JSON.stringify(option)}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Học sinh chọn:</span> 
                          <span className="ml-2 p-1 bg-blue-100 rounded">
                            {(() => {
                              const questionId = question.id || `question-${index}`
                              const answer = selectedSubmission.studentAnswers?.[questionId]
                              return answer ? (typeof answer === 'string' ? answer : JSON.stringify(answer)) : 'Chưa trả lời'
                            })()}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Đáp án đúng:</span> 
                          <span className="ml-2 p-1 bg-green-100 rounded">
                            {selectedSubmission.correctAnswers?.[index] ? 
                              (typeof selectedSubmission.correctAnswers[index] === 'string' ? 
                                selectedSubmission.correctAnswers[index] : 
                                JSON.stringify(selectedSubmission.correctAnswers[index])) : 
                              'Chưa có'}
                          </span>
                        </p>
                      </div>
                    )}

                    {question.type === 'fill_blank' && (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Học sinh điền:</span> 
                          <span className="ml-2 p-1 bg-blue-100 rounded">
                            {(() => {
                              const questionId = question.id || `question-${index}`
                              const answer = selectedSubmission.studentAnswers?.[questionId]
                              return answer ? (typeof answer === 'string' ? answer : JSON.stringify(answer)) : 'Chưa trả lời'
                            })()}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Đáp án đúng:</span> 
                          <span className="ml-2 p-1 bg-green-100 rounded">
                            {selectedSubmission.correctAnswers?.[index] ? 
                              (typeof selectedSubmission.correctAnswers[index] === 'string' ? 
                                selectedSubmission.correctAnswers[index] : 
                                JSON.stringify(selectedSubmission.correctAnswers[index])) : 
                              'Chưa có'}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Grading UI for each question */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Chấm điểm câu này:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuestionGrades(prev => ({ ...prev, [index]: 'correct' }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              questionGrades[index] === 'correct' 
                                ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            ✓ Đúng
                          </button>
                          <button
                            onClick={() => setQuestionGrades(prev => ({ ...prev, [index]: 'incorrect' }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              questionGrades[index] === 'incorrect' 
                                ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            ✗ Sai
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grading Form */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Chấm điểm</h3>
                
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(questionGrades).filter(grade => grade === 'correct').length}
                    </div>
                    <div className="text-sm text-gray-600">Câu đúng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(questionGrades).filter(grade => grade === 'incorrect').length}
                    </div>
                    <div className="text-sm text-gray-600">Câu sai</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedSubmission?.questions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng câu</div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="grade">Điểm số (0-10)</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Nhập điểm số"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback">Nhận xét</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhận xét về bài làm của học sinh..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(null)
                    setGrade('')
                    setFeedback('')
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleGradeSubmission}
                  disabled={isGrading || !grade}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang chấm...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Chấm điểm
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}