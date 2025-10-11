'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function SimpleTestPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testFlow = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Step 1: Send reset email
      setResult('Bước 1: Gửi email reset password...\n')
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        setResult(prev => prev + `❌ Lỗi gửi email: ${error.message}\n`)
        setLoading(false)
        return
      }
      
      setResult(prev => prev + '✅ Email đã được gửi thành công!\n')
      setResult(prev => prev + `📧 Kiểm tra email: ${email}\n`)
      setResult(prev => prev + `🔗 Link sẽ redirect đến: ${window.location.origin}/auth/reset-password\n`)
      setResult(prev => prev + '\n---\n')
      setResult(prev => prev + '📋 Hướng dẫn test:\n')
      setResult(prev => prev + '1. Check email inbox\n')
      setResult(prev => prev + '2. Click vào link reset password\n')
      setResult(prev => prev + '3. Nếu lỗi, check console logs (F12)\n')
      setResult(prev => prev + '4. Báo lại lỗi cụ thể để fix\n')
      
    } catch (error: any) {
      setResult(prev => prev + `❌ Exception: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setResult(`❌ Lỗi check session: ${error.message}`)
      } else if (data.session) {
        setResult(`✅ Có session:\n- User: ${data.session.user?.email}\n- Expires: ${new Date(data.session.expires_at * 1000).toLocaleString()}`)
      } else {
        setResult('ℹ️ Không có session active')
      }
      
    } catch (error: any) {
      setResult(`❌ Exception: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Simple Reset Password Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Reset Password Flow</h2>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Nhập email để test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={testFlow}
              disabled={loading || !email}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {loading ? 'Đang test...' : 'Test Reset Password'}
            </button>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Check Current Session</h2>
          <button
            onClick={checkSession}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            {loading ? 'Checking...' : 'Check Session'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Kết quả:</h2>
            <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded border">{result}</pre>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">🔧 Debug URLs</h2>
          <div className="space-y-1 text-sm">
            <div><strong>Reset Password:</strong> <a href="/auth/reset-password" className="text-blue-600 underline">/auth/reset-password</a></div>
            <div><strong>Callback:</strong> <a href="/auth/callback" className="text-blue-600 underline">/auth/callback</a></div>
            <div><strong>Forgot Password:</strong> <a href="/auth/forgot-password" className="text-blue-600 underline">/auth/forgot-password</a></div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">🚨 Nếu vẫn lỗi:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Mở Developer Tools (F12)</li>
            <li>Click vào link từ email</li>
            <li>Check Console tab để xem error logs</li>
            <li>Copy error message và gửi cho tôi</li>
            <li>Check Network tab để xem request/response</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
