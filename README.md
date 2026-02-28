# Cambridge AI Leadership Programme — Live Learning Blog

A clean, minimal blog for sharing insights and reflections from the Cambridge AI Leadership Programme. Built with Next.js 14, Tailwind CSS, and Supabase.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Authentication → Settings**, make sure email confirmations are disabled (for instant signup) or configure your email provider.
3. Open the **SQL Editor** in your Supabase dashboard.
4. If upgrading from v1, run: `drop table if exists comments; drop table if exists posts;`
5. Paste the contents of `schema.sql` and run it. This creates the `profiles`, `posts`, and `comments` tables along with RLS policies and the auto-profile trigger.

### 2. Configure environment variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your values:
   - `NEXT_PUBLIC_SUPABASE_URL` — found in Supabase → Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — found in Supabase → Settings → API → anon/public key
   - `ATTENDEE_CODE` — access code you share with programme attendees
   - `OBSERVER_CODE` — access code you share with observers

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication & Roles

All pages require login except `/login` and `/signup`.

| Role | How to get it | Permissions |
|------|--------------|-------------|
| **Admin** | Hardcoded to `rizwan.mzi@gmail.com` | Full access — post articles and comment |
| **Attendee** | Sign up with the attendee access code | Post articles and comment |
| **Observer** | Sign up with the observer access code | Comment only |

Usernames and role badges are displayed on all posts and comments.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — all posts in reverse chronological order |
| `/post/[id]` | Individual post with comments |
| `/new-post` | Post editor (Admin and Attendee only) |
| `/about` | About the author and programme |
| `/login` | Sign in |
| `/signup` | Create account with access code |

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repo in Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth)
- **React Markdown** (post rendering)
