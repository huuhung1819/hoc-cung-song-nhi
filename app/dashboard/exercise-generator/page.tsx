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
  Users,
  Lock,
  Unlock
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
  { value: 'fill_blank', label: 'Điền từ' },
  { value: 'essay', label: 'Tự luận' }
]

interface Exercise {
  id: string
  type: string
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

interface Student {
  id: string
  name: string
  email: string
}

export default function ExerciseGeneratorPage() {
  const { user } = useAuth()
  const [isLocked, setIsLocked] = useState(true)
  const [unlockCode, setUnlockCode] = useState('')
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [topic, setTopic] = useState('')
  const [exerciseType, setExerciseType] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([])
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadUserGrade()
    }
  }, [user?.id])

  // Auto-lock after 15 minutes of inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const fifteenMinutes = 15 * 60 * 1000 // 15 minutes in milliseconds
      
      if (!isLocked && timeSinceLastActivity > fifteenMinutes) {
        setIsLocked(true)
      }
    }

    const interval = setInterval(checkInactivity, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isLocked, lastActivity])

  // Update activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())
    
    window.addEventListener('click', updateActivity)
    window.addEventListener('keypress', updateActivity)
    
    return () => {
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('keypress', updateActivity)
    }
  }, [])

  const loadUserGrade = async () => {
    try {
      const response = await fetch(`/api/user/profile?userId=${user?.id}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user?.grade) {
          setGrade(data.user.grade)
        }
      }
    } catch (error) {
      console.error('Error loading user grade:', error)
    }
  }

  const handleUnlock = () => {
    // Check if unlock code is correct (same as unlock code for solutions)
    const correctUnlockCode = localStorage.getItem('unlockCode') || '1234'
    if (unlockCode === correctUnlockCode) {
      setIsLocked(false)
      setShowUnlockDialog(false)
      setUnlockCode('')
      setLastActivity(Date.now()) // Reset activity timer
    } else {
      alert('Mã mở khóa không đúng!')
    }
  }

  const handleLock = () => {
    setIsLocked(true)
    setLastActivity(Date.now())
  }

  const handleGenerateExercises = async () => {
    if (!subject || !grade || !topic) {
      alert('Vui lòng điền đầy đủ thông tin môn học, lớp và chủ đề!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          exerciseType,
          questionCount,
          difficulty,
          customPrompt,
          userGrade: grade
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedExercises(data.exercises || [])
      } else {
        alert('Lỗi khi sinh bài tập: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating exercises:', error)
      alert('Lỗi khi sinh bài tập!')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (editingExercise) {
      setGeneratedExercises(prev => 
        prev.map(ex => ex.id === editingExercise.id ? editingExercise : ex)
      )
      setIsEditing(false)
      setEditingExercise(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingExercise(null)
  }

  const handleCopyExercise = (exercise: Exercise) => {
    const exerciseText = `
Câu hỏi: ${exercise.question}
${exercise.options ? exercise.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') : ''}
Đáp án: ${exercise.correctAnswer}
${exercise.explanation ? `Giải thích: ${exercise.explanation}` : ''}
    `.trim()
    
    navigator.clipboard.writeText(exerciseText)
    alert('Đã copy bài tập!')
  }

  const handleDownloadExercises = () => {
    const content = generatedExercises.map((exercise, index) => `
Câu ${index + 1}: ${exercise.question}
${exercise.options ? exercise.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') : ''}
Đáp án: ${exercise.correctAnswer}
${exercise.explanation ? `Giải thích: ${exercise.explanation}` : ''}
---
    `).join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bai-tap-${subject}-${topic}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLocked) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔒 Sinh Bài Tập
          </h2>
          <p className="text-gray-600 mb-6">
            Tính năng này chỉ dành cho phụ huynh. Vui lòng nhập mã mở khóa để sử dụng.
          </p>
          <Button 
            onClick={() => setShowUnlockDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Nhập Mã Mở Khóa
          </Button>
        </div>

        <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nhập Mã Mở Khóa</DialogTitle>
              <DialogDescription>
                Phụ huynh nhập mã mở khóa lời giải để mở khóa sinh bài tập.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="unlockCode">Mã mở khóa</Label>
                <Input
                  id="unlockCode"
                  type="password"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value)}
                  placeholder="Nhập mã mở khóa"
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleUnlock}>
                Mở Khóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Sinh Bài Tập AI
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo bài tập tự động theo chủ đề và độ khó
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLock}
          className="flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Đóng Khóa
        </Button>
      </div>

      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Tạo Bài Tập Mới
          </CardTitle>
          <CardDescription>
            Điền thông tin để AI sinh bài tập phù hợp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subject">Môn học</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">Lớp</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">Chủ đề</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Phép cộng, Từ vựng..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exerciseType">Loại bài tập</Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại bài tập" />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="questionCount">Số câu hỏi</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="customPrompt">Yêu cầu đặc biệt (tùy chọn)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ví dụ: Tập trung vào phép nhân 2 chữ số, có hình ảnh minh họa..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateExercises}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang sinh bài tập...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Sinh Bài Tập
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Exercises */}
      {generatedExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Bài Tập Đã Sinh ({generatedExercises.length} câu)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadExercises}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải về
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedExercises.map((exercise, index) => (
              <div key={exercise.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold">Câu {index + 1}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditExercise(exercise)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyExercise(exercise)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Câu hỏi:</Label>
                    <p className="mt-1 text-sm">{exercise.question}</p>
                  </div>

                  {exercise.options && exercise.options.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Lựa chọn:</Label>
                      <div className="mt-1 space-y-1">
                        {exercise.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-sm">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Đáp án:</Label>
                    <p className="mt-1 text-sm font-medium text-green-600">
                      {exercise.correctAnswer}
                    </p>
                  </div>

                  {exercise.explanation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Giải thích:</Label>
                      <p className="mt-1 text-sm text-gray-700">{exercise.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Bài Tập</DialogTitle>
          </DialogHeader>
          {editingExercise && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editQuestion">Câu hỏi</Label>
                <Textarea
                  id="editQuestion"
                  value={editingExercise.question}
                  onChange={(e) => setEditingExercise({
                    ...editingExercise,
                    question: e.target.value
                  })}
                  rows={3}
                />
              </div>

              {editingExercise.options && (
                <div>
                  <Label>Lựa chọn</Label>
                  <div className="space-y-2 mt-2">
                    {editingExercise.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="w-6 text-sm font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingExercise.options!]
                            newOptions[index] = e.target.value
                            setEditingExercise({
                              ...editingExercise,
                              options: newOptions
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="editAnswer">Đáp án</Label>
                <Input
                  id="editAnswer"
                  value={editingExercise.correctAnswer}
                  onChange={(e) => setEditingExercise({
                    ...editingExercise,
                    correctAnswer: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="editExplanation">Giải thích</Label>
                <Textarea
                  id="editExplanation"
                  value={editingExercise.explanation || ''}
                  onChange={(e) => setEditingExercise({
                    ...editingExercise,
                    explanation: e.target.value
                  })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
