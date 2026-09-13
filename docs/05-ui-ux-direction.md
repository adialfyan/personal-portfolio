# 05 — UI/UX Direction

## Concept

> **Editorial Tech** — inspired by Studio Freight, but not a clone.

A developer portfolio with an editorial/creative edge: oversized serif display,
technical mono metadata, asymmetric work grid, and an interactive dither portrait.

## Reference Composition

```text
40%  Linear / Vercel       — structure, hierarchy, minimalism
25%  Basement / Studio Freight — typography, editorial composition
20%  Resend               — developer aesthetic, technical details
15%  Active Theory / Lusion — atmospheric motion and dither
```

## Color Palette

```css
--background: #eee9df;   /* warm ivory */
--surface:    #e5dfd3;
--foreground: #171714;
--muted:      #77736a;
--border:     #aaa499;
--accent:     #ff4f00;   /* signal orange */
--dark:       #11110f;
```

Signal orange appears only on status, hover, focus, and select interactive elements.
One accent only.

## Typography

| Role | Font |
|---|---|
| Display | Instrument Serif |
| Body | Geist Sans |
| Utility/mono | Geist Mono |

```text
INSTRUMENT SERIF     — hero, section titles, large CTAs
GEIST SANS           — descriptions, case studies, forms
GEIST MONO           — nav, project numbers, years, status, stack
```

All fonts are free and loaded via `next/font`. Serif is used selectively so the site
keeps a "tech" feel.

## Layout System

- Desktop: 12 columns.
- Tablet: 8 columns.
- Mobile: 4 columns.
- Max content width ~1440px.
- Hairline horizontal borders divide sections.
- Generous spacing for a premium, minimal feel.

## Homepage Composition

### Header

```text
[YOUR NAME]                 WORK / ABOUT / CONTACT
INDEPENDENT DEVELOPER       LOCAL TIME 14:32
```

Sticky without a boxed navbar. Hairline border, mono name, local time detail.
Mobile uses a `MENU` button.

### Hero

Headline in Instrument Serif at large size, dither portrait overlapping the text.
Pointer reveals original color in a small radius. Mobile simplifies to headline,
intro, then full portrait.

### Selected Work

Asymmetric editorial grid (not a uniform card grid):

```text
01  PROJECT A  [landscape]
02  PROJECT B  [portrait]
03  PROJECT C  [wide]
```

Each item shows number, title, role, stack, and year. Mono for metadata, serif for
the title. No rounded cards or shadows.

### About Teaser

Two-column: small label left, large statement right. A dither texture or scan as a
small accent. No skill bars or moving logo walls.

### Contact Footer

Inverted to dark background with warm ivory text and a large serif CTA.

## Project Detail Page

```text
PROJECT NAME
Brief statement

ROLE / YEAR / STACK / LINKS

[LARGE HERO IMAGE]

01 / CONTEXT
02 / APPROACH
03 / OUTCOME

PREVIOUS / NEXT PROJECT
```

Large sharp imagery, readable case study width, technical metadata, dither used only
on cover or separators.

## Navigation & Micro-Detail

- Hairline borders and crop marks.
- Index numbers `01`, `02`, `03`.
- Static metadata like coordinates or location.
- Captions on imagery.
- Typographic arrow `↗`.

## UX Guardrails

- Navigation stays easy to find.
- No custom cursor replacing the native pointer.
- No hidden scrollbar.
- No intro/loading screen (or extremely short if used).
- Projects usable without hover.
- Main text stays HTML, not canvas.
- Keyboard-usable form and navigation.
- Animations reduced or disabled on weak devices.
- Respect `prefers-reduced-motion`.
- Touch targets at least 44px on mobile.
