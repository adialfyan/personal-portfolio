"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectCard } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";

interface GlideCarouselProps {
  projects: ProjectCard[];
}

// 8x8 Bayer Ordered Dither Matrix for pristine retro-editorial dither dissolve
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Draws an authentic 1-bit Bayer dither ramp onto an offscreen canvas texture once.
 * Zero CPU overhead during scrolling; pure hardware texture compositing.
 */
function renderDitherRamp(
  canvas: HTMLCanvasElement,
  side: "left" | "right",
  width: number,
  height: number,
  dotSize = 2
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";

  const cols = Math.ceil(width / dotSize);
  const rows = Math.ceil(height / dotSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * dotSize;
      const y = r * dotSize;

      // Distance from the outer edge towards carousel center (0 = outer solid white, 1 = transparent)
      const distFromOuter = side === "left" ? x / width : (width - x) / width;
      // Gentle power curve for natural dissolving
      const threshold = Math.pow(Math.max(0, 1 - distFromOuter), 1.32);
      const bayerVal = BAYER_8X8[r % 8][c % 8] / 64;

      if (threshold > bayerVal) {
        ctx.fillRect(x, y, dotSize, dotSize);
      }
    }
  }
}

export function GlideCarousel({ projects }: GlideCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftDitherRef = useRef<HTMLCanvasElement | null>(null);
  const rightDitherRef = useRef<HTMLCanvasElement | null>(null);

  const [containerWidth, setContainerWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);

  // Motion physics refs (100% outside React state for 120 FPS performance)
  const scrollXRef = useRef(0);
  const targetScrollXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollStartX: 0 });
  const lastMoveRef = useRef({ x: 0, time: 0, vx: 0 });
  const hasDraggedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Custom Cursor Refs (Zero React re-render cursor tracking)
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorTextRef = useRef<HTMLSpanElement | null>(null);
  const cursorArrowRef = useRef<HTMLSpanElement | null>(null);
  const targetMouseRef = useRef({ x: -200, y: -200, visible: false, mode: "drag" });
  const currentMouseRef = useRef({ x: -200, y: -200 });

  // Physical geometry based on viewport
  const W = isMobile ? 270 : 400; // Base card width
  const G = isMobile ? 18 : 34; // Exact constant physical gap
  const activeScale = isMobile ? 1.15 : 1.34; // Prominent center magnification
  const scaleRadius = isMobile ? 380 : 680; // Radius where scaling applies
  const K = activeScale - 1;
  const spacing = W + G;
  const Vrad = Math.max(0.001, scaleRadius / spacing);

  // Clones configuration for endless seamless looping
  const COPIES = 11; // Odd number so middle copy is centered
  const middleCopy = Math.floor(COPIES / 2);
  const centerGlobalIndex = middleCopy * projects.length;
  const totalVirtualItems = COPIES * projects.length;

  // Flattened virtual cards
  const virtualCards = useMemo(() => {
    const list: Array<{
      globalIndex: number;
      originalIndex: number;
      project: ProjectCard;
    }> = [];
    for (let c = 0; c < COPIES; c++) {
      projects.forEach((proj, idx) => {
        list.push({
          globalIndex: c * projects.length + idx,
          originalIndex: idx,
          project: proj,
        });
      });
    }
    return list;
  }, [projects, COPIES]);

  // Modulo helper supporting negative numbers
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // Scale function
  const getScale = useCallback(
    (v: number) => {
      const absV = Math.abs(v);
      if (absV <= Vrad) return 1 + K * (1 - absV / Vrad);
      return 1;
    },
    [K, Vrad]
  );

  // Integral of scale function guaranteeing constant physical gaps
  const getIntegral = useCallback(
    (v: number) => {
      const absV = Math.abs(v);
      let integral = 0;
      if (absV <= Vrad) {
        integral = absV + K * absV - (K * absV * absV) / (2 * Vrad);
      } else {
        const I_Vrad = Vrad + (K * Vrad) / 2;
        integral = I_Vrad + (absV - Vrad);
      }
      return v < 0 ? -integral : integral;
    },
    [K, Vrad]
  );

  // Card element references for direct transform updates
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const innerImgRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Render static Dither Edge curtains on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const mobile = window.innerWidth < 768;
        setContainerWidth(width);
        setIsMobile(mobile);

        const ditherWidth = mobile ? 60 : 120;
        if (leftDitherRef.current) {
          renderDitherRamp(leftDitherRef.current, "left", ditherWidth, height, 2);
        }
        if (rightDitherRef.current) {
          renderDitherRamp(rightDitherRef.current, "right", ditherWidth, height, 2);
        }
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Animation Loop: 60-120fps direct hardware compositor rendering with delta time
  useEffect(() => {
    let animId: number;
    let isRunning = true;
    lastTimeRef.current = performance.now();

    const render = (time: number) => {
      if (!isRunning) return;

      // Delta time normalization (frame-rate independent physics)
      const dt = Math.min(0.064, Math.max(0.001, (time - lastTimeRef.current) / 1000));
      lastTimeRef.current = time;

      // Active drag: 1:1 tight tracking (no mushiness). Release: velvety smooth glide
      if (isDraggingRef.current) {
        const dragLambda = 44; // High responsiveness to pointer
        const lerpFactor = 1 - Math.exp(-dragLambda * dt);
        scrollXRef.current += (targetScrollXRef.current - scrollXRef.current) * lerpFactor;
      } else {
        const glideLambda = 8.2; // Silky deceleration
        const lerpFactor = 1 - Math.exp(-glideLambda * dt);
        const diff = targetScrollXRef.current - scrollXRef.current;
        if (Math.abs(diff) < 0.25) {
          scrollXRef.current = targetScrollXRef.current;
        } else {
          scrollXRef.current += diff * lerpFactor;
        }
      }

      const currentScrollX = scrollXRef.current;
      const scrollIndex = currentScrollX / spacing;
      const halfWidth = containerWidth / 2;
      const M = totalVirtualItems;

      let closestDist = Infinity;
      let closestIdx = 0;

      // Only iterate and transform cards within active viewing window (prevents calculating 44 cards every frame)
      const centerVirtual = centerGlobalIndex + scrollIndex;
      const minWindow = Math.floor(centerVirtual - 3.5);
      const maxWindow = Math.ceil(centerVirtual + 3.5);

      virtualCards.forEach((vc) => {
        const el = cardRefs.current.get(vc.globalIndex);
        if (!el) return;

        // Fast cull outside viewing window
        const isCandidate = vc.globalIndex >= minWindow && vc.globalIndex <= maxWindow;
        if (!isCandidate) {
          if (el.style.display !== "none") {
            el.style.display = "none";
          }
          return;
        }

        // Virtual position relative to center
        const v_raw = vc.globalIndex - centerGlobalIndex - scrollIndex;
        const v = mod(v_raw + M / 2, M) - M / 2;

        const scale = getScale(v);
        // Exact physical screen x position relative to center
        const x = v * G + W * getIntegral(v);

        // Active index detection
        const distFromCenter = Math.abs(x);
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestIdx = vc.originalIndex;
        }

        // Viewport culling (only render visible cards + safety buffer)
        const visibleMargin = (W * activeScale) / 2 + 160;
        const isVisible =
          x + visibleMargin >= -halfWidth && x - visibleMargin <= halfWidth;

        if (!isVisible) {
          if (el.style.display !== "none") el.style.display = "none";
          return;
        }

        if (el.style.display !== "block") el.style.display = "block";
        const screenX = halfWidth + x;

        // Apply hardware-accelerated 3D transform & depth scaling
        el.style.transform = `translate3d(${screenX}px, -50%, 0) translate3d(-50%, 0, 0) scale(${scale})`;
        el.style.zIndex = Math.round(scale * 100).toString();

        // Native compositor opacity blending (Zero expensive CSS filter pass for 120 FPS)
        const absV = Math.abs(v);
        const opacity = Math.max(
          0.42,
          1 - Math.pow(Math.min(1, absV / 1.15), 1.6) * 0.58
        );
        el.style.opacity = opacity.toString();

        // Parallax effect on image inside card
        const imgEl = innerImgRefs.current.get(vc.globalIndex);
        if (imgEl) {
          const normX = Math.max(-1, Math.min(1, x / halfWidth));
          const parallaxOffset = normX * -26; // Subtle optical shift
          imgEl.style.transform = `scale(1.16) translate3d(${parallaxOffset}px, 0, 0)`;
        }
      });

      // Update active index ONLY when changed to avoid React re-render flood
      if (closestIdx !== activeIndexRef.current) {
        activeIndexRef.current = closestIdx;
        setActiveIndex(closestIdx);
      }

      // Smooth Lerp for Custom Mouse Follower Cursor (Zero React state overhead)
      if (cursorRef.current) {
        const mouseLerp = 1 - Math.exp(-22 * dt);
        currentMouseRef.current.x +=
          (targetMouseRef.current.x - currentMouseRef.current.x) * mouseLerp;
        currentMouseRef.current.y +=
          (targetMouseRef.current.y - currentMouseRef.current.y) * mouseLerp;

        const isVisible = targetMouseRef.current.visible;
        cursorRef.current.style.opacity = isVisible ? "1" : "0";
        cursorRef.current.style.transform = `translate3d(${currentMouseRef.current.x}px, ${currentMouseRef.current.y}px, 0) translate3d(-50%, -50%, 0) scale(${
          isDraggingRef.current ? 0.92 : 1
        })`;

        if (cursorTextRef.current) {
          cursorTextRef.current.textContent = isDraggingRef.current
            ? "Sliding"
            : targetMouseRef.current.mode === "view"
            ? "View"
            : "Drag";
        }
        if (cursorArrowRef.current) {
          cursorArrowRef.current.textContent =
            targetMouseRef.current.mode === "view" ? "↗" : "↔";
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [
    containerWidth,
    spacing,
    W,
    G,
    activeScale,
    getScale,
    getIntegral,
    totalVirtualItems,
    centerGlobalIndex,
    virtualCards,
  ]);

  // Pointer interactions (Drag, Flick & Magnetic Snapping)
  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      scrollStartX: targetScrollXRef.current,
    };
    lastMoveRef.current = {
      x: e.clientX,
      time: performance.now(),
      vx: 0,
    };
    targetMouseRef.current.mode = "drag";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Direct ref update: ZERO React re-renders while moving mouse
    targetMouseRef.current.x = e.clientX;
    targetMouseRef.current.y = e.clientY;
    targetMouseRef.current.visible = true;

    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveRef.current.time);
    const dx = e.clientX - lastMoveRef.current.x;

    lastMoveRef.current = {
      x: e.clientX,
      time: now,
      vx: dx / dt,
    };

    const deltaX = dragStartRef.current.x - e.clientX;
    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }
    // 1:1 Direct responsive tracking while dragging
    targetScrollXRef.current = dragStartRef.current.scrollStartX + deltaX;
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const now = performance.now();
    const idleTime = now - lastMoveRef.current.time;
    // If pointer was held stationary (>65ms) before releasing, momentum is 0
    const vx = idleTime > 65 ? 0 : lastMoveRef.current.vx;

    let projectedTarget = targetScrollXRef.current;
    if (Math.abs(vx) > 0.18) {
      // Natural flick momentum toss
      projectedTarget += -vx * 190;
    }
    const nearestIndex = Math.round(projectedTarget / spacing);
    targetScrollXRef.current = nearestIndex * spacing;
  };

  // Wheel horizontal scrolling with smooth snap
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onWheel = (e: React.WheelEvent) => {
    const delta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.shiftKey
        ? e.deltaY
        : 0;

    if (Math.abs(delta) > 0.5) {
      targetScrollXRef.current += delta * 0.85;

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        const nearestIndex = Math.round(targetScrollXRef.current / spacing);
        targetScrollXRef.current = nearestIndex * spacing;
      }, 160);
    }
  };

  // Step button handlers
  const glideStep = (direction: -1 | 1) => {
    const currentIndex = Math.round(targetScrollXRef.current / spacing);
    targetScrollXRef.current = (currentIndex + direction) * spacing;
  };

  // Jump to specific project index
  const jumpToIndex = (targetOrigIdx: number) => {
    const currentScrollIndex = targetScrollXRef.current / spacing;
    const currentOrigIdx = mod(Math.round(currentScrollIndex), projects.length);
    let diff = targetOrigIdx - currentOrigIdx;
    if (diff > projects.length / 2) diff -= projects.length;
    if (diff < -projects.length / 2) diff += projects.length;
    const targetIdx = Math.round(currentScrollIndex) + diff;
    targetScrollXRef.current = targetIdx * spacing;
  };

  // Card click: If not centered, center it; if already centered, allow navigation
  const handleCardClick = (
    e: React.MouseEvent,
    vc: (typeof virtualCards)[0]
  ) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    const currentScrollIndex = scrollXRef.current / spacing;
    const v_raw = vc.globalIndex - centerGlobalIndex - currentScrollIndex;
    const v = mod(v_raw + totalVirtualItems / 2, totalVirtualItems) - totalVirtualItems / 2;

    if (Math.abs(v) > 0.45) {
      e.preventDefault();
      const targetIdx = Math.round(currentScrollIndex + v);
      targetScrollXRef.current = targetIdx * spacing;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") glideStep(-1);
      else if (e.key === "ArrowRight") glideStep(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [spacing]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full select-none" onWheel={onWheel}>
      {/* Top Controls: Pagination HUD & Arrow Buttons */}
      <div className="flex items-center justify-between pb-6 sm:pb-8">
        <div className="flex items-center gap-3">
          <span
            className="text-2xl sm:text-3xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-light text-muted">
            &bull;
          </span>
          <span className="text-xs tracking-[0.2em] uppercase text-muted font-medium">
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => glideStep(-1)}
            aria-label="Previous project"
            className="flex h-11 w-11 items-center justify-center border border-border bg-background text-foreground transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground active:scale-95 cursor-pointer shadow-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => glideStep(1)}
            aria-label="Next project"
            className="flex h-11 w-11 items-center justify-center border border-border bg-background text-foreground transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground active:scale-95 cursor-pointer shadow-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Glide Carousel Canvas Viewport (Zero CSS Mask Blur for Pure 120 FPS GPU Performance) */}
      <div
        ref={containerRef}
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          targetMouseRef.current.visible = false;
        }}
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing py-6 md:py-10 [touch-action:pan-y]"
        style={{
          height: isMobile ? 420 : 540,
        }}
      >
        {/* Left Edge Bayer Dither Curtain (Dissolves cleanly into white) */}
        <canvas
          ref={leftDitherRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-30 h-full w-[60px] md:w-[120px] will-change-transform [transform:translateZ(0)]"
        />

        {/* Right Edge Bayer Dither Curtain (Dissolves cleanly into white) */}
        <canvas
          ref={rightDitherRef}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-30 h-full w-[60px] md:w-[120px] will-change-transform [transform:translateZ(0)]"
        />

        {virtualCards.map((vc) => {
          const coverUrl = getMediaUrl(vc.project.cover_image_path);
          const isCurrentActive = vc.originalIndex === activeIndex;

          return (
            <div
              key={vc.globalIndex}
              ref={(el) => {
                if (el) cardRefs.current.set(vc.globalIndex, el);
                else cardRefs.current.delete(vc.globalIndex);
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: W,
                willChange: "transform, opacity",
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
              }}
              onMouseEnter={() => {
                targetMouseRef.current.mode = isCurrentActive ? "view" : "drag";
              }}
              className="group select-none"
            >
              <Link
                href={`/work/${vc.project.slug}`}
                onClick={(e) => handleCardClick(e, vc)}
                className="block w-full cursor-pointer focus:outline-none"
              >
                {/* Cinematic Media Frame */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border border-border/90 shadow-sm transition-all duration-300 group-hover:border-foreground group-hover:shadow-xl">
                  <div
                    ref={(el) => {
                      if (el) innerImgRefs.current.set(vc.globalIndex, el);
                      else innerImgRefs.current.delete(vc.globalIndex);
                    }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                    style={{
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={vc.project.title}
                        fill
                        sizes="(max-width: 768px) 280px, 540px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        priority={vc.globalIndex === centerGlobalIndex}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs tracking-wider uppercase text-neutral-400 bg-neutral-900">
                        Preview
                      </div>
                    )}
                  </div>

                  {/* Architectural subtle frame */}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10" />
                </div>

                {/* Cohesive Typography Placard immediately below image */}
                <div className="pt-3.5 sm:pt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-muted mb-1 truncate">
                      {vc.project.project_type ?? "Production System"}
                    </p>
                    <h3
                      className="text-xl sm:text-2xl font-normal leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:underline"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {vc.project.title}
                    </h3>
                  </div>

                  {/* Clean SVG Arrow */}
                  <div className="mt-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground flex-shrink-0 shadow-sm">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom HUD: Progress Scrubber Track */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {projects.map((proj, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={proj.id}
              type="button"
              onClick={() => jumpToIndex(idx)}
              aria-label={`Go to project ${idx + 1}: ${proj.title}`}
              className="group py-2 px-1 focus:outline-none cursor-pointer"
            >
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-10 sm:w-14 bg-foreground"
                    : "w-4 sm:w-6 bg-border group-hover:bg-muted"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Floating Awwwards Mouse Follower Cursor (Hardware Composited, Zero React Re-render) */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-50 transition-opacity duration-150 hidden md:block"
        style={{
          left: 0,
          top: 0,
          willChange: "transform, opacity",
          opacity: 0,
        }}
      >
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 shadow-2xl backdrop-blur-md flex items-center gap-2 bg-neutral-900/95 text-white border border-white/20">
          <span ref={cursorTextRef}>Drag</span>
          <span ref={cursorArrowRef} className="text-neutral-400 tracking-normal">
            &harr;
          </span>
        </div>
      </div>
    </div>
  );
}
