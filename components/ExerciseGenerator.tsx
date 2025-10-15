'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/authContext'
import { toast } from 'sonner'

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

// Danh sách chủ đề theo từng lớp (Lớp 1-5)
// Sau này chỉ cần thay đổi text trong danh sách này, không cần sửa code logic
const SUBJECTS_BY_GRADE: Record<string, Record<string, { name: string; icon: string; subSubjects: string[] }>> = {
              'Lớp 1': {
                math: {
                  name: 'Toán',
                  icon: '📐',
                  subSubjects: [
                    'Toán trắc nghiệm',
                    'Toán có lời văn',
                    'Toán điền vào chỗ trống',
                    'Toán chọn đúng sai',
                    'Phép cộng',
                    'Phép trừ',
                    'Phép nhân',
                    'Phép chia'
                  ]
                },
    literature: {
      name: 'Văn',
      icon: '📝',
      subSubjects: [
        'Đọc chữ cái',
        'Viết câu đơn giản',
        'Kể chuyện',
        'Cảm nhận đơn giản'
      ]
    },
    english: {
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      subSubjects: [
        'Chào hỏi cơ bản',
        'Số đếm 1-10',
        'Màu sắc',
        'Con vật'
      ]
    }
  },
              'Lớp 2': {
                math: {
                  name: 'Toán',
                  icon: '📐',
                  subSubjects: [
                    'Toán trắc nghiệm',
                    'Toán có lời văn',
                    'Toán điền vào chỗ trống',
                    'Toán chọn đúng sai',
                    'Phép cộng',
                    'Phép trừ',
                    'Phép nhân',
                    'Phép chia'
                  ]
                },
    literature: {
      name: 'Văn',
      icon: '📝',
      subSubjects: [
        'Đọc hiểu đơn giản',
        'Viết đoạn ngắn',
        'Kể chuyện',
        'Tả người, vật'
      ]
    },
    english: {
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      subSubjects: [
        'Giới thiệu bản thân',
        'Gia đình',
        'Đồ vật trong nhà',
        'Thức ăn'
      ]
    }
  },
  'Lớp 3': {
    math: {
      name: 'Toán',
      icon: '📐',
      subSubjects: [
        'Trắc nghiệm',
        'Có lời văn',
        'Phép nhân',
        'Phép chia',
        'Phép trừ',
        'Phép cộng',
        'Toán chọn đúng sai',
        'Toán điền vào chỗ trống'
      ]
    },
    literature: {
      name: 'Văn',
      icon: '📝',
      subSubjects: [
        'Đọc hiểu',
        'Phân tích đơn giản',
        'Cảm thụ',
        'Viết đoạn'
      ]
    },
    english: {
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      subSubjects: [
        'Ngữ pháp cơ bản',
        'Từ vựng',
        'Đọc hiểu đơn giản',
        'Viết câu'
      ]
    }
  },
  'Lớp 4': {
    math: {
      name: 'Toán',
      icon: '📐',
      subSubjects: [
        'Trắc nghiệm',
        'Có lời văn',
        'Phép nhân nâng cao',
        'Phép chia nâng cao',
        'Phân số cơ bản',
        'Hình học',
        'Toán chọn đúng sai',
        'Toán điền vào chỗ trống'
      ]
    },
    literature: {
      name: 'Văn',
      icon: '📝',
      subSubjects: [
        'Nghị luận đơn giản',
        'Phân tích',
        'Cảm thụ',
        'Viết đoạn văn'
      ]
    },
    english: {
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      subSubjects: [
        'Ngữ pháp',
        'Từ vựng',
        'Đọc hiểu',
        'Viết đoạn ngắn'
      ]
    }
  },
  'Lớp 5': {
    math: {
      name: 'Toán',
      icon: '📐',
      subSubjects: [
        'Trắc nghiệm',
        'Có lời văn',
        'Phân số',
        'Số thập phân',
        'Hình học nâng cao',
        'Đại số cơ bản',
        'Toán chọn đúng sai',
        'Toán điền vào chỗ trống'
      ]
    },
    literature: {
      name: 'Văn',
      icon: '📝',
      subSubjects: [
        'Nghị luận',
        'Phân tích',
        'Cảm thụ',
        'Viết luận ngắn'
      ]
    },
    english: {
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      subSubjects: [
        'Ngữ pháp nâng cao',
        'Từ vựng',
        'Đọc hiểu',
        'Viết luận'
      ]
    }
  }
}

