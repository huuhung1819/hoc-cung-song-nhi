# 🚀 Hướng dẫn Setup Supabase cho HỌC CÙNG SONG NHI

## 📋 **BƯỚC 1: Tạo Project Supabase**

### 1.1 Đăng ký/Đăng nhập Supabase
- Truy cập: https://supabase.com
- Đăng ký hoặc đăng nhập tài khoản

### 1.2 Tạo Project mới
- Click **"New Project"**
- Chọn Organization
- Đặt tên: `hoc-cung-song-nhi`
- Chọn Region: `Southeast Asia (Singapore)` 
- Chọn Database Password: Tạo password mạnh (lưu lại!)
- Click **"Create new project"**

---

## 📋 **BƯỚC 2: Chạy SQL Schema**

### 2.1 Mở SQL Editor
- Trong project Supabase, click **"SQL Editor"** ở sidebar
- Click **"New query"**

### 2.2 Copy & Paste SQL
```sql
-- Copy toàn bộ nội dung từ file sql/schema.sql
-- Paste vào SQL Editor
-- Click "Run" để chạy
```

### 2.3 Kiểm tra kết quả
- Sau khi chạy xong, bạn sẽ thấy:
  - ✅ 9 bảng được tạo
  - ✅ Indexes được tạo  
  - ✅ RLS policies được tạo
  - ✅ Sample data được insert

---

## 📋 **BƯỚC 3: Lấy API Keys**

### 3.1 Mở Project Settings
- Click **"Settings"** → **"API"**

### 3.2 Copy các keys
```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anon Key  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 **BƯỚC 4: Cấu hình Environment**

### 4.1 Tạo file .env.local
```bash
# Trong thư mục ai-learning-platform
cp .env.example .env.local
```

### 4.2 Cập nhật .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-your-openai-key-here
```

---

## 📋 **BƯỚC 5: Test kết nối**

### 5.1 Restart development server
```bash
cd ai-learning-platform
pnpm run dev
```

### 5.2 Kiểm tra database
- Mở http://localhost:3000
- Kiểm tra không có lỗi database
- Thử tạo user mới

---

## ✅ **KẾT QUẢ SAU KHI SETUP**

### 🗂️ **9 Bảng được tạo:**
1. ✅ `users` - Quản lý người dùng
2. ✅ `lessons` - Bài học  
3. ✅ `students` - Học sinh
4. ✅ `conversations` - Cuộc trò chuyện AI
5. ✅ `messages` - Tin nhắn chat
6. ✅ `token_logs` - Log token usage
7. ✅ `lesson_progress` - Tiến độ học tập
8. ✅ `notifications` - Thông báo
9. ✅ `system_settings` - Cài đặt hệ thống

### 📊 **Sample Data:**
- ✅ 3 bài học mẫu (Toán, Tiếng Việt, Khoa học)
- ✅ 7 cài đặt hệ thống mặc định
- ✅ Token quota theo gói

### 🔒 **Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Policies cho từng role
- ✅ Auth integration sẵn sàng

---

## 🆘 **TROUBLESHOOTING**

### Lỗi thường gặp:

#### 1. **"Invalid API key"**
```bash
# Kiểm tra .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. **"Table not found"**
```bash
# Chạy lại SQL schema
# Kiểm tra trong Supabase Dashboard → Table Editor
```

#### 3. **"Permission denied"**
```bash
# Kiểm tra RLS policies
# Đảm bảo user đã được authenticate
```

---

## 🎉 **HOÀN THÀNH!**

Sau khi setup xong:
- ✅ Database sẵn sàng
- ✅ API keys đã cấu hình  
- ✅ Sample data có sẵn
- ✅ Ready để develop!

**🚀 Bây giờ bạn có thể bắt đầu phát triển tính năng!**
