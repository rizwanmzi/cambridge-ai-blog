-- RLS policies for edit/delete of posts and comments
-- Run this in the Supabase SQL editor

-- Posts: UPDATE policy for authenticated users (own posts)
create policy "users can update own posts"
  on posts for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Posts: DELETE policy for authenticated users (own posts)
create policy "users can delete own posts"
  on posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- Comments: UPDATE policy for authenticated users (own comments)
create policy "users can update own comments"
  on comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comments: DELETE policy for authenticated users (own comments)
create policy "users can delete own comments"
  on comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Note: Admin override is handled in the API routes using the service role client,
-- which bypasses RLS entirely.
