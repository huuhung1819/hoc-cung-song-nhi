'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LessonCard } from '@/components/LessonCard'
import { Search, Filter, BookOpen } from 'lucide-react'

export default function LessonsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const lessons = [
    {
      id: 1,
      title: 'Toán lớp 1: Cộng trừ cơ bản',
      subject: 'Toán học',
      grade: 'Lớp 1',
      progress: 75,
      completed: false,
      description: 'Học cách cộng trừ các số từ 1-20',
      duration: '30 phút'
    },
    {
      id: 2,
      title: 'Tiếng Việt: Đọc và viết chữ cái',
      subject: 'Tiếng Việt',
      grade: 'Lớp 1',
      progress: 60,
      completed: false,
      description: 'Làm quen với bảng chữ cái tiếng Việt',
      duration: '45 phút'
    },
    {
      id: 3,
      title: 'Khoa học: Thực vật xung quanh',
      subject: 'Khoa học',
      grade: 'Lớp 1',
      progress: 100,
      completed: true,
      description: 'Tìm hiểu về các loại cây và hoa',
      duration: '25 phút'
    },
    {
      id: 4,
      title: 'Toán lớp 1: Hình học cơ bản',
      subject: 'Toán học',
      grade: 'Lớp 1',
      progress: 0,
      completed: false,
      description: 'Nhận biết các hình cơ bản: tròn, vuông, tam giác',
      duration: '20 phút'
    },
    {
      id: 5,
      title: 'Tiếng Việt: Đọc hiểu câu chuyện',
      subject: 'Tiếng Việt',
      grade: 'Lớp 1',
      progress: 0,
      completed: false,
      description: 'Đọc và hiểu những câu chuyện ngắn',
      duration: '35 phút'
    }
  ]

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = selectedGrade === 'all' || lesson.grade === selectedGrade
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject
    
    return matchesSearch && matchesGrade && matchesSubject
  })

  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
  const subjects = ['Toán học', 'Tiếng Việt', 'Khoa học', 'Lịch sử', 'Địa lý']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài học</h1>
          <p className="text-gray-600 mt-1">
            Khám phá và học tập với các bài học thú vị
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="w-4 h-4 mr-2" />
          Bài học mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm bài học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả lớp</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả môn</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {lesson.grade}
                </span>
                <span className="text-sm text-gray-500">{lesson.duration}</span>
              </div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiến độ</span>
                  <span className="text-sm font-medium">{lesson.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
                <Button 
                  className="w-full" 
                  variant={lesson.completed ? "secondary" : "default"}
                  disabled={lesson.completed}
                >
                  {lesson.completed ? 'Đã hoàn thành' : 'Bắt đầu học'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy bài học nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
