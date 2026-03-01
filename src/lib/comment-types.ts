export interface Comment {
  id: number;
  post_id: number | null;
  session_id: number | null;
  user_id: string;
  parent_id: number | null;
  body: string;
  like_count: number;
  created_at: string;
  profiles: { username: string; role: string };
  user_has_liked: boolean;
}

export interface CommentNode extends Comment {
  replies: CommentNode[];
}
