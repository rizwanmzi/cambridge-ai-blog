# Cambridge AI Leadership Programme — Live Learning Blog

A shared blog for the Cambridge AI Leadership Programme cohort to capture, discuss, and reflect on sessions in real time. Built with Next.js 14, Tailwind CSS, and Supabase.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Authentication → Settings**, disable email confirmations for instant signup.
3. Open the **SQL Editor** and paste the contents of `schema.sql`. Run it. This creates all tables, RLS policies, the auto-profile trigger, and pre-populates the full programme agenda.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase → Settings → API → anon/public key
- `ATTENDEE_CODE` — code you share with programme attendees
- `OBSERVER_CODE` — code you share with observers

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
| **Admin** | Hardcoded to `rizwan.mzi@gmail.com` | Post articles, comment |
| **Attendee** | Sign up with attendee access code | Post articles, comment |
| **Observer** | Sign up with observer access code | Comment only |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Programme agenda grouped by day, with post counts per session |
| `/session/[id]` | Session detail with posts and discussion thread |
| `/post/[id]` | Full article with comments |
| `/new-post` | Post editor with session selector (Admin/Attendee only) |
| `/about` | About the programme and author |
| `/login` | Sign in |
| `/signup` | Create account with access code |

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth)
- **React Markdown** (post rendering)
