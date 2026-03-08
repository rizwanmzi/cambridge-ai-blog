# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the single-column blog into a 3-panel dashboard layout with left sidebar, center panel (AI summary + posts), and right panel (comments), plus mobile bottom-tab navigation and an Ask AI slide-out drawer.

**Architecture:** New client component `DashboardShell` manages panel state (selected session, expanded post, drawer, mobile tab). All data fetching happens client-side via existing API routes and direct Supabase browser client calls. The root `layout.tsx` conditionally renders the dashboard for authenticated users. Existing page routes (`/session/[id]`, `/post/[id]`, `/ask`) become thin redirects to `/?session=ID` etc.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Supabase (browser client via `@supabase/ssr`), TypeScript

---

## Task 1: Add CSS Utilities for Dashboard Layout

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add dashboard layout utilities**

Add these classes after the existing utility classes in globals.css:

```css
/* Dashboard layout */
.dashboard-sidebar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.06) transparent;
}
.dashboard-sidebar::-webkit-scrollbar { width: 4px; }
.dashboard-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }

.drawer-backdrop {
  animation: fadeIn 200ms ease-out;
}
.drawer-panel {
  animation: slideInRight 200ms ease-out;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Sidebar day group */
.day-group-toggle:hover { background: rgba(255,255,255,0.04); }
.session-item { transition: all 150ms ease; }
.session-item:hover { background: rgba(255,255,255,0.04); }
.session-item.active { background: rgba(255,255,255,0.06); border-left: 2px solid rgb(52,211,153); }

/* Post accordion */
.accordion-content {
  overflow: hidden;
  transition: max-height 300ms ease, opacity 200ms ease;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add dashboard layout CSS utilities"
```

---

## Task 2: Create Dashboard Types

**Files:**
- Create: `src/lib/dashboard-types.ts`

**Step 1: Create shared type definitions**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/dashboard-types.ts
git commit -m "feat: add dashboard shared type definitions"
```

---

## Task 3: Create DashboardSidebar Component

**Files:**
- Create: `src/components/dashboard/DashboardSidebar.tsx`

**Step 1: Implement the sidebar**

This component renders:
- Logo/brand at top
- Session list grouped by collapsible day sections (Day 0-5)
- Each session: truncated title, post count badge, active highlight
- Divider + nav links (Ask AI, Resources, Guide, About)
- Divider + user section (username, role badge, log out)

Key props:
```typescript
interface DashboardSidebarProps {
  sessions: SessionListItem[];
  selectedSessionId: number | null;
  onSelectSession: (id: number) => void;
  onOpenAsk: () => void;
  collapsed: boolean;
}
```

Implementation details:
- Group sessions by `day_number` using a reduce
- Each day group is collapsible with a chevron toggle
- Day labels: `{ 0: "Pre-Arrival", 1: "Day 1", 2: "Day 2", 3: "Day 3", 4: "Day 4", 5: "Day 5" }`
- Selected session has emerald left border (`session-item active` class)
- Social sessions (`is_social`) shown with a subtle social icon
- Post count badge: small pill showing number if > 0
- Nav links use `next/link` for Resources, About; button for Ask AI and Guide
- User section uses `useAuth()` for profile info and signOut
- Guide link opens `GuideModal` (import from existing component)
- Width: `w-60` on desktop, `w-[60px]` when collapsed (tablet), hidden on mobile
- On collapsed state: show only icons, expand on hover

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles (component not yet used in tree)

**Step 3: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat: add DashboardSidebar with session tree and nav"
```

---

## Task 4: Create PostAccordion Component

**Files:**
- Create: `src/components/dashboard/PostAccordion.tsx`

**Step 1: Implement expandable post card**

This component renders a post as a compact card that expands inline to show the full body + post-level comments.

Props:
```typescript
interface PostAccordionProps {
  post: PostListItem;
  isExpanded: boolean;
  onToggle: () => void;
}
```

Implementation:
- Collapsed state: category glow left-border, title, author, time, preview snippet (first 120 chars of body)
- Expanded state: full markdown body (using `ReactMarkdown` + `remarkGfm`), post-level comments loaded on expand
- Comments fetched client-side: `fetch('/api/comments?post_id=${post.id}')` — but actually the existing flow fetches comments via Supabase. For the accordion, fetch comments from Supabase browser client:
  ```typescript
  const supabase = createSupabaseBrowser();
  const { data } = await supabase.from("comments").select("*, profiles(username, role)").eq("post_id", post.id).order("created_at");
  ```
