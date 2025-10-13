'use client'

import { NavbarPreviewPublic } from '@/components/NavbarPreviewPublic'

export default function PreviewDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Preview with Unlock + Upgrade buttons - Public version (no auth) */}
      <NavbarPreviewPublic />
      
      {/* Main Content */}
      {children}
    </div>
  )
}

