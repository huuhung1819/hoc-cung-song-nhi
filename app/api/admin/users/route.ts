import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'
import { logAdminActivityFromRequest } from '@/lib/adminSecurity'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    // Check if user is admin
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log admin activity
    await logAdminActivityFromRequest(
      userId,
      'admin_users_list_viewed',
      request
    )

    const supabase = createServiceClient()

    // Get all users with their details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        plan,
        token_used_today,
        updated_at,
        created_at,
        is_active
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error getting users:', usersError)
      return NextResponse.json(
        { error: 'Failed to get users' },
        { status: 500 }
      )
    }

    // Transform user data
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || 'Chưa cập nhật',
      role: user.role || 'parent',
      plan: user.plan || 'free',
      status: user.is_active ? 'active' : 'banned',
      lastActive: user.updated_at ? new Date(user.updated_at).toLocaleString('vi-VN') : 'Chưa hoạt động',
      createdAt: new Date(user.created_at).toLocaleString('vi-VN'),
      tokensUsed: user.token_used_today || 0
    }))

    return NextResponse.json(transformedUsers)

  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    // Check if user is admin
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId, action, newRole, newStatus } = await request.json()

    // Log admin activity
    await logAdminActivityFromRequest(
      userId,
      'admin_user_update',
      request,
      { targetUserId, action, newRole, newStatus }
    )

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    let updateData: any = {}

    if (action === 'change_role' && newRole) {
      updateData.role = newRole
    } else if (action === 'change_status' && newStatus) {
      updateData.is_active = newStatus === 'active'
    } else if (action === 'ban') {
      updateData.is_active = false
    } else if (action === 'unban') {
      updateData.is_active = true
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
