import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createClient()

    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách người dùng' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, plan, tokenQuota } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản' },
        { status: 400 }
      )
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        plan: plan || 'basic',
        token_quota: tokenQuota || 500,
        token_used_today: 0,
        last_reset: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    return NextResponse.json({
      user: userData,
      message: 'Tạo tài khoản thành công'
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tài khoản' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, role, plan, tokenQuota, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID người dùng' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const updateData: any = {}
    if (name) updateData.name = name
    if (role) updateData.role = role
    if (plan) updateData.plan = plan
    if (tokenQuota) updateData.token_quota = tokenQuota
    if (isActive !== undefined) updateData.is_active = isActive

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      user: data,
      message: 'Cập nhật thông tin thành công'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi cập nhật thông tin' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID người dùng' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Delete user profile
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (userError) {
      throw userError
    }

    // Delete user from auth (requires admin privileges)
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.warn('Could not delete auth user:', authError)
    }

    return NextResponse.json({
      message: 'Xóa người dùng thành công'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa người dùng' },
      { status: 500 }
    )
  }
}
