-- Cambridge AI Leadership Programme Blog - Database Schema v3
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Drop old tables
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists comments;
drop table if exists posts;
drop table if exists sessions;
drop table if exists profiles;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (linked to Supabase Auth)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  role text not null check (role in ('Admin', 'Attendee', 'Observer')),
  created_at timestamptz default now() not null
);

-- Sessions (programme agenda)
create table sessions (
  id bigint generated always as identity primary key,
  day_number int not null check (day_number between 0 and 5),
  title text not null,
  description text,
  faculty text,
  start_time time not null,
  end_time time not null,
  session_date date not null,
  location text,
  is_social boolean default false not null,
  created_at timestamptz default now() not null
);

-- Posts
create table posts (
  id bigint generated always as identity primary key,
  session_id bigint references sessions(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  category text not null check (category in ('Live Insight', 'Formal Notes', 'Key Takeaway', 'Reflection')),
  created_at timestamptz default now() not null
);

-- Comments (on a post OR a session, never both)
create table comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade,
  session_id bigint references sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null,
  constraint comment_target check (
    (post_id is not null and session_id is null) or
    (post_id is null and session_id is not null)
  )
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table sessions enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- Profiles
create policy "Profiles readable by authenticated"
  on profiles for select to authenticated using (true);

create policy "Users can insert own profile"
  on profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update to authenticated
  using (auth.uid() = id);

-- Sessions
create policy "Sessions readable by authenticated"
  on sessions for select to authenticated using (true);

create policy "Sessions readable by anon"
  on sessions for select to anon using (true);

-- Posts
create policy "Posts readable by authenticated"
  on posts for select to authenticated using (true);

create policy "Posts readable by anon"
  on posts for select to anon using (true);

create policy "Admin and Attendee can insert posts"
  on posts for insert to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('Admin', 'Attendee')
    )
  );

-- Comments
create policy "Comments readable by authenticated"
  on comments for select to authenticated using (true);

create policy "Comments readable by anon"
  on comments for select to anon using (true);

create policy "Authenticated can insert comments"
  on comments for insert to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sessions_day on sessions(day_number, start_time);
create index idx_posts_session on posts(session_id);
create index idx_posts_author on posts(author_id);
create index idx_posts_created on posts(created_at desc);
create index idx_comments_post on comments(post_id);
create index idx_comments_session on comments(session_id);

-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PRE-POPULATE SESSIONS
-- ============================================================

-- Day 0 — Sunday 1 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date, is_social)
values (0, 'Drinks Reception', null, '17:00', '17:30', '2026-03-01', true);

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (0, 'Programme Introduction and Classifier Game', 'Vess Popov & Prof. David Stillwell', '17:30', '19:00', '2026-03-01');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date, location, is_social)
values (0, 'Welcome Dinner', null, '19:00', '21:00', '2026-03-01', 'SSC Dining Room', true);

-- Day 1 — Monday 2 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (1, 'Machine Learning', 'Prof. David Stillwell', '09:00', '12:30', '2026-03-02');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (1, 'Basement to Boardrooms: Cloud Computing and AI Foundations', 'Praveen Bissonauth & Manjeet Garcha', '13:30', '15:00', '2026-03-02');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (1, 'Decentralised Machine Learning', 'Prof Amanda Prorok', '15:30', '17:00', '2026-03-02');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date, is_social)
values (1, 'Walking Tour finishing at The Eagle Pub', 'SeeCambridgeDifferently', '17:00', '18:30', '2026-03-02', true);

-- Day 2 — Tuesday 3 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (2, 'Generative AI', 'Prof. David Stillwell', '09:00', '12:30', '2026-03-03');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (2, 'Practical AI Workshop', 'Dr Mark Bloomfield', '13:30', '17:00', '2026-03-03');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (2, 'Professional Reflections', 'Vess Popov & Prof. David Stillwell', '17:00', '17:30', '2026-03-03');

-- Day 3 — Wednesday 4 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (3, 'Agentic AI', 'Michael Birdsall', '09:00', '12:30', '2026-03-04');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (3, 'Dawn Supercomputer Visit & Talks', null, '13:30', '17:00', '2026-03-04');

-- Day 4 — Thursday 5 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (4, 'Legal & Governance', 'Vess Popov', '09:00', '12:30', '2026-03-05');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (4, 'Cambridge Analytica', 'Prof. David Stillwell', '13:30', '14:30', '2026-03-05');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (4, 'Professional Reflections', 'Vess Popov & Prof. David Stillwell', '15:00', '15:30', '2026-03-05');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date, location)
values (4, 'Philosophy and AI', 'Dr Claire Benn', '17:00', '18:30', '2026-03-05', 'Downing College');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date, location, is_social)
values (4, 'Drinks Reception and Gala Dinner', null, '18:30', '21:30', '2026-03-05', 'Downing College', true);

-- Day 5 — Friday 6 March
insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (5, 'The Future Will Be Synthesised: Truth Trust and Transparency in the Generative Age', 'Henry Ajder', '09:00', '10:30', '2026-03-06');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (5, 'Imaging AI Futures (Part 1)', 'Prof. David Stillwell', '11:00', '12:30', '2026-03-06');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (5, 'Imagining AI Futures (Part 2)', 'Vess Popov', '13:30', '15:00', '2026-03-06');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (5, 'Week Wrap-up', 'Vess Popov & Prof. David Stillwell', '15:00', '16:00', '2026-03-06');

insert into sessions (day_number, title, faculty, start_time, end_time, session_date)
values (5, 'Module 2 Intro', 'Prof Shaz Ansari', '16:00', '16:30', '2026-03-06');
