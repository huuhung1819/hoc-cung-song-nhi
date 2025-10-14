# 🔒 Hệ Thống Bảo Mật Tài Khoản Giáo Viên

## 📋 Tổng Quan

Hệ thống đã được thiết kế để **chỉ admin mới có quyền tạo tài khoản giáo viên**, ngăn chặn việc người dùng thường tự đăng ký làm giáo viên và lạm dụng quyền hạn.

---

## 🛡️ Các Biện Pháp Bảo Mật

### **1. Xóa Teacher Option Khỏi Public Registration**

- ❌ **Trước**: User có thể chọn role "Giáo viên" khi đăng ký
- ✅ **Sau**: Chỉ có option "Phụ huynh", hiển thị thông báo liên hệ admin cho giáo viên

**File:** `app/auth/register/page.tsx`

```tsx
// Chỉ cho phép đăng ký với role "parent"
const [userRole] = useState('parent')

// Hiển thị thông báo cho giáo viên
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p>Nếu bạn là giáo viên, vui lòng liên hệ admin để được cấp tài khoản.</p>
  <p>Email: admin@example.com</p>
</div>
```

---

### **2. Admin-Only Teacher Creation**

Chỉ admin có thể tạo tài khoản giáo viên qua:

#### **📍 Admin Panel: `/admin/create-teacher`**

**Features:**
- ✅ Form nhập thông tin giáo viên
- ✅ Tự động tạo mật khẩu mạnh
- ✅ Validation đầy đủ (email, password, name)
- ✅ Check duplicate email
- ✅ Auto-confirm email (skip verification)
- ✅ Tăng token quota cho giáo viên (1000 vs 500)

**Security Checks:**
```typescript
// API: /api/admin/create-teacher
const userId = request.headers.get('x-user-id')
const userRole = request.headers.get('x-user-role')

if (!userId || userRole !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

### **3. Role-Based Access Control (RBAC)**

#### **Database Level:**
- `users` table có constraint: `role IN ('admin', 'teacher', 'parent')`
- Row Level Security (RLS) policies

#### **API Level:**
```typescript
// Middleware checks role cho mọi admin API
if (userRole !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### **UI Level:**
```typescript
// Admin layout checks user role
if (!user || userRole !== 'admin') {
  return <div>Bạn không có quyền truy cập</div>
}
```

---

## 🚀 Workflow Tạo Tài Khoản Giáo Viên

```
Giáo viên liên hệ Admin
         ↓
Admin đăng nhập vào /admin
         ↓
Vào /admin/create-teacher
         ↓
Điền thông tin giáo viên
         ↓
Nhấn "Tạo tài khoản"
         ↓
Hệ thống tạo:
  - Auth user (Supabase Auth)
  - User profile (Database)
  - Auto-confirm email
         ↓
Admin nhận thông tin đăng nhập
         ↓
Gửi email/tin nhắn cho giáo viên
         ↓
Giáo viên đăng nhập và đổi password
```

---

## 📊 So Sánh Trước & Sau

| Tính năng | Trước | Sau |
|-----------|-------|-----|
| **Public Registration** | Cho phép chọn "Teacher" | Chỉ "Parent" |
| **Teacher Creation** | Ai cũng tạo được | Chỉ Admin |
| **Email Verification** | Cần verify | Auto-confirm (admin tạo) |
| **Security Level** | ⚠️ Thấp | ✅ Cao |
| **Abuse Risk** | ⚠️ Cao | ✅ Thấp |

---

## 🔧 API Endpoints

### **1. Create Teacher (Admin Only)**
```
POST /api/admin/create-teacher
Headers:
  x-user-id: <admin_user_id>
  x-user-role: admin
Body:
  {
    email: string,
    password: string,
    name: string,
    phone?: string,
    role?: 'teacher' | 'admin'
  }
```

### **2. Update User Role (Admin Only)**
```
PATCH /api/admin/users
Headers:
  x-user-id: <admin_user_id>
  x-user-role: admin
Body:
  {
    targetUserId: string,
    action: 'change_role',
    newRole: 'teacher' | 'parent' | 'admin'
  }
```

---

## 📱 Hướng Dẫn Sử Dụng

### **Cho Admin:**

1. **Đăng nhập** với tài khoản admin
2. **Vào menu** "Tạo tài khoản GV"
3. **Điền thông tin:**
   - Họ tên giáo viên
   - Email
   - Số điện thoại (optional)
   - Mật khẩu (hoặc tạo tự động)
4. **Nhấn "Tạo tài khoản"**
5. **Copy thông tin** đăng nhập
6. **Gửi cho giáo viên** qua email/SMS

### **Cho Giáo Viên:**

1. **Nhận thông tin** từ admin
2. **Đăng nhập** tại `/auth/login`
3. **Tự động redirect** đến `/teacher`
4. **Đổi password** trong settings (khuyến nghị)

---

## 🧪 Testing

### **Test Admin Creation:**
```bash
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
node scripts/create-teacher-admin.js
```

### **Test Accounts:**
```
Admin: admin@test.com / admin123
Teacher (created by script): teacherdemo@test.com / teacher123
Teacher (manual): demogv@gmail.com / 123456
```

---

## 🚨 Security Notes

### **KHÔNG BAO GIỜ:**
- ❌ Cho phép public registration với role "teacher"
- ❌ Expose admin API endpoints ra public
- ❌ Hard-code admin credentials
- ❌ Skip role checks trong API

### **LUÔN LUÔN:**
- ✅ Verify user role trong mọi admin API
- ✅ Log admin activities (audit trail)
- ✅ Validate input data đầy đủ
- ✅ Use strong passwords
- ✅ Monitor suspicious activities

---

## 📝 Audit Log

Mọi hành động tạo/sửa teacher account đều được log:

```typescript
await logAdminActivityFromRequest(
  userId,
  'admin_create_teacher',
  request,
  {
    targetUserId: authData.user.id,
    targetEmail: email,
    targetName: name,
    targetRole: role || 'teacher'
  }
)
```

---

## 🔄 Nâng Cấp Tương Lai (Optional)

### **1. Invitation Code System**
- Admin tạo invitation codes
- Giáo viên dùng code khi đăng ký
- Code expires sau X ngày

### **2. Pending Teacher Approval**
- Giáo viên đăng ký → Role: "pending_teacher"
- Admin review và approve
- Auto-upgrade role thành "teacher"

### **3. Two-Factor Authentication**
- Thêm 2FA cho admin accounts
- Thêm 2FA cho teacher accounts

### **4. Payment Integration**
- Giáo viên mua subscription
- Auto-approve sau payment
- Định kỳ renew

---

## 📞 Support

Nếu có vấn đề về bảo mật hoặc cần tạo tài khoản giáo viên, liên hệ:

- **Email:** admin@example.com
- **Admin Panel:** https://your-domain.com/admin

---

**Last Updated:** 2025-01-14
**Version:** 1.0.0
**Security Level:** ✅ High

