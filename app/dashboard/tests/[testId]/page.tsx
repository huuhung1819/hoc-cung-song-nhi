'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  Send,
  Play
} from 'lucide-react'
// import { useAuth } from '@/lib/authContext'

interface TestQuestion {
  id: number
  type: 'multiple_choice' | 'essay'
  question: string
  options?: string[]
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

export default function TestTakingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // const { user } = useAuth()
  
  const [test, setTest] = useState<GeneratedTest | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testResults, setTestResults] = useState<{score: number, correctAnswers: number, totalQuestions: number} | null>(null)

  useEffect(() => {
    const testDataParam = searchParams.get('testData')
    if (testDataParam) {
      try {
        const testData = JSON.parse(decodeURIComponent(testDataParam))
        setTest(testData)
        // Don't start timer immediately - wait for user to start
        setTimeLeft(0)
        
        // Initialize answers
        const initialAnswers: Record<string, string> = {}
        testData.questions.forEach((q: TestQuestion) => {
          initialAnswers[q.id.toString()] = ''
        })
        setAnswers(initialAnswers)
      } catch (error) {
        console.error('Error parsing test data:', error)
        router.push('/dashboard/tests')
      }
    }
  }, [searchParams, router])

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted && test) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted, test])

  const handleStartTest = () => {
    if (test) {
      setTimeLeft(test.duration * 60) // Start timer
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const calculateScore = () => {
    if (!test) return { score: 0, correctAnswers: 0, totalQuestions: 0 }
    
    let correctAnswers = 0
    const totalQuestions = test.questions.length
    
    test.questions.forEach(question => {
      const userAnswer = answers[question.id.toString()]
      if (question.type === 'multiple_choice' && question.options) {
        // For multiple choice, check if answer matches first option (correct answer)
        if (userAnswer === question.options[0]) {
          correctAnswers++
        }
      } else if (question.type === 'essay') {
        // For essay questions, give points if not empty
        if (userAnswer && userAnswer.trim().length > 10) {
          correctAnswers++
        }
      }
    })
    
    const score = (correctAnswers / totalQuestions) * 10
    return { score, correctAnswers, totalQuestions }
  }

  const handleSubmit = async () => {
    if (isSubmitted) return
    
    setIsSubmitting(true)
    
    try {
      const { score, correctAnswers, totalQuestions } = calculateScore()
      
      // Set results and show in UI instead of alert
      setTestResults({ score, correctAnswers, totalQuestions })
      setShowResults(true)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Có lỗi xảy ra khi nộp bài!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer.trim()).length
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đề kiểm tra...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/tests')}
          className="flex items-center gap-2 text-lg px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Button>
        
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="flex items-center gap-2 text-lg px-4 py-2">
            <Clock className="w-5 h-5" />
            {timeLeft > 0 ? formatTime(timeLeft) : 'Chưa bắt đầu'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2 text-lg px-4 py-2">
            <CheckCircle className="w-5 h-5" />
            Đã trả lời: {getAnsweredCount()}/{test.questions.length}
          </Badge>
        </div>
      </div>

      {/* Test Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="w-6 h-6 text-blue-600" />
            {test.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-lg text-gray-600">
            <span>Môn: {test.subject}</span>
            <span>Lớp: {test.grade}</span>
            <span>Thời gian: {test.duration} phút</span>
            <span>Tổng điểm: {test.totalPoints}</span>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      {timeLeft === 0 && !isSubmitted && (
        <div className="text-center mb-8">
          <Button
            onClick={handleStartTest}
            size="lg"
            className="px-12 py-4 text-xl"
          >
            <Play className="w-6 h-6 mr-3" />
            Bắt đầu làm bài
          </Button>
        </div>
      )}

      {/* Questions */}
      {test && (
        <div className="space-y-8">
          {test.questions.map((question, index) => (
            <Card key={question.id} className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">
                  Câu {index + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === 'multiple_choice' && question.options ? (
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id.toString()] === option}
                          onChange={(e) => handleAnswerChange(question.id.toString(), e.target.value)}
                          disabled={isSubmitted}
                          className="w-5 h-5 text-blue-600"
                        />
                        <label className="flex-1 cursor-pointer text-lg">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Nhập câu trả lời của bạn..."
                    value={answers[question.id.toString()]}
                    onChange={(e) => handleAnswerChange(question.id.toString(), e.target.value)}
                    disabled={isSubmitted}
                    rows={6}
                    className="text-lg p-4"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {timeLeft > 0 && !isSubmitted && (
        <div className="mt-12 text-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitted || isSubmitting}
            size="lg"
            className="px-16 py-4 text-xl"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Đang nộp bài...
              </>
            ) : (
              <>
                <Send className="w-6 h-6 mr-3" />
                Nộp bài
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {showResults && testResults && (
        <div className="mt-12">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-800 flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8" />
                🎉 Bạn đã hoàn thành bài kiểm tra!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {testResults.score.toFixed(1)}/10
                  </div>
                  <div className="text-lg text-gray-600">📊 Điểm số</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {testResults.correctAnswers}/{testResults.totalQuestions}
                  </div>
                  <div className="text-lg text-gray-600">✅ Câu đúng</div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg text-gray-600">⏱️ Thời gian còn lại</div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => router.push('/dashboard/tests')}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  Quay lại danh sách
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  size="lg"
                  className="px-8 py-3"
                >
                  Làm lại bài khác
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
