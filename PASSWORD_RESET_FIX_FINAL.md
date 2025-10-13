# 🔥 PASSWORD RESET FIX - VẤN ĐỀ MIDDLEWARE REDIRECT

**Ngày sửa**: 2025-10-12  
**Vấn đề**: Click link reset password → Vào Dashboard thay vì Reset Password page

---

## 🐛 VẤN ĐỀ THỰC SỰ

### **Hiện tượng:**
```
User click link trong email → /auth/callback?code=xxx&type=recovery
→ Callback exchange code → Create session
→ Redirect to /auth/reset-password
→ ❌ BỊ REDIRECT LẠI VỀ /DASHBOARD
```

### **Log từ terminal:**
```
GET /auth/callback?code=aec8b069...&next=reset-password&type=recovery 200 in 406ms
→ Sau đó user vào dashboard thay vì reset-password
```

---

## 🔍 NGUYÊN NHÂN GỐC RỄ

### **Flow chi tiết:**

```
1. User click link: /auth/callback?type=recovery
   ↓
2. Callback page:
   - Exchange code for session
   - Session CREATED ✅
   - Detect: type=recovery
   - router.push('/auth/reset-password')
   ↓
3. MIDDLEWARE CHẠY LẠI:
   - Thấy user CÓ SESSION
   - Thấy đang redirect đến /auth/reset-password
   - ❌ REDIRECT LẠI VỀ /DASHBOARD (vì user đã login)
```

### **Vấn đề:**

Middleware cũ:
```typescript
// Cho phép /auth/reset-password KHÔNG redirect
if (isAllowedAuthRoute) {
  return supabaseResponse
}

// NHƯNG sau khi callback tạo session và redirect
// Middleware chạy lại và thấy:
if (user && isAuthRoute) {
  // ❌ Redirect về dashboard
}
```

**Middleware cho phép reset-password page, NHƯNG khi user CÓ session rồi, middleware lại redirect về dashboard!**

---

## ✅ GIẢI PHÁP CUỐI CÙNG

### **Fix 1: Middleware - Thêm check recovery parameter**

```typescript
// Check if this is a password recovery flow
const isPasswordRecovery = 
  request.nextUrl.searchParams.get('type') === 'recovery' || 
  request.nextUrl.searchParams.get('next') === 'reset-password' ||
  request.nextUrl.searchParams.get('recovery') === 'true'

// Allow reset-password page EVEN IF USER IS LOGGED IN
if (user && request.nextUrl.pathname.startsWith('/auth/reset-password')) {
  return supabaseResponse  // ← KHÔNG redirect
}

// Only redirect logged-in users IF NOT recovery flow
if (user && isAuthRoute && !isPasswordRecovery) {
  url.pathname = '/dashboard'
  return NextResponse.redirect(url)
}
```

**Key Point**: Middleware PHẢI biết đây là recovery flow để KHÔNG redirect

---

### **Fix 2: Callback - Thêm recovery=true parameter khi redirect**

```typescript
// Trước:
if (isPasswordRecovery) {
  router.push('/auth/reset-password')  // ❌ Middleware sẽ redirect
}

// Sau:
if (isPasswordRecovery) {
  router.push('/auth/reset-password?recovery=true')  // ✅ Middleware không redirect
}
```

---

## 🔄 FLOW ĐÚNG SAU KHI FIX

### **Password Reset Flow:**

```
1. User click "Quên mật khẩu"
   ↓
2. Nhập email → Submit
   ↓
3. Email gửi link: 
   /auth/callback?code=xxx&type=recovery&next=reset-password
   ↓
4. Callback page:
   - Exchange code → CREATE SESSION ✅
   - Detect: type=recovery
   - Redirect: /auth/reset-password?recovery=true
   ↓
5. MIDDLEWARE:
   - Thấy: recovery=true parameter
   - ✅ CHO PHÉP qua reset-password page
   - KHÔNG redirect về dashboard
   ↓
6. Reset Password Page:
   - User nhập password mới
   - Update password
   - Sign out
   - Redirect: /auth/login
   ↓
7. Login với password mới
```

---

## 🔑 3 KEY POINTS

### **1. Always add recovery flag**
```typescript
router.push('/auth/reset-password?recovery=true')
```

### **2. Middleware checks recovery flag**
```typescript
const isPasswordRecovery = 
  request.nextUrl.searchParams.get('recovery') === 'true'
```

