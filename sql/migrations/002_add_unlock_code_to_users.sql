-- Migration: Add unlock_code to users table
-- Date: 2025-10-12
-- Description: Add unlock_code field to store user's solve mode unlock code

-- Add unlock_code column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS unlock_code VARCHAR(50);

-- Add unlock_quota and unlocks_used columns for tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS unlock_quota INTEGER DEFAULT 10;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS unlocks_used INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN users.unlock_code IS 'Mã unlock để sử dụng chế độ Solve (được mã hóa)';
COMMENT ON COLUMN users.unlock_quota IS 'Số lần unlock tối đa mỗi ngày';
COMMENT ON COLUMN users.unlocks_used IS 'Số lần unlock đã sử dụng hôm nay';

