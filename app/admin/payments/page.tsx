'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Bell,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import PaymentRequestCard from '@/components/PaymentRequestCard';

interface PaymentRequestWithPackage {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  package_name: string;
  package_display_name: string;
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

interface PaymentStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestWithPackage[]>([]);
  const [stats, setStats] = useState<PaymentStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPaymentRequests = async () => {
    try {
      const response = await fetch('/api/admin/payment-requests');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải danh sách thanh toán');
      }

      if (result.success) {
        setPaymentRequests(result.data.payment_requests);
        setStats(result.data.counts);
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Fetch payment requests error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const handleApprove = async (paymentRequestId: string, adminNotes?: string) => {
    setProcessingId(paymentRequestId);
    
    try {
      const response = await fetch('/api/admin/payment-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_request_id: paymentRequestId,
          admin_notes: adminNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể duyệt thanh toán');
      }

      if (result.success) {
        // Refresh the list
        await fetchPaymentRequests();
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Approve payment error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (paymentRequestId: string, reason: string, adminNotes?: string) => {
    setProcessingId(paymentRequestId);
    
    try {
      const response = await fetch('/api/admin/payment-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_request_id: paymentRequestId,
          rejected_reason: reason,
          admin_notes: adminNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể từ chối thanh toán');
      }

      if (result.success) {
        // Refresh the list
        await fetchPaymentRequests();
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Reject payment error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = paymentRequests.filter(req => req.status === 'pending');
  const approvedRequests = paymentRequests.filter(req => req.status === 'approved');
  const rejectedRequests = paymentRequests.filter(req => req.status === 'rejected');

  const totalRevenue = approvedRequests.reduce((sum, req) => sum + req.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý thanh toán
              </h1>
              <p className="text-gray-600">
                Duyệt và quản lý các yêu cầu thanh toán từ người dùng
              </p>
            </div>
            <Button
              onClick={fetchPaymentRequests}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      notation: 'compact'
                    }).format(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {stats.pending > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Bell className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              <strong>Có {stats.pending} yêu cầu thanh toán đang chờ duyệt!</strong>
              Vui lòng kiểm tra và xử lý trong thời gian sớm nhất.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Requests Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Chờ duyệt ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Đã duyệt ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Bị từ chối ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không có yêu cầu chờ duyệt
                  </h3>
                  <p className="text-gray-600">
                    Tất cả các yêu cầu thanh toán đã được xử lý.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <PaymentRequestCard
                  key={request.id}
                  paymentRequest={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={processingId === request.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có thanh toán nào được duyệt
                  </h3>
                  <p className="text-gray-600">
                    Các thanh toán đã duyệt sẽ hiển thị ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map((request) => (
                <PaymentRequestCard
                  key={request.id}
                  paymentRequest={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={processingId === request.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có thanh toán nào bị từ chối
                  </h3>
                  <p className="text-gray-600">
                    Các thanh toán bị từ chối sẽ hiển thị ở đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map((request) => (
                <PaymentRequestCard
                  key={request.id}
                  paymentRequest={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={processingId === request.id}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
