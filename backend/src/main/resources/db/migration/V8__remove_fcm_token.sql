-- Remove fcm_token column since push notifications are not implemented
ALTER TABLE teachers DROP COLUMN IF EXISTS fcm_token;
