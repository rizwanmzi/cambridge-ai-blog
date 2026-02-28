-- Cambridge AI Leadership Programme Blog - Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Posts table
create table posts (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  category text not null check (category in ('Live Insight', 'Formal Notes', 'Key Takeaway', 'Reflection')),
  created_at timestamptz default now() not null
);

-- Comments table
create table comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  author_name text not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table posts enable row level security;
alter table comments enable row level security;

-- Posts: anyone can read, no direct inserts via client (handled by API with admin auth)
create policy "Posts are publicly readable"
  on posts for select
  to anon, authenticated
  using (true);

create policy "Posts can be inserted"
  on posts for insert
  to anon, authenticated
  with check (true);

-- Comments: anyone can read and insert
create policy "Comments are publicly readable"
  on comments for select
  to anon, authenticated
  using (true);

create policy "Anyone can comment"
  on comments for insert
  to anon, authenticated
  with check (true);

-- Indexes for performance
create index idx_posts_created_at on posts(created_at desc);
create index idx_comments_post_id on comments(post_id);
