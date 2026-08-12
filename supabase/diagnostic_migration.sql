-- Run this in your Supabase SQL editor to add diagnostic support

CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  vr_score    INTEGER NOT NULL DEFAULT 300,
  dm_score    INTEGER NOT NULL DEFAULT 300,
  qr_score    INTEGER NOT NULL DEFAULT 300,
  total_score INTEGER NOT NULL DEFAULT 900,
  sjt_band    INTEGER NOT NULL DEFAULT 4,
  subtype_scores  JSONB NOT NULL DEFAULT '{}',
  groq_analysis   TEXT,
  groq_study_plan TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diagnostic report"
  ON diagnostic_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic report"
  ON diagnostic_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic report"
  ON diagnostic_reports FOR UPDATE
  USING (auth.uid() = user_id);
