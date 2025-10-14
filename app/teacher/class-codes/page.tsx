'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Key,
  Copy,
  Plus,
  Trash2,
  Users,
  CheckCircle,
  RefreshCw,
  Loader2,
  Link as LinkIcon
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ClassCode {
  id: string
  code: string
  name: string
  grade: string
  createdAt: string
  expiresAt: string | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
}

export default function ClassCodesPage() {
  const [classCodes, setClassCodes] = useState<ClassCode[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [className, setClassName] = useState('')
  const [classGrade, setClassGrade] = useState('Lớp 1')
  const [maxUses, setMaxUses] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const GRADES = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 
                  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
                  'Lớp 10', 'Lớp 11', 'Lớp 12']

  // Mock data - Replace with real API
  useEffect(() => {
    setClassCodes([
      {
        id: '1',
        code: 'LOP1A-2024',
        name: 'Lớp 1A',
        grade: 'Lớp 1',
        createdAt: '2025-10-10',
        expiresAt: null,
        maxUses: null,
        usedCount: 5,
        isActive: true
      },
      {
        id: '2',
        code: 'TOAN2B-X9K2',
        name: 'Lớp Toán 2B',
        grade: 'Lớp 2',
        createdAt: '2025-10-12',
        expiresAt: '2025-12-31',
        maxUses: 30,
        usedCount: 12,
        isActive: true
      }
    ])
  }, [])

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
      if (i === 3) code += '-'
    }
    return code
  }

  const handleCreateCode = async () => {
    if (!className) {
      alert('Vui lòng nhập tên lớp')
      return
    }

    setIsCreating(true)

    try {
      const newCode: ClassCode = {
        id: Date.now().toString(),
        code: generateCode(),
        name: className,
        grade: classGrade,
        createdAt: new Date().toISOString().split('T')[0],
        expiresAt: null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        usedCount: 0,
        isActive: true
      }

      // TODO: Call API
      // await fetch('/api/teacher/class-codes', {
      //   method: 'POST',
      //   body: JSON.stringify(newCode)
      // })

      await new Promise(resolve => setTimeout(resolve, 1000))

      setClassCodes([newCode, ...classCodes])
      setShowCreateModal(false)
      setClassName('')
      setClassGrade('Lớp 1')
      setMaxUses('')
      alert(`✅ Đã tạo mã lớp: ${newCode.code}`)
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyCode = (code: string) => {
    const inviteLink = `${window.location.origin}/join-class?code=${code}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (id: string) => {
    setClassCodes(classCodes.map(cc =>
      cc.id === id ? { ...cc, isActive: !cc.isActive } : cc
    ))
    // TODO: Call API to update
  }

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã này?')) return
    
    setClassCodes(classCodes.filter(cc => cc.id !== id))
    // TODO: Call API to delete
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-8 h-8 text-indigo-600" />
            Mã mời lớp
          </h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý mã mời để học sinh tham gia lớp
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã mới
        </Button>
      </div>

      {/* Instructions */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-indigo-900">Cách sử dụng mã mời</h3>
              <ul className="mt-2 text-sm text-indigo-700 space-y-1">
                <li>• Tạo mã mời cho lớp học của bạn</li>
                <li>• Chia sẻ link hoặc mã với học sinh</li>
                <li>• Học sinh click link hoặc nhập mã để tham gia lớp</li>
                <li>• Bạn có thể giới hạn số lượng sử dụng hoặc thời gian hết hạn</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Codes List */}
      {classCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <Key className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Chưa có mã lớp nào</p>
            <p className="text-sm mt-1">Click "Tạo mã mới" để bắt đầu</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classCodes.map((classCode) => (
            <Card key={classCode.id} className={!classCode.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {classCode.name}
                      {!classCode.isActive && (
                        <Badge variant="outline" className="text-gray-500">
                          Đã tắt
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{classCode.grade}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(classCode.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCode(classCode.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code Display */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Mã lớp</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-bold text-center">
                      {classCode.code}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(classCode.code)}
                    >
                      {copiedCode === classCode.code ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Link tham gia</Label>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs break-all">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/join-class?code=${classCode.code}`}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Đã sử dụng</span>
                    </div>
                    <p className="mt-1 font-semibold">
                      {classCode.usedCount}
                      {classCode.maxUses && ` / ${classCode.maxUses}`}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tạo ngày</div>
                    <p className="mt-1 font-semibold">
                      {new Date(classCode.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                {classCode.expiresAt && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Hết hạn: {new Date(classCode.expiresAt).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo mã mời lớp mới</DialogTitle>
            <DialogDescription>
              Tạo mã để học sinh có thể tự tham gia lớp của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Class Name */}
            <div className="space-y-2">
              <Label>Tên lớp *</Label>
              <Input
                placeholder="Ví dụ: Lớp 1A, Lớp Toán Nâng cao..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <Label>Khối lớp</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label>Giới hạn số lượng (tùy chọn)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Để trống = không giới hạn"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Số lượng học sinh tối đa có thể sử dụng mã này
              </p>
            </div>

            {/* Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Mã sẽ được tạo tự động:</p>
              <p className="font-mono font-bold text-center">XXXX-XXXX</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false)
                setClassName('')
                setClassGrade('Lớp 1')
                setMaxUses('')
              }}
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateCode}
              disabled={isCreating || !className}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mã
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


