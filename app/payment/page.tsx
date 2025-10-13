'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import QRPayment from '@/components/QRPayment';
import { getPackageById } from '@/lib/pricing';

interface PaymentData {
  userPhone: string;
  userNotes?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('package');

  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) {
      router.push('/pricing');
      return;
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      setError('Gói không hợp lệ');
      return;
    }

    setPackageInfo(pkg);
  }, [packageId, router]);

  const handleSubmitPayment = async (data: PaymentData) => {
    if (!packageInfo) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_name: packageInfo.id,
          user_phone: data.userPhone,
          user_notes: data.userNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }

      if (result.success) {
        setSuccess('Yêu cầu thanh toán đã được gửi!');
        // Redirect to status page
        setTimeout(() => {
          router.push(`/payment/status/${result.data.order_id}`);
        }, 2000);
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Payment request error:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!packageId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy gói
          </h2>
          <p className="text-gray-600 mb-4">
            Vui lòng chọn gói từ trang pricing
          </p>
          <Button onClick={() => router.push('/pricing')}>
            Quay lại trang gói
          </Button>
        </div>
      </div>
    );
  }

  if (!packageInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin gói...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán cho {packageInfo.displayName}
            </h1>
            <p className="text-lg text-gray-600">
              Hoàn tất thanh toán để kích hoạt gói ngay lập tức
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Form */}
        <QRPayment
          packageName={packageInfo.id}
          packageDisplayName={packageInfo.displayName}
          amount={packageInfo.price}
          orderId={`DH${Date.now().toString().slice(-6)}`} // Temporary order ID
          userPhone=""
          onSubmit={handleSubmitPayment}
          loading={loading}
        />

        {/* Security Notice */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>🔒 Bảo mật:</strong> Thông tin thanh toán được mã hóa và bảo vệ. 
              Chúng tôi không lưu trữ thông tin thẻ ngân hàng của bạn.
            </AlertDescription>
          </Alert>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Cần hỗ trợ thanh toán? Liên hệ{' '}
            <a 
              href="mailto:support@ailearning.com" 
              className="text-blue-600 hover:underline font-medium"
            >
              support@ailearning.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
