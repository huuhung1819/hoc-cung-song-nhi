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

    const { otp, purpose = 'change_unlock_code' } = await request.json()

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      )
    }

    // Validate OTP format
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

    // Find the OTP in database
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

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      // Mark as used to prevent further attempts
      await supabase
        .from('otp_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', otpRecord.id)
      
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
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

    // OTP is valid - mark as used
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error updating OTP status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update OTP status' },
        { status: 500 }
      )
    }

    console.log(`✅ OTP verified successfully for user ${userId}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      otpId: otpRecord.id
    })

  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
