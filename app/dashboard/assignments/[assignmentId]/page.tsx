'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  BookOpen, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  Save,
  Send,
  ArrowLeft,
  Calendar,
  Star,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/authContext'

interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'fill_blank' | 'essay'
  options?: string[]
  correctAnswer?: string
}

interface Assignment {
  id: string
  assignmentId: string
  title: string
  subject: string
  gradeLevel: string
  topic: string
  deadline: string
  questions: Question[]
  teacherName: string
  status: 'assigned' | 'submitted' | 'graded'
  assignedAt: string
  score?: number | null
  feedback?: string | null
  submittedAt?: string | null
  studentAnswers?: Record<string, string>
}

export default function DoAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const assignmentId = params.assignmentId as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (assignmentId && user?.id) {
      loadAssignment()
    }
  }, [assignmentId, user])

  const loadAssignment = async () => {
    try {
      const response = await fetch(`/api/student/assignments?studentId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        const foundAssignment = data.assignments.find((a: any) => 
          a.assignmentId === assignmentId
        )
        if (foundAssignment) {
          setAssignment(foundAssignment)
          // Load student answers if assignment is submitted
          const initialAnswers: Record<string, string> = {}
          foundAssignment.questions.forEach((q: Question, index: number) => {
            // Use index as ID if question.id doesn't exist
            const questionId = q.id || `question-${index}`
            // Load student answers if assignment is submitted
            if (foundAssignment.status === 'submitted' && foundAssignment.studentAnswers) {
              initialAnswers[questionId] = foundAssignment.studentAnswers[questionId] || ''
            } else {
              initialAnswers[questionId] = ''
            }
          })
          setAnswers(initialAnswers)
        } else {
          setError('Không tìm thấy bài tập')
        }
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
      setError('Lỗi khi tải bài tập')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!assignment) return

    // Check if all questions are answered
    const unansweredQuestions = assignment.questions.filter((q, index) => {
      const questionId = q.id || `question-${index}`
      return !answers[questionId]?.trim()
    })
    if (unansweredQuestions.length > 0) {
      alert(`Vui lòng trả lời tất cả câu hỏi. Còn ${unansweredQuestions.length} câu chưa trả lời.`)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/student/submit-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment.assignmentId,
          studentId: user?.id,
          answers
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit assignment')
      }

      alert('✅ Đã nộp bài tập thành công!')
      router.push('/dashboard/assignments')
    } catch (error: any) {
      console.error('Error submitting assignment:', error)
      alert('Lỗi khi nộp bài tập. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'Không giới hạn'
    return new Date(deadline).toLocaleDateString('vi-VN')
  }

  const isOverdue = assignment?.deadline && 
                   new Date(assignment.deadline) < new Date() && 
                   assignment.status === 'assigned'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải bài tập...</span>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Không tìm thấy bài tập'}
        </h3>
        <Button onClick={() => router.push('/dashboard/assignments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    )
  }

  // If assignment is graded, show results instead of form
  if (assignment.status === 'graded') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/assignments')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                Kết quả: {assignment.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {assignment.subject} - {assignment.topic}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-red-600">
              {assignment.score}/10
            </div>
            <div className="text-sm text-gray-600">Điểm số</div>
          </div>
        </div>

        {/* Grade Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  Chúc mừng {(user as any)?.user_metadata?.name || (user as any)?.email || 'bạn'} đã hoàn thành bài tập!
                </h2>
                <p className="text-green-700 mt-1">
                  Bài tập đã được giáo viên chấm điểm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {assignment.feedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Nhận xét của giáo viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">{assignment.feedback}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions and Answers Review */}
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá câu trả lời</CardTitle>
            <CardDescription>
              Xem lại câu hỏi và câu trả lời của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {assignment.questions?.map((question: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Câu {index + 1}</h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Đề bài:</h5>
                    <div 
                      className="prose max-w-none bg-gray-50 p-3 rounded text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: question.question?.replace(/\n/g, '<br/>') || 'N/A'
                      }}
                    />
                  </div>
                  
                  {/* Student's Answer */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Đáp án của học sinh:</h5>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm">
                        {assignment.studentAnswers?.[question.id || `question-${index}`] || 'Chưa trả lời'}
                      </p>
                    </div>
                  </div>

                  {/* Grading Result */}
                  {assignment.status === 'graded' && assignment.score && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-1">Kết quả chấm bài:</h5>
                      <div className={`p-3 rounded ${
                        assignment.score >= 8 ? 'bg-green-50 border border-green-200' :
                        assignment.score >= 6 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {assignment.score >= 8 ? (
                            <span className="text-green-600">✓ Đúng</span>
                          ) : (
                            <span className="text-red-600">✗ Sai</span>
                          )}
                          <span className="text-sm font-medium">
                            {assignment.score >= 8 ? 'Câu trả lời đúng' : 'Câu trả lời chưa đúng'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/assignments')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              {assignment.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {assignment.subject} - {assignment.topic}
            </p>
          </div>
        </div>
        
        {isOverdue && (
          <Badge variant="destructive" className="text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Quá hạn
          </Badge>
        )}
      </div>

      {/* Assignment Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Giáo viên:</span>
              <span className="font-medium">{assignment.teacherName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Hạn nộp:</span>
              <span className="font-medium">{formatDeadline(assignment.deadline)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Số câu hỏi:</span>
              <span className="font-medium">{assignment.questions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {assignment.questions.map((question, index) => {
          const questionId = question.id || `question-${index}`
          return (
          <Card key={`question-${questionId}-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  Câu {index + 1}
                </span>
                <Badge variant="outline" className="text-xs">
                  {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 
                   question.type === 'fill_blank' ? 'Điền khuyết' : 'Tự luận'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: question.question.replace(/\n/g, '<br/>') 
                  }}
                />
              </div>

              {/* Answer Input */}
              <div className="space-y-3">
                {question.type === 'multiple_choice' && question.options && (
                  <RadioGroup
                    value={answers[questionId] || ''}
                    onValueChange={(value) => handleAnswerChange(questionId, value)}
                    className="space-y-2"
                    name={`question-${questionId}`}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={`${questionId}-option-${optionIndex}`} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`${questionId}-${optionIndex}`}
                        />
                        <Label 
                          htmlFor={`${questionId}-${optionIndex}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {(question.type === 'fill_blank' || question.type === 'essay') && (
                  <div>
                    <Textarea
                      key={`textarea-${questionId}`}
                      placeholder={
                        question.type === 'fill_blank' 
                          ? "Nhập câu trả lời của bạn..."
                          : "Viết câu trả lời chi tiết..."
                      }
                      value={answers[questionId] || ''}
                      onChange={(e) => {
                        handleAnswerChange(questionId, e.target.value)
                      }}
                      rows={question.type === 'essay' ? 6 : 3}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {/* Submit Section */}
      <Card className="sticky bottom-0 bg-white border-t-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Đã trả lời: {
                assignment.questions.filter((q, index) => {
                  const questionId = q.id || `question-${index}`
                  return answers[questionId]?.trim()
                }).length
              }/{assignment.questions.length} câu</p>
              {isOverdue && (
                <p className="text-red-600 font-medium">⚠️ Bài tập đã quá hạn nộp</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Save draft functionality
                  alert('Đã lưu bản nháp')
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang nộp...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Nộp bài
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
