-- Payment System Migration
-- Created: 2025-01-12
-- Description: Add payment system with packages, subscriptions, and payment requests

-- =============================================
-- 1. PACKAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) UNIQUE NOT NULL,           -- 'free', 'basic', 'premium', 'teacher'
  display_name VARCHAR(50) NOT NULL,          -- 'Gói Basic'
  price DECIMAL(10,2) NOT NULL,               -- 99000.00
  token_quota INTEGER NOT NULL,               -- 500
  max_students INTEGER DEFAULT 1,             -- Số học sinh tối đa
  features JSONB DEFAULT '[]',                -- ['chat', 'lessons', 'reports']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  package_id UUID REFERENCES packages(id) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,        -- NULL = lifetime
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  payment_request_id UUID,                    -- Link đến payment_request (optional)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. PAYMENT_REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  order_id VARCHAR(50) UNIQUE NOT NULL,       -- DH001234
  
  package_id UUID REFERENCES packages(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,              -- 99000.00
  
  user_phone VARCHAR(20) NOT NULL,            -- User nhập
  user_notes TEXT,                           -- User ghi chú (optional)
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  admin_notes TEXT,                          -- Admin ghi chú
  approved_by UUID REFERENCES users(id),     -- Admin ID
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

-- Packages indexes
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON packages(is_active);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_id ON subscriptions(package_id);

-- Payment requests indexes
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON payment_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Packages policies (public read)
CREATE POLICY "Packages are viewable by everyone" ON packages
  FOR SELECT USING (is_active = true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment requests policies
CREATE POLICY "Users can view their own payment requests" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 6. SEED DATA - PACKAGES
-- =============================================

INSERT INTO packages (name, display_name, price, token_quota, max_students, features, is_active) VALUES
('free', 'Miễn phí', 0.00, 50, 1, '["chat", "basic_lessons"]', true),
('basic', 'Gói Basic', 99000.00, 500, 1, '["chat", "all_lessons", "progress_report"]', true),
('premium', 'Gói Premium', 249000.00, 2000, 3, '["chat", "all_lessons", "detailed_reports", "priority_support"]', true),
('teacher', 'Gói Teacher', 499000.00, 999999, 30, '["chat", "all_lessons", "teacher_dashboard", "student_management", "analytics"]', true)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 7. FUNCTIONS
-- =============================================

-- Function: Generate Order ID
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    new_id := 'DH' || LPAD(
      FLOOR(RANDOM() * 1000000)::TEXT, 
      6, 
      '0'
    );
    done := NOT EXISTS(
      SELECT 1 FROM payment_requests WHERE order_id = new_id
    );
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Activate Subscription
CREATE OR REPLACE FUNCTION activate_subscription(
  p_user_id UUID,
  p_package_id UUID,
  p_payment_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  subscription_id UUID;
  package_info packages%ROWTYPE;
BEGIN
  -- Get package info
  SELECT * INTO package_info 
  FROM packages 
  WHERE id = p_package_id;
  
  -- Create subscription
  INSERT INTO subscriptions (
    user_id, 
    package_id, 
    payment_request_id,
    status,
    expires_at
  ) VALUES (
    p_user_id, 
    p_package_id, 
    p_payment_request_id,
    'active',
    NULL -- Lifetime for now
  ) RETURNING id INTO subscription_id;
  
  -- Update user token quota
  UPDATE users 
  SET 
    token_quota = package_info.token_quota,
    plan = package_info.name,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. COMMENTS
-- =============================================

COMMENT ON TABLE packages IS 'Available subscription packages';
COMMENT ON TABLE subscriptions IS 'User subscription history';
COMMENT ON TABLE payment_requests IS 'Pending payment requests awaiting approval';

COMMENT ON COLUMN packages.token_quota IS 'Daily token quota for this package';
COMMENT ON COLUMN packages.max_students IS 'Maximum number of students this package supports';
COMMENT ON COLUMN subscriptions.expires_at IS 'NULL means lifetime subscription';
COMMENT ON COLUMN payment_requests.order_id IS 'Unique order identifier format: DH000001';
COMMENT ON COLUMN payment_requests.user_phone IS 'Phone number provided by user for verification';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
