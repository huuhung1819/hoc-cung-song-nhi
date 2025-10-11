import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, phone } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu User ID' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Update user info
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Không thể cập nhật thông tin người dùng', details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Đã cập nhật thông tin user thành công', user: updatedUser })
  } catch (error: any) {
    console.error('Update user API error:', error)
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
