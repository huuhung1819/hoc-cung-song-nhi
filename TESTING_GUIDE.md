# 🧪 TESTING GUIDE - AUTH FLOWS & RESPONSIVE

**Ngày**: 2025-10-12  
**Mục đích**: Hướng dẫn test chi tiết 2 flows quan trọng

---

## 📋 CHUẨN BỊ

### **1. Mở Browser DevTools:**
```
F12 hoặc Right-click → Inspect
→ Tab Console để xem logs
```

### **2. Mở Terminal để xem logs:**
```bash
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
pnpm dev
```

### **3. Chuẩn bị email:**
- Email thật hoặc test email
- Có thể access được để check email

---

## 🧪 TEST 1: PASSWORD RESET FLOW

### **Bước 1: Request Reset Password**

1. **Truy cập:**
   ```
   http://localhost:3000/auth/forgot-password
   ```

2. **Nhập email** của user đã đăng ký

3. **Click "Gửi link đặt lại mật khẩu"**

4. **Check Console (Browser):**
   ```javascript
   Sending reset password email to: your@email.com
   Redirect URL: http://localhost:3000/auth/callback?type=recovery&next=reset-password
   ```

5. **Check Terminal:**
   ```
   Compiled /auth/forgot-password
   POST /api/... (nếu có)
   ```

---

### **Bước 2: Check Email**

**Cách 1: Email thật**
- Check inbox
- Tìm email từ Supabase
- Click "Reset Password" link

**Cách 2: Supabase Dashboard (recommended for testing)**
1. Go to: Supabase Dashboard
2. Authentication → Users
3. Find user bạn vừa test
4. Click vào user
5. Click "Send password recovery email"
6. Copy link từ email hoặc dashboard

---

### **Bước 3: Click Reset Link**

**Expected URL format:**
```
http://localhost:3000/auth/callback?code=xxx&type=recovery&next=reset-password
```

**Check Console (Browser) khi click:**
```javascript
=== AUTH CALLBACK DEBUG ===
Callback params: { code: "xxx", type: "recovery", next: "reset-password" }
Is password recovery: true
→ Redirecting to reset password page
```

**Check Terminal:**
```
✓ Compiled /auth/callback
GET /auth/callback?code=xxx&type=recovery&next=reset-password 200
✓ Compiled /auth/reset-password  
GET /auth/reset-password?recovery=true 200  ← PHẢI CÓ DÒNG NÀY
```

---

### **Bước 4: Verify Reset Password Page**

**PHẢI thấy:**
- ✅ Page title: "Đặt lại mật khẩu"
- ✅ Icon: 🔐
- ✅ Form với 2 input: "Mật khẩu mới" và "Xác nhận mật khẩu"
- ✅ Button: "Đặt lại mật khẩu"

**KHÔNG được thấy:**
- ❌ Dashboard page
- ❌ Error message "Phiên đăng nhập không hợp lệ"
- ❌ Redirect về login

**Check Console:**
```javascript
=== RESET PASSWORD DEBUG ===
Checking session...
Recovery param: true
Current session: EXISTS  ← PHẢI EXISTS
✅ Valid session found
Session user: your@email.com
```

---

### **Bước 5: Change Password**

1. **Nhập mật khẩu mới** (ít nhất 6 ký tự)
2. **Nhập lại mật khẩu** (phải giống)
3. **Click "Đặt lại mật khẩu"**

**Check Console:**
```javascript
Updating password...
Password updated successfully
Signing out...
Redirecting to login...
```

**Expected:**
- ✅ Success message: "Đặt lại mật khẩu thành công!"
- ✅ Loading spinner
- ✅ Redirect về `/auth/login` sau 3 giây

---

### **Bước 6: Login với Password Mới**

1. **Trang login** phải hiển thị

2. **Nhập email** và **password mới**

3. **Click "Đăng nhập"**

**Expected:**
- ✅ Login thành công
- ✅ Redirect vào `/dashboard`
- ✅ Thấy thông tin user

---

## 🧪 TEST 2: REGISTRATION FLOW

### **Bước 1: Register New Account**

1. **Truy cập:**
   ```
   http://localhost:3000/auth/register
   ```

2. **Điền form:**
   - Họ tên: Nguyễn Văn Test
   - Email: test@example.com (email chưa dùng)
   - Số điện thoại: 0987654321
   - Mật khẩu: Test123456
   - Xác nhận mật khẩu: Test123456
   - Check "Tôi không phải robot"

3. **Click "Đăng ký tài khoản"**

**Check Console:**
```javascript
Registering user...
User registered successfully
Redirecting to login in 3 seconds...
```

**Expected:**
- ✅ Success message: "Đăng ký thành công! Vui lòng kiểm tra email..."
- ✅ Redirect về `/auth/login` sau 3 giây

---

### **Bước 2: Check Email Verification**

**Cách 1: Email thật**
- Check inbox cho verification email

**Cách 2: Supabase Dashboard**
1. Go to: Authentication → Users
2. Find user vừa tạo
3. Check: Email confirmed = false
4. Click "Send email verification"

---

### **Bước 3: Click Verification Link**

**Expected URL:**
```
http://localhost:3000/auth/callback?code=xxx
```
(Không có type=recovery)

**Check Console (Browser):**
```javascript
=== AUTH CALLBACK DEBUG ===
Callback params: { code: "xxx" }
Type param: null
Is password recovery: false  ← PHẢI FALSE
→ Email verification complete, redirecting to login
Signing out...
```

**Check Terminal:**
```
GET /auth/callback?code=xxx 200
GET /auth/login?verified=true 200  ← PHẢI CÓ DÒNG NÀY
```

