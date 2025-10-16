'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  PenTool, 
  Lightbulb, 
  Lock, 
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  title: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  estimatedTime: number // phút
  questionCount: number
  points: number
  isCompleted?: boolean
  userAnswer?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  onOpenModal: (exercise: Exercise) => void
  onToggleAnswer: (exerciseId: string) => void
  onAskAI: (exerciseId: string) => void
  onRequestSolution: (exerciseId: string) => void
  isShowingAnswer: boolean
  isAIHelping: boolean
}

export function ExerciseCard({ 
  exercise, 
  onOpenModal,
  onToggleAnswer,
  onAskAI,
  onRequestSolution,
  isShowingAnswer,
  isAIHelping
}: ExerciseCardProps) {
  const [userAnswer, setUserAnswer] = useState(exercise.userAnswer || '')

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

  const handleAnswerChange = (value: string) => {
    setUserAnswer(value)
    // Auto-save answer could be implemented here
  }

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-2",
      exercise.isCompleted 
        ? "border-green-200 bg-green-50/30" 
        : "border-gray-200 hover:border-blue-300"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">{exercise.subject}</span>
            </div>
            <CardTitle className="text-lg leading-tight mb-2">{exercise.title}</CardTitle>
          </div>
          {exercise.isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={getDifficultyColor(exercise.difficulty)}>
            {getDifficultyText(exercise.difficulty)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {exercise.estimatedTime} phút
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {exercise.points} điểm
          </Badge>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {exercise.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Answer Input Section */}
        {isShowingAnswer && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Nhập đáp án của bạn:</span>
            </div>
            <Input
              placeholder="Nhập đáp án..."
              value={userAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onOpenModal(exercise)}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px]"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Xem chi tiết
          </Button>

          <Button
            onClick={() => onToggleAnswer(exercise.id)}
            size="sm"
            className={cn(
              "flex-1 min-w-[100px]",
              isShowingAnswer 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <PenTool className="w-4 h-4 mr-1" />
            {isShowingAnswer ? 'Đang làm' : 'Làm bài'}
          </Button>

          <Button
            onClick={() => onAskAI(exercise.id)}
            variant="outline"
            size="sm"
            disabled={isAIHelping}
            className="flex-1 min-w-[120px] border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {isAIHelping ? 'Đang hỗ trợ...' : 'Hỏi AI'}
          </Button>

          <Button
            onClick={() => onRequestSolution(exercise.id)}
            variant="outline"
            size="sm"
            disabled={true}
            className="flex-1 min-w-[120px] border-gray-300 text-gray-500 cursor-not-allowed bg-gray-50"
          >
            <Lock className="w-4 h-4 mr-1" />
            Lời giải
          </Button>
        </div>

        {/* Exercise Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>{exercise.questionCount} câu hỏi</span>
          {exercise.isCompleted && (
            <span className="text-green-600 font-medium">Đã hoàn thành</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
