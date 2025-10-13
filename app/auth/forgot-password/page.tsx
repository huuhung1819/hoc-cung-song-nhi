'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

        try {
          console.log('Sending reset password email to:', email)
          console.log('Redirect URL:', `${window.location.origin}/auth/reset-password`)
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })

      if (error) {
        // Translate common Supabase error messages to Vietnamese
        let errorMessage = error.message
        if (error.message.includes('User not found')) {
          errorMessage = 'Không tìm thấy tài khoản với email này'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email không hợp lệ'
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Gửi email quá nhiều. Vui lòng thử lại sau ít phút'
        } else if (error.message.includes('For security purposes')) {
          errorMessage = 'Vì lý do bảo mật, vui lòng thử lại sau ít phút'
        }
        setError(errorMessage)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Login Link */}
        <Link 
          href="/auth/login" 
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại đăng nhập
        </Link>

        <Card className="shadow-2xl border border-gray-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                🔑
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-base">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn"
                    required
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-5xl mb-4">📧</div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Đã gửi email thành công!
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến email:
                  </p>
                  <p className="text-sm font-medium text-green-900 mb-4">
                    {email}
                  </p>
                  <p className="text-xs text-green-600">
                    Vui lòng kiểm tra hộp thư của bạn và click vào link trong email để đặt lại mật khẩu.
                  </p>
                </div>

                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.</p>
        </div>
      </div>
    </div>
  )
}

