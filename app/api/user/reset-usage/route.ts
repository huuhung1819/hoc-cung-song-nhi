import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu User ID' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Reset user's usage data
    const { error } = await supabase
      .from('users')
      .update({
        token_used_today: 0,
        last_reset: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error resetting usage:', error)
      return NextResponse.json({ error: 'Không thể reset usage data' }, { status: 500 })
    }

    // Also clear any existing token logs for today
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('token_logs')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)

    return NextResponse.json({ 
      success: true, 
      message: 'Đã reset usage data thành công' 
    })

  } catch (error: any) {
    console.error('Reset usage API error:', error)
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi reset usage data' },
      { status: 500 }
    )
  }
}
