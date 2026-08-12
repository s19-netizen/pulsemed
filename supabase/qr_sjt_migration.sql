-- Run in Supabase SQL editor (schema only — data is in qr_sjt_data.sql)

-- ─── QR ──────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS qr_datasets (
  id           TEXT PRIMARY KEY,   -- QR-P01, S-P1, G-P1 …
  title        TEXT NOT NULL,
  figure_brief TEXT DEFAULT '',
  scenario     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qr_questions (
  id             TEXT PRIMARY KEY,  -- QR-P01-Q1, S-P1-Q1 …
  dataset_id     TEXT NOT NULL REFERENCES qr_datasets(id) ON DELETE CASCADE,
  difficulty     TEXT NOT NULL,     -- Bronze | Silver | Gold
  topic          TEXT DEFAULT '',
  question       TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT DEFAULT '',
  option_d       TEXT DEFAULT '',
  option_e       TEXT DEFAULT '',
  correct_answer TEXT NOT NULL,     -- e.g. "A. £70.00"
  walkthrough    TEXT DEFAULT '',
  skill_tested   TEXT DEFAULT '',
  time_sec       INTEGER DEFAULT 45
);

ALTER TABLE qr_datasets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read qr_datasets"  ON qr_datasets  FOR SELECT USING (true);
CREATE POLICY "Public read qr_questions" ON qr_questions FOR SELECT USING (true);

-- ─── SJT ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sjt_questions (
  id                 TEXT PRIMARY KEY,  -- SJT001, SJT002 …
  format             TEXT NOT NULL,     -- 'appropriateness' | 'importance' | 'most-least'
  scenario_num       INTEGER,
  scenario_title     TEXT DEFAULT '',
  scenario           TEXT NOT NULL,
  professional_theme TEXT DEFAULT '',
  theme_focus        TEXT DEFAULT '',
  difficulty         TEXT NOT NULL,     -- Bronze | Silver | Gold | Diamond
  question           TEXT NOT NULL,     -- action to rate (AR/IR) or standard prompt (ML)
  option_a           TEXT DEFAULT '',   -- ML only
  option_b           TEXT DEFAULT '',   -- ML only
  option_c           TEXT DEFAULT '',   -- ML only
  correct_answer     TEXT NOT NULL,
  walkthrough        TEXT DEFAULT ''
);

ALTER TABLE sjt_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sjt_questions" ON sjt_questions FOR SELECT USING (true);
