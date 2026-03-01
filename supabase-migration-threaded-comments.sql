-- ============================================================
-- THREADED COMMENTS & LIKES MIGRATION
-- Run in Supabase SQL Editor
-- Safe to run on existing data (all new columns nullable/defaulted)
-- ============================================================

-- 1. Add parent_id to comments for threading
ALTER TABLE comments
  ADD COLUMN parent_id bigint REFERENCES comments(id) ON DELETE CASCADE;

-- 2. Add like_count denormalised counter
ALTER TABLE comments
  ADD COLUMN like_count integer NOT NULL DEFAULT 0;

-- 3. Index for efficient tree queries
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 4. Comment likes table
CREATE TABLE comment_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id bigint REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- 5. RLS for comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes readable by authenticated"
  ON comment_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own likes"
  ON comment_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON comment_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. Trigger function to keep like_count in sync
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_like_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();
