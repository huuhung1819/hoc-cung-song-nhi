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
import { Eye, EyeOff, BookOpen, Star, ArrowLeft } from 'lucide-react'

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
        // Translate common Supabase error messages to Vietnamese
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Thông tin đăng nhập không chính xác'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Không tìm thấy tài khoản'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email không hợp lệ'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Mật khẩu quá ngắn'
        }
        setError(errorMessage)
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
          console.log('🔐 Login Debug - User ID:', userId)
          
          if (!userId) {
            throw new Error('Missing user id after login')
          }
          
          const userInfoResponse = await fetch(`/api/user/info?userId=${userId}`)
          console.log('🔐 Login Debug - API Response Status:', userInfoResponse.status)
          
          const userInfo = await userInfoResponse.json()
          console.log('🔐 Login Debug - User Info:', userInfo)
          console.log('🔐 Login Debug - User Role:', userInfo?.user?.role)
          
          if (userInfo.success && userInfo.user?.role === 'admin') {
            console.log('✅ Admin detected! Redirecting to /admin')
            window.location.href = '/admin' // Use hard redirect instead of router.push
          } else if (userInfo.success && userInfo.user?.role === 'teacher') {
            console.log('👨‍🏫 Teacher detected! Redirecting to /teacher')
            window.location.href = '/teacher' // Use hard redirect instead of router.push
          } else {
            console.log('👨‍👩‍👧‍👦 Parent detected! Redirecting to /dashboard')
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('❌ Error getting user role:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header với nút quay lại */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Quay lại trang chủ</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {/* Logo và tiêu đề */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <img
                  src="/images/song-nhi-girls.jpg"
                  alt="Hai bé gái Song Nhi"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover object-center shadow-lg border-4 border-white"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-3 h-3 md:w-5 md:h-5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HỌC CÙNG SONG NHI
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                  Đăng nhập vào hệ thống
                </p>
              </div>
            </div>
          </div>

          {/* Form đăng nhập */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-600 text-sm text-center font-medium">{success}</p>
                  </div>
                )}

                {/* Email/Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone" className="text-sm font-semibold text-gray-700">
                    Email hoặc Số điện thoại
                  </Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Nhập email hoặc số điện thoại"
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                      className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 pr-12 transition-all duration-200"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-gray-600">
                      Ghi nhớ đăng nhập
                    </Label>
                  </div>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors text-center sm:text-right"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* CAPTCHA */}
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <Checkbox
                    id="captcha"
                    checked={captchaChecked}
                    onCheckedChange={(checked) => setCaptchaChecked(checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <Label htmlFor="captcha" className="text-sm font-normal text-gray-600">
                    Tôi không phải robot
                  </Label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                  </div>
                )}

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !captchaChecked}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <Link 
                    href="/auth/register" 
                    className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features highlight */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-medium">AI Thông Minh</p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Học Tập Cá Nhân</p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Con thông minh hơn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
