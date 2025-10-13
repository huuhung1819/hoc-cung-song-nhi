# Database Migrations

Các file migration SQL để cập nhật schema của Supabase database.

## Cách sử dụng

### Option 1: Chạy qua Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy nội dung từ các file migration theo thứ tự
5. Paste vào SQL Editor và click **Run**

### Option 2: Chạy qua Supabase CLI

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase db push
```

## Danh sách Migrations

### 001_add_phone_column.sql
- Thêm column `phone` vào bảng `users`
- Tạo index cho phone number lookups
- Cho phép login bằng số điện thoại

### 002_add_has_image_column.sql
- Thêm column `has_image` vào bảng `token_logs`
- Track xem message có chứa hình ảnh không
- Giúp phân tích usage patterns

## Lưu ý

- ✅ Các migration sử dụng `IF NOT EXISTS` nên an toàn để chạy nhiều lần
- ✅ Không ảnh hưởng đến data hiện tại
- ✅ Có thể rollback bằng cách drop column nếu cần

## Rollback (nếu cần)

```sql
-- Rollback 001
ALTER TABLE users DROP COLUMN IF EXISTS phone;
DROP INDEX IF EXISTS idx_users_phone;

-- Rollback 002
ALTER TABLE token_logs DROP COLUMN IF EXISTS has_image;
```


