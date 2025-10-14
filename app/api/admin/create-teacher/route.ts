import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'
import { logAdminActivityFromRequest } from '@/lib/adminSecurity'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    // Check if user is admin
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, name, phone, role } = await request.json()

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Định dạng email không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['teacher', 'admin', 'parent']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role không hợp lệ' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng' },
        { status: 400 }
      )
    }

    // Create auth user using admin API (bypasses email verification)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        role: role || 'teacher'
      },
      email_confirm: true // Auto-confirm email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: `Không thể tạo tài khoản: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản' },
        { status: 500 }
      )
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone: phone || null,
        role: role || 'teacher',
        plan: 'basic',
        token_quota: role === 'teacher' ? 1000 : 500, // Teachers get more tokens
        token_used_today: 0,
        last_reset: new Date().toISOString().split('T')[0],
        is_active: true
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `Không thể tạo hồ sơ người dùng: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Log admin activity
    await logAdminActivityFromRequest(
      userId,
      'admin_create_teacher',
      request,
      {
        targetUserId: authData.user.id,
        targetEmail: email,
        targetName: name,
        targetRole: role || 'teacher'
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Tạo tài khoản giáo viên thành công',
      user: {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role
      }
    })

  } catch (error) {
    console.error('Create teacher API error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tài khoản' },
      { status: 500 }
    )
  }
}

