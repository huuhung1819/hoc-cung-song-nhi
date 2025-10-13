'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for email verification success
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setSuccess('✅ Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.')
    }
  }, [searchParams])

  // Helper function to get email from phone number
  const getEmailFromPhone = async (phone: string) => {
    try {
      const response = await fetch(`/api/user/get-email-from-phone?phone=${encodeURIComponent(phone)}`)
      if (response.ok) {
        const data = await response.json()
        return data.email
      }
      return null
    } catch (error) {
      console.error('Error getting email from phone:', error)
      return null
    }
  }

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const rememberMeStatus = localStorage.getItem('rememberMe') === 'true'
    
    if (rememberMeStatus && savedEmail && savedPassword) {
      setEmailOrPhone(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate CAPTCHA
    if (!captchaChecked) {
      setError('Vui lòng xác nhận bạn không phải robot')
      setLoading(false)
      return
    }

    try {
      let loginEmail = emailOrPhone

      // If input is not an email, try to get email from phone number
      if (!emailOrPhone.includes('@')) {
        const emailFromPhone = await getEmailFromPhone(emailOrPhone)
        if (!emailFromPhone) {
          setError('Không tìm thấy tài khoản với số điện thoại này')
          setLoading(false)
          return
        }
        loginEmail = emailFromPhone
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', emailOrPhone) // Save original input
          localStorage.setItem('rememberedPassword', password)
          localStorage.setItem('rememberMe', 'true')
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
          localStorage.removeItem('rememberMe')
        }

        // Redirect based on user role
        // Get user role from API to determine redirect destination
        try {
          const userId = data?.user?.id
          if (!userId) {
            throw new Error('Missing user id after login')
          }
          const userInfoResponse = await fetch(`/api/user/info?userId=${userId}`)
          const userInfo = await userInfoResponse.json()
          
          if (userInfo.success && userInfo.user.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error getting user role:', error)
          router.push('/dashboard') // fallback
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=48&h=48&fit=crop&crop=face&auto=format"
              alt="2 bé hoạt hình"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">HỌC CÙNG SONG NHI</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Đăng nhập vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <p className="text-green-600 text-xs sm:text-sm text-center">{success}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email hoặc Số điện thoại</Label>
              <Input
                id="emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-xs sm:text-sm font-normal">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 text-center sm:text-right">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Simple CAPTCHA */}
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
              <Checkbox
                id="captcha"
                checked={captchaChecked}
                onCheckedChange={(checked) => setCaptchaChecked(checked as boolean)}
              />
              <Label htmlFor="captcha" className="text-xs sm:text-sm font-normal">
                Tôi không phải robot
              </Label>
            </div>

            {error && (
              <div className="text-red-500 text-xs sm:text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full text-sm sm:text-base" disabled={loading || !captchaChecked}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
