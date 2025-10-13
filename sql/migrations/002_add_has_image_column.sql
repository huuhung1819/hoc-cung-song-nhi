-- Migration: Add has_image column to token_logs table
-- Date: 2025-01-11
-- Description: Track if a chat message included an image

-- Add has_image column to token_logs table if not exists
ALTER TABLE token_logs 
ADD COLUMN IF NOT EXISTS has_image BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN token_logs.has_image IS 'Whether the message included an image';


