'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [grade, setGrade] = useState('')
  const [userRole, setUserRole] = useState('parent')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0[0-9]{9}$/
    return phoneRegex.test(phone)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate required fields
    if (!fullName.trim()) {
      setError('Vui lòng không bỏ trống trường họ và tên')
      return
    }

    if (!email.trim()) {
      setError('Vui lòng không bỏ trống trường email')
      return
    }

    if (!phoneNumber.trim()) {
      setError('Vui lòng không bỏ trống trường số điện thoại')
      return
    }

    if (!grade.trim()) {
      setError('Vui lòng chọn lớp học')
      return
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError('Định dạng email không hợp lệ')
      return
    }

    // Validate phone format (Vietnam standard)
    if (!validatePhone(phoneNumber)) {
      setError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')
      return
    }

    // Validate CAPTCHA
    if (!captchaChecked) {
      setError('Vui lòng xác nhận bạn không phải robot')
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phoneNumber,
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Translate common Supabase error messages to Vietnamese
        let errorMessage = error.message
        if (error.message.includes('User already registered')) {
          errorMessage = 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email không hợp lệ'
        } else if (error.message.includes('Password too weak')) {
          errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn'
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Gửi email quá nhiều. Vui lòng thử lại sau ít phút'
        } else if (error.message.includes('Signup is disabled')) {
          errorMessage = 'Đăng ký tạm thời bị tắt. Vui lòng liên hệ quản trị viên'
        }
        setError(errorMessage)
      } else if (data.user) {
        // Update user info with full name and phone
        try {
          console.log('Updating user info:', {
            userId: data.user.id,
            name: fullName,
            email: email,
            phone: phoneNumber,
            grade: grade,
          })
          
          const updateResponse = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              name: fullName,
              email: email,
              phone: phoneNumber,
              grade: grade,
              role: userRole,
            }),
          })
          
          const updateResult = await updateResponse.json()
          console.log('Update result:', updateResult)
        } catch (updateError) {
          console.error('Error updating user info:', updateError)
          // Don't fail the registration if update fails
        }

        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Header Section */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-xl font-bold text-white">SN</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-gray-600">
            Tạo tài khoản để bắt đầu học cùng con
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm text-center">{success}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                placeholder="Nhập họ và tên của bạn"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Grade Selection */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học của con <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                name="grade"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">-- Chọn lớp học --</option>
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
                <option value="Lớp 6">Lớp 6</option>
                <option value="Lớp 7">Lớp 7</option>
                <option value="Lớp 8">Lớp 8</option>
                <option value="Lớp 9">Lớp 9</option>
                <option value="Lớp 10">Lớp 10</option>
                <option value="Lớp 11">Lớp 11</option>
                <option value="Lớp 12">Lớp 12</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                📚 Con chọn lớp để AI đưa ra bài tập đúng lớp của con
              </p>
            </div>

            {/* Teacher Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <h3 className="text-xs font-medium text-purple-800">
                    Dành cho Giáo viên
                  </h3>
                  <div className="mt-1 text-xs text-purple-700">
                    <p>Nếu bạn là giáo viên, vui lòng liên hệ quản trị viên để được cấp tài khoản.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                  placeholder="Mật khẩu (ít nhất 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="captcha"
                checked={captchaChecked}
                onChange={(e) => setCaptchaChecked(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="captcha" className="text-xs font-medium text-gray-700">
                Tôi không phải robot
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
              disabled={loading || !captchaChecked}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang đăng ký...
                </div>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-3">
              <p className="text-xs text-gray-600">
                Đã có tài khoản?{' '}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="text-purple-600 hover:text-purple-500">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-500">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}