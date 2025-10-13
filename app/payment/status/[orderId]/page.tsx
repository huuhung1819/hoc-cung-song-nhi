'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';

interface PaymentStatus {
  order_id: string;
  amount: number;
  package_id: string;
  status: 'pending' | 'approved' | 'rejected';
  user_phone: string;
  user_notes?: string;
  admin_notes?: string;
  rejected_reason?: string;
  created_at: string;
  approved_at?: string;
  updated_at: string;
}

interface PaymentStatusPageProps {
  params: {
    orderId: string;
  };
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
  const router = useRouter();
  const { orderId } = params;

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payment/status/${orderId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải trạng thái thanh toán');
      }

      if (result.success) {
        setPaymentStatus(result.data);
        setLastChecked(new Date());
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Fetch payment status error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();

    // Poll for status updates every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchPaymentStatus();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderId]);

  // Stop polling when status is no longer pending
  useEffect(() => {
    if (paymentStatus && paymentStatus.status !== 'pending' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [paymentStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Đang chờ duyệt';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Đơn hàng không tồn tại hoặc bạn không có quyền xem'}
          </p>
          <Button onClick={() => router.push('/pricing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại chọn gói
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/pricing')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại chọn gói
          </Button>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(paymentStatus.status)}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trạng thái thanh toán
            </h1>
            <p className="text-lg text-gray-600">
              Mã đơn hàng: <span className="font-mono font-semibold">{paymentStatus.order_id}</span>
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
                <CardDescription>
                  Chi tiết về yêu cầu thanh toán của bạn
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(paymentStatus.status)} text-sm px-3 py-1`}>
                {getStatusText(paymentStatus.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Số tiền</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(paymentStatus.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Thời gian tạo</p>
                <p className="text-sm text-gray-900">
                  {formatDate(paymentStatus.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {paymentStatus.user_phone}
                </p>
              </div>
              {paymentStatus.approved_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Thời gian duyệt</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(paymentStatus.approved_at)}
                  </p>
                </div>
              )}
            </div>

            {paymentStatus.user_notes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ghi chú của bạn</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {paymentStatus.user_notes}
                </p>
              </div>
            )}

            {paymentStatus.admin_notes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Ghi chú từ admin</p>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">
                  {paymentStatus.admin_notes}
                </p>
              </div>
            )}

            {paymentStatus.rejected_reason && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  <strong>Lý do từ chối:</strong> {paymentStatus.rejected_reason}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Status-specific Actions */}
        {paymentStatus.status === 'approved' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 Thanh toán thành công!
                </h3>
                <p className="text-green-700 mb-4">
                  Gói subscription của bạn đã được kích hoạt. 
                  Bạn có thể sử dụng ngay bây giờ!
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Vào Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus.status === 'rejected' && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  ❌ Thanh toán bị từ chối
                </h3>
                <p className="text-red-700 mb-4">
                  Thanh toán của bạn không thể được xử lý. 
                  Vui lòng kiểm tra lại thông tin và thử lại.
                </p>
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                  >
                    Chọn gói khác
                  </Button>
                  <Button 
                    onClick={() => router.push('/payment')}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  ⏳ Đang chờ duyệt
                </h3>
                <p className="text-yellow-700 mb-4">
                  Chúng tôi đang kiểm tra và xử lý thanh toán của bạn. 
                  Thời gian xử lý: 5-30 phút.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
                  <RefreshCw className="h-4 w-4" />
                  Tự động cập nhật mỗi 10 giây
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  Lần cuối kiểm tra: {formatDate(lastChecked.toISOString())}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPaymentStatus}
                  disabled={loading}
                  className="mt-4"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cập nhật ngay
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support */}
        <div className="mt-8 text-center">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Cần hỗ trợ? Liên hệ{' '}
              <a 
                href="mailto:support@ailearning.com" 
                className="text-blue-600 hover:underline font-medium"
              >
                support@ailearning.com
              </a>{' '}
              với mã đơn hàng: <code className="bg-gray-100 px-1 rounded">{paymentStatus.order_id}</code>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
