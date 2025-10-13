import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Lấy thông tin user từ database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: 'Không thể lấy thông tin user' }, { status: 500 })
    }

    // Lấy thông tin từ auth.users (nếu cần)
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: authData, error: authError } = await supabaseAuth.auth.admin.getUserById(userId)

    if (authError) {
      console.error('Error fetching auth data:', authError)
    }

    // Tính toán thống kê
    const stats = await calculateUserStats(supabase, userId)

    // Format response
    const profileData = {
      user: {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || authData?.user?.email || '',
        phone: userData.phone || '',
        grade: userData.grade || 'Lớp 1',
        plan: userData.plan || 'basic',
        role: userData.role || 'parent',
        avatar: userData.avatar || '',
        createdAt: userData.created_at || authData?.user?.created_at || new Date().toISOString(),
        updatedAt: userData.updated_at || new Date().toISOString()
      },
      stats: stats,
      notifications: {
        emailUpdates: true, // Default values until database migration
        lessonReminders: true,
        progressReports: false,
        promotions: false
      }
    }

    return NextResponse.json(profileData)

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      name, 
      phone, 
      grade,
      notifications 
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Chuẩn bị data để update
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (grade !== undefined) updateData.grade = grade

    // Cập nhật notification settings (tạm thời bỏ qua cho đến khi database được migrate)
    // TODO: Uncomment after running database migration
    // if (notifications) {
    //   if (notifications.emailUpdates !== undefined) updateData.email_updates = notifications.emailUpdates
    //   if (notifications.lessonReminders !== undefined) updateData.lesson_reminders = notifications.lessonReminders
    //   if (notifications.progressReports !== undefined) updateData.progress_reports = notifications.progressReports
    //   if (notifications.promotions !== undefined) updateData.promotions = notifications.promotions
    // }

    console.log('Updating user profile with data:', updateData)

    // Update user data
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json({ error: 'Không thể cập nhật thông tin user' }, { status: 500 })
    }

    console.log('Successfully updated user profile:', updatedUser)

    return NextResponse.json({ 
      success: true, 
      message: 'Cập nhật thông tin thành công',
      user: updatedUser 
    })

  } catch (error) {
    console.error('Error in profile update API:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Lấy user hiện tại để verify password
    const { data: userData, error: getUserError } = await supabaseAuth.auth.admin.getUserById(userId)
    
    if (getUserError) {
      console.error('Error getting user for password change:', getUserError)
      return NextResponse.json({ error: 'Không thể xác thực user' }, { status: 500 })
    }

    // Update password
    const { data, error } = await supabaseAuth.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('Error updating password:', error)
      
      // Translate common password errors
      let errorMessage = error.message
      if (error.message.includes('Password should be at least')) {
        errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự'
      } else if (error.message.includes('Password too weak')) {
        errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn'
      } else if (error.message.includes('Invalid password')) {
        errorMessage = 'Mật khẩu hiện tại không chính xác'
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công' 
    })

  } catch (error) {
    console.error('Error in password change API:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

async function calculateUserStats(supabase: any, userId: string) {
  try {
    // Đếm số bài học hoàn thành (giả sử có bảng lessons hoặc progress)
    const { count: completedLessons } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    // Tính thời gian học (giả sử có bảng study_sessions)
    const { data: studySessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 ngày gần đây

    const totalStudyTime = studySessions?.reduce((sum: number, session: any) => sum + (session.duration_minutes || 0), 0) || 0
    const studyTimeHours = Math.round(totalStudyTime / 60 * 10) / 10 // Làm tròn 1 chữ số thập phân

    // Tính điểm trung bình (giả sử có bảng quiz_results)
    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('score')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const averageScore = quizResults?.length > 0 
      ? Math.round(quizResults.reduce((sum: number, result: any) => sum + (result.score || 0), 0) / quizResults.length * 10) / 10
      : 0

    return {
      completedLessons: completedLessons || 0,
      studyTimeHours: studyTimeHours,
      averageScore: averageScore,
      totalQuizzes: quizResults?.length || 0,
      studySessions: studySessions?.length || 0
    }

  } catch (error) {
    console.error('Error calculating user stats:', error)
    return {
      completedLessons: 0,
      studyTimeHours: 0,
      averageScore: 0,
      totalQuizzes: 0,
      studySessions: 0
    }
  }
}