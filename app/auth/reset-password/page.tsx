'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  // Check if user has valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('=== RESET PASSWORD DEBUG ===')
        console.log('Checking session...')
        
        // Use URLSearchParams from window.location
        const params = new URLSearchParams(window.location.search)
        console.log('Search params:', Object.fromEntries(params.entries()))
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setError('Phiên đăng nhập không hợp lệ. Vui lòng thử lại từ email.')
          setSessionLoading(false)
          return
        }

        console.log('Current session:', data.session ? 'EXISTS' : 'NONE')
        
        if (data.session) {
          console.log('✅ Valid session found')
          setIsValidSession(true)
        } else {
          // Check if there's a code parameter (from email link)
          const code = params.get('code')
          console.log('Code parameter:', code ? 'EXISTS' : 'NONE')
          
          if (code) {
            console.log('Attempting code exchange...')
            // Try to exchange the code for a session
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('❌ Code exchange error:', exchangeError)
              setError(`Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Chi tiết: ${exchangeError.message}`)
            } else if (exchangeData.session) {
              console.log('✅ Code exchange successful')
              setIsValidSession(true)
            } else {
              console.error('❌ No session created from code exchange')
              setError('Không thể tạo phiên đăng nhập từ code.')
            }
          } else {
            console.log('❌ No code parameter found')
            setError('Bạn cần truy cập từ link trong email để đặt lại mật khẩu.')
          }
        }
      } catch (err: any) {
        console.error('❌ Unexpected error:', err)
        setError(`Có lỗi xảy ra khi kiểm tra phiên đăng nhập: ${err.message}`)
      } finally {
        setSessionLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Đang kiểm tra phiên đăng nhập...</h2>
          <p className="text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  // Show error state if no valid session
  if (!isValidSession && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="shadow-2xl border border-gray-200">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl font-bold shadow-lg">
                  ❌
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">Lỗi xác thực</CardTitle>
              <CardDescription className="text-red-700">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm text-center">
                    Vui lòng kiểm tra lại email và click vào link đặt lại mật khẩu.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Gửi lại email đặt lại mật khẩu
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border border-gray-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                🔐
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
            <CardDescription className="text-base">
              Nhập mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
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
                    'Đặt lại mật khẩu'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Đặt lại mật khẩu thành công!
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!success && (
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Mật khẩu phải có ít nhất 6 ký tự và nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
          </div>
        )}
      </div>
    </div>
  )
}
