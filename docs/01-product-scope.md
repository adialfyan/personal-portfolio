# 01 — Product Scope

## Positioning

- **Primary identity:** Full-stack developer.
- **Audience:** Combined (recruiters first, then freelance clients and creative studios).
- **Language:** English for the public site and admin dashboard.

The site reads as a developer portfolio with an editorial/creative edge. Credibility
comes from strong case studies and outcomes, not from long technology lists.

## Goals

1. Communicate who the owner is and what they do within seconds.
2. Prove capability through three strong, well-documented projects.
3. Provide a clear path to contact.
4. Stay fast, accessible, and maintainable on free-tier hosting.

## Sitemap (MVP)

```text
/
├── /work/[slug]
├── /about
├── /contact
└── /admin
```

A standalone `/work` index is deferred until more projects exist. The homepage is the
showcase for the three featured projects.

## Homepage Structure

```text
01  Navigation
02  Hero + dither portrait
03  Selected work
04  About statement
05  Capabilities
06  Contact CTA
07  Footer
```

### Hero

Answers three questions fast:

- Who is this person?
- What do they do?
- Where is the proof?

Example structure (copy finalized later in the dashboard):

```text
[NAME / PORTFOLIO 2026]

FULL-STACK
DEVELOPER

I design and build web products
from interface to infrastructure.

Based in Indonesia
Available for selected work

[VIEW SELECTED WORK]  [CONTACT]
```

No badges, status pulse, gradients, or technology logo walls.

### Selected Work

Three projects at deliberately different scales:

```text
01  Featured project  — large landscape, 7–8 columns
02  Second project    — portrait, 4–5 columns
03  Third project     — wide editorial image
```

Each preview includes title, one-line outcome, role, year, and selected stack.

## Case Study Structure

Each project follows a consistent format:

```text
01 / Overview
02 / Problem
03 / Role
04 / Approach
05 / Technical Decisions
06 / Result
07 / Reflection
```

## About Page

```text
Short personal statement
Current focus
Capabilities
Selected stack
Experience / education
Availability
CV link
```

Capabilities (descriptive, no percentages):

```text
Product Development
Frontend Engineering
Backend Systems
Database Design
Interface Implementation
Deployment & Maintenance
```

## Content Boundaries

- Hardcoded in app: UI labels, navigation, section titles, case study structure,
  typography, layout, animations, dither behavior.
- Managed in dashboard: personal identity, portrait, bio, availability, projects,
  case studies, project media, technologies, social links, resume, contact CTA,
  basic SEO.

## Copy Principles

- Short and direct.
- Not overly formal.
- No AI-generated filler such as "crafting innovative digital experiences".
- Focus on real contribution and decisions.
