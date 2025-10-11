'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
        } else {
          setSession(data.session)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Auth Flow</h1>
      
      <div className="space-y-6">
        {/* URL Parameters */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">URL Parameters</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Code:</strong> {code || 'None'}</div>
            <div><strong>Error:</strong> {errorParam || 'None'}</div>
            <div><strong>Error Description:</strong> {errorDescription || 'None'}</div>
            <div><strong>Full URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server side'}</div>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Session</h2>
          {session ? (
            <div className="space-y-2 text-sm">
              <div><strong>User ID:</strong> {session.user?.id}</div>
              <div><strong>Email:</strong> {session.user?.email}</div>
              <div><strong>Expires:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No active session</div>
          )}
        </div>

        {/* Error Info */}
        {error && (
          <div className="bg-red-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Test Actions */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
          <div className="space-y-2">
            <button
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.exchangeCodeForSession(code || '')
                  console.log('Exchange result:', { data, error })
                  alert(`Exchange result: ${error ? error.message : 'Success'}`)
                } catch (err: any) {
                  console.error('Exchange error:', err)
                  alert(`Exchange error: ${err.message}`)
                }
              }}
              disabled={!code}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Test Code Exchange
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/auth/login'
              }}
              className="px-4 py-2 bg-green-500 text-white rounded ml-2"
            >
              Go to Login
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/auth/forgot-password'
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded ml-2"
            >
              Go to Forgot Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
