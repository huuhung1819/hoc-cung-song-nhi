-- Migration: Add grade field to users table
-- File: sql/migrations/004_add_grade_to_users.sql

-- Add grade column to users table
ALTER TABLE users 
ADD COLUMN grade VARCHAR(10) DEFAULT 'Lớp 1';  -- Changed from 'Lớp 5' to 'Lớp 1'

-- Add comment for clarity
COMMENT ON COLUMN users.grade IS 'Lớp học của học sinh (Lớp 1, Lớp 2, ..., Lớp 12)';

-- Update existing users to have default grade
UPDATE users 
SET grade = 'Lớp 1'  -- Changed from 'Lớp 5' to 'Lớp 1'
WHERE grade IS NULL;

-- Make grade NOT NULL after setting defaults
ALTER TABLE users 
ALTER COLUMN grade SET NOT NULL;
