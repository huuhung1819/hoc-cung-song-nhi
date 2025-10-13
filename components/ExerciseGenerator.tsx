'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExerciseGeneratorProps {
  isUnlockMode: boolean
  userId?: string
  onSendToChat?: (exercise: string, mode: 'coach' | 'solve') => void
}

interface ExerciseState {
  exercise: string
  mode: 'coach' | 'solve' | null
  status: 'idle' | 'asking' | 'answered'
}

const SUBJECTS = {
  math: {
    name: 'Toán',
    icon: '📐',
    subSubjects: [
      'Trắc nghiệm',
      'Có lời văn', 
      'Cộng trừ nhân chia'
    ]
  },
  literature: {
    name: 'Văn',
    icon: '📝',
    subSubjects: [
      'Nghị luận',
      'Phân tích',
      'Cảm thụ',
      'Viết đoạn'
    ]
  },
  english: {
    name: 'Tiếng Anh',
    icon: '🇬🇧',
    subSubjects: [
      'Ngữ pháp',
      'Từ vựng',
      'Đọc hiểu',
      'Viết luận'
    ]
  }
}

export function ExerciseGenerator({ isUnlockMode, userId, onSendToChat }: ExerciseGeneratorProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedSubSubject, setSelectedSubSubject] = useState<string | null>(null)
  const [exercises, setExercises] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [userGrade, setUserGrade] = useState<string>('Lớp 1')
  
  // Track state of each exercise
  const [exerciseStates, setExerciseStates] = useState<Record<number, ExerciseState>>({})

  const handleSubjectClick = (subjectKey: string) => {
    setSelectedSubject(subjectKey)
    setSelectedSubSubject(null)
    setExercises([])
    setExerciseStates({})
    setError('')
  }

  const handleSubSubjectClick = (subSubject: string) => {
    setSelectedSubSubject(subSubject)
    setExercises([])
    setExerciseStates({})
    setError('')
  }

  const handleGenerateExercises = async () => {
    if (!selectedSubject || !selectedSubSubject) return
    
    setIsGenerating(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          subSubject: selectedSubSubject,
          userId: userId,
          count: 5
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate exercises')
      }

      const data = await response.json()
      setExercises(data.exercises || [])
      setUserGrade(data.grade || 'Lớp 1')
      
      // Initialize states for new exercises
      const newStates: Record<number, ExerciseState> = {}
      data.exercises.forEach((_: string, index: number) => {
        newStates[index] = {
          exercise: data.exercises[index],
          mode: null,
          status: 'idle'
        }
      })
      setExerciseStates(newStates)
      
    } catch (err: any) {
      console.error('Error generating exercises:', err)
      setError('Không thể tạo bài tập. Vui lòng thử lại.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAskAI = (exercise: string, index: number) => {
    // Update state
    setExerciseStates(prev => ({
      ...prev,
      [index]: {
        exercise,
        mode: 'coach',
        status: 'asking'
      }
    }))

    // Send to chat
    if (onSendToChat) {
      onSendToChat(exercise, 'coach')
    }

    // Simulate AI response (in real app, listen to chat response)
    setTimeout(() => {
      setExerciseStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          status: 'answered'
        }
      }))
    }, 1000)
  }

  const handleShowSolution = (index: number) => {
    const state = exerciseStates[index]
    if (!state) return

    // Use saved exercise from state
    const exercise = state.exercise

    // Update state
    setExerciseStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        mode: 'solve',
        status: 'asking'
      }
    }))

    // Send to chat with 'solve' mode
    if (onSendToChat) {
      onSendToChat(exercise, 'solve')
    }

    // Simulate AI response
    setTimeout(() => {
      setExerciseStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          status: 'answered'
        }
      }))
    }, 1000)
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📝 Tạo bài tập theo môn học</span>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isUnlockMode 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isUnlockMode ? '✅ Có lời giải' : '💡 Chỉ hướng dẫn'}
            </span>
          </div>
        </CardTitle>
        <div className="mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            🎓 {userGrade}
          </span>
          <p className="text-sm text-gray-600 mt-1">
            AI sẽ tạo bài tập phù hợp với chương trình {userGrade}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Chọn môn học:</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(SUBJECTS).map(([key, subject]) => (
              <button
                key={key}
                onClick={() => handleSubjectClick(key)}
                className={`p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedSubject === key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{subject.icon}</div>
                <div className="font-medium text-gray-900">{subject.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sub Subject Selection */}
        {selectedSubject && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {SUBJECTS[selectedSubject].icon} Chọn loại bài tập {SUBJECTS[selectedSubject].name}:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS[selectedSubject].subSubjects.map((subSubject) => (
                <button
                  key={subSubject}
                  onClick={() => handleSubSubjectClick(subSubject)}
                  className={`p-3 border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors ${
                    selectedSubSubject === subSubject
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 text-gray-900'
                  }`}
                >
                  {subSubject}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedSubject && selectedSubSubject && (
          <div className="text-center">
            <Button
              onClick={handleGenerateExercises}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  AI đang tạo 5 bài tập...
                </>
              ) : (
                '🤖 AI tạo 5 bài tập'
              )}
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Exercises Display */}
        {exercises.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Bài tập {SUBJECTS[selectedSubject!].name} - {selectedSubSubject}:
            </h3>
            {exercises.map((exercise, index) => {
              const state = exerciseStates[index] || { status: 'idle', mode: null }
              
              return (
                <div key={index} className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Bài {index + 1}
                      </span>
                      {state.status === 'asking' && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded animate-pulse">
                          ⏳ Đang hỏi AI...
                        </span>
                      )}
                      {state.status === 'answered' && state.mode === 'coach' && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✅ Đã hỏi
                        </span>
                      )}
                      {state.status === 'answered' && state.mode === 'solve' && (
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          ✅ Đã xem lời giải
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newExercises = exercises.filter((_, i) => i !== index)
                        setExercises(newExercises)
                        const newStates = { ...exerciseStates }
                        delete newStates[index]
                        setExerciseStates(newStates)
                      }}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <pre className="whitespace-pre-wrap text-gray-900 font-medium mb-3 text-sm leading-relaxed">
                    {exercise}
                  </pre>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button
                      onClick={() => handleAskAI(exercise, index)}
                      disabled={state.status === 'asking'}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      {state.status === 'asking' && state.mode === 'coach' ? (
                        <>⏳ Đang hỏi...</>
                      ) : state.status === 'answered' && state.mode === 'coach' ? (
                        <>✅ Đã hỏi gia sư AI</>
                      ) : (
                        <>💬 Hỏi gia sư AI</>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleShowSolution(index)}
                      disabled={!isUnlockMode || state.status === 'asking'}
                      variant="default"
                      size="sm"
                      className={`flex-1 ${
                        isUnlockMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {!isUnlockMode ? (
                        <>🔒 Xem lời giải (cần mở khóa)</>
                      ) : state.status === 'asking' && state.mode === 'solve' ? (
                        <>⏳ Đang lấy lời giải...</>
                      ) : state.status === 'answered' && state.mode === 'solve' ? (
                        <>✅ Đã xem lời giải</>
                      ) : (
                        <>📖 Xem lời giải</>
                      )}
                    </Button>
                  </div>

                  {/* Hint for locked mode */}
                  {!isUnlockMode && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      💡 Mở khóa từ navbar để xem lời giải chi tiết
                    </p>
                  )}
                </div>
              )
            })}
            
            <div className="flex gap-2 justify-center pt-2">
              <Button
                onClick={handleGenerateExercises}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? '⏳ Đang tạo...' : '🤖 AI tạo thêm 5 bài tập'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExercises([])
                  setExerciseStates({})
                }}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                🗑️ Xóa tất cả
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