- Then fetch user's liked comment IDs similarly to existing pattern
- Render comments using existing `CommentSection` component (from `src/app/post/[id]/CommentSection.tsx`)
- Category border colors and glow: reuse the same maps from session page
- Smooth expand/collapse with `accordion-content` CSS class + `max-height` trick or conditional render with animation

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/components/dashboard/PostAccordion.tsx
git commit -m "feat: add PostAccordion expandable post card"
```

---

## Task 5: Create CenterPanel Component

**Files:**
- Create: `src/components/dashboard/CenterPanel.tsx`

**Step 1: Implement the center panel**

This component is the main content area showing the selected session's content.

Props:
```typescript
interface CenterPanelProps {
  selectedSessionId: number | null;
  expandedPostId: number | null;
  onExpandPost: (id: number | null) => void;
}
```

**When no session is selected** (welcome state):
- Centered layout with programme title, subtitle
- Total sessions count, total posts count (passed as props or fetched)
- "Select a session from the sidebar" prompt

**When a session is selected**, renders vertically:
1. **Session header**: title, day badge, time range, faculty, description
2. **AI Intelligence Brief** section:
   - Fetches summary via existing `/api/ai/session-summary` POST endpoint
   - Uses `AISummaryCard` component (from `src/components/AISummaryCard.tsx`)
   - Loading state with shimmer skeleton
   - Admin gets "Generate Summary" button if no summary exists
   - Cache summary in component state so switching back doesn't re-fetch
3. **Posts section**:
   - "Posts" header with count
   - `QuickPostBar` component at top (reused from `src/components/QuickPostBar.tsx`)
   - List of `PostAccordion` components for each post
   - Posts fetched client-side from Supabase browser client
4. **Photos strip** (if photos exist):
   - Horizontal scrollable row of thumbnails
   - Fetched client-side from Supabase `session_photos` table

Data fetching pattern:
```typescript
useEffect(() => {
  if (!selectedSessionId) return;
  // Fetch session detail, posts, photos in parallel
  const supabase = createSupabaseBrowser();
  Promise.all([
    supabase.from("sessions").select("*").eq("id", selectedSessionId).single(),
    supabase.from("posts").select("*, profiles(username, role)").eq("session_id", selectedSessionId).order("created_at", { ascending: false }),
    supabase.from("session_photos").select("*").eq("session_id", selectedSessionId).order("created_at", { ascending: false }),
  ]).then(([sessionRes, postsRes, photosRes]) => {
    // set state
  });
}, [selectedSessionId]);
```

For AI Summary:
```typescript
async function fetchSummary() {
  const res = await fetch("/api/ai/session-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: selectedSessionId }),
  });
  const data = await res.json();
  // data.summary is the SummaryContent object
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/components/dashboard/CenterPanel.tsx
git commit -m "feat: add CenterPanel with AI summary, posts, and photos"
```

---

## Task 6: Create RightPanel Component

**Files:**
- Create: `src/components/dashboard/RightPanel.tsx`

**Step 1: Implement the right panel**

This component shows session-level comments and a comment input.

Props:
```typescript
interface RightPanelProps {
  selectedSessionId: number | null;
}
```

Implementation:
- Header: "Session Discussion" with comment count
- Comment thread: reuse the `SessionComments` component logic but adapted for the panel
  - Fetch comments client-side from Supabase browser client:
    ```typescript
    supabase.from("comments").select("*, profiles(username, role)").eq("session_id", id).order("created_at")
    ```
  - Also fetch user's liked comment IDs
  - Pass to `CommentItem` tree (built via `buildCommentTree`)
- Comment input pinned at bottom
- When no session selected: "Select a session to view discussion"
- Scrollable area between header and input
- Re-fetch comments when `selectedSessionId` changes

Since `SessionComments` already has all the logic for rendering, liking, replying, deleting comments, we can largely extract its internals or simply instantiate it with fetched data. The simplest approach: fetch comments in `RightPanel`, pass as `initialComments` to `SessionComments`.

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/components/dashboard/RightPanel.tsx
git commit -m "feat: add RightPanel with session comments thread"
```

---

## Task 7: Create AskDrawer Component

**Files:**
- Create: `src/components/dashboard/AskDrawer.tsx`

**Step 1: Implement the slide-out drawer**

