-- Cambridge AI Leadership Programme Blog - Database Schema v2
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
--
-- If upgrading from v1, drop old tables first:
--   drop table if exists comments;
--   drop table if exists posts;

-- Profiles table (linked to Supabase Auth users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  role text not null check (role in ('Admin', 'Attendee', 'Observer')),
  created_at timestamptz default now() not null
);

-- Posts table
create table posts (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  category text not null check (category in ('Live Insight', 'Formal Notes', 'Key Takeaway', 'Reflection')),
  author_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Comments table
create table comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- Profiles policies
create policy "Profiles are publicly readable"
  on profiles for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Posts policies
create policy "Posts are publicly readable"
  on posts for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert posts"
  on posts for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Comments policies
create policy "Comments are publicly readable"
  on comments for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert comments"
  on comments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Indexes
create index idx_posts_created_at on posts(created_at desc);
create index idx_posts_author_id on posts(author_id);
create index idx_comments_post_id on comments(post_id);
create index idx_comments_user_id on comments(user_id);

-- Auto-create profile on signup via trigger
-- The role and username are passed via raw_user_meta_data during signup
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
