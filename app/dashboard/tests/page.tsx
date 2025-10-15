'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/authContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardCheck, 
  Sparkles, 
  Download, 
  Clock, 
  FileText, 
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Play
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
  { value: 'Toán', label: 'Toán' },
  { value: 'Văn', label: 'Văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' }
]

const GRADES = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12'
]

const TEST_TYPES = [
  { 
    value: '15min', 
    label: 'Kiểm tra 15 phút',
    description: '10 câu trắc nghiệm',
    duration: '15 phút',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: '45min', 
    label: 'Kiểm tra 1 tiết',
    description: '20 câu trắc nghiệm + 2 câu tự luận',
    duration: '45 phút',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: '90min', 
    label: 'Kiểm tra giữa kỳ',
    description: '30 câu trắc nghiệm + 3 câu tự luận',
    duration: '90 phút',
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    value: '120min', 
    label: 'Kiểm tra cuối kỳ',
    description: '40 câu trắc nghiệm + 4 câu tự luận',
    duration: '120 phút',
    color: 'bg-red-100 text-red-800'
  }
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Dễ', description: 'Kiến thức cơ bản', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Trung bình', description: 'Kiến thức nâng cao', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Khó', description: 'Kiến thức chuyên sâu', color: 'bg-red-100 text-red-800' }
]

interface TestQuestion {
  id: string
  type: 'multiple_choice' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  points: number
}

interface GeneratedTest {
  id: string
  title: string
  subject: string
  grade: string
  testType: string
  difficulty: string
  duration: number
  questions: TestQuestion[]
  totalPoints: number
  createdAt: Date
}

export default function TestsPage() {
  const { user } = useAuth()
  const [isLocked, setIsLocked] = useState(true)
  const [unlockCode, setUnlockCode] = useState('')
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  const [subject, setSubject] = useState('Toán')
  const [grade, setGrade] = useState('Lớp 1')
  const [testType, setTestType] = useState('15min')
  const [difficulty, setDifficulty] = useState('medium')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTests, setGeneratedTests] = useState<GeneratedTest[]>([])

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

  const handleGenerateTest = async () => {
    if (!subject || !grade || !testType) {
      alert('Vui lòng điền đầy đủ thông tin môn học, lớp và loại kiểm tra!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/teacher/generate-test-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          testType,
          difficulty,
          customPrompt,
          userGrade: grade
        })
      })

      const data = await response.json()
      if (data.success) {
        const questions = data.test?.questions || data.questions || []
        const newTest: GeneratedTest = {
          id: Date.now().toString(),
          title: `${subject} - ${testType}`,
          subject,
          grade,
          testType,
          difficulty,
          duration: parseInt(TEST_TYPES.find(t => t.value === testType)?.duration || '15'),
          questions: questions,
          totalPoints: questions.reduce((sum: number, q: TestQuestion) => sum + (q.points || 1), 0),
          createdAt: new Date()
        }
        setGeneratedTests(prev => [newTest, ...prev])
      } else {
        alert('Lỗi khi sinh đề kiểm tra: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating test:', error)
      alert('Lỗi khi sinh đề kiểm tra!')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadTest = (test: GeneratedTest) => {
    const content = `
ĐỀ KIỂM TRA ${test.title.toUpperCase()}
Môn: ${test.subject} - Lớp: ${test.grade}
Thời gian: ${test.duration} phút
Tổng điểm: ${test.totalPoints} điểm

${test.questions.map((question, index) => `
Câu ${index + 1} (${question.points} điểm): ${question.question}
${question.options ? question.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n') : ''}
Đáp án: ${question.correctAnswer}
${question.explanation ? `Giải thích: ${question.explanation}` : ''}
---
`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `de-kiem-tra-${test.subject.toLowerCase()}-${test.testType}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTestTypeInfo = (type: string) => {
    return TEST_TYPES.find(t => t.value === type) || TEST_TYPES[0]
  }

  const getDifficultyInfo = (level: string) => {
    return DIFFICULTY_LEVELS.find(d => d.value === level) || DIFFICULTY_LEVELS[1]
  }

  const handleTakeTest = (test: GeneratedTest) => {
    // Navigate to test taking page
    window.open(`/dashboard/tests/${test.id}?testData=${encodeURIComponent(JSON.stringify(test))}`, '_blank')
  }

  if (isLocked) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔒 Bài Kiểm Tra
          </h2>
          <p className="text-gray-600 mb-6">
            Tính năng này chỉ dành cho phụ huynh. Vui lòng nhập mã mở khóa lời giải để sử dụng.
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
                Phụ huynh nhập mã mở khóa lời giải để mở khóa bài kiểm tra.
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
            📝 Tạo Bài Kiểm Tra
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo đề kiểm tra tự động với nhiều loại và độ khó khác nhau
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

      {/* Test Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            Tạo Đề Kiểm Tra Mới
          </CardTitle>
          <CardDescription>
            Chọn thông tin để AI tạo đề kiểm tra phù hợp
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
              <Select value={grade} onValueChange={setGrade} disabled>
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
              <p className="text-sm text-gray-500 mt-1">Lớp được cố định theo thông tin tài khoản</p>
            </div>

            <div>
              <Label htmlFor="testType">Loại kiểm tra</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại kiểm tra" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {testType && (
              <div>
                <Label>Thông tin kiểm tra</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {getTestTypeInfo(testType).duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getTestTypeInfo(testType).description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="customPrompt">Yêu cầu đặc biệt (tùy chọn)</Label>
            <Input
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ví dụ: Tập trung vào chương 3, có hình ảnh minh họa..."
            />
          </div>

          <Button 
            onClick={handleGenerateTest}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo đề kiểm tra...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Tạo Đề Kiểm Tra
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Tests */}
      {generatedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Đề Kiểm Tra Đã Tạo ({generatedTests.length} đề)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedTests.map((test) => (
              <div key={test.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      <Badge className={getTestTypeInfo(test.testType).color}>
                        {getTestTypeInfo(test.testType).label}
                      </Badge>
                      <Badge className={getDifficultyInfo(test.difficulty).color}>
                        {getDifficultyInfo(test.difficulty).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.duration} phút
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {test.questions.length} câu
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {test.totalPoints} điểm
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {test.grade}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTakeTest(test)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Làm bài
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTest(test)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tải về
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {test.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="text-sm p-3 bg-gray-50 rounded">
                      <div className="font-medium mb-1">
                        Câu {index + 1} ({question.points} điểm)
                      </div>
                      <div className="text-gray-700 mb-2">{question.question}</div>
                      {question.options && (
                        <div className="text-gray-600">
                          {question.options.slice(0, 2).map((opt, optIndex) => (
                            <div key={optIndex}>
                              {String.fromCharCode(65 + optIndex)}. {opt}
                            </div>
                          ))}
                          {question.options.length > 2 && (
                            <div>...</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {test.questions.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... và {test.questions.length - 3} câu khác
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
