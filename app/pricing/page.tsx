'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Users, Crown } from 'lucide-react';
import { PRICING_PACKAGES, getPackageById } from '@/lib/pricing';

export default function PricingPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Get user's current plan from API
    // For now, default to 'free'
    setCurrentPlan('free');
  }, []);

  const handleSelectPackage = async (packageId: string) => {
    if (packageId === currentPlan) {
      router.push('/dashboard');
      return;
    }

    setLoading(packageId);
    
    try {
      // Redirect to payment page
      router.push(`/payment?package=${packageId}`);
    } catch (error) {
      console.error('Error selecting package:', error);
    } finally {
      setLoading(null);
    }
  };

  const getIconForPackage = (packageId: string) => {
    switch (packageId) {
      case 'basic':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6" />;
      case 'teacher':
        return <Crown className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getBadgeColor = (packageId: string) => {
    if (packageId === 'premium') return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (packageId === 'teacher') return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nâng cấp để trải nghiệm đầy đủ tính năng AI học tập, 
            quản lý tiến độ và hỗ trợ chuyên nghiệp
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan !== 'free' && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Gói hiện tại: {getPackageById(currentPlan)?.displayName}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRICING_PACKAGES.map((pkg) => {
            const isCurrentPlan = pkg.id === currentPlan;
            const isPopular = pkg.popular;
            const isFree = pkg.id === 'free';

            return (
              <Card 
                key={pkg.id} 
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  isPopular 
                    ? 'ring-2 ring-purple-500 scale-105' 
                    : isCurrentPlan 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:scale-102'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`${getBadgeColor(pkg.id)} text-white px-4 py-1`}>
                      ⭐ Phổ biến nhất
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      ✓ Gói hiện tại
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      isPopular ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {getIconForPackage(pkg.id)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">
                    {pkg.displayName}
                  </CardTitle>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {pkg.priceText}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {pkg.period}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Package Details */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tokens/ngày:</span>
                      <span className="font-medium">{pkg.tokenQuota.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Học sinh:</span>
                      <span className="font-medium">
                        {pkg.maxStudents === 999999 ? 'Không giới hạn' : pkg.maxStudents}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    disabled={loading === pkg.id}
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-green-500 hover:bg-green-600'
                        : isPopular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                    size="lg"
                  >
                    {loading === pkg.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Đang xử lý...
                      </>
                    ) : isCurrentPlan ? (
                      '✓ Đang sử dụng'
                    ) : isFree ? (
                      'Miễn phí'
                    ) : (
                      'Chọn gói'
                    )}
                  </Button>

                  {/* Current Plan Note */}
                  {isCurrentPlan && (
                    <p className="text-center text-xs text-green-600">
                      Bạn đang sử dụng gói này
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Câu hỏi thường gặp
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Làm sao để thanh toán?
              </h3>
              <p className="text-gray-600 text-sm">
                Sau khi chọn gói, bạn sẽ được chuyển đến trang thanh toán với QR Code. 
                Quét mã QR bằng app ngân hàng hoặc chuyển khoản thủ công theo hướng dẫn.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Thời gian kích hoạt gói?
              </h3>
              <p className="text-gray-600 text-sm">
                Sau khi chuyển khoản, chúng tôi sẽ xác nhận và kích hoạt gói trong vòng 5-30 phút. 
                Bạn sẽ nhận email thông báo khi hoàn tất.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Có thể nâng cấp/xuống cấp không?
              </h3>
              <p className="text-gray-600 text-sm">
                Bạn có thể nâng cấp gói bất kỳ lúc nào. Gói mới sẽ có hiệu lực ngay lập tức. 
                Liên hệ support để được hỗ trợ xuống cấp nếu cần.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Cần hỗ trợ? Liên hệ{' '}
            <a href="mailto:support@ailearning.com" className="text-blue-600 hover:underline">
              support@ailearning.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
