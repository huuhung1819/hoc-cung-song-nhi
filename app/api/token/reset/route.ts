import { NextRequest, NextResponse } from 'next/server'
import { tokenManager } from '@/lib/tokenManager'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    // Reset daily tokens for user
    await tokenManager.resetDailyTokens(userId)

    return NextResponse.json({
      message: 'Reset token thành công',
      resetAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Reset token error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi reset token' },
      { status: 500 }
    )
  }
}

// Cron job endpoint for daily reset (called by external cron service)
export async function GET() {
  try {
    // Reset tokens for all users
    await tokenManager.resetAllDailyTokens()

    return NextResponse.json({
      message: 'Reset token hàng ngày hoàn thành',
      resetAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Daily reset error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi reset token hàng ngày' },
      { status: 500 }
    )
  }
}
