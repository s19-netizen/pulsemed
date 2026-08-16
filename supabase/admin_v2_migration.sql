-- Admin v2: passages (context/scenario/stimulus) and their questions
create table if not exists admin_passages (
  id         uuid primary key default gen_random_uuid(),
  section    text not null,
  content    text not null,
  chart      jsonb,
  created_at timestamptz default now()
);

create table if not exists admin_qs (
  id            uuid primary key default gen_random_uuid(),
  passage_id    uuid references admin_passages(id) on delete cascade,
  section       text not null,
  q_type        text,
  subtype       text,
  difficulty    text,
  question_text text,
  options       jsonb,
  correct       text,
  explanations  jsonb,
  venn          jsonb,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);