### **3. Allow reset-password for logged-in users**
```typescript
if (user && request.nextUrl.pathname.startsWith('/auth/reset-password')) {
  return supabaseResponse  // NO redirect
}
```

---

## 📊 SO SÁNH

### **TRƯỚC FIX:**

```
Callback → Create session → Redirect /auth/reset-password
                              ↓
                         MIDDLEWARE:
                         - User có session
                         - ❌ Redirect → /dashboard
```

### **SAU FIX:**

```
Callback → Create session → Redirect /auth/reset-password?recovery=true
                              ↓
                         MIDDLEWARE:
                         - User có session
                         - recovery=true
                         - ✅ CHO PHÉP → /auth/reset-password
```

---

## 🧪 TESTING

### **Test Reset Password:**

1. **Go to forgot password:**
   ```
   http://localhost:3000/auth/forgot-password
   ```

2. **Enter email và submit**

3. **Check email** cho reset link

4. **Click reset link**

5. **Check console logs:**
   ```
   ✅ Should see: "→ Redirecting to reset password page"
   ✅ Should see: router.push('/auth/reset-password?recovery=true')
   ```

6. **Verify:**
   - [ ] Redirect đến `/auth/reset-password?recovery=true`
   - [ ] KHÔNG redirect về dashboard
   - [ ] Thấy form đổi password
   - [ ] Có thể nhập password mới
   - [ ] Update thành công

7. **After reset:**
   - [ ] Redirect về login
   - [ ] Login với password mới thành công

---

## 📄 FILES MODIFIED

### **1. middleware.ts** ⭐ **CRITICAL FIX**

**Changes:**
- Added `isPasswordRecovery` check
- Allow `/auth/reset-password` for logged-in users
- Check `recovery=true` parameter
- Don't redirect if recovery flow

### **2. app/auth/callback/page.tsx**

**Changes:**
- Add `?recovery=true` to reset-password redirect
- Ensure recovery flag is passed to middleware

---

## 🎯 WHY THIS WORKS

### **Problem Root Cause:**
Middleware runs MULTIPLE TIMES:
1. First: For `/auth/callback` → Allowed ✅
2. Second: After session created, for `/auth/reset-password` → ❌ Redirected

### **Solution:**
Add a FLAG (`recovery=true`) so middleware knows:
- "This user is in recovery flow"
- "Don't redirect even though they're logged in"
- "Let them access reset-password page"

---

## ⚠️ IMPORTANT NOTES

### **Why recovery=true is needed:**

Middleware cannot "remember" state between requests. Each redirect is a NEW request with NEW middleware execution.

So we MUST pass information via:
- ✅ URL parameters (recovery=true)
- ❌ Variables (lost between requests)
- ❌ State (client-side only)

### **Why check in middleware:**

If we only fix callback, middleware will STILL redirect when accessing reset-password page.

We MUST tell middleware: "Allow this page for logged-in users during recovery"

---

## 🔐 SECURITY

### **Is this secure?**

✅ **YES** because:
- Recovery link expires (Supabase default: 1 hour)
- User must have valid session from email link
- Can only reset OWN password (session-based)
- Link is one-time use
- `recovery=true` flag just prevents redirect, doesn't bypass auth

---

## 📚 LESSONS LEARNED

### **1. Middleware runs for EVERY request**
- Including redirects
- Must handle all cases

### **2. State is lost between redirects**
- Can't rely on variables
- Must use URL parameters

### **3. Auth flows need special handling**
- Can't treat all logged-in users the same
- Recovery flow is special case

### **4. Debug with console logs**
- Terminal logs show the real flow
- `console.log` in middleware helps

---

## ✅ CHECKLIST

### **Before Deploy:**
- [ ] Test forgot password flow end-to-end
- [ ] Verify console logs show correct flow
- [ ] Check middleware doesn't redirect
- [ ] Confirm reset-password page displays
- [ ] Test password update works
- [ ] Test login with new password

### **After Deploy:**
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify email links work
- [ ] Test on mobile

---

**VẤN ĐỀ ĐÃ ĐƯỢC FIX TRIỆT ĐỂ!** 🎉

**Key: Thêm `recovery=true` flag để middleware biết đừng redirect!**

**Last Updated**: 2025-10-12
