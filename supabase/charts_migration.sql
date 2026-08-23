-- Add chart jsonb column to tables that need rendered figures
ALTER TABLE dm_questions ADD COLUMN IF NOT EXISTS chart jsonb;
ALTER TABLE qr_datasets  ADD COLUMN IF NOT EXISTS chart jsonb;
