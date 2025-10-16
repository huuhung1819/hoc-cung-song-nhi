'use client'

import { useState, useEffect } from 'react'
import { useDailyLimit } from '@/lib/hooks/useDailyLimit'
import { useAuth } from '@/lib/authContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ExerciseModal } from './ExerciseModal'
import { 
  BookOpen, 
  Filter, 
  Search,
  TrendingUp,
  Clock,
  Star,
  PenTool,
  Lock,
  Lightbulb
} from 'lucide-react'

interface Exercise {
  id: string
  title: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  estimatedTime: number
  questionCount: number
  points: number
  isCompleted?: boolean
  isLocked?: boolean
  userAnswer?: string
  questions: {
    id: string
    question: string
    type: 'multiple_choice' | 'text' | 'calculation'
    options?: string[]
    correctAnswer?: string
  }[]
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Phép cộng và trừ cơ bản',
    subject: 'Toán học',
    difficulty: 'easy',
    description: 'Luyện tập các phép tính cộng trừ với số từ 1 đến 100',
    estimatedTime: 15,
    questionCount: 10,
    points: 100,
    isCompleted: false,
    questions: [
      {
        id: 'q1',
        question: 'Tính: 25 + 37 = ?',
        type: 'multiple_choice',
        options: ['62', '52', '72', '42'],
        correctAnswer: '62'
      },
      {
        id: 'q2',
        question: 'Tính: 89 - 45 = ?',
        type: 'calculation',
        correctAnswer: '44'
      }
    ]
  },
  {
    id: '2',
    title: 'Nhận biết hình học',
    subject: 'Toán học',
    difficulty: 'easy',
    description: 'Phân biệt các hình cơ bản: hình tròn, vuông, tam giác, chữ nhật',
    estimatedTime: 20,
    questionCount: 8,
    points: 80,
    isCompleted: true,
    userAnswer: 'Đã hoàn thành',
    questions: [
      {
        id: 'q3',
        question: 'Hình nào có 3 cạnh?',
        type: 'multiple_choice',
        options: ['Hình vuông', 'Hình tam giác', 'Hình tròn', 'Hình chữ nhật'],
        correctAnswer: 'Hình tam giác'
      }
    ]
  },
  {
    id: '3',
    title: 'Đọc hiểu đoạn văn',
    subject: 'Tiếng Việt',
    difficulty: 'medium',
    description: 'Đọc và hiểu nội dung các đoạn văn ngắn về chủ đề gia đình',
    estimatedTime: 25,
    questionCount: 6,
    points: 120,
    isCompleted: false,
    questions: [
      {
        id: 'q4',
        question: 'Em hãy đọc đoạn văn sau và trả lời câu hỏi: "Gia đình em có 4 người: bố, mẹ, em và anh trai. Bố em là giáo viên, mẹ em là bác sĩ. Em rất yêu gia đình của mình." Câu hỏi: Nghề nghiệp của bố em là gì?',
        type: 'text',
        correctAnswer: 'giáo viên'
      }
    ]
  },
  {
    id: '4',
    title: 'Từ vựng tiếng Anh cơ bản',
    subject: 'Tiếng Anh',
    difficulty: 'medium',
    description: 'Học và luyện tập từ vựng về màu sắc, con vật, đồ vật hàng ngày',
    estimatedTime: 30,
    questionCount: 12,
    points: 150,
    isCompleted: false,
    questions: [
      {
        id: 'q5',
        question: 'Từ "cat" có nghĩa là gì?',
        type: 'multiple_choice',
        options: ['Con chó', 'Con mèo', 'Con gà', 'Con bò'],
        correctAnswer: 'Con mèo'
      },
      {
        id: 'q6',
        question: 'Dịch sang tiếng Việt: "The sky is blue"',
        type: 'text',
        correctAnswer: 'Bầu trời màu xanh'
      }
    ]
  },
  {
    id: '5',
    title: 'Phép nhân và chia',
    subject: 'Toán học',
    difficulty: 'hard',
    description: 'Thực hiện các phép nhân và chia với bảng cửu chương',
    estimatedTime: 35,
    questionCount: 15,
    points: 200,
    isCompleted: false,
    questions: [
      {
        id: 'q7',
        question: 'Tính: 7 × 8 = ?',
        type: 'calculation',
        correctAnswer: '56'
      },
      {
        id: 'q8',
        question: 'Tính: 72 ÷ 9 = ?',
        type: 'calculation',
        correctAnswer: '8'
      }
    ]
  }
]

