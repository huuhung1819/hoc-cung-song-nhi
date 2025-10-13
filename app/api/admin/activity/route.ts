import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    // Check if user is admin
    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get recent payment activities
    const { data: paymentActivities, error: paymentError } = await supabase
      .from('payment_requests')
      .select(`
        id,
        status,
        amount,
        created_at,
        approved_at,
        rejected_reason,
        users!payment_requests_user_id_fkey(email, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (paymentError) {
      console.error('Error getting payment activities:', paymentError)
    }

    // Get recent user registrations
    const { data: userActivities, error: userError } = await supabase
      .from('users')
      .select('id, email, name, created_at, role')
      .order('created_at', { ascending: false })
      .limit(5)

    if (userError) {
      console.error('Error getting user activities:', userError)
    }

    const activities = []

    // Process payment activities
    if (paymentActivities) {
      paymentActivities.forEach((payment: any) => {
        let message = ''
        let status: 'success' | 'warning' | 'error' = 'success'
        let timestamp = payment.created_at

        if (payment.status === 'approved') {
          message = `Thanh toán ${payment.amount.toLocaleString('vi-VN')} VNĐ từ ${payment.users.email} đã được duyệt`
          status = 'success'
          timestamp = payment.approved_at || payment.created_at
        } else if (payment.status === 'rejected') {
          message = `Thanh toán ${payment.amount.toLocaleString('vi-VN')} VNĐ từ ${payment.users.email} đã bị từ chối`
          status = 'error'
          timestamp = payment.approved_at || payment.created_at // Use approved_at for rejected timestamp
        } else if (payment.status === 'pending') {
          message = `Thanh toán ${payment.amount.toLocaleString('vi-VN')} VNĐ từ ${payment.users.email} đang chờ duyệt`
          status = 'warning'
        }

        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          message,
          timestamp: new Date(timestamp).toLocaleString('vi-VN'),
          status
        })
      })
    }

    // Process user activities
    if (userActivities) {
      userActivities.forEach((user: any) => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          message: `Người dùng mới ${user.email} (${user.role}) đã đăng ký`,
          timestamp: new Date(user.created_at).toLocaleString('vi-VN'),
          status: 'success' as const
        })
      })
    }

    // Add some system activities
    activities.push({
      id: 'system-1',
      type: 'system',
      message: 'Hệ thống hoạt động bình thường',
      timestamp: new Date().toLocaleString('vi-VN'),
      status: 'success'
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(activities.slice(0, 10))

  } catch (error) {
    console.error('Error getting admin activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
