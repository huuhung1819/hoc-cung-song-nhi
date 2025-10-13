import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/lib/supabaseClient'
import { AuthProvider } from '@/lib/authContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Learning Dashboard',
  description: 'Nền tảng học tập AI cho học sinh, giáo viên và phụ huynh',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SupabaseProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
