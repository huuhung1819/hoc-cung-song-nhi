import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const role = searchParams.get('role') // Optional filter by role

    const supabase = createServiceClient()

    let query = supabase
      .from('users')
      .select('id, email, name, role, grade, plan, created_at')
      .order('created_at', { ascending: false })

    // Filter by role if provided
    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })

  } catch (error: any) {
    console.error('Error in users list API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


