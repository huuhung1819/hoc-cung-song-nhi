'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Sparkles, Download, Copy, Loader2, CheckCircle } from 'lucide-react'

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Đã copy
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
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
              <div className="space-y-6 max-h-[700px] overflow-y-auto">
                {exercises.map((exercise, idx) => (
                  <Card key={idx} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-3">
                            {exercise.question}
                          </p>

                          {exercise.type === 'multiple_choice' && (
                            <>
                              <div className="space-y-2 mb-3">
                                {exercise.options.map((opt: string, i: number) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded ${
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
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
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
    </div>
  )
}

