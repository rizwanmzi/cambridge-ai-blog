export interface SessionListItem {
  id: number;
  title: string;
  day_number: number;
  start_time: string;
  end_time: string;
  faculty: string | null;
  description: string | null;
  location: string | null;
  session_date: string | null;
  is_social: boolean;
  post_count: number;
}

export interface DashboardState {
  selectedSessionId: number | null;
  expandedPostId: number | null;
  askDrawerOpen: boolean;
  sidebarCollapsed: boolean;
  mobileTab: "sessions" | "summary" | "posts" | "chat";
}

export interface PostListItem {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  author_id: string;
  session_id: number;
  profiles: { username: string; role: string } | null;
}

export interface SessionDetail {
  id: number;
  title: string;
  day_number: number;
  start_time: string;
  end_time: string;
  faculty: string | null;
  description: string | null;
  location: string | null;
  is_social: boolean;
}
