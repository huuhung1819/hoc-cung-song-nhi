'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Phone, Mail } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📚 Hướng dẫn Sử dụng</h1>
        <p className="text-gray-600 mt-1">
          Tất cả những gì bạn cần biết để sử dụng nền tảng AI Học Cùng Song Nhi
        </p>
      </div>

      {/* Guide Content */}
      <Accordion type="single" collapsible className="w-full">
        {/* Section 1: Quản lý Tài khoản */}
        <AccordionItem value="account">
          <AccordionTrigger className="text-lg font-semibold">
            🎯 1. Quản lý Tài khoản
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Thay đổi thông tin cá nhân:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click vào avatar/ảnh đại diện ở góc trên bên phải</li>
                <li>Chọn "Cài đặt" hoặc "Thông tin cá nhân"</li>
                <li>Cập nhật: Họ tên, Email, Số điện thoại</li>
                <li>Click "Lưu thay đổi" để cập nhật</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Thay đổi mật khẩu:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Vào phần "Cài đặt" → "Bảo mật"</li>
                <li>Nhập mật khẩu hiện tại</li>
                <li>Nhập mật khẩu mới (tối thiểu 6 ký tự)</li>
                <li>Xác nhận mật khẩu mới</li>
                <li>Click "Đổi mật khẩu"</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Cập nhật lớp học:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Vào "Cài đặt" → "Thông tin học tập"</li>
                <li>Chọn lớp học mới từ danh sách</li>
                <li>Lưu thay đổi - AI sẽ điều chỉnh nội dung phù hợp</li>
                <li>Lưu ý: Thay đổi lớp sẽ ảnh hưởng đến độ khó bài tập</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Quên mật khẩu:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Đăng xuất khỏi tài khoản</li>
                <li>Ở trang đăng nhập, click "Quên mật khẩu?"</li>
                <li>Nhập email đã đăng ký</li>
                <li>Kiểm tra hộp thư và làm theo hướng dẫn</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Sử dụng AI */}
        <AccordionItem value="ai">
          <AccordionTrigger className="text-lg font-semibold">
            🤖 2. Sử dụng AI Gia sư
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Đặt câu hỏi cho AI:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Gõ câu hỏi vào ô chat ở Dashboard</li>
                <li>AI sẽ trả lời trong vài giây</li>
                <li>Có thể hỏi tiếp để hiểu rõ hơn</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Hai chế độ học tập:</h3>
              <div className="ml-2 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">🎓 Chế độ Coach (Hướng dẫn)</p>
                  <p className="text-sm text-blue-700 mt-1">AI sẽ hướng dẫn từng bước, giúp bạn tự tìm ra đáp án. Khuyến khích dùng để học sâu hơn!</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">✅ Chế độ Solve (Giải đáp)</p>
                  <p className="text-sm text-green-700 mt-1">AI đưa ra đáp án trực tiếp. Cần mã mở khóa để sử dụng.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Mã mở khóa:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Xem mã ở góc trên Dashboard (bên cạnh số token)</li>
                <li>Dùng để chuyển sang chế độ Solve</li>
                <li>Mỗi ngày có giới hạn số lần mở khóa</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Upload ảnh bài tập:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click icon 📷 trong khung chat</li>
                <li>Chọn ảnh bài tập từ máy tính/điện thoại</li>
                <li>AI sẽ tự động đọc và giải thích bài tập trong ảnh</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Tạo bài tập */}
        <AccordionItem value="exercises">
          <AccordionTrigger className="text-lg font-semibold">
            📝 3. Tạo Bài tập
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Cách tạo bài tập:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click nút "Tạo bài tập" ở Dashboard</li>
                <li>Chọn môn học: Toán, Văn, Tiếng Anh...</li>
                <li>Chọn dạng bài: Trắc nghiệm, Tự luận, Có lời văn...</li>
                <li>Click "Tạo" - AI sẽ tự động sinh ra bài tập phù hợp</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Làm bài tập:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Đọc đề bài và suy nghĩ</li>
                <li>Nếu khó, hỏi AI Coach để được hướng dẫn</li>
                <li>Copy câu hỏi vào chat và học cùng AI</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Token và Gói */}
        <AccordionItem value="tokens">
          <AccordionTrigger className="text-lg font-semibold">
            📊 4. Token và Gói Dịch vụ
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Token là gì?</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Token = Lượt hỏi AI</li>
                <li>Mỗi câu hỏi gửi đến AI = 1 token</li>
                <li>Token được reset về ban đầu mỗi ngày lúc 0h</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Các gói dịch vụ:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Gói</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Token/ngày</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Free</td>
                      <td className="border border-gray-300 px-4 py-2">10 câu</td>
                      <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Premium</td>
                      <td className="border border-gray-300 px-4 py-2">50 câu</td>
                      <td className="border border-gray-300 px-4 py-2">99,000đ/tháng</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Pro</td>
                      <td className="border border-gray-300 px-4 py-2">Không giới hạn</td>
                      <td className="border border-gray-300 px-4 py-2">249,000đ/tháng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Cách nâng cấp:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Nâng cấp" ở sidebar hoặc góc trên Dashboard</li>
                <li>Chọn gói phù hợp với nhu cầu</li>
                <li>Làm theo hướng dẫn thanh toán</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: Thanh toán */}
        <AccordionItem value="payment">
          <AccordionTrigger className="text-lg font-semibold">
            💳 5. Thanh toán
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Hướng dẫn thanh toán VietQR:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Chọn gói cần nâng cấp</li>
                <li>Click "Thanh toán ngay"</li>
                <li>Quét mã QR bằng app ngân hàng hoặc chuyển khoản thủ công</li>
                <li>Nội dung chuyển khoản: Sử dụng mã đơn hàng được cung cấp</li>
                <li>Chụp ảnh biên lai và upload lên hệ thống</li>
                <li>Click "Xác nhận đã chuyển khoản"</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Kiểm tra trạng thái thanh toán:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Vào mục "Thanh toán" để xem trạng thái</li>
                <li>Thời gian duyệt: 5-30 phút trong giờ hành chính (8h-22h)</li>
                <li>Khi được duyệt, gói sẽ tự động kích hoạt và chuyển về Dashboard</li>
              </ul>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Lưu ý:</strong> Nội dung chuyển khoản phải đúng mã đơn hàng để hệ thống tự động nhận diện.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 6: FAQ */}
        <AccordionItem value="faq">
          <AccordionTrigger className="text-lg font-semibold">
            ❓ 6. Câu hỏi Thường gặp
          </AccordionTrigger>
          <AccordionContent className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Làm sao thay đổi thông tin cá nhân?</h4>
              <p className="ml-2 text-sm">A: Click vào avatar ở góc trên → "Cài đặt" → Cập nhật thông tin → "Lưu thay đổi".</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Token hết giữa chừng thì sao?</h4>
              <p className="ml-2 text-sm">A: Bạn có thể nâng cấp gói để có thêm token, hoặc đợi đến 0h để token được reset.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Mã mở khóa ở đâu?</h4>
              <p className="ml-2 text-sm">A: Xem ở góc trên Dashboard, bên cạnh số token còn lại.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: AI không trả lời?</h4>
              <p className="ml-2 text-sm">A: Kiểm tra kết nối mạng, refresh lại trang, hoặc đăng xuất rồi đăng nhập lại. Nếu vẫn lỗi, liên hệ hỗ trợ.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Thanh toán bao lâu được duyệt?</h4>
              <p className="ml-2 text-sm">A: Thời gian duyệt từ 5-30 phút trong giờ hành chính (8h-22h). Ngoài giờ sẽ được xử lý vào sáng hôm sau.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Tôi đã chuyển khoản nhưng chưa được active?</h4>
              <p className="ml-2 text-sm">A: Kiểm tra xem nội dung chuyển khoản có đúng mã đơn hàng không. Nếu đúng, vui lòng đợi hoặc liên hệ hỗ trợ với mã đơn hàng.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Làm sao xem tiến độ học tập?</h4>
              <p className="ml-2 text-sm">A: Vào tab "Tiến độ" ở sidebar để xem chi tiết thống kê học tập của bạn.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Làm sao đổi mật khẩu?</h4>
              <p className="ml-2 text-sm">A: Avatar → "Cài đặt" → "Bảo mật" → Nhập mật khẩu cũ và mới → "Đổi mật khẩu".</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Thay đổi lớp học có ảnh hưởng gì?</h4>
              <p className="ml-2 text-sm">A: Có, AI sẽ điều chỉnh độ khó bài tập và nội dung phù hợp với lớp học mới của bạn.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Q: Upload ảnh bị lỗi?</h4>
              <p className="ml-2 text-sm">A: Đảm bảo file ảnh có kích thước dưới 5MB và định dạng JPG hoặc PNG. Nếu vẫn lỗi, thử chụp lại ảnh rõ hơn.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Contact Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">💬 Cần hỗ trợ thêm?</h3>
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Email: <a href="mailto:support@ailearning.com" className="text-blue-600 hover:underline font-medium">support@ailearning.com</a></span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>Hotline: <span className="font-medium">1900-xxxx</span> (8h - 22h hàng ngày)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
