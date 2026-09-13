# 04 — Content Model

All personal content is entered manually through the admin dashboard. Only UI labels
remain hardcoded.

## Global Profile

```text
Full Name
Professional Title
Short Introduction
Long Biography
Location
Timezone
Availability Status
Availability Text
Email
Resume URL
Portrait
```

Example `Professional Title`:

```text
Full-stack Developer
```

## Social Links

```text
Platform
Label
URL
Display Order
Visible / Hidden
```

Initial platforms:

```text
GitHub
LinkedIn
Instagram
X
Email
```

## Project Editor

```text
Project Title
Slug
One-line Summary
Project Type
Role
Client
Year
Duration
Status
Featured
Display Order
Cover Image
Live URL
Repository URL
```

Case study content:

```text
Overview
Problem
Approach
Technical Decisions
Outcome
Reflection
```

Project attachments:

```text
Technologies
Gallery Images
Image Captions
```

## Site Settings

```text
Website Title
SEO Description
Default Open Graph Image
Contact CTA
Footer Text
Accent Color
```

Accent color may be a setting, but layout and fonts are not editable to keep the
design consistent.

## Dashboard Structure

```text
/admin
├── Overview
├── Profile
├── Projects
│   ├── All Projects
│   └── New Project
├── Social Links
├── Messages
└── Site Settings
```

The dashboard is utilitarian: no dither, GSAP, or heavy art direction. Its job is
content management.

## Project Workflow

```text
Create draft -> Fill project info -> Upload media -> Preview -> Publish
             -> Revalidate public pages
```

Dashboard features:

- `Save Draft`
- `Preview`
- `Publish`
- Delete confirmation
- Unique slug validation
- Cover image preview
- Ordering of the three featured projects
- Clear success/error messaging

## Hardcoded vs Managed

**Hardcoded in the app**

- `Selected Work`, `About`, `Contact`, `Previous Project`, `Next Project`
- Navigation and form labels
- Case study structure
- Typography and layout
- Animation and dither behavior

**Managed in the dashboard**

- Personal identity, portrait, bio, availability
- Projects and case studies
- Project media and technologies
- Social links and resume
- Contact CTA and basic SEO

## Case Study Editor

- Markdown editor with preview (not a rich-text page builder).
- One cover image and up to six gallery images per project.

## MVP Content Decisions

- Public site and admin dashboard in English.
- Featured projects selected via `is_featured` + `sort_order`.
- Accent stays signal orange; not editable per project.
- Dither applied automatically to portrait and covers.
- No multilingual system in MVP.
- No drag-and-drop page builder.
- No font/layout settings in dashboard.
