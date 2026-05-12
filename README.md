# Signal Layer Builders

A lightweight builder directory for the Signal Layer ecosystem.

Signal Layer Builders is for people building practical AI systems, operational workflows, orchestration layers, infrastructure, observability tooling, automation, and scalable systems. The first MVP is intentionally small: profiles, projects, links, skills, interests, and availability signals.

## Philosophy

The moat is not resumes. The useful signal comes from demonstrated thinking, contribution, technical discussion, collaborative reputation, operational maturity, systems reasoning, and real-world building.

This MVP starts with the simplest useful foundation. It is not LinkedIn, a job board, a recruiter product, or a social network.

## Stack

- Next.js app router
- TypeScript
- Tailwind CSS
- Supabase auth and database
- Vercel-ready deployment

## Included In The MVP

- Landing page at `/`
- Builder directory at `/builders`
- Public builder profiles at `/builders/[slug]`
- Authenticated profile editor at `/profile/edit`
- Basic Supabase email-link auth
- Skills, interests, languages, location, timezone, and availability fields
- GitHub, LinkedIn, portfolio, and project links
- Profile status: `pending`, `approved`, `hidden`
- Supabase SQL schema and row-level security policies
- Clearly marked local demo data when Supabase env vars are not configured

## Intentionally Not Included Yet

- Recruiter features
- Payments
- Endorsements
- Messaging
- Feeds
- Comments
- Likes
- Rankings
- Discord integration
- GitHub activity sync
- AI matching
- Recommendation engine
- Advanced reputation graph

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Enable email auth in Supabase Auth.
3. Add your local and production URLs to the Supabase auth redirect allow list.
4. Run the SQL in `supabase/migrations/001_builder_directory.sql`.
5. Add the Supabase URL and anon key to `.env.local`.

Profiles are saved with `status = 'pending'` by default. To make a profile public, manually set `status = 'approved'` in Supabase.

## Database Schema

The schema contains:

- `profiles`
- `projects`

The required fields from the MVP brief are included. Array fields use `text[]` for `languages`, `skills`, `interests`, and project `tags`.

Row-level security is enabled. Public users can only read approved profiles and their projects. Authenticated users can insert and update their own pending profile and manage projects attached to their own profile.

For admin moderation, use the Supabase dashboard or add a separate admin role/policy later.

## Deployment Notes For Vercel

1. Import the GitHub repository into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.
3. Add the deployed Vercel URL to Supabase Auth redirect URLs.
4. Deploy.

No secrets should be committed. The anon key is expected to be public, but it should still come from environment variables.

## Development Checks

```bash
npm run typecheck
npm run build
```

Use `npm run lint` once dependencies are installed.
