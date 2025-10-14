'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/authContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Loader2, 
  CheckCircle, 
  Edit2, 
  Save, 
  X,
  Send,
  Users
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'

const SUBJECTS = [
  { value: 'Toán', label: 'Toán học' },
  { value: 'Tiếng Việt', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Khoa học', label: 'Khoa học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' }
]

const GRADES = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12'
]

const EXERCISE_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'fill_blank', label: 'Điền vào chỗ trống' },
  { value: 'essay', label: 'Tự luận' },
  { value: 'mixed', label: 'Hỗn hợp' }
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ (Cơ bản)' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó (Nâng cao)' }
]

export default function ExerciseGeneratorPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [topic, setTopic] = useState('')
  const [exerciseType, setExerciseType] = useState('multiple_choice')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState('5')
  const [exercises, setExercises] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedQuestion, setEditedQuestion] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDeadline, setAssignmentDeadline] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  
  // Real data from API
  const [students, setStudents] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)

  // Fetch students from API
  useEffect(() => {
    if (user?.id) {
      loadStudents()
    }
  }, [user])

  const loadStudents = async () => {
    setIsLoadingStudents(true)
    try {
      // Fetch teacher's students with cache busting
      const response = await fetch(`/api/admin/teacher-students?teacherId=${user?.id}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        // Map relationships to student objects
        const studentsList = data.relationships.map((rel: any) => ({
          id: rel.student_id,
          name: rel.student?.name || rel.student?.email || 'Unknown',
          grade: rel.student?.grade || 'Chưa xác định'
        }))
        setStudents(studentsList)
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleGenerate = async () => {
    if (!subject || !grade || !topic) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsGenerating(true)
    setError('')
    setExercises([])

    try {
      const response = await fetch('/api/teacher/generate-exercises-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          exerciseType,
          difficulty,
          count: parseInt(count)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo bài tập')
      }

      setExercises(data.exercises)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo bài tập')
    } finally {
      setIsGenerating(false)
    }
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditedQuestion(exercises[index].question)
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedExercises = [...exercises]
      updatedExercises[editingIndex] = {
        ...updatedExercises[editingIndex],
        question: editedQuestion
      }
      setExercises(updatedExercises)
      setEditingIndex(null)
      setEditedQuestion('')
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditedQuestion('')
  }

  const handleStudentSelect = (studentId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedStudents(prev => [...prev, studentId])
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId))
    }
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedStudents(students.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const openAssignModal = () => {
    setAssignmentTitle(`Bài tập ${subject} - ${topic}`)
    setAssignmentDeadline('')
    setSelectedStudents([])
    setShowAssignModal(true)
  }

  const handleAssignExercises = async () => {
    if (!assignmentTitle || !assignmentDeadline || selectedStudents.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất một học sinh')
      return
    }

    setIsAssigning(true)

    try {
      // Chuẩn bị data: BỎ đáp án trước khi giao cho học sinh
      const exercisesForStudents = exercises.map(ex => {
        const questionOnly: any = {
          question: ex.question,
          type: ex.type
        }

        // Nếu là trắc nghiệm, giữ lại các options nhưng BỎ correctAnswer và explanation
        if (ex.type === 'multiple_choice') {
          questionOnly.options = ex.options
        }

        // BỎ hết đáp án, explanation, hints, sampleAnswer
        // Chỉ giữ lại câu hỏi thuần túy

        return questionOnly
      })

      // Data để lưu (bao gồm cả đáp án cho giáo viên)
      const assignmentData = {
        title: assignmentTitle,
        subject,
        grade,
        topic,
        deadline: assignmentDeadline,
        studentIds: selectedStudents,
        // Câu hỏi cho học sinh (KHÔNG có đáp án)
        questionsForStudents: exercisesForStudents,
        // Câu hỏi + đáp án đầy đủ cho giáo viên
        questionsWithAnswers: exercises,
        createdAt: new Date().toISOString()
      }

      // Gọi API để lưu assignment
      const response = await fetch('/api/teacher/create-assignment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '' // Pass user ID for RLS
        },
        body: JSON.stringify(assignmentData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create assignment')
      }

      alert(`✅ Đã giao bài tập cho ${selectedStudents.length} học sinh!\n\n📝 Học sinh sẽ chỉ thấy câu hỏi, KHÔNG có đáp án.\n👨‍🏫 Giáo viên có đầy đủ đáp án để chấm bài.`)
      setShowAssignModal(false)
      setSelectedStudents([])
      setAssignmentTitle('')
      setAssignmentDeadline('')
    } catch (error) {
      alert('Có lỗi khi giao bài tập. Vui lòng thử lại.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDownload = () => {
    let content = `# Bài tập ${subject} - ${topic}\n`
    content += `**Lớp:** ${grade}\n`
    content += `**Độ khó:** ${DIFFICULTIES.find(d => d.value === difficulty)?.label}\n\n`

    exercises.forEach((ex, idx) => {
      content += `## Câu ${idx + 1}\n\n`
      content += `${ex.question}\n\n`

      if (ex.type === 'multiple_choice') {
        ex.options.forEach((opt: string, i: number) => {
          content += `${String.fromCharCode(65 + i)}. ${opt}\n`
        })
        content += `\n**Đáp án:** ${ex.correctAnswer}\n`
        content += `**Giải thích:** ${ex.explanation}\n\n`
      } else if (ex.type === 'fill_blank') {
        content += `**Đáp án:** ${ex.correctAnswer}\n`
        content += `**Giải thích:** ${ex.explanation}\n\n`
      } else if (ex.type === 'essay') {
        content += `**Gợi ý:** ${ex.hints}\n\n`
        content += `**Đáp án mẫu:** ${ex.sampleAnswer}\n\n`
      }

      content += '---\n\n'
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Bai-tap-${subject}-${topic}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    let content = `Bài tập ${subject} - ${topic}\n\n`
    
    exercises.forEach((ex, idx) => {
      content += `Câu ${idx + 1}: ${ex.question}\n`
      if (ex.type === 'multiple_choice') {
        ex.options.forEach((opt: string, i: number) => {
          content += `${String.fromCharCode(65 + i)}. ${opt}\n`
        })
      }
      content += '\n'
    })

    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-green-600" />
          Sinh Bài tập
        </h1>
        <p className="text-gray-600 mt-1">
          AI tạo bài tập với nhiều dạng và độ khó khác nhau
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cấu hình bài tập</CardTitle>
            <CardDescription>
              Tùy chỉnh để tạo bài tập phù hợp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label>Môn học *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label>Lớp *</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Exercise Type */}
            <div className="space-y-2">
              <Label>Loại bài tập</Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-2">
              <Label>Số lượng câu hỏi</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo bài tập
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bài tập đã tạo</CardTitle>
                <CardDescription>
                  {exercises.length > 0 && `${exercises.length} câu hỏi`}
                </CardDescription>
              </div>
              {exercises.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-600" />
                        <span className="text-xs md:text-sm">Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="text-xs md:text-sm">Copy</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">Tải về</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={openAssignModal}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">Giao bài tập</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!exercises.length && !isGenerating && (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Bài tập sẽ hiển thị ở đây sau khi tạo</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-green-600" />
                <p className="text-gray-600">AI đang tạo bài tập...</p>
              </div>
            )}

            {exercises.length > 0 && (
              <div className="space-y-4 md:space-y-6 max-h-[700px] overflow-y-auto">
                {exercises.map((exercise, idx) => (
                  <Card key={idx} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm md:text-base">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Question - editable or display mode */}
                          {editingIndex === idx ? (
                            <div className="mb-3 space-y-2">
                              <Textarea
                                value={editedQuestion}
                                onChange={(e) => setEditedQuestion(e.target.value)}
                                className="text-sm md:text-base"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={saveEdit}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between mb-2 md:mb-3">
                              <p className="font-medium text-gray-900 text-sm md:text-base flex-1">
                                {exercise.question}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(idx)}
                                className="ml-2 flex-shrink-0"
                              >
                                <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                              </Button>
                            </div>
                          )}

                          {exercise.type === 'multiple_choice' && (
                            <>
                              <div className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                                {exercise.options.map((opt: string, i: number) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded text-sm md:text-base ${
                                      String.fromCharCode(65 + i) === exercise.correctAnswer
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + i)}.
                                    </span>{' '}
                                    {opt}
                                  </div>
                                ))}
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-2 md:p-3 text-xs md:text-sm">
                                <p className="font-semibold text-blue-900 mb-1">
                                  Đáp án: {exercise.correctAnswer}
                                </p>
                                <p className="text-blue-700">{exercise.explanation}</p>
                              </div>
                            </>
                          )}

                          {exercise.type === 'fill_blank' && (
                            <>
                              <div className="bg-green-50 border border-green-200 rounded p-3 mb-2 text-sm">
                                <p className="font-semibold text-green-900">
                                  Đáp án: {exercise.correctAnswer}
                                </p>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                <p className="text-blue-700">{exercise.explanation}</p>
                              </div>
                            </>
                          )}

                          {exercise.type === 'essay' && (
                            <>
                              {exercise.hints && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2 text-sm">
                                  <p className="font-semibold text-yellow-900 mb-1">
                                    Gợi ý:
                                  </p>
                                  <p className="text-yellow-700">{exercise.hints}</p>
                                </div>
                              )}
                              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                                <p className="font-semibold text-green-900 mb-1">
                                  Đáp án mẫu:
                                </p>
                                <p className="text-green-700 whitespace-pre-line">
                                  {exercise.sampleAnswer}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Giao bài tập cho học sinh
            </DialogTitle>
            <DialogDescription>
              Chọn học sinh và thiết lập thông tin bài tập
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Assignment Title */}
            <div className="space-y-2">
              <Label>Tiêu đề bài tập *</Label>
              <Input
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Ví dụ: Bài tập Toán - Phép cộng"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label>Hạn nộp *</Label>
              <Input
                type="datetime-local"
                value={assignmentDeadline}
                onChange={(e) => setAssignmentDeadline(e.target.value)}
              />
            </div>

            {/* Student Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Chọn học sinh ({selectedStudents.length}/{students.length})</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadStudents}
                    disabled={isLoadingStudents}
                    className="text-xs"
                  >
                    {isLoadingStudents ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      '🔄'
                    )}
                  </Button>
                  <Checkbox
                    id="select-all"
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm cursor-pointer">
                    Chọn tất cả
                  </label>
                </div>
              </div>

              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {isLoadingStudents ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Đang tải danh sách học sinh...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Chưa có học sinh nào trong lớp</p>
                    <p className="text-xs text-gray-500">Liên hệ admin để thêm học sinh</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) =>
                          handleStudentSelect(student.id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="flex-1 flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.grade}</p>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Tóm tắt:</strong> Giao {exercises.length} câu hỏi cho {selectedStudents.length} học sinh
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(false)}
              disabled={isAssigning}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignExercises}
              disabled={isAssigning || selectedStudents.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang giao...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Giao bài tập
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

