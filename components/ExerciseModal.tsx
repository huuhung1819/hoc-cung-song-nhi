'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  BookOpen, 
  PenTool, 
  Lightbulb, 
  Lock, 
  CheckCircle,
  Clock,
  Star,
  Send,
  Bot,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/authContext'
import confetti from 'canvas-confetti'

interface Exercise {
  id: string
  title: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  estimatedTime: number
  questionCount: number
  points: number
  questions: {
    id: string
    question: string
    type: 'multiple_choice' | 'text' | 'calculation'
    options?: string[]
    correctAnswer?: string
  }[]
}

interface ExerciseModalProps {
  exercise: Exercise | null
  allExercises?: Exercise[]
  isOpen: boolean
  onClose: () => void
  onSaveAnswer: (exerciseId: string, answers: Record<string, string>) => void
}

export function ExerciseModal({ exercise, allExercises = [], isOpen, onClose, onSaveAnswer }: ExerciseModalProps) {
  const { user } = useAuth()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  // Bỏ currentQuestionIndex vì mỗi bài chỉ có 1 câu
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({}) // exerciseId -> questionId -> answer
  const [userAnswer, setUserAnswer] = useState('')
  const [isAIHelping, setIsAIHelping] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showAIResponse, setShowAIResponse] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Track số lần thử sai cho mỗi bài
  const [exerciseAttempts, setExerciseAttempts] = useState<Record<string, number>>({})
  // Track kết quả submit (đúng/sai)
  const [submitResults, setSubmitResults] = useState<Record<string, 'correct' | 'incorrect' | null>>({})

  if (!exercise) return null

  // Use all exercises if provided, otherwise just the single exercise
  const exercises = allExercises.length > 0 ? allExercises : [exercise]
  const currentExercise = exercises[currentExerciseIndex]
  const currentQuestion = currentExercise.questions[0] // Mỗi bài chỉ có 1 câu (index 0)
  const isLastExercise = currentExerciseIndex === exercises.length - 1
  const isFirstExercise = currentExerciseIndex === 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ'
      case 'medium':
        return 'Trung bình'
      case 'hard':
        return 'Khó'
      default:
        return difficulty
    }
  }

  const handleAnswerChange = (answer: string) => {
    setUserAnswer(answer)
    setAnswers(prev => ({
      ...prev,
      [currentExercise.id]: {
        ...(prev[currentExercise.id] || {}),
        [currentQuestion.id]: answer
      }
    }))
    
    // Clear previous submit result when user changes answer
    setSubmitResults(prev => ({ ...prev, [currentExercise.id]: null }))
  }
  
  // Check đáp án khi học sinh submit
  const handleCheckAnswer = () => {
    const currentAnswer = userAnswer.trim()
    
    if (!currentAnswer) {
      alert('Vui lòng nhập đáp án trước khi kiểm tra!')
      return
    }
    
    const correctAnswer = currentQuestion.correctAnswer || ''
    
    // Normalize để so sánh (bỏ khoảng trắng, lowercase)
    const isCorrect = currentAnswer.toLowerCase() === correctAnswer.trim().toLowerCase()
    
              if (isCorrect) {
                setSubmitResults(prev => ({ ...prev, [currentExercise.id]: 'correct' }))
                // Reset attempts khi đúng
                setExerciseAttempts(prev => ({ ...prev, [currentExercise.id]: 0 }))
                
                // 🎉 PHÁO HOA NHẸ NHÀNG Ở GIỮA!
                confetti({
                  particleCount: 30,
                  spread: 60,
                  origin: { x: 0.5, y: 0.7 }, // Bắn từ giữa màn hình, hơi thấp
                  colors: ['#fca5a5', '#f87171', '#ef4444'], // Màu đỏ nhạt
                  gravity: 0.8, // Rơi chậm hơn
                  ticks: 200, // Bay lâu hơn
                  scalar: 0.8 // Kích thước nhỏ hơn
                })
    } else {
      setSubmitResults(prev => ({ ...prev, [currentExercise.id]: 'incorrect' }))
      // Tăng số lần thử
      const newAttempts = (exerciseAttempts[currentExercise.id] || 0) + 1
      setExerciseAttempts(prev => ({ ...prev, [currentExercise.id]: newAttempts }))
    }
  }

  const handleNextExercise = () => {
    // Check if current question is answered
    const currentExerciseAnswers = answers[currentExercise.id] || {}
    if (!currentExerciseAnswers[currentQuestion.id] || currentExerciseAnswers[currentQuestion.id].trim() === '') {
      alert('Vui lòng trả lời bài hiện tại trước khi chuyển sang bài tiếp theo!')
      return
    }
    
    // Chuyển sang bài tiếp theo (mỗi bài chỉ có 1 câu)
    if (!isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1)
      const nextExercise = exercises[currentExerciseIndex + 1]
      const nextExerciseAnswers = answers[nextExercise.id] || {}
      setUserAnswer(nextExerciseAnswers[nextExercise.questions[0]?.id] || '')
    }
  }

  const handlePrevExercise = () => {
    // Chuyển sang bài trước (mỗi bài chỉ có 1 câu)
    if (!isFirstExercise) {
      setCurrentExerciseIndex(prev => prev - 1)
      const prevExercise = exercises[currentExerciseIndex - 1]
      const prevExerciseAnswers = answers[prevExercise.id] || {}
      setUserAnswer(prevExerciseAnswers[prevExercise.questions[0]?.id] || '')
    }
  }

  const handleAskAI = async () => {
    console.log('🔥 handleAskAI called!', { userId: user?.id, exercise: currentExercise.title })
    
    if (!user?.id) {
      alert('Vui lòng đăng nhập để sử dụng tính năng này')
      return
    }
    
    setIsAIHelping(true)
    setShowAIResponse(true)
    setAiResponse('') // Clear previous response
    
    try {
      console.log('🚀 Making API call to /api/chat...')
      // Call AI API to get help with the exercise
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          message: `Tôi đang làm bài tập "${currentExercise.title}" - ${currentExercise.subject}. Câu hỏi: "${currentQuestion.question}". Bạn có thể hướng dẫn tôi cách giải bài này không? Đừng đưa đáp án trực tiếp, chỉ hướng dẫn cách tư duy và giải quyết.`,
          mode: 'coach',
          userRole: 'parent'
        })
      })

      if (!response.ok) {
        throw new Error('Không thể kết nối với AI')
      }

      const data = await response.json()
      console.log('📥 API Response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      console.log('💬 Setting AI response:', data.reply)
      setAiResponse(data.reply || 'AI chưa thể trả lời được câu hỏi này.')
      
      // Scroll to AI response
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      
    } catch (error) {
      console.error('Error asking AI:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
      setAiResponse(`Xin lỗi, có lỗi khi kết nối với AI: ${errorMessage}. Vui lòng thử lại sau.`)
    } finally {
      setIsAIHelping(false)
    }
  }

  const handleSaveAndClose = () => {
    // Check if ALL exercises are answered CORRECTLY (mỗi bài chỉ có 1 câu)
    const allQuestionsAnswered = exercises.every(ex => {
      return submitResults[ex.id] === 'correct' // Chỉ tính bài đã trả lời ĐÚNG
    })
    
    if (!allQuestionsAnswered) {
      alert('Vui lòng trả lời ĐÚNG TẤT CẢ bài tập trước khi hoàn thành!')
      return
    }
    
    // Save all exercises' answers
    exercises.forEach(ex => {
      if (answers[ex.id]) {
        onSaveAnswer(ex.id, answers[ex.id])
      }
    })
    
    // Reset state
    setCurrentExerciseIndex(0)
    setAnswers({})
    setUserAnswer('')
    setShowAIResponse(false)
    setAiResponse('')
    setExerciseAttempts({})
    setSubmitResults({})
  }

  const handleClose = () => {
    setCurrentExerciseIndex(0)
    setAnswers({})
    setUserAnswer('')
    setShowAIResponse(false)
    setAiResponse('')
    setExerciseAttempts({})
    setSubmitResults({})
    onClose()
  }

  // Check if all exercises are answered CORRECTLY (mỗi bài chỉ có 1 câu)
  const allQuestionsAnswered = exercises.every(ex => {
    return submitResults[ex.id] === 'correct' // Chỉ tính bài đã trả lời ĐÚNG
  })
  
  // Check if current question is answered AND correct
  const currentExerciseAnswers = answers[currentExercise.id] || {}
  const currentQuestionAnswered = currentExerciseAnswers[currentQuestion?.id] && currentExerciseAnswers[currentQuestion?.id].trim() !== ''
  const currentQuestionCorrect = submitResults[currentExercise.id] === 'correct'
  
  // Count total exercises and correctly answered exercises (mỗi bài = 1 câu)
  const totalQuestions = exercises.length // Tổng số bài
  const answeredQuestions = exercises.filter(ex => {
    return submitResults[ex.id] === 'correct' // Chỉ đếm bài đã trả lời ĐÚNG
  }).length
  
  // Check if can ask AI (phải thử sai ít nhất 2 lần)
  const canAskAI = (exerciseAttempts[currentExercise.id] || 0) >= 2

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">
                Bài {currentExerciseIndex + 1}/{exercises.length}: {currentExercise.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{currentExercise.subject}</span>
                <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                  {getDifficultyText(currentExercise.difficulty)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentExercise.estimatedTime} phút
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {currentExercise.points} điểm
                </Badge>
              </div>
              <DialogDescription>
                Bài {currentExerciseIndex + 1} của {exercises.length} (Đã trả lời: {answeredQuestions}/{totalQuestions} bài)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Focus Mode Warning */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-600" />
          <div className="text-sm text-amber-800">
            <strong>Chế độ tập trung:</strong> Bạn phải làm xong {exercises.length} bài tập mới có thể thoát ra.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Question Content */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <PenTool className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Câu hỏi:</span>
              </div>
              <p className="text-gray-900 leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Answer Input */}
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn đáp án đúng:
                </label>
                <div className="flex flex-wrap gap-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" style={{ flex: '1 1 calc(50% - 6px)', minWidth: '200px' }}>
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={userAnswer === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Đáp án của bạn:
                </label>
                {currentQuestion.type === 'calculation' ? (
                  <Input
                    type="text"
                    placeholder="Nhập kết quả tính toán..."
                    value={userAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="text-lg"
                  />
                ) : (
                  <Textarea
                    placeholder="Viết câu trả lời của bạn..."
                    value={userAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                )}
              </div>
            )}
            
            {/* Nút kiểm tra đáp án */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCheckAnswer}
                disabled={!userAnswer.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Kiểm tra đáp án
              </Button>
              
              {/* Feedback đúng/sai */}
              {submitResults[currentExercise.id] === 'correct' && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Chính xác! Tuyệt vời! 🎉
                </div>
              )}
              
              {submitResults[currentExercise.id] === 'incorrect' && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="text-2xl">😢</span>
                  {(exerciseAttempts[currentExercise.id] || 0) >= 2 
                    ? 'Chưa đúng! Bạn có thể hỏi gia sư AI! 💡' 
                    : `Chưa đúng! Hãy thử lại! (Còn ${2 - (exerciseAttempts[currentExercise.id] || 0)} lần để hỏi gia sư AI)`}
                </div>
              )}
            </div>
          </div>

          {/* AI Help Section */}
          {(showAIResponse || isAIHelping) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">AI Hướng dẫn:</span>
              </div>
              {isAIHelping ? (
                <div className="flex items-center gap-2 text-purple-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  AI đang phân tích câu hỏi và chuẩn bị hướng dẫn cho bạn...
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={handlePrevExercise}
              disabled={isFirstExercise}
              variant="outline"
              size="sm"
            >
              Bài trước
            </Button>
            <Button
              onClick={handleNextExercise}
              disabled={isLastExercise || !currentQuestionCorrect}
              variant="outline"
              size="sm"
              className={!currentQuestionCorrect ? 'opacity-50' : ''}
            >
              {!currentQuestionAnswered 
                ? '🔒 Nhập đáp án' 
                : !currentQuestionCorrect
                  ? '🔒 Trả lời đúng để tiếp tục'
                  : 'Bài tiếp'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAskAI}
              disabled={!canAskAI || isAIHelping}
              variant="outline"
              size="sm"
              className={cn(
                "border-purple-300 text-purple-700 hover:bg-purple-50",
                !canAskAI && "opacity-50 cursor-not-allowed"
              )}
              title={!canAskAI ? "Hãy thử tự làm trước! Sau 2 lần sai bạn có thể hỏi AI." : ""}
            >
              {!canAskAI ? (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  Hỏi gia sư AI (🔒 Thử trước)
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {isAIHelping ? 'Đang hỗ trợ...' : 'Hỏi gia sư AI'}
                </>
              )}
            </Button>

            {allQuestionsAnswered ? (
              <Button
                onClick={handleSaveAndClose}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Hoàn thành {exercises.length} bài
              </Button>
            ) : (
              <div className="text-sm text-gray-500 flex items-center gap-2 px-4">
                <Lock className="w-4 h-4" />
                Còn {totalQuestions - answeredQuestions}/{totalQuestions} bài
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
