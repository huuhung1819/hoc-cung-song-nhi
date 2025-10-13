import { createClient } from '@/lib/supabaseServer'

// Custom email template for OTP
const createOTPEmailTemplate = (email: string, otp: string) => {
  return {
    to: email,
    subject: `Mã xác thực đổi mã mở khóa - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔐 AI Learning Platform</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Mã xác thực đổi mã mở khóa</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">Xin chào!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Bạn đã yêu cầu đổi mã mở khóa mới cho tài khoản học tập của con.
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">Mã xác thực của bạn là:</p>
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0;">${otp}</div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Lưu ý quan trọng:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; color: #856404; font-size: 14px; padding-left: 20px;">
              <li>Mã này có hiệu lực trong <strong>10 phút</strong></li>
              <li>Chỉ sử dụng <strong>1 lần</strong> để đổi mã mở khóa</li>
              <li>Nếu không phải bạn yêu cầu, vui lòng <strong>bỏ qua email này</strong></li>
              <li>Không chia sẻ mã này với ai khác</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            Trân trọng,<br>
            <strong>AI Learning Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    `,
    text: `
Mã xác thực đổi mã mở khóa - ${otp}

Xin chào!

Bạn đã yêu cầu đổi mã mở khóa mới cho tài khoản học tập của con.

Mã xác thực của bạn là: ${otp}

⚠️ Lưu ý quan trọng:
- Mã này có hiệu lực trong 10 phút
- Chỉ sử dụng 1 lần để đổi mã mở khóa
- Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này
- Không chia sẻ mã này với ai khác

Trân trọng,
AI Learning Team
    `
  }
}

// Send OTP email using Supabase custom SMTP
export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    const supabase = createClient()
    
    // Use Supabase Edge Function to send custom email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: createOTPEmailTemplate(email, otp)
    })

    if (error) {
      console.error('Supabase email error:', error)
      
      // Fallback: Try using Supabase's built-in email service
      console.log('Falling back to built-in Supabase email service...')
      const fallbackResult = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=otp&code=${otp}`
      } as any)
      
      if (fallbackResult.error) {
        console.error('Fallback email error:', fallbackResult.error)
        return { success: false, error: fallbackResult.error.message }
      }
      
      console.log('✅ Fallback Supabase email sent successfully to:', email)
      return { success: true, data: fallbackResult.data }
    }

    console.log('✅ Supabase custom email sent successfully to:', email)
    return { success: true, data }
    
  } catch (error) {
    console.error('Error sending Supabase email:', error)
    return { success: false, error: (error as Error).message }
  }
}
