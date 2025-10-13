import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/paymentManager';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_request_id, admin_notes } = body;

    // Validate input
    if (!payment_request_id) {
      return NextResponse.json(
        { error: 'Payment request ID is required' },
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

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Verify payment request exists and is pending
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('payment_requests')
      .select('id, status, order_id')
      .eq('id', payment_request_id)
      .single();

    if (fetchError || !paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment request is not pending' },
        { status: 400 }
      );
    }

    // Approve payment request
    await PaymentManager.approvePaymentRequest(
      payment_request_id,
      userId,
      admin_notes
    );

    return NextResponse.json({
      success: true,
      message: 'Payment request approved successfully',
      data: {
        payment_request_id,
        order_id: paymentRequest.order_id,
        approved_by: userId,
        approved_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Approve payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
