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
- GitHub OAuth through Supabase Auth
- Minimal admin review page at `/admin/profiles`
- Pending profile review UX with a local preview
- Basic profile validation before save
- Project showcase on public builder profiles
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

## Early Tester Flow

1. Log in with GitHub or an email magic link.
2. Create a builder profile at `/profile/edit`.
3. The profile is saved as pending while it is reviewed.
4. Once approved, the profile appears in `/builders`.

Projects help builders show practical work in context. They are intentionally simple: name, description, URL, and tags. The directory cards stay lightweight and only show a small project count.

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
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
```

`SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` are only needed for the admin profile review page. Keep the service role key server-side only. Do not prefix it with `NEXT_PUBLIC_`.

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Enable email auth in Supabase Auth.
3. Configure the Supabase auth URLs listed below.
4. Run the SQL in `supabase/migrations/001_builder_directory.sql`.
5. Add the Supabase URL and anon key to `.env.local`.

Profiles are saved with `status = 'pending'` by default. To make a profile public, manually set `status = 'approved'` in Supabase.

### GitHub OAuth

The profile auth flow supports both email links and GitHub OAuth. GitHub is only used for sign-in. The app does not sync repositories, contribution activity, rankings, or graphs.

In Supabase, go to Authentication -> Providers -> GitHub:

1. Enable GitHub.
2. Add the GitHub OAuth client ID and client secret from your GitHub OAuth app.
3. Use the Supabase callback URL shown in the GitHub provider settings as the Authorization callback URL in GitHub.
4. Confirm the Supabase Site URL and redirect allow list below include the production domain and local development ports.

When a user signs in with GitHub, the app redirects back to `/profile/edit`. If Supabase provides a simple GitHub username in user metadata, the editor may prefill the GitHub URL. It does not write GitHub activity data.

### Supabase Auth URLs

In Supabase, go to Authentication -> URL Configuration.

Set Site URL to:

```text
https://signal-layer-website.vercel.app
```

Add this production redirect URL:

```text
https://signal-layer-website.vercel.app/**
```

Add local redirect URLs for the ports you use during development:

```text
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3002/**
http://localhost:3003/**
http://localhost:3004/**
http://localhost:3005/**
```

The app sends Supabase email links back to the current browser origin plus `/profile/edit`. In production that should resolve to:

```text
https://signal-layer-website.vercel.app/profile/edit
```

If confirmation emails still point to an older domain, update the Supabase Site URL and redirect allow list, then send a new email link. Existing email links keep the redirect URL they were generated with.

### Admin Approval Flow

The admin review page lives at `/admin/profiles`.

Set these server-side environment variables locally and in Vercel:

```bash
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

Admins must sign in with one of the emails in `ADMIN_EMAILS`. The browser sends the Supabase access token to the admin API, the server verifies the user email, and only the server uses the Supabase service role key to read and update pending profiles.

Pending profiles can be approved or hidden. Approved profiles appear publicly in `/builders`. Hidden profiles stay out of the public directory.

## Database Schema

The schema contains:

- `profiles`
- `projects`

The required fields from the MVP brief are included. Array fields use `text[]` for `languages`, `skills`, `interests`, and project `tags`.

Row-level security is enabled. Public users can only read approved profiles and their projects. Authenticated users can insert and update their own pending profile and manage projects attached to their own profile.

Admin moderation is intentionally small. Use `/admin/profiles` for pending profile review, or use the Supabase dashboard directly for exceptional cases.

## Deployment Notes For Vercel

1. Import the GitHub repository into Vercel.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.
3. Set `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` in Vercel if you want `/admin/profiles`.
4. Confirm the Supabase Auth Site URL is `https://signal-layer-website.vercel.app`.
5. Add `https://signal-layer-website.vercel.app/**` to Supabase Auth redirect URLs.
6. Configure the GitHub provider in Supabase if you want GitHub login.
7. Deploy.

No secrets should be committed. The anon key is expected to be public, but it should still come from environment variables.

## Development Checks

```bash
npm run typecheck
npm run lint
npm run build
```
