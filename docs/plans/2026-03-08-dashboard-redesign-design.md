# Dashboard Redesign Design

## Context
The app is currently a single-column blog (max-width 720px). Users navigate between separate pages for sessions, posts, ask AI, etc. The goal is to transform it into a 3-panel dashboard layout ("Notion meets premium conference app") where users can browse sessions, read AI summaries, and discuss — all without leaving the page.

## Constraints
- NO changes to database schema, Supabase logic, or API routes
- NO changes to authentication or role-based access
- Existing routes (`/session/[id]`, `/post/[id]`, `/ask`) must still work as direct links
- Tailwind CSS only — no external component libraries

## Layout

### Desktop (>= 1024px): 3-Panel Dashboard
```
┌────────────┬──────────────────────────────┬──────────────────────┐
│  Sidebar   │       Center Panel           │    Right Panel       │
│  ~240px    │       flex-1                 │    ~320px            │
│  fixed     │       scrollable             │    scrollable        │
└────────────┴──────────────────────────────┴──────────────────────┘
```

### Tablet (768-1023px): Collapsed sidebar + 2 panels
- Sidebar collapses to icon-only (~60px), expands on hover
- Center and Right panels share remaining space

### Mobile (< 768px): Single column + bottom tabs
- Bottom tab bar: Sessions | Summary | Posts | Chat
- Each tab shows one panel's content full-width
- Active session shown in header

## Panel Specifications

### Left Sidebar (`DashboardSidebar`)
- **Logo/brand** at top
- **Session list** grouped by collapsible day sections (Day 0-5)
  - Each session shows: title (truncated), activity dot if has posts, post count badge
  - Selected session highlighted with accent left-border
  - Social sessions (is_social=true) shown in italic
- **Divider**
- **Nav links**: Ask AI (opens drawer), Resources, Guide, About
- **Divider**
- **User section**: username, role badge, log out button

### Center Panel (`CenterPanel`)
When a session is selected:
1. **Session header**: title, day badge, time, faculty
2. **AI Intelligence Brief** (AISummaryCard) — loaded on demand, cached
   - If no summary yet: "Generate Summary" button (admin) or "No summary available" message
3. **Posts section**: scrollable list of posts for this session
   - Each post: category glow border, title, author, time, preview snippet
   - Clicking a post expands it inline (accordion) showing full body + post-level comments
   - Quick post bar at top of posts section
4. **Photos strip**: horizontal scrollable row of thumbnails (if photos exist)

When no session is selected:
- Welcome/overview state with programme stats and "select a session" prompt

### Right Panel (`RightPanel`)
- **Header**: "Session Discussion" with comment count
- **Quick post input** at top (for quick session-level posts)
- **Comment thread**: session-level comments with threading (reuses CommentItem)
- **New comment input** pinned at bottom

### Ask AI Drawer (`AskDrawer`)
- Triggered by clicking "Ask AI" in sidebar
- Slides in from right, overlays the Right Panel (~380px wide)
- Semi-transparent backdrop on center panel
- Contains the full AskInterface (chat bubbles, sources, input)
- Dismiss via X button or clicking backdrop

## Data Flow

### State Management
New client component `DashboardShell` manages:
```typescript
interface DashboardState {
  selectedSessionId: number | null;
  expandedPostId: number | null;
  askDrawerOpen: boolean;
  sidebarCollapsed: boolean;  // tablet
  mobileTab: "sessions" | "summary" | "posts" | "chat";
}
```

### Data Fetching
- **Sessions list**: Fetched once on mount via server component, passed as prop
- **Session detail + posts + comments**: Fetched client-side when a session is selected (`/api` calls or direct Supabase client)
- **AI Summary**: Fetched on demand via existing `/api/ai/session-summary` endpoint
- **Post expand**: Full post body already available from session posts query; post-level comments fetched on expand

### URL Sync
- Selecting a session updates URL to `/?session=ID` (shallow routing, no page reload)
- Direct navigation to `/session/[id]` renders the dashboard with that session pre-selected
- `/post/[id]` renders dashboard with parent session selected and post expanded
- `/ask` renders dashboard with Ask drawer open

## New Components

| Component | Type | Purpose |
|-----------|------|---------|
| `DashboardShell` | Client | Root layout managing 3-panel state |
| `DashboardSidebar` | Client | Left sidebar with session tree + nav |
| `CenterPanel` | Client | Session header + AI brief + posts |
| `RightPanel` | Client | Session comments thread |
| `AskDrawer` | Client | Slide-out AI chat overlay |
| `PostAccordion` | Client | Expandable post card in center panel |
| `MobileDashboard` | Client | Mobile tab-based single-column view |

## Modified Components

| Component | Changes |
|-----------|---------|
| `layout.tsx` | Replace NavBar + single column with DashboardShell (for authenticated users) |
| `NavBar` | Removed (replaced by sidebar) |
| `MobileTabBar` | Replaced by MobileDashboard bottom tabs |
| `AISummaryCard` | Reused as-is in center panel |
| `CommentItem` | Reused as-is in right panel |
| `QuickPostBar` | Reused in center panel posts section |
| `AskInterface` | Reused inside AskDrawer |
| `PhotoGallery` | Adapted to horizontal strip layout |

## Preserved Routes
- `/session/[id]` — Server component redirects to dashboard with `?session=ID`
- `/post/[id]` — Server component redirects to dashboard with `?session=SID&post=PID`
- `/ask` — Server component redirects to dashboard with `?ask=1`
- `/login`, `/signup` — Unchanged (no dashboard)
- `/resources`, `/about` — Accessible from sidebar, render in center panel

## Mobile Bottom Tabs
```
┌──────────┬──────────┬──────────┬──────────┐
│ Sessions │ Summary  │  Posts   │   Chat   │
│    📋    │    ✦     │    📝    │    💬    │
└──────────┴──────────┴──────────┴──────────┘
```
- **Sessions**: Full session list (current sidebar content)
- **Summary**: AI Intelligence Brief for selected session
- **Posts**: Posts feed for selected session
- **Chat**: Session comments + quick post

## Visual Design
- Same dark theme: `#0A0A0A` background
- Sidebar: `bg-dark-surface` (`#111111`) with `border-r border-[rgba(255,255,255,0.06)]`
- Panels separated by subtle 1px borders
- Glass-panel styling on cards within panels
- Violet/indigo accent for AI elements
- Emerald accent for active/live indicators
- Smooth transitions (200ms) for panel reveals, accordion expand, drawer slide
