# 07 — MVP Roadmap

## Phase 1 — Foundation

- Scaffold Next.js with TypeScript.
- Set up Supabase project.
- Configure development and production environments.
- Create database schema and status enums.
- Enable Row Level Security.
- Create media buckets.
- Connect repository to Vercel.

## Phase 2 — Public MVP

- Homepage.
- About page.
- Project detail by slug.
- Social links.
- SEO metadata, Open Graph, sitemap, robots.
- Responsive layout.

At this stage data is already read from Supabase, even before the dashboard is ready.

## Phase 3 — Authentication & Admin

- Admin login via Supabase Auth.
- Protect `/admin` routes.
- Profile CRUD.
- Project CRUD.
- Manage technologies and project links.
- Cover image upload.
- Publish/unpublish projects.
- Revalidation after content changes.

## Phase 4 — Contact

- Email and social links.
- Contact form.
- Server-side validation.
- Message storage.
- Simple inbox in admin.
- unread/read/archive/spam statuses.
- Honeypot and rate limiting.

## Phase 5 — Hardening & Deployment

- Verify all RLS policies.
- Validate file uploads.
- Error handling and loading states.
- Mobile testing.
- Basic accessibility.
- SEO metadata audit.
- Production deployment to Vercel.
- Custom domain (if available).

## Post-MVP

- Per-project gallery.
- Experience and education sections.
- Blog.
- Testimonials.
- Draft preview.
- Email notifications.
- Cloudflare Turnstile.
- Analytics.
- Indonesian/English multilingual.
- Grid/index view switcher.
- Advanced page transitions.
- WebGL dither experiments.

## MVP Constraints

- Three featured projects on the homepage.
- One cover image + up to six gallery images per project.
- Case studies written in Markdown.
- Single admin at launch.
- Signal orange accent, not editable per project.
- No multilingual, page builder, or drag-and-drop in MVP.
