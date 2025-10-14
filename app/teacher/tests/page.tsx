'use client'

import { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'

const SUBJECTS = [
  { value: 'Toán', label: 'Toán học' },
  { value: 'Tiếng Việt', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Khoa học', label: 'Khoa học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' }
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
    description: '20 câu hỗn hợp',
    duration: '45 phút',
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: '90min', 
    label: 'Kiểm tra 2 tiết',
    description: '30 câu hỗn hợp',
    duration: '90 phút',
    color: 'bg-orange-100 text-orange-800'
  },
  { 
    value: 'semester', 
    label: 'Thi học kỳ',
    description: '40 câu hỗn hợp',
    duration: '135 phút',
    color: 'bg-red-100 text-red-800'
  }
]

const DIFFICULTIES = [
  { value: 'easy', label: 'Dễ (Cơ bản)', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Khó (Nâng cao)', color: 'bg-red-100 text-red-800' }
]

export default function TestsPage() {
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [testType, setTestType] = useState('15min')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [test, setTest] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!subject || !grade || !topic) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsGenerating(true)
    setError('')
    setTest(null)

    try {
      const response = await fetch('/api/teacher/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          grade,
          testType,
          topic,
          difficulty
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo đề kiểm tra')
      }

      setTest(data.test)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo đề kiểm tra')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!test) return

    let content = `# ${test.title}\n\n`
    content += `**Môn học:** ${test.subject}\n`
    content += `**Lớp:** ${test.grade}\n`
    content += `**Thời gian:** ${test.duration}\n`
    content += `**Điểm tối đa:** ${test.totalPoints} điểm\n\n`
    
    content += `## Hướng dẫn làm bài\n`
    content += `${test.instructions}\n\n`

    content += `## Đề bài\n\n`

    // Group questions by type
    const multipleChoice = test.questions.filter((q: any) => q.type === 'multiple_choice')
    const essay = test.questions.filter((q: any) => q.type === 'essay')

    if (multipleChoice.length > 0) {
      content += `### I. TRẮC NGHIỆM (${multipleChoice.reduce((sum: number, q: any) => sum + q.points, 0)} điểm)\n\n`
      multipleChoice.forEach((question: any, idx: number) => {
        content += `**Câu ${idx + 1}:** ${question.question}\n\n`
        question.options.forEach((opt: string, i: number) => {
          content += `${String.fromCharCode(65 + i)}. ${opt}\n`
        })
        content += '\n'
      })
    }

    if (essay.length > 0) {
      content += `### II. TỰ LUẬN (${essay.reduce((sum: number, q: any) => sum + q.points, 0)} điểm)\n\n`
      essay.forEach((question: any, idx: number) => {
        content += `**Câu ${idx + multipleChoice.length + 1}:** ${question.question} (${question.points} điểm)\n\n`
      })
    }

    content += `## ĐÁP ÁN\n\n`
    test.answers.forEach((answer: string, idx: number) => {
      content += `${idx + 1}. ${answer}\n`
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `De-kiem-tra-${test.subject}-${test.testType}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedTestType = TEST_TYPES.find(t => t.value === testType)
  const selectedDifficulty = DIFFICULTIES.find(d => d.value === difficulty)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-8 h-8 text-indigo-600" />
          Bài kiểm tra
        </h1>
        <p className="text-gray-600 mt-1">
          Tạo đề kiểm tra với nhiều định dạng và thời gian khác nhau
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cấu hình đề kiểm tra</CardTitle>
            <CardDescription>
              Chọn loại kiểm tra và thông tin đề bài
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

            {/* Test Type */}
            <div className="space-y-2">
              <Label>Loại kiểm tra *</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEST_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <span>{t.label}</span>
                        <Badge className={t.color}>{t.duration}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label>Chủ đề kiểm tra *</Label>
              <Input
                placeholder="Ví dụ: Phép cộng, trừ trong phạm vi 100"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
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
                      <div className="flex items-center gap-2">
                        <span>{d.label}</span>
                        <Badge className={d.color}>Độ khó</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Type Info */}
            {selectedTestType && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm md:text-base">{selectedTestType.label}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{selectedTestType.description}</p>
                <p className="text-xs text-gray-500 mt-1">Thời gian: {selectedTestType.duration}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo đề...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo đề kiểm tra
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
                <CardTitle>Đề kiểm tra đã tạo</CardTitle>
                <CardDescription>
                  {test && `${test.questions.length} câu hỏi - ${test.totalPoints} điểm`}
                </CardDescription>
              </div>
              {test && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải về
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!test && !isGenerating && (
              <div className="text-center py-12 text-gray-400">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Đề kiểm tra sẽ hiển thị ở đây sau khi tạo</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-indigo-600" />
                <p className="text-gray-600">AI đang tạo đề kiểm tra...</p>
              </div>
            )}

            {test && (
              <div className="space-y-6 max-h-[700px] overflow-y-auto">
                {/* Test Header */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 md:p-4">
                  <h3 className="text-lg md:text-xl font-bold text-indigo-900 mb-2">{test.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Môn: {test.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Lớp: {test.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Thời gian: {test.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      <span>Điểm: {test.totalPoints}/10</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-sm text-gray-700">{test.instructions}</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {test.questions.map((question: any, idx: number) => (
                    <Card key={idx} className="border-l-4 border-l-indigo-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {question.question}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {question.points} điểm
                              </Badge>
                            </div>

                            {question.type === 'multiple_choice' && (
                              <div className="space-y-2">
                                {question.options.map((opt: string, i: number) => (
                                  <div
                                    key={i}
                                    className="p-2 rounded bg-gray-50 border"
                                  >
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + i)}.
                                    </span>{' '}
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.type === 'essay' && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-blue-700">
                                  <strong>Yêu cầu:</strong> Trình bày chi tiết, rõ ràng
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Answers */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Đáp án</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {test.answers.map((answer: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <span className="font-medium text-green-700">{idx + 1}.</span>
                          <span className="text-gray-700">{answer}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