export function ExerciseGenerator({ isUnlockMode, userId, onSendToChat }: ExerciseGeneratorProps) {
  const { user } = useAuth()
  
  // Use userId prop first, fallback to user?.id from useAuth
  const effectiveUserId = userId || user?.id
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedSubSubject, setSelectedSubSubject] = useState<string | null>(null)
  const [exercises, setExercises] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [userGrade, setUserGrade] = useState<string>('Lớp 1')
  
  // Track state of each exercise
  const [exerciseStates, setExerciseStates] = useState<Record<number, ExerciseState>>({})
  
  // Popup states
  const [showTopicPopup, setShowTopicPopup] = useState(false)
  const [popupSubject, setPopupSubject] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch user grade from database on mount
  useEffect(() => {
    const fetchUserGrade = async () => {
      if (!effectiveUserId) return

      try {
        const response = await fetch(`/api/user/info?userId=${effectiveUserId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user?.grade) {
            setUserGrade(data.user.grade)
          }
        }
      } catch (error) {
        console.error('Error fetching user grade:', error)
        // Giữ nguyên default 'Lớp 1' nếu có lỗi
      }
    }

    fetchUserGrade()
  }, [effectiveUserId])

  // Listen for profile updates (when grade changes)
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!effectiveUserId) return

      try {
        const response = await fetch(`/api/user/info?userId=${effectiveUserId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.user?.grade) {
            setUserGrade(data.user.grade)
            // Reset selection để user thấy danh sách mới
            setSelectedSubject(null)
            setSelectedSubSubject(null)
            setExercises([])
            setExerciseStates({})
            toast.success(`Đã cập nhật danh sách bài tập cho ${data.user.grade}`)
          }
        }
      } catch (error) {
        console.error('Error refetching grade:', error)
      }
    }

    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate)
  }, [effectiveUserId])

  const handleSubjectClick = (subjectKey: string) => {
    setPopupSubject(subjectKey)
    setShowTopicPopup(true)
    setSearchQuery('')
  }

  const handleSubSubjectClick = (subSubject: string) => {
    setSelectedSubSubject(subSubject)
    setExercises([])
    setExerciseStates({})
    setError('')
  }

  const handleTopicClickInPopup = (topic: string) => {
    setSelectedSubject(popupSubject)
    setSelectedSubSubject(topic)
    setExercises([])
    setExerciseStates({})
    setError('')
    setShowTopicPopup(false)
    setPopupSubject(null)
    setSearchQuery('')
  }

  const handleClosePopup = () => {
    setShowTopicPopup(false)
    setPopupSubject(null)
    setSearchQuery('')
  }

  // Helper function: Lấy danh sách môn học theo lớp của user
  const getSubjectsForGrade = () => {
    // Sử dụng userGrade từ state (đã được set từ API response)
    const grade = userGrade || 'Lớp 1'
    return SUBJECTS_BY_GRADE[grade] || SUBJECTS_BY_GRADE['Lớp 1']
  }

  const getFilteredTopics = () => {
    if (!popupSubject) return []
    const subjects = getSubjectsForGrade()
    const subject = subjects[popupSubject as keyof typeof subjects]
    if (!subject) return []
    
    const topics = subject.subSubjects
    if (!searchQuery.trim()) return topics
    
    return topics.filter(topic => 
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
          userId: effectiveUserId,
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
    // Check if userId is available
    if (!effectiveUserId) {
      setError('Chưa đăng nhập hoặc thông tin người dùng chưa được tải. Vui lòng thử lại.')
      console.error('handleAskAI: effectiveUserId is undefined')
      return
    }

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

    // Reset status after timeout to prevent stuck state
    setTimeout(() => {
      setExerciseStates(prev => {
        const currentState = prev[index]
        if (currentState && currentState.status === 'asking') {
          return {
            ...prev,
            [index]: {
              ...currentState,
              status: 'answered'
            }
          }
        }
        return prev
      })
    }, 10000) // 10 second timeout
  }

  const handleShowSolution = (index: number) => {
    const state = exerciseStates[index]
    if (!state) return

    // Check if userId is available
    if (!effectiveUserId) {
      setError('Chưa đăng nhập hoặc thông tin người dùng chưa được tải. Vui lòng thử lại.')
      console.error('handleShowSolution: effectiveUserId is undefined')
      return
    }

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

    // Reset status after timeout to prevent stuck state
    setTimeout(() => {
      setExerciseStates(prev => {
        const currentState = prev[index]
        if (currentState && currentState.status === 'asking') {
          return {
            ...prev,
            [index]: {
              ...currentState,
              status: 'answered'
            }
          }
        }
        return prev
      })
    }, 10000) // 10 second timeout
  }

  return (
    <>
      {/* Topic Selection Popup */}
      {showTopicPopup && popupSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">{getSubjectsForGrade()[popupSubject as keyof ReturnType<typeof getSubjectsForGrade>]?.icon}</span>
                  Chọn chủ đề {getSubjectsForGrade()[popupSubject as keyof ReturnType<typeof getSubjectsForGrade>]?.name} {userGrade}
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="text-white hover:text-gray-200 transition-colors text-xl bg-purple-600 hover:bg-purple-700 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Topics List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {getFilteredTopics().map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClickInPopup(topic)}
                    className="p-3 text-left border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  >
                    <span className="font-medium text-gray-900">{topic}</span>
                  </button>
                ))}
                {getFilteredTopics().length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>Không tìm thấy chủ đề nào</p>
                    <p className="text-sm">Thử từ khóa khác</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClosePopup}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-xl">
        <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
          <span className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Tạo bài tập theo môn học
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
              isUnlockMode 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {isUnlockMode ? '✅ Có lời giải' : '💡 Chỉ hướng dẫn'}
            </span>
          </div>
        </CardTitle>
        <div className="mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
            🎓 {userGrade}
          </span>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            AI sẽ tạo bài tập phù hợp với chương trình {userGrade}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 Chọn môn học:</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(getSubjectsForGrade()).map(([key, subject]) => (
              <button
                key={key}
                onClick={() => handleSubjectClick(key)}
                className={`p-4 border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${
                  selectedSubject === key 
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md' 
                    : 'border-gray-300 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="text-3xl mb-2">{subject.icon}</div>
                <div className="font-medium text-gray-900">{subject.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Subject and Topic Display */}
        {selectedSubject && selectedSubSubject && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-2xl">{getSubjectsForGrade()[selectedSubject as keyof ReturnType<typeof getSubjectsForGrade>]?.icon}</span>
              Đã chọn: {getSubjectsForGrade()[selectedSubject as keyof ReturnType<typeof getSubjectsForGrade>]?.name} {userGrade} - {selectedSubSubject}
            </h3>
            <p className="text-sm text-gray-700 font-medium">
              Bấm "AI tạo 5 bài tập" để bắt đầu tạo bài tập
            </p>
          </div>
        )}

        {/* Generate Button */}
        {selectedSubject && selectedSubSubject && (
          <div className="text-center">
            <Button
              onClick={handleGenerateExercises}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Exercises Display */}
        {exercises.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              📋 Bài tập {getSubjectsForGrade()[selectedSubject as keyof ReturnType<typeof getSubjectsForGrade>]?.name} {userGrade} - {selectedSubSubject}:
            </h3>
            {exercises.map((exercise, index) => {
              const state = exerciseStates[index] || { status: 'idle', mode: null }
              
              return (
                <div key={index} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-600 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
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
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
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
                      className={`flex-1 rounded-lg font-medium ${
                        isUnlockMode 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-200' 
                          : 'bg-gray-400 cursor-not-allowed text-white'
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
    </>
  )
}
