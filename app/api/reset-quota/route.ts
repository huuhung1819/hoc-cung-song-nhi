import { NextRequest, NextResponse } from 'next/server'
import { tokenManager } from '@/lib/tokenManager'

export async function POST(request: NextRequest) {
  try {
    // Reset demo user quota
    await tokenManager.resetDemoUserQuota()
    
    return NextResponse.json({
      success: true,
      message: 'Demo user quota đã được reset thành công'
    })
  } catch (error) {
    console.error('Error resetting quota:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi reset quota' },
      { status: 500 }
    )
  }
}
