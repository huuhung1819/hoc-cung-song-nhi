import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/paymentManager';

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers (from middleware)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's payment requests
    const paymentRequests = await PaymentManager.getUserPaymentRequests(userId);

    // Transform data for frontend
    const transformed = paymentRequests.map(req => ({
      id: req.id,
      order_id: req.order_id,
      package_id: req.package_id,
      amount: req.amount,
      user_phone: req.user_phone,
      user_notes: req.user_notes,
      status: req.status,
      admin_notes: req.admin_notes,
      rejected_reason: req.rejected_reason,
      created_at: req.created_at,
      approved_at: req.approved_at,
      updated_at: req.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: transformed
    });

  } catch (error) {
    console.error('Get payment requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
