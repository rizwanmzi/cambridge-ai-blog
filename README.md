# Cambridge AI Leadership Programme — Live Learning Blog

A clean, minimal blog for sharing insights and reflections from the Cambridge AI Leadership Programme. Built with Next.js 14, Tailwind CSS, and Supabase.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `schema.sql` and run it. This creates the `posts` and `comments` tables with the necessary policies.

### 2. Configure environment variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your values:
   - `NEXT_PUBLIC_SUPABASE_URL` — found in Supabase → Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — found in Supabase → Settings → API → anon/public key
   - `ADMIN_PASSWORD` — choose a strong password for the admin page

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — all posts in reverse chronological order |
| `/post/[id]` | Individual post with comments |
| `/admin` | Password-protected post editor (link in footer) |
| `/about` | About the author and programme |

## Posting

1. Click the **Admin** link in the footer.
2. Enter the admin password.
3. Fill in the title, choose a category, write your post in Markdown, and hit **Publish**.
4. Works on mobile — post from your phone during sessions.

## Categories

- **Live Insight** — quick observations during sessions
- **Formal Notes** — structured summaries of concepts
- **Key Takeaway** — ideas that stick
- **Reflection** — personal reflections on leadership

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repo in Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL database)
- **React Markdown** (post rendering)
