# Personal Portfolio

A personal portfolio built with Next.js and Supabase, designed with an editorial-tech
art direction inspired by Studio Freight and deployed on the free tiers of Vercel and
Supabase.

## Overview

- **Public website** — English, editorial-tech, dither signature, asymmetric project grid.
- **Admin dashboard** — manage profile, social links, projects, case studies, and contact messages.
- **Stack** — Next.js, TypeScript, Tailwind CSS, Supabase, GSAP ScrollTrigger.

## Documentation

| File | Contents |
|---|---|
| [docs/01-product-scope.md](docs/01-product-scope.md) | Positioning, sitemap, homepage structure |
| [docs/02-architecture.md](docs/02-architecture.md) | System architecture, rendering, security |
| [docs/03-database-erd.md](docs/03-database-erd.md) | Schema, ERD, Row Level Security |
| [docs/04-content-model.md](docs/04-content-model.md) | Dashboard fields and content workflow |
| [docs/05-ui-ux-direction.md](docs/05-ui-ux-direction.md) | Art direction, typography, layout |
| [docs/06-motion-dither.md](docs/06-motion-dither.md) | Motion spec and dither behavior |
| [docs/07-mvp-roadmap.md](docs/07-mvp-roadmap.md) | Implementation phases and scope |

## Quickstart (Phase 1 — Foundation)

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Database: run `supabase/schema.sql` in the Supabase SQL Editor, then create a
public `portfolio-media` bucket with `profile/*` and `projects/*` paths.
Add your auth user id to `admin_users` to unlock the dashboard (Phase 3).

## Design Principles

- Editorial-tech art direction, not SaaS-generic.
- Warm ivory, signal orange, Instrument Serif + Geist Sans + Geist Mono.
- Native scroll with selective GSAP ScrollTrigger.
- Interactive dither portrait as the signature interaction.
- No AI-slop: no gradients, pulse dots, glass cards, floating orbs, or generic bento grids.
