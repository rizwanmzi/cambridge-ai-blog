-- AI Summaries table for caching Claude-generated summaries
create table ai_summaries (
  id bigint generated always as identity primary key,
  session_id bigint references sessions(id) on delete cascade,
  day_number int check (day_number between 0 and 5),
  scope text not null check (scope in ('session','day','programme')),
  content jsonb not null,
  generated_at timestamptz default now(),
  is_stale boolean default true,
  constraint scope_check check (
    (scope='session' and session_id is not null and day_number is null) or
    (scope='day' and day_number is not null and session_id is null) or
    (scope='programme' and session_id is null and day_number is null)
  )
);

create unique index on ai_summaries(session_id) where scope='session';
create unique index on ai_summaries(day_number) where scope='day';
create unique index on ai_summaries((1)) where scope='programme';
create index on ai_summaries(scope);

alter table ai_summaries enable row level security;
create policy "readable by auth" on ai_summaries for select to authenticated using (true);
