-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS vr_passages (
  code         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  passage_text TEXT NOT NULL,
  word_count   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vr_questions (
  id                 TEXT PRIMARY KEY,
  passage_code       TEXT NOT NULL REFERENCES vr_passages(code) ON DELETE CASCADE,
  format             TEXT NOT NULL,        -- 'TFCT' | 'MCQ'
  difficulty         TEXT NOT NULL,        -- 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  primary_subtype    TEXT,
  skill_focus        TEXT,
  question           TEXT NOT NULL,
  option_a           TEXT NOT NULL,
  option_b           TEXT NOT NULL,
  option_c           TEXT DEFAULT '',
  option_d           TEXT DEFAULT '',
  correct_answer     TEXT NOT NULL,        -- e.g. "A — True" or "B"
  supporting_evidence TEXT DEFAULT '',
  explanation        TEXT DEFAULT ''
);

-- RLS: public read (questions are not user-specific)
ALTER TABLE vr_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vr_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read vr_passages" ON vr_passages FOR SELECT USING (true);
CREATE POLICY "Public read vr_questions" ON vr_questions FOR SELECT USING (true);
