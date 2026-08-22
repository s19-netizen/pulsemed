-- Tutors: sign in with email + password (no Google)
create table if not exists tutors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- Students: assigned by a tutor, sign in with username + password
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  name          text not null,
  tutor_id      uuid references tutors(id) on delete set null,
  exam_date     date,
  created_at    timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists students_tutor_idx on students(tutor_id);
create index if not exists students_username_idx on students(username);
