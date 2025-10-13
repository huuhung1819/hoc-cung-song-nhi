import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, phone, grade } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu User ID' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if user exists, if not create them
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create them
      console.log('User does not exist, creating new user:', userId)
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: name || '',
          email: email || '',
          phone: phone || '',
          grade: grade || 'Lớp 1',
          plan: 'basic',
          role: 'parent'
        })
        .select('*')
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Không thể tạo người dùng mới', details: createError }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Đã tạo người dùng mới thành công', user: newUser })
    }

    // Update user info
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone) updateData.phone = phone
    if (grade) updateData.grade = grade

    console.log('Updating user with data:', updateData)
    console.log('User ID:', userId)

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    console.log('Updated user result:', updatedUser)
    console.log('Update error:', error)

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
