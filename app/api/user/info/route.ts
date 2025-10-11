import { NextRequest, NextResponse } from 'next/server'
import { tokenManager } from '@/lib/tokenManager'
import { createServerClientForAPI } from '@/lib/supabaseServer'

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

    // Get user info from database
    const supabase = createServerClientForAPI()
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email, plan, role')
      .eq('id', userId)
      .single()

    // Get token info from tokenManager
    const tokenInfo = await tokenManager.getTokenInfo(userId)
    
    // Calculate percentage for progress bar (no specific numbers shown)
    const usagePercentage = Math.round((tokenInfo.used / tokenInfo.quota) * 100)
    const isNearLimit = usagePercentage >= 80
    const isAtLimit = usagePercentage >= 100

    // Get plan display name
    const planNames = {
      'basic': 'Gói Cơ Bản',
      'premium': 'Gói Cao Cấp',
      'pro': 'Gói Chuyên Nghiệp'
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: userData?.name || 'User',
        email: userData?.email || '',
        plan: planNames[tokenInfo.plan as keyof typeof planNames] || 'Gói Cơ Bản',
        role: userData?.role || 'parent',
        usagePercentage: usagePercentage,
        isNearLimit: isNearLimit,
        isAtLimit: isAtLimit,
        unlocksUsed: 0, // TODO: Implement unlock tracking
        unlocksQuota: 10,
        lastReset: tokenInfo.lastReset
      }
    })

  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin người dùng' },
      { status: 500 }
    )
  }
}
