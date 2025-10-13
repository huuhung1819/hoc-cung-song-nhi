'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Smartphone, CreditCard } from 'lucide-react';
import { generatePaymentQR, getBankTransferInstructions } from '@/lib/vietqr';

interface QRPaymentProps {
  packageName: string;
  packageDisplayName: string;
  amount: number;
  orderId: string;
  userPhone: string;
  onSubmit: (data: { userPhone: string; userNotes?: string }) => void;
  loading?: boolean;
}

export default function QRPayment({
  packageName,
  packageDisplayName,
  amount,
  orderId,
  userPhone,
  onSubmit,
  loading = false
}: QRPaymentProps) {
  const [phone, setPhone] = useState(userPhone);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const orderContent = `${orderId} ${phone}`;
  const qrUrl = generatePaymentQR(orderId, phone, amount);
  const bankInstructions = getBankTransferInstructions(amount, orderContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    onSubmit({
      userPhone: phone.trim(),
      userNotes: notes.trim() || undefined
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thanh toán cho {packageDisplayName}
        </h1>
        <p className="text-lg text-gray-600">
          Số tiền: <span className="font-semibold text-blue-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Quét mã QR
            </CardTitle>
            <CardDescription>
              Mở app ngân hàng và quét mã QR để thanh toán nhanh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <img 
                src={qrUrl} 
                alt="QR Code thanh toán"
                className="w-48 h-48"
              />
            </div>

            {/* Bank Transfer Info */}
            <div className="space-y-2">
              <h4 className="font-medium">Hoặc chuyển khoản thủ công:</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">🏦 Ngân hàng:</span>
                  <span>LP Bank</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">💳 Số TK:</span>
                  <span className="font-mono">0762236886</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">👤 Chủ TK:</span>
                  <span>CẤN HỮU HÙNG</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">💰 Số tiền:</span>
                  <span className="font-semibold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(amount)} VNĐ
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">📝 Nội dung:</span>
                  <span className="font-mono text-xs break-all">{orderContent}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(bankInstructions)}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép thông tin
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Xác nhận thanh toán
            </CardTitle>
            <CardDescription>
              Điền thông tin để chúng tôi xác nhận giao dịch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Số điện thoại này sẽ được dùng để xác nhận giao dịch
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thời gian chuyển khoản, số tiền chính xác..."
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Warning */}
              <Alert>
                <AlertDescription>
                  ⚠️ <strong>Quan trọng:</strong> Vui lòng nhập chính xác nội dung chuyển khoản: <code className="bg-gray-100 px-1 rounded">{orderContent}</code>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  '✓ Tôi đã chuyển khoản'
                )}
              </Button>
            </form>

            {/* Processing Time */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>⏱️ Thời gian xử lý:</strong> 5-30 phút
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Bạn sẽ nhận email thông báo khi đơn được duyệt
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
