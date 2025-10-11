# 🔧 TÙY CHỈNH WORKFLOW CHO DỰ ÁN "HỌC CÙNG AI"

## 📋 Workflow hiện tại đã có:
1. **Start** → Bắt đầu
2. **Query rewrite Agent** → Viết lại câu hỏi
3. **Classify Agent** → Phân loại câu hỏi  
4. **If/Else Logic** → Điều hướng theo 3 nhánh:
   - Q&A → Internal Q&A Agent
   - Fact finding → External fact finding Agent
   - Else → Generic Agent

## 🎯 Tùy chỉnh cho Giáo dục:

### 1. **Query rewrite Agent** - Đặt tên: "Viết lại câu hỏi giáo dục"
**Instructions:**
```
Bạn là chuyên gia viết lại câu hỏi giáo dục. Nhiệm vụ của bạn là:

1. Làm rõ ý định của phụ huynh/giáo viên
2. Thêm ngữ cảnh về cấp lớp, môn học nếu thiếu
3. Đảm bảo câu hỏi cụ thể và có thể trả lời được
4. Giữ nguyên ý nghĩa gốc

Ví dụ:
- Input: "Con tôi học toán kém"
- Output: "Con tôi đang học lớp 3, gặp khó khăn với môn toán, cần hướng dẫn để cải thiện"

Luôn trả lời bằng tiếng Việt.
```

### 2. **Classify Agent** - Đặt tên: "Phân loại câu hỏi giáo dục"
**Instructions:**
```
Bạn là chuyên gia phân loại câu hỏi giáo dục. Phân tích câu hỏi và phân loại vào một trong các loại sau:

**HOC_TAP** - Câu hỏi về học tập:
- Hỏi về phương pháp học
- Yêu cầu tạo kế hoạch học tập
- Hỏi về bài tập, thực hành
- Tư vấn cải thiện kết quả học tập

**TIEN_DO** - Câu hỏi về tiến độ:
- Kiểm tra tiến độ học tập
- Đánh giá kết quả
- Theo dõi quá trình học

**TAI_LIEU** - Câu hỏi về tài liệu:
- Yêu cầu tài liệu học tập
- Hỏi về sách, video hướng dẫn
- Tìm kiếm nguồn học liệu

**TONG_QUAN** - Câu hỏi tổng quan khác:
- Hỏi về chương trình học
- Tư vấn chọn môn học
- Câu hỏi chung về giáo dục

Chỉ trả lời bằng một từ: HOC_TAP, TIEN_DO, TAI_LIEU, hoặc TONG_QUAN
```

### 3. **Cập nhật If/Else Logic:**
Thay vì 3 nhánh cũ, đổi thành:
- **HOC_TAP** → Agent Hỗ trợ Học tập
- **TIEN_DO** → Agent Theo dõi Tiến độ  
- **TAI_LIEU** → Agent Tài liệu Học tập
- **TONG_QUAN** → Agent Tư vấn Tổng quan

## 🚀 Các bước thực hiện:

### Bước 1: Sửa Query rewrite Agent
1. Click vào node "Query rewrite"
2. Trong phần **Instructions**, paste nội dung trên
3. Click **Save**

### Bước 2: Sửa Classify Agent  
1. Click vào node "Classify"
2. Trong phần **Instructions**, paste nội dung trên
3. Click **Save**

### Bước 3: Sửa If/Else Logic
1. Click vào node "If/Else"
2. Thay đổi các nhánh thành:
   - `HOC_TAP` → Tạo agent mới "Agent Hỗ trợ Học tập"
   - `TIEN_DO` → Tạo agent mới "Agent Theo dõi Tiến độ"
   - `TAI_LIEU` → Tạo agent mới "Agent Tài liệu Học tập"  
   - `TONG_QUAN` → Tạo agent mới "Agent Tư vấn Tổng quan"

### Bước 4: Tạo các Agent chuyên biệt
Cho mỗi agent mới, thêm **Tools** phù hợp:

**Agent Hỗ trợ Học tập:**
- create_study_plan
- generate_practice_exercises
- track_study_session

**Agent Theo dõi Tiến độ:**
- get_student_progress
- analyze_student_performance

**Agent Tài liệu Học tập:**
- get_learning_resources
- search_educational_content

**Agent Tư vấn Tổng quan:**
- general_education_advice
- curriculum_guidance

## ✅ Kết quả mong đợi:
Sau khi hoàn thành, workflow sẽ:
1. ✅ Hiểu rõ câu hỏi của người dùng
2. ✅ Phân loại đúng loại câu hỏi
3. ✅ Điều hướng đến agent chuyên biệt
4. ✅ Cung cấp câu trả lời phù hợp và hữu ích

## 🎯 Bước tiếp theo:
1. Hoàn thành tùy chỉnh workflow
2. Test với các câu hỏi mẫu
3. Lưu và lấy Agent ID
4. Cập nhật code để sử dụng Agent mới
