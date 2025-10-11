'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: string) => {
    setLoading(true)
    try {
      // Demo login - create demo user session
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Nguyễn Văn A',
        role: role
      }
      
      // Store demo user in localStorage for demo purposes
      localStorage.setItem('demo-user', JSON.stringify(demoUser))
      
      // Redirect to appropriate dashboard
      if (role === 'parent') {
        router.push('/dashboard')
      } else if (role === 'teacher') {
        router.push('/teacher')
      } else if (role === 'admin') {
        router.push('/admin')
      }
    } catch (err) {
      setError('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=48&h=48&fit=crop&crop=face&auto=format"
              alt="2 bé hoạt hình"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold">HỌC CÙNG SONG NHI</CardTitle>
          <CardDescription>
            Đăng nhập vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
              <Label htmlFor="captcha" className="text-sm font-normal">
                Tôi không phải robot
              </Label>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !captchaChecked}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc đăng nhập demo
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin('parent')}
                disabled={loading}
              >
                Demo Phụ huynh
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin('teacher')}
                disabled={loading}
              >
                Demo Giáo viên
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
              >
                Demo Quản trị viên
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
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
