import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PaymentManager } from '@/lib/paymentManager';
import { getPackageById } from '@/lib/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { package_name, user_phone, user_notes } = body;

    // Validate input
    if (!package_name || !user_phone) {
      return NextResponse.json(
        { error: 'Package name and phone number are required' },
        { status: 400 }
      );
    }

    // Validate package exists
    const packageInfo = getPackageById(package_name);
    if (!packageInfo) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    // Validate phone number format - more flexible for Vietnamese numbers
    const phoneRegex = /^(\+84|84|0)?[1-9][0-9]{8,9}$/;
    const cleanPhone = user_phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
    
    console.log('📱 Phone validation debug:', {
      original: user_phone,
      cleaned: cleanPhone,
      isValid: phoneRegex.test(cleanPhone)
    });
    
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: `Invalid phone number format. Received: "${user_phone}". Please enter a valid Vietnamese phone number (e.g., 0123456789, +84123456789)` },
        { status: 400 }
      );
    }

    // Get user from request headers (from middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has pending payment for this package
    const { data: existingPayment } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('package_id', package_name)
      .eq('status', 'pending')
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'You already have a pending payment for this package' },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = await PaymentManager.createPaymentRequest({
      user_id: userId,
      package_name,
      user_phone,
      user_notes
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: paymentRequest.order_id,
        amount: paymentRequest.amount,
        package_name,
        package_display_name: packageInfo.displayName,
        status: paymentRequest.status,
        created_at: paymentRequest.created_at
      }
    });

  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
