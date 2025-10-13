'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExerciseDisplayProps {
  subject: string
  subSubject: string
  isUnlockMode: boolean
  onGenerateExercise: (subject: string, subSubject: string) => void
}

export function ExerciseDisplay({ subject, subSubject, isUnlockMode, onGenerateExercise }: ExerciseDisplayProps) {
  const [exercise, setExercise] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateExercise = async () => {
    setIsGenerating(true)
    // Simulate AI generating exercise
    setTimeout(() => {
      const mockExercise = generateMockExercise(subject, subSubject)
      setExercise(mockExercise)
      setIsGenerating(false)
    }, 2000)
  }

  const generateMockExercise = (subject: string, subSubject: string) => {
    const exercises = {
      math: {
        'Trắc nghiệm': 'Câu 1: Kết quả của phép tính 15 + 27 là:\nA) 42\nB) 41\nC) 43\nD) 40',
        'Có lời văn': 'Bài toán: Một cửa hàng có 120 quyển vở. Ngày đầu bán được 1/3 số vở. Ngày thứ hai bán được 1/4 số vở còn lại. Hỏi cửa hàng còn lại bao nhiêu quyển vở?',
        'Cộng trừ nhân chia': 'Tính: 25 × 4 + 15 ÷ 3 - 8 = ?'
      },
      literature: {
        'Nghị luận': 'Đề bài: Em hãy viết một bài văn nghị luận về chủ đề "Tình bạn trong cuộc sống".',
        'Phân tích': 'Phân tích đoạn thơ sau: "Trăng ơi từ đâu đến? Hay từ cánh rừng xa..."',
        'Cảm thụ': 'Cảm nhận của em về hình ảnh người mẹ trong bài thơ "Mẹ ơi con yêu mẹ".',
        'Viết đoạn': 'Viết một đoạn văn ngắn (5-7 câu) tả cảnh mùa thu.'
      },
      english: {
        'Ngữ pháp': 'Chọn đáp án đúng: "She _____ to school every day."\nA) go\nB) goes\nC) going\nD) went',
        'Từ vựng': 'Điền từ thích hợp: "The weather is very _____ today. It\'s raining heavily."\nA) sunny\nB) cloudy\nC) rainy\nD) windy',
        'Đọc hiểu': 'Đọc đoạn văn sau và trả lời câu hỏi: "Tom is a student. He goes to school by bus every day..."',
        'Viết luận': 'Write a short paragraph (50-60 words) about your favorite hobby.'
      }
    }
    
    return exercises[subject]?.[subSubject] || 'Bài tập đang được tạo...'
  }

  return (
    <div className="space-y-4">
      {/* AI Active Status */}
      <div className="text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-gray-600">
          AI đã sẵn sàng hỗ trợ <strong>{subject}</strong> - <strong>{subSubject}</strong>!
        </p>
      </div>

      {/* Exercise Display */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📝 Bài tập {subject} - {subSubject}</span>
            <Button
              onClick={handleGenerateExercise}
              disabled={isGenerating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo bài tập'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exercise ? (
            <div className="bg-white p-4 rounded-lg border min-h-[200px]">
              <pre className="whitespace-pre-wrap text-gray-900 font-medium">
                {exercise}
              </pre>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border min-h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📝</div>
                <p>Nhấn "Tạo bài tập" để AI sinh bài tập cho bạn</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          {isUnlockMode ? (
            <>
              <span className="text-green-600 mr-2">✅</span>
              Có lời giải - AI sẽ đưa ra đáp án chi tiết
            </>
          ) : (
            <>
              <span className="text-yellow-600 mr-2">💡</span>
              Chỉ hướng dẫn - AI sẽ gợi ý cách làm
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleGenerateExercise}
          disabled={isGenerating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? 'Đang tạo...' : 'Tạo bài tập mới'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setExercise('')}
          disabled={!exercise}
        >
          Xóa bài tập
        </Button>
      </div>
    </div>
  )
}
