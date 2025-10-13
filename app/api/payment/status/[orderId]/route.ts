import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/paymentManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get payment request by order ID
    const paymentRequest = await PaymentManager.getPaymentRequestByOrderId(orderId);

    if (!paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this payment request
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (paymentRequest.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Return payment status
    return NextResponse.json({
      success: true,
      data: {
        order_id: paymentRequest.order_id,
        amount: paymentRequest.amount,
        package_id: paymentRequest.package_id,
        status: paymentRequest.status,
        user_phone: paymentRequest.user_phone,
        user_notes: paymentRequest.user_notes,
        admin_notes: paymentRequest.admin_notes,
        rejected_reason: paymentRequest.rejected_reason,
        created_at: paymentRequest.created_at,
        approved_at: paymentRequest.approved_at,
        updated_at: paymentRequest.updated_at
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
