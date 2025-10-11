# 🤖 HƯỚNG DẪN TẠO AGENT BUILDER CHO DỰ ÁN "HỌC CÙNG AI"

## 📖 Tổng quan
Agent Builder là công cụ mới của OpenAI để tạo các trợ lý AI thông minh với khả năng sử dụng công cụ và thực hiện các tác vụ phức tạp.

## 🎯 Template đầu tiên nên chọn: "Internal knowledge assistant"

### Lý do chọn:
- ✅ Phù hợp với mục tiêu giáo dục
- ✅ Hỗ trợ hội thoại đa lượt
- ✅ Dễ tùy chỉnh cho từng vai trò người dùng
- ✅ Có sẵn khung sườn cho việc phân loại và trả lời câu hỏi

---

## 🚀 BƯỚC 1: TẠO AGENT ĐẦU TIÊN

### 1.1 Truy cập OpenAI Platform
1. Vào [OpenAI Platform](https://platform.openai.com)
2. Đăng nhập với tài khoản của bạn
3. Tìm và click vào **"Agent Builder"**

### 1.2 Chọn Template
1. Trên trang "Create a workflow", bạn sẽ thấy 6 template:
   - **Data enrichment** (Làm giàu dữ liệu)
   - **Planning helper** (Trợ giúp lập kế hoạch)
   - **Customer service** (Dịch vụ khách hàng)
   - **Structured Data Q/A** (Hỏi/Đáp dữ liệu có cấu trúc)
   - **Document comparison** (So sánh tài liệu)
   - **Internal knowledge assistant** (Trợ lý kiến thức nội bộ) ⭐

2. **Click vào "Internal knowledge assistant"**

### 1.3 Cấu hình Agent cơ bản
1. **Name (Tên):** `Trợ lý Phụ huynh - Học cùng AI`
2. **Description (Mô tả):** `Trợ lý AI chuyên hỗ trợ phụ huynh trong việc hướng dẫn con học tập`
3. **Instructions (Hướng dẫn):** Copy nội dung từ file `docs/parent-agent-instructions.md`

---

## 🛠️ BƯỚC 2: THÊM CÔNG CỤ (TOOLS)

### 2.1 Các công cụ cần thêm cho Phụ huynh:
1. **get_student_progress** - Lấy tiến độ học tập
2. **create_study_plan** - Tạo kế hoạch học tập  
3. **generate_practice_exercises** - Tạo bài tập thực hành
4. **get_learning_resources** - Lấy tài liệu học tập
5. **track_study_session** - Theo dõi buổi học

### 2.2 Cách thêm công cụ:
1. Trong Agent Builder, tìm section **"Tools"**
2. Click **"Add Tool"** 
3. Chọn **"Function"**
4. Điền thông tin cho từng công cụ theo template đã chuẩn bị

---

## ⚙️ BƯỚC 3: CẤU HÌNH CHI TIẾT

### 3.1 Model Settings
- **Model:** `gpt-4o-mini` (để tiết kiệm chi phí)
- **Temperature:** `0.7` (cân bằng sáng tạo và chính xác)
- **Max Tokens:** `1000`

### 3.2 Response Format
- Đảm bảo agent trả lời bằng **tiếng Việt**
- Sử dụng **tone thân thiện, khuyến khích**
- Có thể **sử dụng emoji** phù hợp

---

## 🧪 BƯỚC 4: TEST VÀ TỐI ƯU

### 4.1 Test cơ bản
1. Trong Agent Builder, click **"Test"**
2. Thử các câu hỏi mẫu:
   - "Con tôi đang học lớp 3, làm sao để giúp con học toán tốt hơn?"
   - "Tạo cho tôi một kế hoạch học tập cho con trong tuần này"
   - "Con tôi cần luyện tập gì để cải thiện tiếng Việt?"

### 4.2 Điều chỉnh
- Nếu agent chưa trả lời đúng ý, chỉnh sửa **Instructions**
- Thêm **Examples** nếu cần
- Điều chỉnh **Tools** nếu thiếu chức năng

---

## 💾 BƯỚC 5: LƯU VÀ LẤY ID

### 5.1 Lưu Agent
1. Click **"Save"** 
2. Agent sẽ được tạo với ID dạng: `asst_xxxxxxxxx`

### 5.2 Lấy Agent ID
1. Copy **Agent ID** (bắt đầu bằng `asst_`)
2. Lưu vào file `.env.local`:
```env
OPENAI_PARENT_AGENT_ID=asst_xxxxxxxxx
```

---

## 🔄 BƯỚC 6: TẠO CÁC AGENT KHÁC

Sau khi tạo xong Agent Phụ huynh, lặp lại quy trình để tạo:

### 6.1 Agent Giáo viên
- **Template:** "Internal knowledge assistant" 
- **Name:** `Trợ lý Giáo viên - Học cùng AI`
- **Tools:** Tập trung vào quản lý lớp học, tạo bài tập, đánh giá học sinh

### 6.2 Agent Quản trị  
- **Template:** "Internal knowledge assistant"
- **Name:** `Trợ lý Quản trị - Học cùng AI`
- **Tools:** Tập trung vào phân tích, báo cáo, giám sát hệ thống

---

## 📝 CHECKLIST HOÀN THÀNH

- [ ] Tạo Agent Phụ huynh với template "Internal knowledge assistant"
- [ ] Thêm 5 công cụ cơ bản cho Phụ huynh
- [ ] Test agent với các câu hỏi mẫu
- [ ] Lưu Agent ID vào .env.local
- [ ] Tạo Agent Giáo viên (tùy chọn)
- [ ] Tạo Agent Quản trị (tùy chọn)
- [ ] Cập nhật code để sử dụng Agent ID mới

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **Chi phí:** Agent Builder có thể tốn token nhiều hơn, cần theo dõi usage
2. **Rate Limit:** Có giới hạn số request, cần implement retry logic
3. **Error Handling:** Luôn có fallback khi Agent không khả dụng
4. **Testing:** Test kỹ trước khi deploy production

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành, bạn sẽ có:
- ✅ 3 Agent chuyên biệt cho từng vai trò người dùng
- ✅ Khả năng trả lời câu hỏi thông minh hơn
- ✅ Tích hợp các công cụ hữu ích
- ✅ Trải nghiệm người dùng tốt hơn

**Chúc bạn thành công! 🚀**