---

### **Bước 4: Verify Login Page**

**PHẢI thấy:**
- ✅ Page title: "HỌC CÙNG SONG NHI"  
- ✅ Success message: "✅ Email đã được xác thực thành công!"
- ✅ Login form
- ✅ KHÔNG tự động vào dashboard

**Check Console:**
```javascript
useEffect detected verified=true
Setting success message...
```

---

### **Bước 5: Login Manually**

1. **Nhập email** và **password** vừa đăng ký
2. **Check "Tôi không phải robot"**
3. **Click "Đăng nhập"**

**Expected:**
- ✅ Login thành công
- ✅ Redirect vào `/dashboard`
- ✅ Thấy "Chào mừng, [Tên]!"

---

## ⚠️ TROUBLESHOOTING

### **Nếu Reset Password vẫn redirect về Dashboard:**

**Check 1: Middleware logs**
```typescript
// Thêm vào middleware.ts (dòng 75)
console.log('🔍 MIDDLEWARE:', {
  pathname: request.nextUrl.pathname,
  recovery: request.nextUrl.searchParams.get('recovery'),
  hasUser: !!user,
  willRedirect: user && isAuthRoute && !isPasswordRecovery
})
```

**Check 2: Callback logs**
```
Phải thấy trong terminal:
=== AUTH CALLBACK DEBUG ===
Type param: recovery  ← PHẢI CÓ
Is password recovery: true  ← PHẢI TRUE
→ Redirecting to reset password page
```

**Check 3: URL parameters**
```
Callback URL phải có: ?type=recovery&next=reset-password
Reset-password URL phải có: ?recovery=true
```

---

### **Nếu Registration vẫn tự động vào Dashboard:**

**Check 1: Callback sign out**
```javascript
// Phải thấy trong console:
→ Email verification complete, redirecting to login
Signing out...
```

**Check 2: Middleware logs**
```
After callback:
- User should be null (signed out)
- Should allow /auth/login
```

**Check 3: Terminal logs**
```
GET /auth/login?verified=true 200  ← Phải có
KHÔNG có: GET /dashboard
```

---

## 📊 SUCCESS CRITERIA

### **Password Reset:**
```
✅ Forgot password page loads
✅ Email được gửi
✅ Click link → Callback page
✅ Callback → Reset password page (KHÔNG dashboard)
✅ Form đổi password hiển thị
✅ Có thể đổi password
✅ Redirect về login sau reset
✅ Login với password mới thành công
```

### **Registration:**
```
✅ Register form loads
✅ Có thể đăng ký
✅ Email verification được gửi
✅ Click link → Callback page
✅ Callback → Login page (KHÔNG dashboard)
✅ Success message hiển thị
✅ User PHẢI login thủ công
✅ Login thành công → Dashboard
```

---

## 🎯 EXPECTED TERMINAL LOGS

### **Password Reset:**
```bash
# Step 1: Forgot password
GET /auth/forgot-password 200

# Step 2: Click email link
GET /auth/callback?code=xxx&type=recovery&next=reset-password 200

# Step 3: Should redirect to reset-password
GET /auth/reset-password?recovery=true 200  ← QUAN TRỌNG

# Step 4: After password change
GET /auth/login 200
```

### **Registration:**
```bash
# Step 1: Register
GET /auth/register 200
POST /api/user/update 200

# Step 2: Click email verification
GET /auth/callback?code=xxx 200

# Step 3: Should redirect to login
GET /auth/login?verified=true 200  ← QUAN TRỌNG

# Step 4: Manual login
GET /dashboard 200
```

---

## 🔍 DEBUG COMMANDS

### **Test specific URL:**
```bash
# Test reset-password with recovery flag
curl -s "http://localhost:3000/auth/reset-password?recovery=true" | grep -i "đặt lại mật khẩu"

# Test login with verified flag
curl -s "http://localhost:3000/auth/login?verified=true" | grep -i "xác thực"

# Test callback
curl -s "http://localhost:3000/auth/callback" | grep -i "đang xác thực"
```

### **Check Supabase connection:**
```bash
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
pnpm test-db
```

---

## 📸 SCREENSHOTS TO VERIFY

### **Password Reset Success:**
```
1. Screenshot forgot-password page
2. Screenshot email content
3. Screenshot reset-password page (NOT dashboard)
4. Screenshot password change form
5. Screenshot login page after reset
6. Screenshot successful login
```

### **Registration Success:**
```
1. Screenshot register form
2. Screenshot success message
3. Screenshot verification email
4. Screenshot login page with verified message
5. Screenshot login form
6. Screenshot dashboard after login
```

---

## ⏱️ TIMING EXPECTATIONS

### **Normal Timing:**
```
Forgot password submit: < 2s
Email delivery: 1-30s (depends on Supabase)
Callback processing: < 1s
Reset-password page load: < 1s
Password update: < 2s
Login redirect: < 1s
```

### **If Slow:**
- Check network tab in DevTools
- Check Supabase dashboard status
- Check terminal for errors

---

## 🎊 ALL TESTS PASS IF:

### **Password Reset:**
- ✅ No redirect to dashboard
- ✅ Can see reset-password form
- ✅ Can change password
- ✅ Can login with new password

### **Registration:**
- ✅ No auto-login to dashboard
- ✅ Redirect to login page
- ✅ Success message shows
- ✅ Must login manually
- ✅ Dashboard accessible after login

---

**BẮT ĐẦU TEST NGAY!** 🚀

**Check browser console và terminal logs để debug!** 🔍

**Last Updated**: 2025-10-12
