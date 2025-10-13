'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Package,
  MessageSquare,
  Calendar,
  CreditCard
} from 'lucide-react';

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

interface PaymentRequestCardProps {
  paymentRequest: PaymentRequestWithPackage;
  onApprove: (id: string, adminNotes?: string) => void;
  onReject: (id: string, reason: string, adminNotes?: string) => void;
  loading?: boolean;
}

export default function PaymentRequestCard({
  paymentRequest,
  onApprove,
  onReject,
  loading = false
}: PaymentRequestCardProps) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
        return 'Chờ duyệt';
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

  const handleApprove = () => {
    onApprove(paymentRequest.id, adminNotes || undefined);
    setShowApproveForm(false);
    setAdminNotes('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    
    onReject(paymentRequest.id, rejectReason, rejectNotes || undefined);
    setShowRejectForm(false);
    setRejectReason('');
    setRejectNotes('');
  };

  const isPending = paymentRequest.status === 'pending';

  return (
    <Card className={`transition-all duration-200 ${
      isPending ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {paymentRequest.order_id}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(paymentRequest.created_at)}
              </span>
              <Badge className={`${getStatusColor(paymentRequest.status)} text-xs`}>
                {getStatusIcon(paymentRequest.status)}
                <span className="ml-1">{getStatusText(paymentRequest.status)}</span>
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(paymentRequest.amount)}
            </div>
            <div className="text-sm text-gray-500">
              {paymentRequest.package_display_name}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{paymentRequest.user_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{paymentRequest.user_email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{paymentRequest.user_phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{paymentRequest.package_display_name}</span>
            </div>
            {paymentRequest.user_notes && (
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-gray-600">{paymentRequest.user_notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        {paymentRequest.admin_notes && (
          <Alert>
            <AlertDescription>
              <strong>Ghi chú admin:</strong> {paymentRequest.admin_notes}
            </AlertDescription>
          </Alert>
        )}

        {/* Rejection Reason */}
        {paymentRequest.rejected_reason && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Lý do từ chối:</strong> {paymentRequest.rejected_reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => setShowApproveForm(!showApproveForm)}
              className="bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Duyệt
            </Button>
            <Button
              onClick={() => setShowRejectForm(!showRejectForm)}
              variant="destructive"
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Từ chối
            </Button>
          </div>
        )}

        {/* Approve Form */}
        {showApproveForm && (
          <div className="border rounded-lg p-4 bg-green-50 space-y-3">
            <div>
              <Label htmlFor="approve-notes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="approve-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ghi chú nội bộ..."
                rows={2}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
              </Button>
              <Button
                onClick={() => setShowApproveForm(false)}
                variant="outline"
                disabled={loading}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Reject Form */}
        {showRejectForm && (
          <div className="border rounded-lg p-4 bg-red-50 space-y-3">
            <div>
              <Label htmlFor="reject-reason">Lý do từ chối *</Label>
              <select
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={loading}
              >
                <option value="">Chọn lý do...</option>
                <option value="Sai số tiền">Sai số tiền</option>
                <option value="Sai nội dung chuyển khoản">Sai nội dung chuyển khoản</option>
                <option value="Không tìm thấy giao dịch">Không tìm thấy giao dịch</option>
                <option value="Giao dịch chưa hoàn tất">Giao dịch chưa hoàn tất</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reject-notes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="reject-notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Ghi chú chi tiết..."
                rows={2}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={loading || !rejectReason.trim()}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
              <Button
                onClick={() => setShowRejectForm(false)}
                variant="outline"
                disabled={loading}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Processed Info */}
        {paymentRequest.approved_at && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Đã duyệt lúc: {formatDate(paymentRequest.approved_at)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
