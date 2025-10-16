'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCcw, CheckCircle, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatInterface } from './ChatInterface'
import { toast } from 'sonner'

interface ExerciseData {
  content: string
  index: number
  total: number
  subject: string
  subSubject: string
}

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  exerciseData: ExerciseData
  isUnlockMode: boolean
  onExerciseComplete?: () => void
  onNextExercise?: () => void
  onSendToChat?: (exercise: string, mode: 'coach' | 'solve') => void
}

export function ChatPopup({
  isOpen,
  onClose,
  userId,
  exerciseData,
  isUnlockMode,
  onExerciseComplete,
  onNextExercise,
  onSendToChat
}: ChatPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [answerChecked, setAnswerChecked] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    isCorrect: boolean
    message: string
    correctAnswer?: string
  } | null>(null)
  const chatSendFunctionRef = useRef<((exercise: string, mode: 'coach' | 'solve') => void) | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Reset answer when exercise changes
  useEffect(() => {
    setUserAnswer('')
    setAnswerChecked(false)
    setIsChecking(false)
    setCheckResult(null)
  }, [exerciseData.content])

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Vui lòng nhập đáp án của bạn!')
      return
    }

    setIsChecking(true)
    
    try {
      // Gửi yêu cầu chấm điểm đến AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: `Hãy chấm điểm bài tập này:\n\nBài tập: ${exerciseData.content}\nĐáp án của học sinh: ${userAnswer}\n\nChỉ trả lời theo format JSON: {"isCorrect": true/false, "message": "thông điệp", "correctAnswer": "đáp án đúng"}`,
          conversationId: null,
          mode: 'coach'
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.response) {
        try {
          // Parse JSON response từ AI
          const aiResponse = JSON.parse(data.response)
          setCheckResult({
            isCorrect: aiResponse.isCorrect,
            message: aiResponse.message,
            correctAnswer: aiResponse.correctAnswer
          })
        } catch (parseError) {
          // Fallback nếu AI không trả về JSON đúng format - sử dụng fallback logic
          console.log('AI response not JSON, using fallback logic:', data.response)
          // Sẽ rơi vào catch block bên dưới để xử lý bằng fallback logic
          throw new Error('AI response not in JSON format')
        }
      } else {
        throw new Error(data.error || 'Không thể chấm điểm')
      }
    } catch (error) {
      console.error('Error checking answer:', error)
      // Fallback logic cho một số trường hợp đơn giản
      const exerciseText = exerciseData.content.toLowerCase()
      let isCorrect = false
      let correctAnswer = undefined
      
      // Check for specific patterns - addition word problems
      const additionPatterns = [
        // Pattern: "có X và Y" hoặc "X...và Y"
        /có\s+(\d+).*?và\s+(\d+)/,
        /(\d+).*?và\s+(\d+).*?bông|(\d+).*?và\s+(\d+).*?quả|(\d+).*?và\s+(\d+).*?cái/,
        // Pattern: direct math operations
        /(\d+)\s*(cộng|\+|trừ|-|nhân|\*|chia|\/)\s*(\d+)/,
        // Pattern: "tổng cộng" or "tổng số"
        /tổng.*?(\d+).*?(\d+)|(\d+).*?(\d+).*?tổng/
      ]
      
      // Try to extract numbers for addition
      const numbers: number[] = []
      const allNumbers = exerciseText.match(/\d+/g)
      if (allNumbers && allNumbers.length >= 2) {
        // Check if it's an addition problem (look for keywords)
        if (exerciseText.includes('và') || exerciseText.includes('tổng') || 
            exerciseText.includes('cộng') || exerciseText.includes('+') ||
            exerciseText.includes('có tổng cộng') || exerciseText.includes('hỏi có tổng')) {
          
          const num1 = parseInt(allNumbers[0])
          const num2 = parseInt(allNumbers[1])
          const expectedSum = num1 + num2
          isCorrect = userAnswer.trim() === expectedSum.toString()
          correctAnswer = expectedSum.toString()
        }
      }
      
      // Fallback to original patterns if not detected as addition
      if (!isCorrect) {
        if (exerciseText.includes('5 cộng 3') || exerciseText.includes('5 + 3')) {
          isCorrect = userAnswer.trim() === '8'
          correctAnswer = '8'
        } else if (exerciseText.includes('10 trừ 4') || exerciseText.includes('10 - 4')) {
          isCorrect = userAnswer.trim() === '6'
          correctAnswer = '6'
        } else {
          // Extract and calculate for more cases
          const mathPattern = exerciseText.match(/(\d+)\s*(cộng|\+|trừ|-|nhân|\*|chia|\/)\s*(\d+)/)
          if (mathPattern) {
            const [, num1, operator, num2] = mathPattern
            const a = parseInt(num1)
            const b = parseInt(num2)
            let result = 0
            
            if (operator === 'cộng' || operator === '+') {
              result = a + b
            } else if (operator === 'trừ' || operator === '-') {
              result = a - b
            } else if (operator === 'nhân' || operator === '*') {
              result = a * b
            } else if (operator === 'chia' || operator === '/') {
              result = Math.floor(a / b) // For integer division
            }
            
            isCorrect = userAnswer.trim() === result.toString()
            correctAnswer = result.toString()
          }
        }
      }
      
      setCheckResult({
        isCorrect,
        message: isCorrect ? 'Chính xác! Bạn làm rất tốt!' : 'Chưa chính xác. Hãy thử lại!',
        correctAnswer: isCorrect ? undefined : (correctAnswer || 'Đáp án đúng là khác')
      })
    } finally {
      setIsChecking(false)
      setAnswerChecked(true)
      toast.success('Đã chấm điểm! Hãy xem kết quả bên dưới.')
    }
  }

  const handleAskAIInChat = () => {
    const message = `Bài tập: ${exerciseData.content}\nĐáp án của tôi: ${userAnswer}`
    if (chatSendFunctionRef.current) {
      chatSendFunctionRef.current(message, 'coach')
    } else if (onSendToChat) {
      onSendToChat(message, 'coach')
    }
  }

  const handleSendExerciseToChat = () => {
    // Use the internal chat send function first, fallback to prop
    if (chatSendFunctionRef.current) {
      chatSendFunctionRef.current(exerciseData.content, 'coach')
      toast.success('Đã gửi bài tập vào chat!')
    } else if (onSendToChat) {
      onSendToChat(exerciseData.content, 'coach')
      toast.success('Đã gửi bài tập vào chat!')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div 
        className={`bg-white rounded-xl shadow-2xl border transition-all duration-300 ${
          isMinimized ? 'w-96 h-20' : 'w-full max-w-7xl h-[90vh] flex flex-col overflow-y-auto'
        }`}
        ref={chatRef}
      >
        {/* Header with Exercise */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    AI Gia sư hỗ trợ - Bài {exerciseData.index + 1}/{exerciseData.total}
                  </h2>
                  <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {exerciseData.subject} - {exerciseData.subSubject}
                  </span>
                </div>
              
              {/* Pinned Exercise Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-medium leading-relaxed">
                  {exerciseData.content}
                </pre>
              </div>
              
              {/* Send Exercise to Chat Button */}
              <div className="mt-2">
                <Button
                  onClick={handleSendExerciseToChat}
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Gửi bài tập vào chat
                </Button>
              </div>
              
              {/* Answer Input Section */}
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-800">Đáp án của bạn:</span>
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Nhập đáp án..."
                    className="flex-1 max-w-xs"
                  />
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={isChecking || !userAnswer.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isChecking ? (
                      <>⏳ Đang chấm...</>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-1" />
                        Chấm điểm
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Ask AI Button */}
                {userAnswer.trim() && (
                  <div className="mt-2">
                    <Button
                      onClick={handleAskAIInChat}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Hỏi AI về đáp án này
                    </Button>
                  </div>
                )}
                
                {/* Answer Result */}
                {answerChecked && checkResult && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    checkResult.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-medium ${
                        checkResult.isCorrect ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Kết quả chấm điểm:
                      </span>
                    </div>
                    <div className={`text-sm ${
                      checkResult.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎯</span>
                        <span>Đáp án của bạn: <strong>{userAnswer}</strong></span>
                      </div>
                      {checkResult.correctAnswer && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💡</span>
                          <span>Đáp án đúng: <strong>{checkResult.correctAnswer}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{checkResult.isCorrect ? '✅' : '❌'}</span>
                        <span>{checkResult.message}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
              {/* Action Buttons */}
              <Button
                onClick={onExerciseComplete}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Hoàn thành
              </Button>
              
              {onNextExercise && (
                <Button
                  onClick={onNextExercise}
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Bài tiếp theo
                </Button>
              )}
              
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                {isMinimized ? '📖' : '📝'}
              </Button>
              
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {!isMinimized && (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 p-6 min-h-0">
              <ChatInterface 
                userId={userId}
                isUnlockMode={isUnlockMode}
                className="h-full"
                onNewMessage={() => {
                  // Handle new message if needed
                }}
                onRegisterSendExercise={(sendFn) => {
                  chatSendFunctionRef.current = sendFn
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
