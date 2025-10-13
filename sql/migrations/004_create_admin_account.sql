-- =============================================
-- MIGRATION 004: CREATE ADMIN ACCOUNT
-- =============================================
-- Purpose: Tạo tài khoản admin với security best practices
-- Date: 2025-10-13
-- Author: System
-- Note: Script này là idempotent (có thể chạy nhiều lần an toàn)
-- =============================================

-- Tạo bảng admin activity logs (nếu chưa có)
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_user_id ON admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- Tạo bảng admin rate limits (nếu chưa có)
CREATE TABLE IF NOT EXISTS admin_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Index cho performance
CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_user_id ON admin_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_window_start ON admin_rate_limits(window_start);

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (chỉ admin mới xem được)
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs" ON admin_activity_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- TẠO ADMIN ACCOUNT
-- =============================================

DO $$
DECLARE
  admin_email TEXT;
  admin_exists BOOLEAN;
  admin_user_id UUID;
BEGIN
  -- Lấy admin email từ biến môi trường (fallback to default)
  -- Trong production, set biến ADMIN_EMAIL trong Cloud Run Secrets
  admin_email := COALESCE(
    current_setting('app.admin_email', true),
    'huuhung20182019@gmail.com'
  );

  RAISE NOTICE 'Checking for admin account: %', admin_email;

  -- Kiểm tra xem email này đã tồn tại chưa
  SELECT EXISTS (
    SELECT 1 FROM users WHERE email = admin_email
  ) INTO admin_exists;

  IF admin_exists THEN
    -- Nếu user đã tồn tại, update role thành admin
    UPDATE users 
    SET 
      role = 'admin',
      plan = 'enterprise',
      token_quota = 999999,
      updated_at = NOW()
    WHERE email = admin_email
    RETURNING id INTO admin_user_id;
    
    RAISE NOTICE 'Existing user elevated to admin: %', admin_email;
    
  ELSE
    -- Tạo user mới với role admin
    -- LƯU Ý: User này cần được tạo trong Supabase Auth
    -- Sau khi chạy migration, chạy script setup-admin.ts để set password
    INSERT INTO users (
      id,
      email, 
      name, 
      role, 
      plan, 
      token_quota,
      token_used_today,
      is_active
    ) VALUES (
      gen_random_uuid(),
      admin_email,
      'System Administrator',
      'admin',
      'enterprise',
      999999,
      0,
      true
    )
    RETURNING id INTO admin_user_id;
    
    RAISE NOTICE 'New admin account created: %', admin_email;
  END IF;

  -- Log admin account creation
  INSERT INTO admin_activity_logs (
    user_id,
    action,
    details
  ) VALUES (
    admin_user_id,
    'admin_account_created',
    jsonb_build_object(
      'email', admin_email,
      'method', 'migration_004',
      'timestamp', NOW()
    )
  );

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Admin account setup completed!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Next step: Run setup-admin script to set password';
  RAISE NOTICE 'Command: npm run setup-admin';
  RAISE NOTICE '==============================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating admin account: %', SQLERRM;
    RAISE NOTICE 'You can create admin manually - see ADMIN_SETUP.md';
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify admin account
SELECT 
  id,
  email, 
  name, 
  role, 
  plan, 
  token_quota,
  is_active,
  created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- Show admin activity logs count
SELECT COUNT(*) as admin_logs_count 
FROM admin_activity_logs;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old activity logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE admin_activity_logs IS 'Logs all admin activities for audit trail';
COMMENT ON TABLE admin_rate_limits IS 'Tracks rate limits for admin endpoints';
COMMENT ON COLUMN admin_activity_logs.action IS 'Action type: login, payment_approve, user_ban, etc.';
COMMENT ON COLUMN admin_activity_logs.details IS 'JSON details of the action';
COMMENT ON FUNCTION cleanup_old_rate_limits() IS 'Run periodically to remove rate limit records older than 1 hour';
COMMENT ON FUNCTION cleanup_old_activity_logs() IS 'Run periodically to remove activity logs older than 90 days';

