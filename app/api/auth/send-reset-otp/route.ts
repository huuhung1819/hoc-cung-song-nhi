import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendOTPEmail } from '@/lib/emailConfig'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with user session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Don't set cookies in API routes
          },
          remove(name: string, options: any) {
            // Don't remove cookies in API routes
          },
        },
      }
    )

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      )
    }

    const { userEmail, purpose = 'change_unlock_code' } = await request.json()

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Validate purpose
    if (!['reset_password', 'change_unlock_code'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      )
    }

    // Use authenticated user's ID
    const userId = user.id

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    
    // Clean up any existing OTPs for this user and purpose
    await supabase
      .from('otp_codes')
      .delete()
      .eq('user_id', userId)
      .eq('purpose', purpose)
      .eq('is_used', false)

    // Store OTP in database
    const { data: otpRecord, error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        user_id: userId,
        email: userEmail,
        otp: otp,
        purpose: purpose,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0,
        max_attempts: 3,
        is_used: false
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store OTP' },
        { status: 500 }
      )
    }

    console.log('✅ OTP stored in database:', otpRecord.id, 'for email:', userEmail)

    // Send email via Supabase
    const emailResult = await sendOTPEmail(userEmail, otp)
    
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error)
      
      // Clean up the stored OTP if email fails
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', otpRecord.id)
      
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
    
    console.log('✅ Email sent successfully to:', userEmail, 'OTP:', otp)

    return NextResponse.json({
      success: true,
      message: `Đã gửi mã OTP đến ${userEmail}`,
      email: userEmail,
      otpId: otpRecord.id
      // otp // For testing - remove in production
    })

  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
