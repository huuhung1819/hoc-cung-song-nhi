import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/paymentManager';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Get status filter from query params
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;

    // Get payment requests
    const paymentRequests = await PaymentManager.getAllPaymentRequests(status);

    // Transform data for admin dashboard
    const transformed = paymentRequests.map(req => ({
      id: req.id,
      order_id: req.order_id,
      user_id: req.user_id,
      user_name: req.user_name,
      user_email: req.user_email,
      package_name: req.package_name,
      package_display_name: req.package_display_name,
      amount: req.amount,
      user_phone: req.user_phone,
      user_notes: req.user_notes,
      status: req.status,
      admin_notes: req.admin_notes,
      approved_by: req.approved_by,
      approved_at: req.approved_at,
      rejected_reason: req.rejected_reason,
      created_at: req.created_at,
      updated_at: req.updated_at
    }));

    // Get counts for dashboard
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: transformed.length
    };

    transformed.forEach(req => {
      counts[req.status as keyof typeof counts]++;
    });

    return NextResponse.json({
      success: true,
      data: {
        payment_requests: transformed,
        counts
      }
    });

  } catch (error) {
    console.error('Get admin payment requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