const subjects = ['Toán', 'Tiếng Việt', 'Tiếng Anh']

// Chủ đề theo môn học và lớp
const subjectTopics = {
  'Toán': {
    'Lớp 1': ['Toán trắc nghiệm', 'Toán có lời văn', 'Toán lớn hơn nhỏ hơn', 'Phép cộng', 'Phép trừ', 'Phép nhân', 'Phép chia'],
    'Lớp 2': ['Phép cộng trừ có nhớ', 'Bảng cửu chương', 'Hình học', 'Giải toán có lời văn'],
    'Lớp 3': ['Bài tập chia 3', 'Bài tập chia 4', 'Bài tập chia 5', 'Bài tập chia 6', 'Chia 7', 'Chia 8', 'Chia 9', 'Toán có lời văn dạng chia'],
    'Lớp 4': ['Phép tính nâng cao', 'Phân số', 'Hình học nâng cao', 'Đo lường'],
    'Lớp 5': ['Số thập phân', 'Tỷ lệ phần trăm', 'Hình học không gian', 'Thống kê cơ bản']
  },
  'Tiếng Việt': {
    'Lớp 1': ['Bảng chữ cái', 'Đánh vần cơ bản', 'Đọc hiểu đơn giản', 'Viết chữ'],
    'Lớp 2': ['Đọc hiểu câu chuyện', 'Ngữ pháp cơ bản', 'Tập làm văn ngắn', 'Chính tả'],
    'Lớp 3': ['Ngữ pháp', 'Tập làm văn', 'Đọc hiểu nâng cao', 'Kể chuyện'],
    'Lớp 4': ['Văn miêu tả', 'Ngữ pháp nâng cao', 'Đọc hiểu văn học', 'Viết bài'],
    'Lớp 5': ['Văn nghị luận', 'Văn bản học thuật', 'Thơ ca', 'Truyện ngắn']
  },
  'Tiếng Anh': {
    'Cơ bản': ['Từ vựng cơ bản', 'Ngữ pháp đơn giản', 'Giao tiếp hàng ngày', 'Số đếm'],
    'Trung cấp': ['Thì động từ', 'Cấu trúc câu', 'Đọc hiểu', 'Viết cơ bản'],
    'Nâng cao': ['Ngữ pháp phức tạp', 'Văn bản học thuật', 'Thuyết trình', 'Viết luận']
  }
}

// Function to generate mock exercises based on topic
const generateMockExercisesByTopic = (subject: string, grade: string, topic: string): Exercise[] => {
  // Không dùng templates cứng nữa, luôn generate 5 bài mới
  // Mỗi bài = 1 câu hỏi duy nhất

  // Default: Generate 5 exercises, each with 1 question only
  const exercises: Exercise[] = []
  for (let i = 1; i <= 5; i++) {
    exercises.push({
      id: `generated_${Date.now()}_${i}`,
      title: `Bài ${i}: ${topic}`,
      subject,
      difficulty: i <= 2 ? 'easy' as const : i <= 4 ? 'medium' as const : 'hard' as const,
      description: `Bài tập ${i} được AI tạo cho ${grade} - Chủ đề: ${topic}`,
      estimatedTime: 5 + (i * 2), // 7, 9, 11, 13, 15 phút
      questionCount: 1, // Mỗi bài chỉ có 1 câu duy nhất
      points: 10 + (i * 5), // 15, 20, 25, 30, 35 điểm
      isLocked: i > 1, // Chỉ bài 1 mở khóa, các bài khác khóa
      isCompleted: false,
      questions: [
        {
          id: `q_generated_${Date.now()}_${i}`,
          question: `Bài ${i}: ${topic} - ${i % 3 === 0 ? 'Tính' : i % 3 === 1 ? 'Giải' : 'Trả lời'}: Câu hỏi về ${topic.toLowerCase()} (mức độ ${i <= 2 ? 'dễ' : i <= 4 ? 'trung bình' : 'khó'})`,
          type: i % 3 === 0 ? 'multiple_choice' as const : i % 3 === 1 ? 'calculation' as const : 'text' as const,
          options: i % 3 === 0 ? ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'] : undefined,
          correctAnswer: i % 3 === 0 ? 'Đáp án B' : i % 3 === 1 ? '42' : 'Đáp án văn bản'
        }
      ]
    })
  }
  return exercises
}

