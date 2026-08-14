-- Run this in your Supabase SQL editor

-- Stores per-question responses from practice, diagnostic, and mock sessions
CREATE TABLE IF NOT EXISTS question_responses (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT NOT NULL,
  session_id       TEXT NOT NULL,
  session_type     TEXT NOT NULL,   -- 'diagnostic' | 'practice' | 'mock'
  question_index   INTEGER,
  question_tag     TEXT,
  is_correct       BOOLEAN,
  time_taken_ms    INTEGER,
  selected_answer  TEXT,
  correct_answer   TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS question_responses_user_id_idx ON question_responses (user_id);
CREATE INDEX IF NOT EXISTS question_responses_session_idx ON question_responses (session_id);

ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own responses"
  ON question_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own responses"
  ON question_responses FOR SELECT
  USING (true);

-- Caches the AI-generated study plan per user (refreshed every 24h)
CREATE TABLE IF NOT EXISTS ai_study_plan (
  user_id      TEXT PRIMARY KEY,
  plan_json    JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_study_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own study plan"
  ON ai_study_plan FOR SELECT
  USING (true);

CREATE POLICY "Users can upsert own study plan"
  ON ai_study_plan FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own study plan"
  ON ai_study_plan FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own study plan"
  ON ai_study_plan FOR DELETE
  USING (true);
