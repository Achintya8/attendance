-- Add fcm_token column to teachers table for Firebase Cloud Messaging
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
