import { NextRequest, NextResponse } from 'next/server'
import { createServerClientForAPI } from '@/lib/supabaseServer'
import crypto from 'crypto'

// Simple encryption for unlock code (can be improved with more secure methods)
const encryptCode = (code: string): string => {
  const secretKey = process.env.UNLOCK_CODE_SECRET || 'default-secret-key-change-in-production'
  return crypto.createHmac('sha256', secretKey).update(code).digest('hex')
}

const verifyCode = (code: string, hashedCode: string): boolean => {
  return encryptCode(code) === hashedCode
}

/**
 * GET /api/unlock-code?userId=xxx
 * Get user's unlock code info (not the actual code, just metadata)
 */
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

    const supabase = createServerClientForAPI()

    const { data: user, error } = await supabase
      .from('users')
      .select('unlock_quota, unlocks_used')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      unlockQuota: user.unlock_quota || 10,
      unlocksUsed: user.unlocks_used || 0,
      hasUnlockCode: !!(user as any).unlock_code
    })

  } catch (error) {
    console.error('Get unlock code info error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/unlock-code
 * Set or verify unlock code
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, action, code } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = createServerClientForAPI()

    if (action === 'set') {
      // Set new unlock code
      if (!code || code.length < 6) {
        return NextResponse.json(
          { error: 'Mã unlock phải có ít nhất 6 ký tự' },
          { status: 400 }
        )
      }

      const hashedCode = encryptCode(code)

      const { error } = await supabase
        .from('users')
        .update({ unlock_code: hashedCode })
        .eq('id', userId)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Đã cập nhật mã unlock'
      })

    } else if (action === 'verify') {
      // Verify unlock code
      if (!code) {
        return NextResponse.json(
          { error: 'Thiếu mã unlock' },
          { status: 400 }
        )
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('unlock_code, unlock_quota, unlocks_used')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'Không tìm thấy người dùng' },
          { status: 404 }
        )
      }

      if (!user.unlock_code) {
        return NextResponse.json(
          { error: 'Chưa thiết lập mã unlock' },
          { status: 400 }
        )
      }

      // Check if user has exceeded unlock quota
      if (user.unlocks_used >= user.unlock_quota) {
        return NextResponse.json(
          { 
            error: 'Đã hết lượt unlock hôm nay',
            valid: false 
          },
          { status: 429 }
        )
      }

      const isValid = verifyCode(code, user.unlock_code)

      if (isValid) {
        // Increment unlocks_used
        await supabase
          .from('users')
          .update({ unlocks_used: (user.unlocks_used || 0) + 1 })
          .eq('id', userId)
      }

      return NextResponse.json({
        valid: isValid,
        remainingUnlocks: user.unlock_quota - (user.unlocks_used || 0) - (isValid ? 1 : 0)
      })

    } else {
      return NextResponse.json(
        { error: 'Action không hợp lệ' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Unlock code API error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra' },
      { status: 500 }
    )
  }
}

