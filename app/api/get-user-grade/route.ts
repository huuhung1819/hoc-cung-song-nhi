import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Lấy grade từ database
    const supabase = createServiceClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('grade')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user grade:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch user grade' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      grade: user?.grade || 'Lớp 1',
      success: true
    })

  } catch (error: any) {
    console.error('Error in get-user-grade API:', error.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
