# 06 — Motion & Dither

## Scroll Strategy

```text
Native browser scroll
+ GSAP
+ ScrollTrigger
```

No Lenis in the MVP. Native scroll is lighter, more accessible, and works well on
mobile. Add smooth-scroll only if prototyping later shows it is truly needed.

### GSAP used for

- Clip/mask reveal of headlines.
- Short metadata stagger.
- Hero dither threshold.
- Project image reveal on viewport entry.
- Solid section color inversion (ivory to black).
- Very subtle image parallax.
- Thumbnail-to-detail transition.

### GSAP not used for

- Forcing scroll speed.
- Animating every element.
- Fade-up on every section.
- Custom scrollbar.
- Scroll-jacking.
- Decorative animations.
- Heavy mobile effects.

## Motion Language

```text
Reveal     : clip-path / overflow mask
Direction  : vertical or horizontal, decisive
Easing     : power3.out or expo.out
Duration   : 500–800ms
Stagger    : very short, 40–80ms
Parallax   : max ~3–5%
```

Example project reveal:

1. Divider line opens horizontally.
2. Image appears through a mask.
3. Number and metadata appear.
4. Title shifts slightly (not an exaggerated fade).
5. Dither shifts with scroll position for featured project only.

## Timing Budget

```text
Hover feedback      150–200ms
UI transitions      250–400ms
Section reveal      500–700ms
Page transition     600–900ms
```

## Signature Interactions

1. **Dither portrait** — ordered/Bayer dither portrait; pointer or scroll changes
   threshold subtly.
2. **Editorial project reveal** — asymmetric grid reveals through masking; hover turns
   dither into the original (or high-contrast monochrome).
3. **Section inversion** — ivory to black footer changes solidly, not via gradient.

## Dither Implementation

### Static dither

Images processed to dithered PNG/WebP before upload.

- Pros: very light, consistent, safe everywhere.
- Cons: not interactive; needs an admin transform step.

### CSS/Canvas dither

Original processed with `<canvas>` on demand.

- Pros: animatable, can reveal original on hover, lighter than complex shaders.
- Cons: watch mobile performance, provide reduced-motion fallback.

### WebGL shader dither

- Pros: most expressive, reacts to pointer/scroll/time.
- Cons: complex, risky performance, too heavy for MVP.

**MVP choice:** static dither for project cards + canvas dither only in the hero.
No WebGL yet.

## Anti-AI-Slop Rules

Explicitly avoid:

- Purple-blue gradients.
- Glow behind headlines.
- Blinking status dot.
- Floating orbs.
- Glass cards.
- Generic SaaS bento grids.
- Pills on every metadata item.
- Technology logo marquee.
- AI-landing background grids.
- Filler copy like "crafting digital experiences".
- Sparkle icons.
- Cursor blob.
- Uniform fade-up on every section.
- Rounded cards with soft shadows.

## Performance Rules

- Max one interactive canvas per viewport.
- Do not run dither canvas for all projects at once.
- Pause off-screen animations.
- Use transform and opacity; avoid expensive layout animations.
- Pause animations when the tab is inactive.
- Mobile uses lighter or static dither.
- `prefers-reduced-motion` disables parallax, stagger, and threshold animation.
- Content remains usable if JavaScript fails.
