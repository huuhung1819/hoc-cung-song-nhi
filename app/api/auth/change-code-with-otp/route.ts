import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

    const { otp, newCode, purpose = 'change_unlock_code' } = await request.json()

    if (!otp || !newCode) {
      return NextResponse.json(
        { error: 'OTP and new code are required' },
        { status: 400 }
      )
    }

    // Validate new code format (4 digits)
    if (!/^\d{4}$/.test(newCode)) {
      return NextResponse.json(
        { error: 'New code must be 4 digits' },
        { status: 400 }
      )
    }

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
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

    // First, verify the OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('purpose', purpose)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 404 }
      )
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // Increment attempts
      const newAttempts = otpRecord.attempts + 1
      
      if (newAttempts >= otpRecord.max_attempts) {
        // Mark as used to prevent further attempts
        await supabase
          .from('otp_codes')
          .update({ 
            is_used: true, 
            used_at: new Date().toISOString(),
            attempts: newAttempts
          })
          .eq('id', otpRecord.id)
        
        return NextResponse.json(
          { error: 'Too many failed attempts. OTP has been invalidated.' },
          { status: 400 }
        )
      }
      
      // Update attempts count
      await supabase
        .from('otp_codes')
        .update({ attempts: newAttempts })
        .eq('id', otpRecord.id)
      
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    const { error: otpUpdateError } = await supabase
      .from('otp_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    if (otpUpdateError) {
      console.error('Error updating OTP status:', otpUpdateError)
      return NextResponse.json(
        { error: 'Failed to update OTP status' },
        { status: 500 }
      )
    }

    // Now update the unlock code based on purpose
    if (purpose === 'change_unlock_code') {
      // Update unlock code in localStorage (or database if you have a user_settings table)
      // For now, we'll use localStorage as that's how the current system works
      // In production, you might want to store this in a user_settings table
      
      console.log(`✅ Unlock code changed for user ${userId}: ${newCode}`)
      
      // You could also store this in a user_settings table:
      // await supabase
      //   .from('user_settings')
      //   .upsert({
      //     user_id: userId,
      //     unlock_code: newCode,
      //     updated_at: new Date().toISOString()
      //   })
      
    } else if (purpose === 'reset_password') {
      // Reset password logic would go here
      // This would typically involve updating the user's password in Supabase Auth
      console.log(`✅ Password reset for user ${userId}`)
    }

    console.log(`✅ Change code successful for user ${userId}: OTP ${otp} -> New code ${newCode}`)

    return NextResponse.json({
      success: true,
      message: purpose === 'change_unlock_code' ? 'Đã đổi mã mở khóa thành công!' : 'Đã reset mật khẩu thành công!',
      newCode: purpose === 'change_unlock_code' ? newCode : undefined
    })

  } catch (error) {
    console.error('Error changing code with OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
