// Payment Manager
// Business logic for payment system

import { createClient } from '@supabase/supabase-js';
import { getPackageById } from './pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PaymentRequest {
  id: string;
  user_id: string;
  order_id: string;
  package_id: string;
  amount: number;
  user_phone: string;
  user_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequestData {
  user_id: string;
  package_name: string;
  user_phone: string;
  user_notes?: string;
}

export interface PaymentRequestWithPackage extends PaymentRequest {
  package_name: string;
  package_display_name: string;
  user_name: string;
  user_email: string;
}

export class PaymentManager {
  
  /**
   * Create a new payment request
   */
  static async createPaymentRequest(data: CreatePaymentRequestData): Promise<PaymentRequest> {
    const packageInfo = getPackageById(data.package_name);
    if (!packageInfo) {
      throw new Error('Invalid package');
    }

    // Generate order ID
    const orderId = await this.generateOrderId();

    // Get package ID from database
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('id')
      .eq('name', data.package_name)
      .single();

    if (packageError || !packageData) {
      throw new Error('Package not found in database');
    }

    // Create payment request
    const { data: paymentRequest, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: data.user_id,
        order_id: orderId,
        package_id: packageData.id,
        amount: packageInfo.price,
        user_phone: data.user_phone,
        user_notes: data.user_notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment request: ${error.message}`);
    }

    return paymentRequest;
  }

  /**
   * Get payment requests for a user
   */
  static async getUserPaymentRequests(userId: string): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payment requests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get payment request by order ID
   */
  static async getPaymentRequestByOrderId(orderId: string): Promise<PaymentRequest | null> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch payment request: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all pending payment requests (admin)
   */
  static async getPendingPaymentRequests(): Promise<PaymentRequestWithPackage[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(`
        *,
        packages!inner(name, display_name),
        users!payment_requests_user_id_fkey(name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch pending payments: ${error.message}`);
    }

    // Transform the data
    const transformed = (data || []).map((item: any) => ({
      ...item,
      package_name: item.packages.name,
      package_display_name: item.packages.display_name,
      user_name: item.users.name,
      user_email: item.users.email,
    }));

    return transformed;
  }

  /**
   * Get all payment requests with status (admin)
   */
  static async getAllPaymentRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<PaymentRequestWithPackage[]> {
    let query = supabase
      .from('payment_requests')
      .select(`
        *,
        packages!inner(name, display_name),
        users!payment_requests_user_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch payment requests: ${error.message}`);
    }

    // Transform the data
    const transformed = (data || []).map((item: any) => ({
      ...item,
      package_name: item.packages.name,
      package_display_name: item.packages.display_name,
      user_name: item.users.name,
      user_email: item.users.email,
    }));

    return transformed;
  }

  /**
   * Approve payment request
   */
  static async approvePaymentRequest(
    paymentRequestId: string,
    adminId: string,
    adminNotes?: string
  ): Promise<void> {
    // Update payment request status
    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRequestId);

    if (updateError) {
      throw new Error(`Failed to approve payment: ${updateError.message}`);
    }

    // Get payment request details
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('payment_requests')
      .select('user_id, package_id')
      .eq('id', paymentRequestId)
      .single();

    if (fetchError || !paymentRequest) {
      throw new Error('Failed to fetch payment request details');
    }

    // Get package info first
    const { data: packageInfo, error: packageError } = await supabase
      .from('packages')
      .select('name, token_quota')
      .eq('id', paymentRequest.package_id)
      .single();

    if (packageError || !packageInfo) {
      throw new Error('Failed to fetch package info');
    }

    // Map package name to valid plan name
    const validPlan = packageInfo.name === 'free' ? 'basic' : 
                     packageInfo.name === 'teacher' ? 'pro' : 
                     packageInfo.name;

    // Create subscription manually
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: paymentRequest.user_id,
        package_id: paymentRequest.package_id,
        payment_request_id: paymentRequestId,
        status: 'active',
        expires_at: null // Lifetime for now
      })
      .select()
      .single();

    if (subscriptionError) {
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }

    // Update user with new plan and token quota
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        plan: validPlan,
        token_quota: packageInfo.token_quota,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRequest.user_id);

    if (userUpdateError) {
      throw new Error(`Failed to update user plan: ${userUpdateError.message}`);
    }

    // Send notification to user
    await this.sendApprovalNotification(paymentRequest.user_id, paymentRequestId);
  }

  /**
   * Reject payment request
   */
  static async rejectPaymentRequest(
    paymentRequestId: string,
    adminId: string,
    rejectedReason: string,
    adminNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejected_reason: rejectedReason,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRequestId);

    if (error) {
      throw new Error(`Failed to reject payment: ${error.message}`);
    }

    // Send notification to user
    const { data: paymentRequest } = await supabase
      .from('payment_requests')
      .select('user_id')
      .eq('id', paymentRequestId)
      .single();

    if (paymentRequest) {
      await this.sendRejectionNotification(paymentRequest.user_id, paymentRequestId, rejectedReason);
    }
  }

  /**
   * Generate unique order ID
   */
  private static async generateOrderId(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_order_id');
    
    if (error || !data) {
      // Fallback method
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `DH${timestamp}${random}`;
    }
    
    return data;
  }

  /**
   * Send approval notification to user
   */
  private static async sendApprovalNotification(userId: string, paymentRequestId: string): Promise<void> {
    // Create notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '✅ Thanh toán đã được duyệt!',
        message: 'Gói subscription của bạn đã được kích hoạt. Bạn có thể sử dụng ngay bây giờ!',
        type: 'success',
        action_url: '/dashboard'
      });

    if (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  /**
   * Send rejection notification to user
   */
  private static async sendRejectionNotification(
    userId: string,
    paymentRequestId: string,
    reason: string
  ): Promise<void> {
    // Create notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '❌ Thanh toán bị từ chối',
        message: `Thanh toán của bạn không thể được xử lý. Lý do: ${reason}`,
        type: 'error',
        action_url: '/pricing'
      });

    if (error) {
      console.error('Failed to send rejection notification:', error);
    }
  }

  /**
   * Check if user has active subscription
   */
  static async getUserActiveSubscription(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages!inner(name, display_name, features)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No active subscription
      }
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's current package
   */
  static async getUserCurrentPackage(userId: string): Promise<string> {
    const subscription = await this.getUserActiveSubscription(userId);
    return subscription?.packages?.name || 'free';
  }
}
