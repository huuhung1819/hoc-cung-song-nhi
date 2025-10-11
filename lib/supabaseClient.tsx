import { createBrowserClient } from '@supabase/ssr'
import React from 'react'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Supabase Provider for client-side
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
