'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PenTool, Sparkles, Download, Save, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const SUBJECTS = [
  { value: 'Toán', label: 'Toán học' },
  { value: 'Tiếng Việt', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Khoa học', label: 'Khoa học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'Công nghệ', label: 'Công nghệ' },
  { value: 'Mỹ thuật', label: 'Mỹ thuật' },
  { value: 'Âm nhạc', label: 'Âm nhạc' },
  { value: 'Thể dục', label: 'Thể dục' }
]

const GRADES = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12'
]

const DURATIONS = [
  { value: '1 tiết (45 phút)', label: '1 tiết (45 phút)' },
  { value: '2 tiết (90 phút)', label: '2 tiết (90 phút)' },
  { value: '3 tiết (135 phút)', label: '3 tiết (135 phút)' }
]

export default function LessonPlannerPage() {
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('1 tiết (45 phút)')
  const [lessonPlan, setLessonPlan] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!subject || !grade || !topic) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsGenerating(true)
    setError('')
    setLessonPlan('')

    try {
      const response = await fetch('/api/teacher/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          duration
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo giáo án')
      }

      setLessonPlan(data.lessonPlan)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo giáo án')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([lessonPlan], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Giao-an-${subject}-${topic}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    // TODO: Implement save to database
    alert('Chức năng lưu vào hệ thống sẽ được cập nhật sau!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <PenTool className="w-8 h-8 text-blue-600" />
          Soạn Giáo án
        </h1>
        <p className="text-gray-600 mt-1">
          AI hỗ trợ tạo giáo án chi tiết theo chương trình Bộ GD&ĐT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài học</CardTitle>
            <CardDescription>
              Điền thông tin để AI tạo giáo án phù hợp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Môn học *</Label>
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
              <Label htmlFor="grade">Lớp *</Label>
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
              <Label htmlFor="topic">Chủ đề bài học *</Label>
              <Input
                id="topic"
                placeholder="Ví dụ: Phép cộng trong phạm vi 20"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Thời lượng</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo giáo án...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo giáo án với AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Giáo án</CardTitle>
                <CardDescription>
                  Xem trước và chỉnh sửa giáo án
                </CardDescription>
              </div>
              {lessonPlan && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!lessonPlan && !isGenerating && (
              <div className="text-center py-12 text-gray-400">
                <PenTool className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Giáo án sẽ hiển thị ở đây sau khi tạo</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">AI đang soạn giáo án cho bạn...</p>
              </div>
            )}

            {lessonPlan && (
              <div className="prose prose-sm max-w-none">
                <Textarea
                  value={lessonPlan}
                  onChange={(e) => setLessonPlan(e.target.value)}
                  className="min-h-[600px] font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Markdown Preview */}
      {lessonPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Xem trước (Markdown)</CardTitle>
            <CardDescription>
              Định dạng giáo án sau khi xuất ra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg">
              <ReactMarkdown>{lessonPlan}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

