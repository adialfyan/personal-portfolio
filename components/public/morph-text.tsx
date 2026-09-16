"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export interface MorphTextProps {
  /** Text content or static word */
  children?: ReactNode;
  /** Optional array of words to cycle and morph between */
  words?: string[];
  /** Interval in milliseconds between word switches (default: 4000ms) */
  interval?: number;
  /** Intensity of the liquid melt distortion (1-20, default: 11) */
  intensity?: number;
  /** Custom CSS classes */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MorphText Component
 * True Dual-Layer Liquid Gooey Typography with zero-jerk continuous interpolation.
 * - Rest State: 100% crisp editorial typography, identical pass-through matrix.
 * - Transition: Non-linear alpha fusion where outgoing and incoming words blend
 *   into a unified molten shape without text snapping, flash of old text, or width stutter.
 */
export function MorphText({
  children,
  words,
  interval = 4000,
  intensity = 11,
  className = "",
  style,
}: MorphTextProps) {
  const rawId = useId();
  const filterId = `morph-filter-${rawId.replace(/[^a-zA-Z0-9-_]/g, "")}`;

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const text1Ref = useRef<HTMLSpanElement | null>(null);
  const text2Ref = useRef<HTMLSpanElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);

  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement | null>(null);

  const currentIndexRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isTransitioningRef = useRef(false);

  // Animation values stored in refs for 120 FPS performance
  const animRef = useRef<{
    scale: number;
    blur: number;
    alphaThreshold: number;
    alphaOffset: number;
    baseFreqX: number;
    baseFreqY: number;
    time: number;
  }>({
    scale: 0,
    blur: 0,
    alphaThreshold: 1,
    alphaOffset: 0,
    baseFreqX: 0.035,
    baseFreqY: 0.045,
    time: 0,
  });

  const rafIdRef = useRef<number | null>(null);

  // Apply matrix and turbulence directly to SVG filter DOM
  const updateFilterDOM = () => {
    const displacement = displacementRef.current;
    const turbulence = turbulenceRef.current;
    const blur = blurRef.current;
    const colorMatrix = colorMatrixRef.current;

    if (!displacement || !turbulence || !blur || !colorMatrix) return;

    animRef.current.time += 0.02;
    const t = animRef.current.time;

    const fx = animRef.current.baseFreqX + Math.sin(t * 1.4) * 0.006;
    const fy = animRef.current.baseFreqY + Math.cos(t * 1.7) * 0.006;
    turbulence.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);

    displacement.setAttribute("scale", animRef.current.scale.toFixed(2));
    blur.setAttribute("stdDeviation", animRef.current.blur.toFixed(2));

    const a = animRef.current.alphaThreshold;
    const o = animRef.current.alphaOffset;
    colorMatrix.setAttribute(
      "values",
      `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${a.toFixed(2)} ${o.toFixed(2)}`
    );
  };

  const startLoop = () => {
    if (rafIdRef.current) return;
    const tick = () => {
      updateFilterDOM();
      if (
        isHoveredRef.current ||
        isTransitioningRef.current ||
        animRef.current.scale > 0.05 ||
        animRef.current.blur > 0.05 ||
        animRef.current.alphaThreshold > 1.05
      ) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // Reset to exact identity
        animRef.current.scale = 0;
        animRef.current.blur = 0;
        animRef.current.alphaThreshold = 1;
        animRef.current.alphaOffset = 0;
        updateFilterDOM();
        rafIdRef.current = null;
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
  };

  useLayoutEffect(() => {
    if (!words || words.length <= 1) return;

    const t1 = text1Ref.current;
    const t2 = text2Ref.current;
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!t1 || !t2 || !container || !measure) return;

    // Set initial text synchronously
    t1.textContent = words[0];
    t2.textContent = words[1];
    measure.textContent = words[0];
    const initialWidth = measure.offsetWidth;
    if (initialWidth > 0) {
      container.style.width = `${initialWidth}px`;
    }

    const timer = setInterval(() => {
      if (isTransitioningRef.current) return;

      const totalWords = words.length;
      const currentIdx = currentIndexRef.current;
      const nextIdx = (currentIdx + 1) % totalWords;
      const fromWord = words[currentIdx];
      const toWord = words[nextIdx];

      // Measure accurate rendered widths
      measure.textContent = toWord;
      const targetWidth = measure.offsetWidth;
      measure.textContent = fromWord;
      const startWidth = measure.offsetWidth;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        currentIndexRef.current = nextIdx;
        t1.textContent = toWord;
        container.style.width = `${targetWidth}px`;
        return;
      }

      isTransitioningRef.current = true;
      t2.textContent = toWord;
      startLoop();

      // Ensure starting states
      t1.style.opacity = "1";
      t1.style.filter = "blur(0px)";
      t1.style.transform = "translateY(0px) scale(1)";

      t2.style.opacity = "0";
      t2.style.filter = "blur(10px)";
      t2.style.transform = "translateY(4px) scale(0.97)";

      const progress = { val: 0 };
      const duration = 1.05; // Generous buttery smooth 1050ms transition

      gsap.to(progress, {
        val: 1,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = progress.val;

          // Outgoing word: melts and blurs out smoothly
          const blur1 = p * 10;
          const opacity1 = Math.min(1, Math.max(0, Math.pow(1 - p, 0.45)));
          t1.style.filter = `blur(${blur1.toFixed(2)}px)`;
          t1.style.opacity = opacity1.toFixed(3);
          t1.style.transform = `translateY(${(-p * 4).toFixed(2)}px) scale(${(1 + p * 0.03).toFixed(3)})`;

          // Incoming word: sharpens and coalesces smoothly
          const blur2 = (1 - p) * 10;
          const opacity2 = Math.min(1, Math.max(0, Math.pow(p, 0.45)));
          t2.style.filter = `blur(${blur2.toFixed(2)}px)`;
          t2.style.opacity = opacity2.toFixed(3);
          t2.style.transform = `translateY(${((1 - p) * 4).toFixed(2)}px) scale(${(0.97 + p * 0.03).toFixed(3)})`;

          // Liquid turbulence & alpha matrix bell curves
          const bell = Math.sin(p * Math.PI);
          animRef.current.scale = isHoveredRef.current
            ? intensity
            : bell * (intensity * 1.3);
          animRef.current.blur = bell * 1.8;
          // Interpolate alpha threshold from 1 (identity) to 25 (liquid goo) and back to 1
          animRef.current.alphaThreshold = 1 + bell * 24;
          animRef.current.alphaOffset = -(bell * 9.5);

          // Smooth container width interpolation without CSS fighting
          if (startWidth > 0 && targetWidth > 0) {
            const curW = startWidth + (targetWidth - startWidth) * p;
            container.style.width = `${curW.toFixed(2)}px`;
          }
        },
        onComplete: () => {
          currentIndexRef.current = nextIdx;

          // Seamless synchronous handoff: t1 takes toWord instantly while pixel-identical to t2
          t1.textContent = toWord;
          t1.style.opacity = "1";
          t1.style.filter = "none";
          t1.style.transform = "none";

          t2.style.opacity = "0";
          t2.style.filter = "blur(10px)";
          t2.style.transform = "none";

          container.style.width = `${targetWidth}px`;

          animRef.current.scale = isHoveredRef.current ? intensity : 0;
          animRef.current.blur = 0;
          animRef.current.alphaThreshold = 1;
          animRef.current.alphaOffset = 0;
          updateFilterDOM();

          isTransitioningRef.current = false;
        },
      });
    }, interval);

    return () => {
      clearInterval(timer);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [words, interval, intensity]);

  // Interactive hover handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    startLoop();
    gsap.killTweensOf(animRef.current);
    gsap.to(animRef.current, {
      scale: intensity,
      blur: 1.5,
      alphaThreshold: 22,
      alphaOffset: -8,
      duration: 0.45,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (isTransitioningRef.current) return;
    gsap.killTweensOf(animRef.current);
    gsap.to(animRef.current, {
      scale: 0,
      blur: 0,
      alphaThreshold: 1,
      alphaOffset: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const initialText = words && words.length > 0 ? words[0] : children;

  return (
    <>
      {/* Permanent SVG filter definition with dynamic identity-to-goo matrix */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter
            id={filterId}
            x="-30%"
            y="-50%"
            width="160%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.035 0.045"
              numOctaves="2"
              result="noise"
              seed="5"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur
              ref={blurRef}
              in="displaced"
              stdDeviation="0"
              result="blurred"
            />
            <feColorMatrix
              ref={colorMatrixRef}
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Hidden measurement span for exact typographic bounding boxes */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className={`pointer-events-none absolute opacity-0 select-none whitespace-nowrap ${className}`}
        style={{ position: "absolute", visibility: "hidden", left: -9999, top: -9999 }}
      >
        {initialText}
      </span>

      {/* Dual-layer container with continuous inline-grid overlay */}
      <span
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative inline-grid place-items-baseline select-none cursor-pointer ${className}`}
        style={{
          ...style,
          filter: `url(#${filterId})`,
          willChange: "transform, width",
        }}
      >
        {/* Layer 1 (Active/Primary Word) */}
        <span
          ref={text1Ref}
          className="col-start-1 row-start-1 whitespace-nowrap block"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {initialText}
        </span>

        {/* Layer 2 (Incoming Word during Morph) */}
        {words && words.length > 1 && (
          <span
            ref={text2Ref}
            aria-hidden="true"
            className="col-start-1 row-start-1 whitespace-nowrap block pointer-events-none opacity-0"
            style={{ willChange: "transform, opacity, filter" }}
          >
            {words[1]}
          </span>
        )}
      </span>
    </>
  );
}
