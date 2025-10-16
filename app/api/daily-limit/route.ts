import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const DAILY_LIMIT = 500 // 50 bài tập mỗi ngày

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    // Check today's usage
    const { data: usage, error } = await supabase
      .from('daily_exercise_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const todayUsage = usage?.count || 0
    const remaining = Math.max(0, DAILY_LIMIT - todayUsage)

    return NextResponse.json({
      todayUsage,
      dailyLimit: DAILY_LIMIT,
      remaining,
      canCreate: remaining > 0
    })

  } catch (error) {
    console.error('Error checking daily limit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get userId and count from request body (sent by frontend)
    let userId: string
    let count: number = 1 // Default to 1 if not specified
    try {
      const body = await request.json()
      userId = body.userId
      count = body.count || 1 // Default to 1 if not specified
    } catch (error) {
      // If JSON parsing fails, try to get from URL params as fallback
      const url = new URL(request.url)
      userId = url.searchParams.get('userId') || ''
      count = parseInt(url.searchParams.get('count') || '1')
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Check current usage
    const { data: usage, error: checkError } = await supabase
      .from('daily_exercise_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking usage:', checkError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const currentCount = usage?.count || 0

    // Check if limit reached
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json({ 
        error: 'Daily limit reached',
        todayUsage: currentCount,
        dailyLimit: DAILY_LIMIT,
        remaining: 0,
        canCreate: false
      }, { status: 429 })
    }

    // Update or insert usage record
    const newCount = currentCount + count
    const { error: upsertError } = await supabase
      .from('daily_exercise_usage')
      .upsert({
        user_id: userId,
        date: today,
        count: newCount,
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })

    if (upsertError) {
      console.error('Error updating usage:', upsertError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      todayUsage: newCount,
      dailyLimit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - newCount,
      canCreate: true
    })

  } catch (error) {
    console.error('Error updating daily limit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
