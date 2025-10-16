'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

interface DatabaseSetupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DatabaseSetupModal({ isOpen, onClose }: DatabaseSetupModalProps) {
  const [copied, setCopied] = useState(false)

  const sqlCode = `-- Create daily exercise usage table
CREATE TABLE IF NOT EXISTS daily_exercise_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER DEFAULT 0 NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_exercise_usage_user_date ON daily_exercise_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_exercise_usage_date ON daily_exercise_usage(date);

-- Enable RLS
ALTER TABLE daily_exercise_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage" ON daily_exercise_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON daily_exercise_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON daily_exercise_usage
    FOR UPDATE USING (auth.uid() = user_id);`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Cần thiết lập Database
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 mb-2">Lỗi Database</h3>
                <p className="text-red-700 text-sm">
                  Bảng <code className="bg-red-100 px-1 rounded">daily_exercise_usage</code> chưa được tạo trong database. 
                  Bạn cần tạo bảng này để sử dụng tính năng giới hạn bài tập hàng ngày.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Hướng dẫn tạo bảng:</h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-medium">1</div>
                <div>
                  <p className="font-medium text-blue-800">Mở Supabase Dashboard</p>
                  <p className="text-blue-700 text-sm">Truy cập SQL Editor trong dự án của bạn</p>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Mở Supabase Dashboard
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-sm font-medium">2</div>
                <div>
                  <p className="font-medium text-green-800">Chạy SQL Code</p>
                  <p className="text-green-700 text-sm">Copy và paste đoạn code SQL bên dưới vào SQL Editor</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-sm font-medium">3</div>
                <div>
                  <p className="font-medium text-purple-800">Hoàn thành</p>
                  <p className="text-purple-700 text-sm">Sau khi chạy SQL, quay lại và thử tạo bài tập</p>
                </div>
              </div>
            </div>
          </div>

          {/* SQL Code */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">SQL Code cần chạy:</h4>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Đã copy
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sqlCode}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Đóng
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tải lại trang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
