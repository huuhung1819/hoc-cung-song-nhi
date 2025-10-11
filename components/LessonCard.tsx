'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn, getGradeColor, getSubjectColor } from '@/lib/utils'
import { BookOpen, Clock, CheckCircle, Play, RotateCcw } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  subject: string
  grade: string
  progress: number
  completed: boolean
  description?: string
  duration?: string
}

interface LessonCardProps {
  lesson: Lesson
  onStart?: (lesson: Lesson) => void
  className?: string
}

export function LessonCard({ lesson, onStart, className }: LessonCardProps) {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleStart = async () => {
    if (isStarting) return
    
    setIsStarting(true)
    try {
      // If custom onStart handler is provided, use it
      if (onStart) {
        await onStart(lesson)
        return
      }

      // Default behavior: navigate to lesson page
      // For now, we'll simulate lesson start with a delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Navigate to lesson page (you can customize this route)
      router.push(`/dashboard/lessons/${lesson.id}`)
    } catch (error) {
      console.error('Error starting lesson:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleReview = () => {
    // Navigate to lesson review page
    router.push(`/dashboard/lessons/${lesson.id}/review`)
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            getGradeColor(lesson.grade)
          )}>
            {lesson.grade}
          </span>
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            getSubjectColor(lesson.subject)
          )}>
            {lesson.subject}
          </span>
        </div>
        
        {lesson.completed && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {lesson.title}
      </h3>

      {/* Description */}
      {lesson.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {lesson.description}
        </p>
      )}

      {/* Duration */}
      {lesson.duration && (
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock className="w-4 h-4 mr-1" />
          {lesson.duration}
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tiến độ</span>
          <span className="text-sm font-medium">{lesson.progress}%</span>
        </div>
        <Progress value={lesson.progress} className="h-2" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {lesson.completed ? (
          <div className="space-y-2">
            <Button
              onClick={handleReview}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Xem lại bài học
            </Button>
            <div className="flex items-center justify-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Đã hoàn thành
            </div>
          </div>
        ) : (
          <Button
            onClick={handleStart}
            disabled={isStarting}
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700",
              isStarting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                {lesson.progress > 0 ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Tiếp tục học
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Bắt đầu học
                  </>
                )}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