Props:
```typescript
interface AskDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

Implementation:
- When `open` is true, render:
  1. Semi-transparent backdrop (`drawer-backdrop` class) covering the viewport
  2. Panel sliding in from right (`drawer-panel` class), width ~380px
  3. Header with "Ask the Programme" title and X close button
  4. Body: `AskInterface` component (from `src/app/ask/AskInterface.tsx`)
- Clicking backdrop calls `onClose`
- Panel uses `fixed inset-y-0 right-0 z-50`
- Desktop: overlays the right panel
- Mobile: full-width overlay

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/components/dashboard/AskDrawer.tsx
git commit -m "feat: add AskDrawer slide-out AI chat overlay"
```

---

## Task 8: Create DashboardShell Component

**Files:**
- Create: `src/components/dashboard/DashboardShell.tsx`

**Step 1: Implement the root dashboard component**

This is the main orchestrator that composes all panels.

Props:
```typescript
interface DashboardShellProps {
  sessions: SessionListItem[];
  initialSessionId?: number | null;
  initialPostId?: number | null;
  initialAskOpen?: boolean;
}
```

Implementation:
- Manages `DashboardState` via `useState`
- Reads initial values from URL search params (`?session=ID&post=PID&ask=1`) on mount
- Updates URL via `window.history.replaceState` when state changes (shallow routing, no reload)
- Desktop layout (>= 1024px):
  ```
  <div className="flex h-screen overflow-hidden">
    <DashboardSidebar ... />
    <div className="flex-1 overflow-y-auto">
      <CenterPanel ... />
    </div>
    <div className="w-80 border-l border-[rgba(255,255,255,0.06)] overflow-y-auto">
      <RightPanel ... />
    </div>
    <AskDrawer ... />
  </div>
  ```
- Tablet (768-1023px): sidebar collapsed, same 2 panels
- Mobile (< 768px): single column with bottom tabs (handled via CSS `hidden`/`block` + media queries and state)

Mobile bottom tabs:
```
<div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-bg border-t border-dark-border">
  <div className="flex items-center justify-around h-14">
    {/* Sessions | Summary | Posts | Chat tabs */}
  </div>
</div>
```

Each mobile tab shows the corresponding panel content:
- Sessions: `DashboardSidebar` content (full session list, no sidebar shell)
- Summary: AI summary portion of `CenterPanel`
- Posts: Posts portion of `CenterPanel`
- Chat: `RightPanel` (comments)

Responsive breakpoint detection: use CSS classes (`hidden lg:flex`, `lg:hidden`) rather than JS media queries where possible. For the mobile tab content switching, use state-based rendering.

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/components/dashboard/DashboardShell.tsx
git commit -m "feat: add DashboardShell root component with 3-panel layout"
```

---

## Task 9: Modify Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Update layout to use DashboardShell**

The root layout currently renders NavBar + children + MobileTabBar. Change it to:
- For authenticated users: render `DashboardShell` (which replaces NavBar and MobileTabBar)
- For unauthenticated users: render children only (login/signup/landing pages)

Since `layout.tsx` is a server component and can't use auth hooks, we need a client wrapper. Create a minimal client component that checks auth and conditionally renders dashboard vs children.

Create: `src/components/dashboard/DashboardLayout.tsx`

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardShell from "./DashboardShell";
import type { SessionListItem } from "@/lib/dashboard-types";

export default function DashboardLayout({
  sessions,
  children,
}: {
  sessions: SessionListItem[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-dark-bg" />; // blank loading
  }

  if (!user) {
    return <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10">{children}</main>;
  }

  return <DashboardShell sessions={sessions} />;
}
```

Then update `layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { createSupabaseServer } from "@/lib/supabase-server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Cambridge AI Leadership Programme — Cohort 2",
  description: "Insights, reflections, and key takeaways from the Cambridge AI Leadership Programme.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch sessions server-side for the sidebar
  const supabase = createSupabaseServer();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("day_number")
    .order("start_time");

  const { data: postCounts } = await supabase
    .from("posts")
    .select("session_id");

  const countMap: Record<number, number> = {};
  if (postCounts) {
    for (const p of postCounts) {
      countMap[p.session_id] = (countMap[p.session_id] || 0) + 1;
    }
  }

  const sessionList = (sessions || []).map((s) => ({
    ...s,
    post_count: countMap[s.id] || 0,
  }));

  return (
    <html lang="en">
      <body className="bg-dark-bg text-txt-primary min-h-screen">
        <AuthProvider>
          <DashboardLayout sessions={sessionList}>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
```

Note: Remove NavBar and MobileTabBar imports — they're replaced by the sidebar and mobile tabs in DashboardShell.

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles with all routes

