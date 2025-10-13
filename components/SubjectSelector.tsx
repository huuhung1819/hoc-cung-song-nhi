'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SubjectSelectorProps {
  onSubjectSelect: (subject: string, subSubject: string) => void
  isUnlockMode: boolean
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

export function SubjectSelector({ onSubjectSelect, isUnlockMode }: SubjectSelectorProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const handleSubjectClick = (subjectKey: string) => {
    setSelectedSubject(subjectKey)
  }

  const handleSubSubjectClick = (subSubject: string) => {
    if (selectedSubject) {
      onSubjectSelect(selectedSubject, subSubject)
    }
  }

  return (
    <div className="space-y-4">
      {/* AI Status */}
      <div className="text-center">
        <div className="text-2xl mb-2">😴</div>
        <p className="text-gray-600">AI đang chờ bạn chọn môn học...</p>
      </div>

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
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-900 transition-colors"
              >
                {subSubject}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          {isUnlockMode ? (
            <>
              <span className="text-green-600 mr-2">✅</span>
              Có lời giải
            </>
          ) : (
            <>
              <span className="text-yellow-600 mr-2">💡</span>
              Chỉ hướng dẫn
            </>
          )}
        </div>
      </div>
    </div>
  )
}
