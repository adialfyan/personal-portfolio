"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

export interface BouncyLineProps {
  className?: string;
  color?: string;
  lineWidth?: number;
  sensitivity?: number; // 1 - 100 (proximity threshold to catch cursor, default: 40)
  bounceAmount?: number; // 1 - 100 (elasticity and duration, default: 60)
  trackMouseX?: boolean; // If true, string curves toward cursor X; default: true
  ariaHidden?: boolean;
}

/**
 * GSAP Bouncy Line Component
 * High-performance interactive physics divider.
 * Plucks and bounces elastically like a guitar string on slow drag or high-speed strumming.
 * SSR-safe, zero layout shift, 120 FPS direct SVG manipulation.
 */
export function BouncyLine({
  className = "",
  color = "var(--color-border, #e5e5e5)",
  lineWidth = 1,
  sensitivity = 40,
  bounceAmount = 60,
  trackMouseX = true,
  ariaHidden = true,
}: BouncyLineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Animation state (ref-based to prevent React re-renders during 120fps motion)
  const widthRef = useRef<number>(0);
  const pointsRef = useRef<{ x1: number; y1: number }>({ x1: 0, y1: lineWidth / 2 });
  const isHoveringRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);
  const prevMouseRef = useRef<{ x: number; y: number } | null>(null);
  const boundsRef = useRef<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;
    if (!container || !path) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const w = container.offsetWidth;
      const midY = lineWidth / 2;
      path.setAttribute("d", `M 0 ${midY} L ${w} ${midY}`);
      return;
    }

    const midY = lineWidth / 2;

    const renderPath = () => {
      const w = widthRef.current;
      if (w <= 0) return;
      const { x1, y1 } = pointsRef.current;
      path.setAttribute("d", `M 0 ${midY} Q ${x1} ${y1} ${w} ${midY}`);
    };

    const updateBounds = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      boundsRef.current = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
      if (rect.width > 0 && rect.width !== widthRef.current) {
        widthRef.current = rect.width;
        if (!isHoveringRef.current) {
          pointsRef.current.x1 = rect.width / 2;
          pointsRef.current.y1 = midY;
          renderPath();
        }
      }
    };

    updateBounds();

    // IntersectionObserver to sleep when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            updateBounds();
          }
        }
      },
      { rootMargin: "150px 0px 150px 0px" }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });
    resizeObserver.observe(container);

    // Proximity parameters
    const mappedSnapDist = (sensitivity / 100) * 145 + 5;
    const maxDisplacement = mappedSnapDist * 2.2;

    const release = (initialVelocityY?: number) => {
      isHoveringRef.current = false;
      const w = widthRef.current;
      if (w <= 0) return;

      const amount = bounceAmount / 100;
      const mappedDuration = 0.55 + amount * 0.95;
      const mappedPeriod = 0.42 - amount * 0.32;
      const mappedStrength = 0.6 + amount * 0.85;

      gsap.killTweensOf(pointsRef.current);
      gsap.to(pointsRef.current, {
        y1: midY,
        x1: w / 2,
        duration: mappedDuration,
        ease: `elastic.out(${mappedStrength}, ${mappedPeriod})`,
        onUpdate: renderPath,
        onComplete: () => {
          pointsRef.current.y1 = midY;
          pointsRef.current.x1 = w / 2;
          renderPath();
        },
      });
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isVisibleRef.current) return;
      const w = widthRef.current;
      if (w <= 0) return;

      const currentContainerTop = boundsRef.current.top - window.scrollY;
      const currentContainerLeft = boundsRef.current.left - window.scrollX;

      const mouseX = clientX - currentContainerLeft;
      const mouseY = clientY - currentContainerTop;
      const dist = Math.abs(mouseY - midY);

      const prev = prevMouseRef.current;
      prevMouseRef.current = { x: mouseX, y: mouseY };

      // High-speed strum detection (if mouse sliced completely across line in one frame)
      if (prev !== null && !isHoveringRef.current && mouseX >= 0 && mouseX <= w) {
        const crossed = (prev.y - midY) * (mouseY - midY) < 0;
        if (crossed) {
          const swipeDeltaY = mouseY - prev.y;
          const direction = Math.sign(swipeDeltaY) || 1;
          const impulse = Math.min(mappedSnapDist * 1.6, Math.max(30, Math.abs(swipeDeltaY) * 0.9)) * direction;
          
          pointsRef.current.y1 = midY + impulse;
          pointsRef.current.x1 = trackMouseX ? Math.max(w * 0.05, Math.min(w * 0.95, mouseX)) : w / 2;
          renderPath();
          release();
          return;
        }
      }

      // Proximity catch (approaching within snap zone)
      if (!isHoveringRef.current) {
        if (dist < mappedSnapDist && mouseX >= 0 && mouseX <= w) {
          isHoveringRef.current = true;
          gsap.killTweensOf(pointsRef.current);
        }
      }

      if (isHoveringRef.current) {
        // Break threshold: cursor pulled beyond limit or left horizontal range
        if (dist > maxDisplacement || mouseX < -40 || mouseX > w + 40) {
          release();
          return;
        }

        // Exact parabolic curvature: apex meets cursor point
        pointsRef.current.y1 = mouseY * 2 - midY;

        if (trackMouseX) {
          pointsRef.current.x1 = Math.max(w * 0.04, Math.min(w * 0.96, mouseX));
        } else {
          pointsRef.current.x1 = w / 2;
        }

        renderPath();
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      prevMouseRef.current = null;
      if (isHoveringRef.current) {
        release();
      }
    };

    const onScroll = () => {
      if (isVisibleRef.current) {
        const rect = container.getBoundingClientRect();
        boundsRef.current.top = rect.top + window.scrollY;
        boundsRef.current.left = rect.left + window.scrollX;
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", () => release());
    document.addEventListener("mouseleave", () => release());

    return () => {
      gsap.killTweensOf(pointsRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", () => release());
      document.removeEventListener("mouseleave", () => release());
    };
  }, [lineWidth, sensitivity, bounceAmount, trackMouseX]);

  return (
    <div
      ref={containerRef}
      aria-hidden={ariaHidden}
      className={`relative w-full overflow-visible pointer-events-none select-none ${className}`}
      style={{ height: lineWidth }}
    >
      <svg
        className="block w-full overflow-visible pointer-events-none"
        style={{ height: lineWidth }}
      >
        {/* Fallback line during SSR / initial hydration */}
        {!mounted && (
          <line
            x1="0"
            y1={lineWidth / 2}
            x2="100%"
            y2={lineWidth / 2}
            stroke={color}
            strokeWidth={lineWidth}
          />
        )}
        {/* Dynamic interactive path after mount */}
        <path
          ref={pathRef}
          fill="none"
          stroke={color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          className={mounted ? "block" : "hidden"}
        />
      </svg>
    </div>
  );
}
