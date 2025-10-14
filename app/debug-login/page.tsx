'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabaseClient'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('demogv@gmail.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('🔐 Attempting login with:', { email, password })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('📋 Login result:', { data, error })

      if (error) {
        setError(`Login failed: ${error.message}`)
        setResult({ error: error.message, code: error.code, status: error.status })
      } else {
        setResult({
          success: true,
          userId: data.user?.id,
          email: data.user?.email,
          sessionExpires: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString('vi-VN') : 'N/A'
        })
        setError('')
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`)
      setResult({ exception: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setResult(null)
      setError('')
      console.log('🔓 Logged out')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const testAccounts = [
    { email: 'demogv@gmail.com', password: '123456', name: 'Demo Teacher' },
    { email: 'teacher@test.com', password: 'teacher123', name: 'Test Teacher' },
    { email: 'parent@test.com', password: 'parent123', name: 'Test Parent' },
    { email: 'giaovien@gmail.com', password: 'giaovien123', name: 'Original Teacher' }
  ]

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Login Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Test Login'}
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium">❌ Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-green-800 font-medium">
                {result.success ? '✅ Success!' : '📋 Result:'}
              </h3>
              <pre className="text-green-700 text-sm mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-medium mb-4">🧪 Quick Test Accounts:</h3>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((account, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className="justify-start"
                >
                  {account.name}: {account.email}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-blue-800 font-medium mb-2">🔍 Debug Info:</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• Environment: {process.env.NODE_ENV}</p>
              <p>• Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p>• Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p>• User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
              <p>• Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