export function ExercisePracticePage() {
  const [selectedSubject, setSelectedSubject] = useState('Toán')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State cho popup chọn chủ đề
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false)
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([])
  const [useGeneratedExercises, setUseGeneratedExercises] = useState(false)

  // Daily limit hook
  const { data: dailyLimitData, loading: dailyLimitLoading, incrementUsage } = useDailyLimit()
  
  // Auth hook
  const { user } = useAuth()
  
  // State cho user info
  const [userGrade, setUserGrade] = useState<string>('')
  
  // State cho pagination
  const [currentPage, setCurrentPage] = useState(0)

  // Sử dụng bài tập được AI sinh hoặc mock data
  const currentExercises = useGeneratedExercises ? generatedExercises : mockExercises

  // Load user grade when component mounts - TỰ ĐỘNG lấy từ database
  useEffect(() => {
    if (user?.id) {
      // Tự động lấy grade từ database
      const fetchUserGrade = async () => {
        try {
          const response = await fetch('/api/get-user-grade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
          })
          
          if (response.ok) {
            const data = await response.json()
            const grade = data.grade || 'Lớp 1'
            console.log('🎓 Auto-loaded user grade:', grade)
            setUserGrade(grade)
            setSelectedGrade(grade) // Tự động set grade
          } else {
            // Fallback nếu API không hoạt động
            const grade = (user as any)?.user_metadata?.grade || (user as any)?.grade || 'Lớp 1'
            setUserGrade(grade)
            setSelectedGrade(grade)
          }
        } catch (error) {
          console.error('Error fetching user grade:', error)
          // Fallback nếu có lỗi
          const grade = (user as any)?.user_metadata?.grade || (user as any)?.grade || 'Lớp 1'
          setUserGrade(grade)
          setSelectedGrade(grade)
        }
      }
      
      fetchUserGrade()
    }
  }, [user])

  // Reset page when exercises change
  useEffect(() => {
    setCurrentPage(0)
  }, [currentExercises])

  // TỰ ĐỘNG reset topic khi grade thay đổi
  useEffect(() => {
    setSelectedTopic('') // Reset topic khi grade thay đổi
    setSelectedSubjectForTopic('') // Reset subject khi grade thay đổi
  }, [selectedGrade])

  // Pagination functions
  const handleNextPage = () => {
    if (currentPage < filteredExercises.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Function to get topics for specific subject and grade
  const getTopicsForSubjectAndGrade = (subject: string, grade: string): string[] => {
    if (!subject || !grade) return []
    
    const subjectData = subjectTopics[subject as keyof typeof subjectTopics]
    if (!subjectData) return []
    
    // For subjects with grade-specific data
    if (subject === 'Toán' || subject === 'Tiếng Việt') {
      return (subjectData as any)[grade] || []
    }
    
    // For other subjects (Tiếng Anh, Khoa học) - use existing structure
    return Object.values(subjectData).flat() as string[]
  }

  // Filter exercises based on selected criteria
  const filteredExercises = currentExercises.filter(exercise => {
    const matchesSubject = exercise.subject === selectedSubject
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSubject && matchesSearch
  })

  // Get current exercise for display
  const currentExercise = filteredExercises[currentPage]

  const handleOpenModal = (exercise: Exercise) => {
    // Allow opening any exercise, but always start from the first exercise in the session
    // Find the first exercise that should be worked on
    let targetExercise = exercise
    
    if (useGeneratedExercises && generatedExercises.length > 0) {
      // Find the first exercise that is not completed yet
      const firstIncompleteExercise = generatedExercises.find(ex => !ex.isCompleted)
      if (firstIncompleteExercise) {
        targetExercise = firstIncompleteExercise
      } else {
        // All exercises completed, start from the first one
        targetExercise = generatedExercises[0]
      }
    }
    
    setSelectedExercise(targetExercise)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedExercise(null)
    setIsModalOpen(false)
  }

  // Handlers for topic selection modal
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)
    setSelectedSubjectForTopic(subject)
    // Không tự động mở popup nữa, user phải bấm nút "Chọn chủ đề"
  }

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade)
    setSelectedTopic('')
  }

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic)
  }

  const handleGenerateExercises = async () => {
    if (!selectedSubjectForTopic || !selectedGrade || !selectedTopic) return
    
    // Check daily limit before generating
    if (dailyLimitData && !dailyLimitData.canCreate) {
      alert(`Bạn đã đạt giới hạn ${dailyLimitData.dailyLimit} bài tập/ngày. Vui lòng quay lại vào ngày mai!`)
      return
    }
    
    setIsGeneratingExercises(true)
    setIsTopicModalOpen(false)
    
    try {
      // Call AI API to generate real exercises
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: selectedSubjectForTopic,
          subSubject: selectedTopic,
          grade: selectedGrade,
          count: 5, // Generate 5 exercises
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Không thể tạo bài tập từ AI')
      }

      const data = await response.json()
      console.log('AI Response:', data) // Debug log
      
      if (data.exercises && data.exercises.length > 0) {
        // Transform AI response to our Exercise format
        // Mỗi exercise từ AI = 1 câu hỏi (1 bài = 1 câu)
        const transformedExercises: Exercise[] = data.exercises.map((ex: any, index: number) => ({
          id: `ai_${Date.now()}_${index}`,
          title: `Bài ${index + 1}`,
          subject: selectedSubjectForTopic,
          difficulty: ex.difficulty || (index <= 1 ? 'easy' : index <= 3 ? 'medium' : 'hard'),
          description: ex.description || `Bài ${index + 1} về ${selectedTopic} - ${selectedGrade}`,
          estimatedTime: ex.estimatedTime || 5, // Mỗi bài 5 phút
          questionCount: 1, // Mỗi bài chỉ có 1 câu
          points: ex.points || 10, // Mỗi bài 10 điểm
          isLocked: index > 0, // Chỉ bài 1 mở khóa
          isCompleted: false,
          questions: [
            {
              id: `q_ai_${Date.now()}_${index}`,
              question: ex.question || ex.content || `Bài ${index + 1}: ${selectedTopic}`,
              type: ex.type || (index % 3 === 0 ? 'multiple_choice' : index % 3 === 1 ? 'calculation' : 'text'),
              options: ex.options || (index % 3 === 0 ? ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'] : undefined),
              correctAnswer: ex.correctAnswer || ex.answer || 'Đáp án mẫu'
            }
          ]
        }))
        
        console.log('Transformed exercises:', transformedExercises) // Debug log
        setGeneratedExercises(transformedExercises)
        setUseGeneratedExercises(true)
        
        // Increment daily usage with actual exercise count (5 exercises)
        const { success, error } = await incrementUsage(transformedExercises.length)
        if (!success) {
          console.error('Failed to update daily usage:', error)
          // Don't block the user, just log the error
        }
      } else {
        console.log('No exercises in AI response:', data) // Debug log
        throw new Error('AI không tạo được bài tập')
      }
    } catch (generateError) {
      console.error('Error generating exercises:', generateError)
      
      // Show specific error message
      const errorMessage = generateError instanceof Error ? generateError.message : 'Có lỗi xảy ra khi tạo bài tập'
      alert(`Lỗi: ${errorMessage}. Đang sử dụng bài tập mẫu...`)
      
      // Fallback to mock data if AI fails
      const newExercises = generateMockExercisesByTopic(selectedSubjectForTopic, selectedGrade, selectedTopic)
      setGeneratedExercises(newExercises)
      setUseGeneratedExercises(true)
      
      // Increment daily usage with mock exercise count
      const { success, error: usageError } = await incrementUsage(newExercises.length)
      if (!success) {
        console.error('Failed to update daily usage for mock data:', usageError)
      }
    } finally {
      setIsGeneratingExercises(false)
    }
  }

  const handleCloseTopicModal = () => {
    setIsTopicModalOpen(false)
    setSelectedSubjectForTopic('')
    setSelectedTopic('')
    // Không reset selectedGrade vì nó lấy từ user profile
  }

  const handleRequestSolution = (exerciseId: string) => {
    alert('Tính năng này sẽ được mở khóa khi bạn hoàn thành bài tập hoặc nâng cấp gói học!')
  }

  const handleSaveAnswer = (exerciseId: string, answers: Record<string, string>) => {
    console.log('Saving answers for exercise:', exerciseId, answers)
    
    // Mark current exercise as completed
    if (useGeneratedExercises) {
      setGeneratedExercises(prev => {
        const updated = prev.map((ex, idx) => {
          if (ex.id === exerciseId) {
            return { ...ex, isCompleted: true }
          }
          // Unlock next exercise
          if (idx > 0 && prev[idx - 1].id === exerciseId) {
            return { ...ex, isLocked: false }
          }
          return ex
        })
        return updated
      })
    }
    
    // Close modal after saving
    handleCloseModal()
  }

  // Helper function to render exercise content
  const renderExerciseContent = (exercise: Exercise) => {
    if (exercise.questions.length === 0) return null

    const firstQuestion = exercise.questions[0]
    
    return (
      <div className="mb-4">
        <div className="space-y-4">
          {/* Show first question */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <PenTool className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Câu hỏi:</span>
            </div>
            <div className="space-y-3">
              <p className="text-gray-900 leading-relaxed text-lg font-medium">
                {firstQuestion.question}
              </p>
              
              {/* Multiple Choice Options */}
              {firstQuestion.type === 'multiple_choice' && firstQuestion.options && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-3">Chọn đáp án đúng:</div>
                  <div className="space-y-2">
                    {firstQuestion.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                        <span className="w-5 h-5 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1 text-base">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show hint for other question types */}
              {firstQuestion.type !== 'multiple_choice' && (
                <div className="text-xs text-gray-600 italic">
                  {firstQuestion.type === 'calculation' 
                    ? 'Nhập kết quả tính toán' 
                    : 'Viết câu trả lời'}
                </div>
              )}
            </div>
          </div>
          
          {/* Show question count if more than 1 */}
          {exercise.questions.length > 1 && (
            <div className="text-xs text-gray-500 text-center py-2 border-t">
              Và {exercise.questions.length - 1} câu hỏi khác...
            </div>
          )}
        </div>
      </div>
    )
  }

  // Helper function to render action buttons
  const renderActionButtons = (exercise: Exercise) => {
    return (
      <div className="flex gap-3 flex-wrap items-center">
        <Button
          onClick={() => handleOpenModal(exercise)}
          size="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {exercise.isCompleted ? 'Xem lại' : 'Làm bài'}
        </Button>

        <Button
          onClick={() => handleRequestSolution(exercise.id)}
          variant="outline"
          size="default"
          disabled={true}
          className="border-gray-300 text-gray-500 cursor-not-allowed bg-gray-50"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Lời giải
        </Button>
      </div>
    )
  }

  const completedCount = currentExercises.filter(e => e.isCompleted).length
  const totalPoints = currentExercises.reduce((sum, e) => sum + (e.isCompleted ? e.points : 0), 0)
  const averageTime = Math.round(currentExercises.reduce((sum, e) => sum + e.estimatedTime, 0) / currentExercises.length)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Bài tập học tập
              </h1>
              <p className="text-gray-600 mt-1">
                Chọn môn học và bắt đầu luyện tập với AI
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                    <p className="text-sm text-gray-600">Bài đã hoàn thành</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    {dailyLimitData ? (
                      <>
                        <p className="text-sm text-gray-600">Bài tập hôm nay còn</p>
                        <p className={`text-2xl font-bold ${
                          dailyLimitData.remaining > 5 
                            ? 'text-green-600' 
                            : dailyLimitData.remaining > 0 
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}>
                          {dailyLimitData.remaining}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Đang tải...</p>
                        <p className="text-2xl font-bold text-gray-400">--</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{averageTime}p</p>
                    <p className="text-sm text-gray-600">Thời gian TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm bài tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Subject Tabs */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      console.log('Subject clicked:', subject)
                      setSelectedSubject(subject)
                      setSelectedSubjectForTopic(subject)
                      setIsTopicModalOpen(true)
                    }}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      selectedSubject === subject
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:shadow-md'
                    }`}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Textbook-style Exercise Layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header Section */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">BÀI TẬP LUYỆN TẬP</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {selectedSubject}
              </span>
              <span>{filteredExercises.length} bài tập</span>
              
              {isGeneratingExercises && (
                <span className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  AI đang tạo bài tập thật...
                </span>
              )}
              {useGeneratedExercises && !isGeneratingExercises && (
                <span className="flex items-center gap-2 text-green-600">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Bài tập được AI tạo thật theo chủ đề
                </span>
              )}
            </div>
          </div>

          {/* Single Exercise Display with Pagination */}
          {currentExercise ? (
            <div className="space-y-6">
              {/* Page Navigation */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                    >
                      ← Bài trước
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === filteredExercises.length - 1}
                      variant="outline"
                      size="sm"
                    >
                      Bài tiếp →
                    </Button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="flex gap-1">
                  {filteredExercises.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPage ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Exercise */}
              <div className="exercise-item pb-8">

                {/* Exercise Content */}
                <div className="ml-0">
                  {renderExerciseContent(currentExercise)}
                </div>

                {/* Action Buttons */}
                <div className="ml-0 mt-6">
                  {renderActionButtons(currentExercise)}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Chưa có bài tập nào
                </h3>
                <p className="text-sm text-gray-500">
                  Hãy chọn môn học và tạo bài tập để bắt đầu học
                </p>
              </CardContent>
            </Card>
          )}

          {/* Page Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Tổng cộng: {filteredExercises.length} bài tập</span>
              <div className="flex items-center gap-2">
                <span>Trang 1</span>
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredExercises.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy bài tập nào
              </h3>
              <p className="text-gray-600">
                Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Topic Selection Modal */}
      <Dialog open={isTopicModalOpen} onOpenChange={handleCloseTopicModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Chọn chủ đề học tập</DialogTitle>
            <DialogDescription>
              Chọn lớp và chủ đề để AI tạo bài tập phù hợp cho bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Subject Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Môn học đã chọn:</h3>
              <p className="text-blue-700">{selectedSubjectForTopic} - {userGrade}</p>
            </div>

            {/* Topic Selection */}
            {selectedGrade && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn chủ đề cho {selectedGrade} - {selectedSubjectForTopic}:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getTopicsForSubjectAndGrade(selectedSubjectForTopic, selectedGrade).map((topic: string) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicChange(topic)}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        selectedTopic === topic
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseTopicModal}>
              Hủy
            </Button>
            <Button 
              onClick={handleGenerateExercises}
              disabled={!selectedTopic || isGeneratingExercises || (dailyLimitData ? !dailyLimitData.canCreate : false)}
              className={`${
                dailyLimitData && !dailyLimitData.canCreate 
                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {dailyLimitData && !dailyLimitData.canCreate 
                ? `Đã hết ${dailyLimitData.dailyLimit} bài/ngày`
                : isGeneratingExercises 
                  ? 'AI đang tạo bài tập...' 
                  : 'Tạo bài tập'
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        allExercises={useGeneratedExercises ? generatedExercises : []}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveAnswer={handleSaveAnswer}
      />
    </div>
  )
}
