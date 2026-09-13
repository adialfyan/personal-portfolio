# 02 — Architecture

## Overview

Serverless monolith: Next.js on Vercel for the frontend and backend, Supabase for the
database, authentication, and storage. No separate backend server, no VPS, no Docker
in production.

```text
Visitor
  |
  v
Next.js on Vercel
  |
  |-- Public pages
  |-- Admin dashboard
  |-- Server Actions / Route Handlers
  |
  v
Supabase
  |-- PostgreSQL
  |-- Authentication
  |-- Storage
  |-- Row Level Security
```

## Technology

| Concern | Choice |
|---|---|
| Frontend + backend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Database | Supabase PostgreSQL |
| Admin auth | Supabase Auth (email magic link) |
| Images | Supabase Storage |
| Validation | Zod |
| Contact form | Next.js Server Action |
| Protection | Supabase Row Level Security |
| Anti-spam | Honeypot + rate limit (Turnstile later) |

## Application Structure

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   ├── work/[slug]/
│   └── contact/
├── admin/
│   ├── login/
│   ├── page.tsx
│   ├── profile/
│   ├── projects/
│   ├── social-links/
│   ├── messages/
│   └── settings/
└── api/contact/

lib/
├── supabase/ (client.ts, server.ts, admin.ts)
├── validations/
└── queries/

components/
├── public/
├── admin/
└── ui/
```

## Environment Variables

- Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server-only: `SUPABASE_SERVICE_ROLE_KEY` (never prefixed with `NEXT_PUBLIC_`).
- `service_role` is used only on the server when strictly necessary.

## Rendering Strategy

| Content | Strategy |
|---|---|
| Home, About, project list | Static with revalidation |
| Project detail | Static/dynamic with revalidation |
| Admin dashboard | Dynamic, authenticated |
| Contact form | Server Action / Route Handler |

After admin edits, the app calls `revalidatePath()` so public content updates without a
manual rebuild.

## Contact Flow

```text
Form -> Server Action / Route Handler -> Zod validation -> Honeypot + rate limit
     -> Insert into contact_messages
```

- Input length limits on name, email, subject, and message.
- No raw HTML accepted.
- Never insert directly from the browser into Supabase.

## Storage

```text
portfolio-media/
├── profile/
└── projects/
```

- Public read for portfolio media.
- Admin-only upload/update/delete.
- Store storage paths in the database, never binary or base64.
- Restrict to JPEG, PNG, WebP, AVIF.
- Upload limit around 2–3 MB; resize/compress before or during upload.
- One cover image per project for the MVP; gallery is a later phase.

## Free-Tier Strategy

- Public pages are heavily cacheable.
- Supabase is called only when necessary.
- No always-on server.
- Images live in object storage.
- Admin dashboard is low-traffic.
- Contact form volume is low.

Verify current Vercel and Supabase free-tier quotas (database, storage, bandwidth,
image optimization, inactivity policy) before final deployment.
