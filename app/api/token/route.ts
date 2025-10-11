import { NextRequest, NextResponse } from 'next/server'
import { tokenManager } from '@/lib/tokenManager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    // Get token info for user
    const tokenInfo = await tokenManager.getTokenInfo(userId)

    return NextResponse.json(tokenInfo)

  } catch (error) {
    console.error('Get token info error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin token' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, amount } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'reset':
        // Reset daily tokens
        await tokenManager.resetDailyTokens(userId)
        return NextResponse.json({
          message: 'Reset token thành công'
        })

      case 'add':
        // Add tokens (admin only)
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Số lượng token không hợp lệ' },
            { status: 400 }
          )
        }
        await tokenManager.addTokens(userId, amount)
        return NextResponse.json({
          message: `Đã thêm ${amount} token`
        })

      case 'set_quota':
        // Set token quota (admin only)
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Quota token không hợp lệ' },
            { status: 400 }
          )
        }
        await tokenManager.setTokenQuota(userId, amount)
        return NextResponse.json({
          message: `Đã cập nhật quota token thành ${amount}`
        })

      default:
        return NextResponse.json(
          { error: 'Hành động không hợp lệ' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Token action error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi thực hiện hành động token' },
      { status: 500 }
    )
  }
}
