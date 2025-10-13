-- Migration: Add phone column to users table
-- Date: 2025-01-11
-- Description: Add phone column to support phone number login

-- Add phone column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comment
COMMENT ON COLUMN users.phone IS 'User phone number for login (optional)';


