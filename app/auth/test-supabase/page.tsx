'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function TestSupabasePage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testSupabaseConnection = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Test 1: Check Supabase client
      setResult('Testing Supabase client...\n')
      
      // Test 2: Try to get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      setResult(prev => prev + `Session test: ${sessionError ? `Error: ${sessionError.message}` : `Success: ${sessionData.session ? 'Has session' : 'No session'}`}\n`)
      
      // Test 3: Try to send reset password email
      const testEmail = 'test@example.com'
      setResult(prev => prev + `Sending reset email to ${testEmail}...\n`)
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      
      if (resetError) {
        setResult(prev => prev + `Reset email error: ${resetError.message}\n`)
      } else {
        setResult(prev => prev + `Reset email sent successfully!\n`)
      }
      
      // Test 4: Check environment
      setResult(prev => prev + `Environment: ${process.env.NODE_ENV}\n`)
      setResult(prev => prev + `Origin: ${window.location.origin}\n`)
      
    } catch (error: any) {
      setResult(prev => prev + `Exception: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  const testCodeExchange = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Simulate a code exchange
      const fakeCode = 'test-code-123'
      setResult(`Testing code exchange with: ${fakeCode}\n`)
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(fakeCode)
      
      if (error) {
        setResult(prev => prev + `Code exchange error (expected): ${error.message}\n`)
      } else {
        setResult(prev => prev + `Code exchange success: ${JSON.stringify(data)}\n`)
      }
      
    } catch (error: any) {
      setResult(prev => prev + `Code exchange exception: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Supabase Connection</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testSupabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {loading ? 'Testing...' : 'Test Supabase Connection'}
          </button>
          
          <button
            onClick={testCodeExchange}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Test Code Exchange
          </button>
        </div>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Supabase Connection" to check basic connectivity</li>
            <li>Check the console for detailed logs</li>
            <li>If reset email works, check your email inbox</li>
            <li>Click the link in the email to test the full flow</li>
          </ol>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug URLs:</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Debug Page:</strong> <a href="/auth/debug" className="text-blue-600 underline">/auth/debug</a></div>
            <div><strong>Forgot Password:</strong> <a href="/auth/forgot-password" className="text-blue-600 underline">/auth/forgot-password</a></div>
            <div><strong>Test Reset:</strong> <a href="/auth/test-reset" className="text-blue-600 underline">/auth/test-reset</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}