**Step 3: Commit**

```bash
git add src/app/layout.tsx src/components/dashboard/DashboardLayout.tsx
git commit -m "feat: integrate DashboardShell into root layout"
```

---

## Task 10: Update Home Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Simplify home page**

Since the dashboard now handles session display for authenticated users, the home page becomes minimal:
- Unauthenticated: still renders `LandingPage` (but this is now handled by DashboardLayout showing children)
- Authenticated: renders nothing visible (DashboardShell takes over the viewport)

Update `page.tsx` to just render the LandingPage for unauthenticated users:

```typescript
import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return <LandingPage />;
}
```

The DashboardLayout component already handles the auth check and shows DashboardShell for logged-in users, so the page content (LandingPage) only renders when unauthenticated.

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: simplify home page (dashboard handles authenticated view)"
```

---

## Task 11: Add Route Redirects for Backward Compatibility

**Files:**
- Modify: `src/app/session/[id]/page.tsx`
- Modify: `src/app/post/[id]/page.tsx`
- Modify: `src/app/ask/page.tsx`

**Step 1: Session page redirect**

The session detail page should redirect to the dashboard with the session pre-selected:

```typescript
import { redirect } from "next/navigation";

export default function SessionPage({ params }: { params: { id: string } }) {
  redirect(`/?session=${params.id}`);
}
```

**Step 2: Post page redirect**

The post detail page needs to find the parent session, then redirect:

```typescript
import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";

export const revalidate = 0;

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: post } = await supabase
    .from("posts")
    .select("session_id")
    .eq("id", params.id)
    .single();

  if (!post) notFound();
  redirect(`/?session=${post.session_id}&post=${params.id}`);
}
```

**Step 3: Ask page redirect**

```typescript
import { redirect } from "next/navigation";

export default function AskPage() {
  redirect("/?ask=1");
}
```

**Step 4: Handle URL params in DashboardShell**

Update `DashboardShell` to read URL params on mount:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session");
  const postId = params.get("post");
  const ask = params.get("ask");

  if (sessionId) setSelectedSessionId(Number(sessionId));
  if (postId) setExpandedPostId(Number(postId));
  if (ask === "1") setAskDrawerOpen(true);
}, []);
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Compiles, all routes generate

**Step 6: Commit**

```bash
git add src/app/session/[id]/page.tsx src/app/post/[id]/page.tsx src/app/ask/page.tsx
git commit -m "feat: add route redirects for backward compatibility"
```

---

## Task 12: Final Integration and Cleanup

**Files:**
- Various cleanup

**Step 1: Remove unused imports**

Check that old `NavBar` and `MobileTabBar` are no longer imported anywhere. If so, they can remain as files but won't be in the render tree. Don't delete them yet — they serve as reference.

**Step 2: Test all routes manually**

- `/` — should show dashboard for authenticated, landing for unauthenticated
- `/?session=1` — should show session 1 selected in sidebar + center panel
- `/?session=1&post=5` — should show session 1 with post 5 expanded
- `/?ask=1` — should show Ask drawer open
- `/session/1` — should redirect to `/?session=1`
- `/post/1` — should redirect to `/?session=X&post=1`
- `/ask` — should redirect to `/?ask=1`
- `/login`, `/signup` — should work unchanged

**Step 3: Verify production build**

Run: `npm run build`
Expected: Zero errors, all routes compile

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete dashboard redesign - 3-panel layout with sidebar, AI summary, comments, and Ask drawer"
```

---

## Implementation Order Summary

| # | Component | Depends On |
|---|-----------|------------|
| 1 | CSS utilities | — |
| 2 | Dashboard types | — |
| 3 | DashboardSidebar | types |
| 4 | PostAccordion | types |
| 5 | CenterPanel | types, PostAccordion, AISummaryCard, QuickPostBar |
| 6 | RightPanel | types, SessionComments/CommentItem |
| 7 | AskDrawer | AskInterface |
| 8 | DashboardShell | Sidebar, CenterPanel, RightPanel, AskDrawer |
| 9 | Layout integration | DashboardShell, DashboardLayout |
| 10 | Home page simplify | Layout integration |
| 11 | Route redirects | DashboardShell (URL param reading) |
| 12 | Final integration | All above |

Tasks 1-2 can run in parallel. Tasks 3, 4, 6, 7 can run in parallel (they don't depend on each other). Task 5 depends on 4. Task 8 depends on 3, 5, 6, 7. Tasks 9-12 are sequential.
