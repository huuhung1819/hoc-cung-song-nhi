import { NextRequest, NextResponse } from 'next/server'
import { createServerClientForAPI } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Thiếu số điện thoại' }, { status: 400 })
    }

    const supabase = createServerClientForAPI()

    // Find user by phone number
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('phone', phone)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản với số điện thoại này' }, { status: 404 })
    }

    return NextResponse.json({ email: user.email })
  } catch (error: any) {
    console.error('Get email from phone API error:', error)
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi tìm kiếm tài khoản. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
