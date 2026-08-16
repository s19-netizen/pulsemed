-- Admin: question edits/overrides
create table if not exists admin_edits (
  question_id   text primary key,
  mock_id       text,
  section       text,
  question_text text,
  options       jsonb,
  correct_index integer,
  explanation   text,
  context       text,
  presentation  text default 'text',
  updated_at    timestamptz default now()
);

-- Admin: new mock tests
create table if not exists admin_mocks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  sections   jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
