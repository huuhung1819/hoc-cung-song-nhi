-- Migration: Add notification settings columns to users table
-- File: 005_add_notification_settings.sql

-- Add notification settings columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS lesson_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS progress_reports BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotions BOOLEAN DEFAULT false;

-- Add avatar column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';

-- Update existing users with default values
UPDATE users 
SET 
  email_updates = true,
  lesson_reminders = true,
  progress_reports = false,
  promotions = false,
  avatar = ''
WHERE email_updates IS NULL;

-- Add comments
COMMENT ON COLUMN users.email_updates IS 'User wants to receive email updates';
COMMENT ON COLUMN users.lesson_reminders IS 'User wants lesson reminders';
COMMENT ON COLUMN users.progress_reports IS 'User wants progress reports';
COMMENT ON COLUMN users.promotions IS 'User wants promotion notifications';
COMMENT ON COLUMN users.avatar IS 'User avatar image URL';
