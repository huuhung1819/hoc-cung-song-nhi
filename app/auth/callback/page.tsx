'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const type = searchParams.get('type')
        
        console.log('=== AUTH CALLBACK DEBUG ===')
        console.log('Callback params:', { code, errorParam, errorDescription, type })
        console.log('Full URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        
        // Check for error parameters first
        if (errorParam) {
          console.error('Auth callback error:', { errorParam, errorDescription })
          setError(`Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Chi tiết: ${errorDescription || errorParam}`)
          setLoading(false)
          return
        }

        // If there's a code parameter, exchange it for a session
        if (code) {
          console.log('Exchanging code for session:', code.substring(0, 10) + '...')
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('Code exchange error:', error)
              setError(`Lỗi xác thực code: ${error.message}`)
              setLoading(false)
              return
            }

            if (data.session) {
              console.log('Session created successfully, redirecting to reset password')
              // Successfully exchanged code for session, redirect to reset password
              router.push('/auth/reset-password')
              return
            } else {
              console.error('No session created from code exchange')
              setError('Không thể tạo phiên đăng nhập từ code.')
              setLoading(false)
              return
            }
          } catch (exchangeError: any) {
            console.error('Exchange code exception:', exchangeError)
            setError(`Lỗi khi xử lý code: ${exchangeError.message}`)
            setLoading(false)
            return
          }
        }

        // Fallback: check existing session
        console.log('No code found, checking existing session...')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setError('Có lỗi xảy ra khi xác thực. Vui lòng thử lại.')
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('Existing session found, redirecting to reset password')
          // User has a valid session, redirect to reset password
          router.push('/auth/reset-password')
        } else {
          console.log('No session found, redirecting to login')
          // No session and no code, redirect to login
          router.push('/auth/login')
        }
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError(`Có lỗi xảy ra: ${err.message}`)
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Đang xác thực...</h2>
          <p className="text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi xác thực</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return null
}
