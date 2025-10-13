# 🔐 Admin Account Setup Guide

Complete guide for setting up and managing admin accounts in the AI Learning Platform.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Detailed Setup Instructions](#detailed-setup-instructions)
3. [Security Features](#security-features)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Managing Admin Accounts](#managing-admin-accounts)
7. [Security Best Practices](#security-best-practices)

---

## 🚀 Quick Start

### Prerequisites

- ✅ Supabase project set up
- ✅ Database schema created (`sql/schema.sql` executed)
- ✅ Environment variables configured (`.env.local`)

### Setup Steps

```bash
# 1. Set admin email in .env.local
echo "ADMIN_EMAIL=huuhung20182019@gmail.com" >> .env.local

# 2. Run migration to create admin tables
# Execute sql/migrations/004_create_admin_account.sql in Supabase SQL Editor

# 3. Run admin setup script
npm run setup-admin

# 4. Login to admin dashboard
# Visit: http://localhost:3000/admin
```

---

## 📖 Detailed Setup Instructions

### Step 1: Configure Environment

Edit your `.env.local` file:

```bash
# Admin Configuration
ADMIN_EMAIL=huuhung20182019@gmail.com
ADMIN_SESSION_TIMEOUT=900000          # 15 minutes
ADMIN_RATE_LIMIT=10                   # 10 requests/minute
ADMIN_ENABLE_LOGGING=true             # Enable activity logging
```

**Important Notes:**
- Change `ADMIN_EMAIL` to your email address
- Use a professional email (not a temporary one)
- Keep this file secure and never commit to Git

### Step 2: Run Database Migration

**Option A: Via Supabase Dashboard (Recommended)**

1. Open Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Create new query
4. Copy contents of `sql/migrations/004_create_admin_account.sql`
5. Execute the query
6. Verify success: Should see admin tables created

**Option B: Via Supabase CLI**

```bash
supabase migration up
```

**What This Migration Does:**
- ✅ Creates `admin_activity_logs` table
- ✅ Creates `admin_rate_limits` table
- ✅ Sets up RLS policies
- ✅ Creates admin user record (or updates existing user)
- ✅ Creates cleanup functions

### Step 3: Run Setup Script

The setup script creates/updates the admin account with proper authentication:

```bash
npm run setup-admin
```

**What Happens:**

1. **Email Confirmation**
   - Script asks if you want to use `ADMIN_EMAIL` from .env
   - Or allows you to enter a different email

2. **Database Check**
   - Checks if user already exists
   - If exists: Offers to elevate to admin or reset password
   - If not: Will create new user

3. **Password Setup**
   - Prompts for password (hidden input)
   - Validates password strength:
     - Minimum 12 characters
     - At least 1 uppercase letter
     - At least 1 lowercase letter
     - At least 1 number
     - At least 1 special character
   - Confirms password

4. **Account Creation**
   - Creates/updates Supabase Auth user
   - Creates/updates database user record
   - Sets role to `admin`
   - Sets plan to `enterprise`
   - Sets token quota to `999999` (unlimited)

5. **Verification**
   - Logs setup activity
   - Displays success message with credentials summary

### Step 4: Verify Setup

**Via SQL Query:**

```sql
-- Check user in database
SELECT 
  id, email, name, role, plan, token_quota, is_active, created_at
FROM users 
WHERE email = 'huuhung20182019@gmail.com';

-- Expected result:
-- role: 'admin'
-- plan: 'enterprise'
-- token_quota: 999999
-- is_active: true
```

**Via Supabase Dashboard:**

1. Go to: **Authentication > Users**
2. Find your admin email
3. Verify: User is confirmed and active

**Via Application:**

1. Visit: `http://localhost:3000/auth/login`
2. Login with admin credentials
3. Should redirect to: `http://localhost:3000/admin`
4. Admin dashboard should load successfully

---

## 🛡️ Security Features

### 1. Rate Limiting

**Configuration:**
```bash
ADMIN_RATE_LIMIT=10  # Max 10 requests per minute
```

**How It Works:**
- Tracks requests per admin user per endpoint
- Window: 1 minute sliding window
- Automatic cleanup of old records

**When Rate Limit Exceeded:**
- Returns HTTP 429 (Too Many Requests)
- Response includes reset time
- Activity is logged

**Headers Added:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 2025-10-13T10:30:00Z
```

### 2. Session Management

**Configuration:**
```bash
ADMIN_SESSION_TIMEOUT=900000  # 15 minutes (in milliseconds)
```

**How It Works:**
- Tracks last activity timestamp
- Automatically expires after timeout
- Forces re-login when expired

**Session Expiry Behavior:**
- Redirects to: `/auth/login?reason=session_expired`
- Activity is logged
- Previous session invalidated

### 3. Activity Logging

**Configuration:**
```bash
ADMIN_ENABLE_LOGGING=true
```

**What Gets Logged:**
- Admin route access
- User management actions (ban, role change, etc.)
- Payment approvals/rejections
- System configuration changes
- Failed access attempts
- Rate limit violations
- Session expirations

**Log Structure:**
```typescript
{
  user_id: UUID,
  action: string,           // 'admin_login', 'payment_approve', etc.
  details: JSON,            // Action-specific details
  ip_address: string,       // Client IP
  user_agent: string,       // Browser/client info
  created_at: timestamp
}
```

**Viewing Logs:**

```sql
-- Recent admin activities
SELECT 
  action, 
  details, 
  ip_address, 
  created_at 
FROM admin_activity_logs 
WHERE user_id = 'YOUR_ADMIN_ID'
ORDER BY created_at DESC 
LIMIT 50;

-- Specific action types
SELECT * FROM admin_activity_logs 
WHERE action LIKE '%payment%'
ORDER BY created_at DESC;
```

### 4. Middleware Protection

Admin routes are protected at multiple levels:

**Level 1: Authentication Check**
- Verifies Supabase Auth session
- Redirects to login if not authenticated

**Level 2: Role Check**
- Verifies user role is `admin`
- Redirects to dashboard if not admin

**Level 3: Rate Limiting**
- Checks request rate per user
- Blocks if limit exceeded

**Level 4: Session Validation**
- Checks last activity timestamp
- Logs out if session expired

**Level 5: Activity Logging**
- Logs all admin route access
- Tracks user actions for audit trail

---

## ⚙️ Environment Configuration

### Development Environment

```bash
# .env.local
ADMIN_EMAIL=dev-admin@example.com
ADMIN_SESSION_TIMEOUT=3600000        # 1 hour (more relaxed)
ADMIN_RATE_LIMIT=30                  # 30 requests/minute (more relaxed)
ADMIN_ENABLE_LOGGING=true
```

### Staging Environment

```bash
# Cloud Run Secrets
ADMIN_EMAIL=staging-admin@example.com
ADMIN_SESSION_TIMEOUT=1800000        # 30 minutes
ADMIN_RATE_LIMIT=20                  # 20 requests/minute
ADMIN_ENABLE_LOGGING=true
```

### Production Environment

```bash
# Cloud Run Secrets (Recommended)
ADMIN_EMAIL=huuhung20182019@gmail.com
ADMIN_SESSION_TIMEOUT=600000         # 10 minutes (stricter)
ADMIN_RATE_LIMIT=10                  # 10 requests/minute (stricter)
ADMIN_ENABLE_LOGGING=true
```

**Setting Cloud Run Secrets:**

```bash
# Create secrets
echo -n "huuhung20182019@gmail.com" | gcloud secrets create admin-email --data-file=-
echo -n "600000" | gcloud secrets create admin-session-timeout --data-file=-
echo -n "10" | gcloud secrets create admin-rate-limit --data-file=-

# Use in Cloud Run
gcloud run services update YOUR_SERVICE \
  --set-env-vars ADMIN_EMAIL=projects/PROJECT_ID/secrets/admin-email/versions/latest \
  --set-env-vars ADMIN_SESSION_TIMEOUT=projects/PROJECT_ID/secrets/admin-session-timeout/versions/latest \
  --set-env-vars ADMIN_RATE_LIMIT=projects/PROJECT_ID/secrets/admin-rate-limit/versions/latest
```

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" when accessing /admin

**Possible Causes:**
1. Not logged in
2. User role is not 'admin'
3. Session expired

**Solutions:**

```sql
-- Check user role
SELECT id, email, role FROM users WHERE email = 'YOUR_EMAIL';

-- Update role to admin
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';

-- Check if user is active
SELECT is_active FROM users WHERE email = 'YOUR_EMAIL';

-- Activate user
UPDATE users SET is_active = true WHERE email = 'YOUR_EMAIL';
```

### Issue: Rate Limit Exceeded

**Symptoms:**
- HTTP 429 errors
- Message: "Rate limit exceeded"

**Solutions:**

```sql
-- Clear rate limits for user
DELETE FROM admin_rate_limits WHERE user_id = 'YOUR_USER_ID';

-- Or wait for window to reset (1 minute)
```

**Adjust Rate Limit:**
```bash
# In .env.local
ADMIN_RATE_LIMIT=30  # Increase limit
```

### Issue: Session Keeps Expiring

**Symptoms:**
- Frequent logouts
- Redirect to login page

**Solutions:**

```bash
# Increase session timeout (in .env.local)
ADMIN_SESSION_TIMEOUT=1800000  # 30 minutes
```

### Issue: Setup Script Fails

**Common Errors:**

**Error: "Missing Supabase credentials"**
```bash
# Check .env.local has:
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Error: "User already exists"**
- Not an error! Script will update existing user
- Choose to reset password or elevate role

**Error: "Password validation failed"**
- Ensure password meets requirements:
  - 12+ characters
  - Uppercase, lowercase, number, special char

### Issue: Cannot Login After Setup

**Solutions:**

1. **Reset Password via App:**
   - Go to: `/auth/forgot-password`
   - Enter admin email
   - Follow password reset link

2. **Reset via Supabase Dashboard:**
   - Go to: Authentication > Users
   - Find admin user
   - Click "Send Password Reset"

3. **Recreate Account:**
   ```bash
   # Delete existing user
   DELETE FROM users WHERE email = 'YOUR_EMAIL';
   
   # Run setup again
   npm run setup-admin
   ```

---

## 👥 Managing Admin Accounts

### Creating Additional Admin Accounts

**Method 1: Via Setup Script**
```bash
# Change ADMIN_EMAIL in .env.local
ADMIN_EMAIL=another-admin@example.com

# Run setup
npm run setup-admin
```

**Method 2: Via SQL**
```sql
-- Elevate existing user to admin
UPDATE users 
SET 
  role = 'admin',
  plan = 'enterprise',
  token_quota = 999999
WHERE email = 'user@example.com';

-- Or create new admin
INSERT INTO users (email, name, role, plan, token_quota)
VALUES ('new-admin@example.com', 'Admin Name', 'admin', 'enterprise', 999999);
```

### Revoking Admin Access

```sql
-- Demote admin to parent
UPDATE users 
SET 
  role = 'parent',
  plan = 'free',
  token_quota = 500
WHERE email = 'former-admin@example.com';
```

### Viewing All Admins

```sql
SELECT 
  id, email, name, role, 
  last_active, created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;
```

### Monitoring Admin Activity

```sql
-- Recent admin activities
SELECT 
  u.email,
  aal.action,
  aal.details,
  aal.ip_address,
  aal.created_at
FROM admin_activity_logs aal
JOIN users u ON u.id = aal.user_id
ORDER BY aal.created_at DESC
LIMIT 100;

-- Admin activities by type
SELECT 
  action,
  COUNT(*) as count
FROM admin_activity_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY action
ORDER BY count DESC;
```

---

## 🔒 Security Best Practices

### 1. Password Management

✅ **DO:**
- Use a password manager
- Generate strong, unique passwords
- Change password every 90 days
- Use different passwords for dev/staging/production

❌ **DON'T:**
- Reuse passwords from other accounts
- Share admin credentials
- Store passwords in plain text
- Use predictable patterns

### 2. Access Control

✅ **DO:**
- Limit number of admin accounts (principle of least privilege)
- Use unique email for each admin
- Review admin list regularly
- Remove inactive admin accounts

❌ **DON'T:**
- Create shared admin accounts
- Use generic emails (admin@, test@)
- Keep ex-employee accounts active

### 3. Session Security

✅ **DO:**
- Set appropriate session timeout for your use case
- Log out when finished
- Use incognito/private mode for sensitive operations
- Clear browser cache regularly

❌ **DON'T:**
- Keep sessions open indefinitely
- Use admin account on public computers
- Save passwords in browser on shared devices

### 4. Monitoring

✅ **DO:**
- Review activity logs weekly
- Set up alerts for suspicious activities
- Monitor rate limit violations
- Track failed login attempts

❌ **DON'T:**
- Ignore security alerts
- Disable logging in production
- Ignore unusual activity patterns

### 5. Environment Security

✅ **DO:**
- Use Cloud Run Secrets for production
- Rotate secrets regularly
- Use different credentials per environment
- Keep .env.local out of Git

❌ **DON'T:**
- Commit secrets to Git
- Share .env files via email/chat
- Use production secrets in development
- Store secrets in plain text files

### 6. Audit Trail

✅ **DO:**
- Keep activity logs for at least 90 days
- Regular backup of logs
- Export logs for compliance
- Document all admin actions

❌ **DON'T:**
- Delete logs without backup
- Disable logging
- Ignore log warnings

---

## 📊 Maintenance Tasks

### Daily

- [ ] Review recent admin activities
- [ ] Check for rate limit violations
- [ ] Verify no unauthorized access attempts

### Weekly

- [ ] Export activity logs
- [ ] Review all admin accounts
- [ ] Check session timeout settings
- [ ] Verify rate limiting is working

### Monthly

- [ ] Cleanup old activity logs (keep 90 days)
- [ ] Review security settings
- [ ] Audit admin permissions
- [ ] Update passwords if needed

### Quarterly

- [ ] Full security audit
- [ ] Review and update security policies
- [ ] Test backup/restore procedures
- [ ] Update documentation

---

## 📞 Support

### Need Help?

1. **Check Logs:**
   ```sql
   SELECT * FROM admin_activity_logs 
   WHERE action LIKE '%error%'
   ORDER BY created_at DESC LIMIT 20;
   ```

2. **Verify Configuration:**
   ```bash
   # Check environment variables
   cat .env.local | grep ADMIN
   ```

3. **Reset Everything:**
   ```bash
   # Clear rate limits
   DELETE FROM admin_rate_limits;
   
   # Clear logs (optional)
   DELETE FROM admin_activity_logs WHERE created_at < NOW() - INTERVAL '7 days';
   
   # Re-run setup
   npm run setup-admin
   ```

---

## 📝 Changelog

### Version 1.0.0 (2025-10-13)

- ✅ Initial admin setup system
- ✅ Rate limiting implementation
- ✅ Activity logging
- ✅ Session management
- ✅ Interactive setup script
- ✅ Comprehensive documentation

---

## 🙏 Credits

Developed for AI Learning Platform - HocCungSongNhi
Security best practices based on OWASP guidelines

---

**Last Updated:** October 13, 2025
**Version:** 1.0.0

