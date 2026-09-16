"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

export interface SakuraCornerBranchProps {
  className?: string;
}

interface BloomClusterDef {
  src: string;
  name: string;
  originX: string;
  originY: string;
  delay: number; // Staggered delay for sequential blooming (satu persatu)
}

const BLOOM_CLUSTERS: BloomClusterDef[] = [
  {
    src: "/sakura-bloom-1.png?v=4",
    name: "Trunk Buds & Twin Blossoms",
    originX: "89.3%",
    originY: "41.8%",
    delay: 0.00,
  },
  {
    src: "/sakura-bloom-2.png?v=4",
    name: "Upper Twig Blossoms",
    originX: "81.6%",
    originY: "20.1%",
    delay: 0.12,
  },
  {
    src: "/sakura-bloom-3.png?v=4",
    name: "Upper Grand Blossom",
    originX: "58.5%",
    originY: "37.4%",
    delay: 0.24,
  },
  {
    src: "/sakura-bloom-4.png?v=4",
    name: "Mid-Right Hanging Blossoms",
    originX: "86.5%",
    originY: "58.9%",
    delay: 0.36,
  },
  {
    src: "/sakura-bloom-5.png?v=4",
    name: "Center Blossom Cluster",
    originX: "63.1%",
    originY: "64.1%",
    delay: 0.48,
  },
  {
    src: "/sakura-bloom-6.png?v=4",
    name: "Terminal Tip Blossoms",
    originX: "26.7%",
    originY: "69.9%",
    delay: 0.60,
  },
];

interface PetalDef {
  src: string;
  pctX: number;
  pctY: number;
  size: number;
  baseDelay: number;
  driftX: number;
  fallDist: number;
  duration: number;
}

const PETAL_DEFINITIONS: PetalDef[] = [
  {
    src: "/sakura-petal-1.png?v=4",
    pctX: 68,
    pctY: 38,
    size: 20,
    baseDelay: 0.65,
    driftX: -32,
    fallDist: 260,
    duration: 3.2,
  },
  {
    src: "/sakura-petal-2.png?v=4",
    pctX: 62,
    pctY: 62,
    size: 16,
    baseDelay: 0.95,
    driftX: 28,
    fallDist: 290,
    duration: 3.4,
  },
  {
    src: "/sakura-petal-3.png?v=4",
    pctX: 52,
    pctY: 53,
    size: 18,
    baseDelay: 1.25,
    driftX: -26,
    fallDist: 250,
    duration: 3.0,
  },
  {
    src: "/sakura-petal-4.png?v=4",
    pctX: 20,
    pctY: 70,
    size: 19,
    baseDelay: 1.55,
    driftX: -36,
    fallDist: 230,
    duration: 3.3,
  },
  {
    src: "/sakura-petal-5.png?v=4",
    pctX: 80,
    pctY: 20,
    size: 17,
    baseDelay: 1.85,
    driftX: 24,
    fallDist: 310,
    duration: 3.5,
  },
  {
    src: "/sakura-petal-1.png?v=4",
    pctX: 65,
    pctY: 42,
    size: 15,
    baseDelay: 2.2,
    driftX: -22,
    fallDist: 270,
    duration: 3.1,
  },
  {
    src: "/sakura-petal-2.png?v=4",
    pctX: 58,
    pctY: 65,
    size: 18,
    baseDelay: 2.55,
    driftX: 30,
    fallDist: 280,
    duration: 3.4,
  },
];

/**
 * SakuraCornerBranch Component
 * - Rest State: Clean Sumi-e bare wooden branch resting peacefully in top-right
 *   corner with a quiet ambient spring breeze.
 * - Hover State (Sequential Morphing Bloom & Falling Petals):
 *     1. Flower clusters bloom ONE BY ONE (satu persatu) in sequence.
 *     2. Authentic Liquid Gooey Morphing (from MorphText engine) applied exclusively
 *        during the transition window, then completely idling for maximum 120 FPS performance.
 *     3. Delicate dithered sakura petals detach and drift down with realistic
 *        harmonic air sway, 3D tumbling, and fluttering physics (gugur).
 * - Leave State:
 *     Flowers melt and dissolve back into the branch in reverse cascade, leaving
 *     only the clean resting bare branch.
 */
export function SakuraCornerBranch({ className = "" }: SakuraCornerBranchProps) {
  const rawId = useId();
  const filterId = `flower-morph-filter-${rawId.replace(/[^a-zA-Z0-9-_]/g, "")}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const branchWrapperRef = useRef<HTMLDivElement | null>(null);
  const clusterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const petalRefs = useRef<(HTMLDivElement | null)[]>([]);

  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const isMorphingRef = useRef(false);

  const clusterTweens = useRef<(gsap.core.Tween | null)[]>([]);
  const petalTweens = useRef<(gsap.core.Timeline | gsap.core.Tween)[]>([]);
  const morphProgressTween = useRef<gsap.core.Tween | null>(null);
  const ambientTweenRef = useRef<gsap.core.Tween | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // MorphText SVG liquid filter parameters
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

  const updateFilterDOM = () => {
    const displacement = displacementRef.current;
    const turbulence = turbulenceRef.current;
    const blur = blurRef.current;
    const colorMatrix = colorMatrixRef.current;

    if (!displacement || !turbulence || !blur || !colorMatrix) return;

    animRef.current.time += 0.02;
    const t = animRef.current.time;

    const fx = animRef.current.baseFreqX + Math.sin(t * 1.3) * 0.005;
    const fy = animRef.current.baseFreqY + Math.cos(t * 1.6) * 0.005;
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
        isMorphingRef.current ||
        animRef.current.scale > 0.05 ||
        animRef.current.blur > 0.05 ||
        animRef.current.alphaThreshold > 1.05
      ) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // Reset to exact identity & STOP RAF LOOP (0% CPU cost when idle)
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

  // 1. Setup Ambient Sway & Resting Bare Branch Pose
  useLayoutEffect(() => {
    const branch = branchWrapperRef.current;
    if (!branch) return;

    gsap.set(branch, {
      scale: 0.88,
      opacity: 0.78,
      rotation: 0,
      x: 0,
      y: 0,
      transformOrigin: "98% 28%",
      force3D: true,
    });

    clusterRefs.current.forEach((el, i) => {
      if (!el) return;
      const cluster = BLOOM_CLUSTERS[i];
      gsap.set(el, {
        opacity: 0,
        scale: 0.35,
        transformOrigin: `${cluster.originX} ${cluster.originY}`,
        force3D: true,
      });
    });

    ambientTweenRef.current = gsap.to(branch, {
      rotation: 1.2,
      y: 3.0,
      x: -1.5,
      duration: 5.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      if (ambientTweenRef.current) ambientTweenRef.current.kill();
      if (morphProgressTween.current) morphProgressTween.current.kill();
      clusterTweens.current.forEach((t) => t?.kill());
      petalTweens.current.forEach((t) => t?.kill());
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // 2. Falling Petal Particle Animator (Gugur)
  const dropPetalRef = useRef<(index: number, initialDelay?: number) => void>(() => {});

  useEffect(() => {
    dropPetalRef.current = (index: number, initialDelay = 0) => {
      const el = petalRefs.current[index];
      const container = containerRef.current;
      if (!el || !container) return;

      const def = PETAL_DEFINITIONS[index];
      const rect = container.getBoundingClientRect();
      const width = rect.width || 440;
      const height = rect.height || 440;

      const startX = (def.pctX / 100) * width + (Math.random() * 16 - 8);
      const startY = (def.pctY / 100) * height + (Math.random() * 16 - 8);

      const driftX = def.driftX * (0.85 + Math.random() * 0.35);
      const fallY = def.fallDist * (0.85 + Math.random() * 0.3);
      const duration = def.duration * (0.9 + Math.random() * 0.25);
      const rotationTotal = (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 35);

      gsap.set(el, {
        x: startX,
        y: startY,
        opacity: 0,
        rotationZ: Math.random() * 40 - 20,
        rotationY: 0,
        scale: 0.85,
        force3D: true,
      });

      const tl = gsap.timeline({
        delay: initialDelay,
        onComplete: () => {
          if (isHoveredRef.current) {
            dropPetalRef.current(index, 0.3 + Math.random() * 0.5);
          }
        },
      });

      tl.to(el, {
        opacity: 0.92,
        scale: 1,
        duration: 0.45,
        ease: "power1.out",
      }, 0);

      tl.to(el, {
        y: startY + fallY,
        duration: duration,
        ease: "sine.in",
      }, 0);

      tl.to(el, {
        keyframes: [
          { x: startX + driftX * 0.4, duration: duration * 0.33, ease: "sine.inOut" },
          { x: startX + driftX * 0.85, duration: duration * 0.33, ease: "sine.inOut" },
          { x: startX + driftX, duration: duration * 0.34, ease: "sine.out" },
        ],
      }, 0);

      tl.to(el, {
        rotationZ: `+=${rotationTotal}`,
        rotationY: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration: duration,
        ease: "none",
      }, 0);

      tl.to(el, {
        opacity: 0,
        scale: 0.75,
        duration: 0.65,
        ease: "power2.in",
      }, duration - 0.65);

      petalTweens.current[index] = tl;
    };
  }, []);

  // 3. Hover Handler: Sequential Morphing Bloom (Satu Persatu) with MorphText Liquid Filter
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    isMorphingRef.current = true;
    setIsHovered(true);
    startLoop();

    if (ambientTweenRef.current) {
      ambientTweenRef.current.pause();
    }

    const branch = branchWrapperRef.current;
    if (branch) {
      gsap.to(branch, {
        scale: 1.03,
        opacity: 1.0,
        rotation: 2.8,
        x: -6,
        y: 5,
        duration: 1.0,
        ease: "power2.out",
      });
    }

    // Trigger MorphText Liquid Filter Bell Curve
    if (morphProgressTween.current) morphProgressTween.current.kill();
    const progress = { val: 0 };
    morphProgressTween.current = gsap.to(progress, {
      val: 1,
      duration: 1.15,
      ease: "power2.out",
      onUpdate: () => {
        const p = progress.val;
        const bell = Math.sin(p * Math.PI);

        // Liquid morph parameters from MorphText
        animRef.current.scale = bell * 6.5; // Soft, silky liquid ripple (no harsh tearing)
        animRef.current.blur = bell * 1.5;
        animRef.current.alphaThreshold = 1 + bell * 18;
        animRef.current.alphaOffset = -(bell * 7.0);
      },
      onComplete: () => {
        isMorphingRef.current = false;
        animRef.current.scale = 0;
        animRef.current.blur = 0;
        animRef.current.alphaThreshold = 1;
        animRef.current.alphaOffset = 0;
        updateFilterDOM();
      },
    });

    // Animate Flower Clusters ONE BY ONE (satu persatu)
    BLOOM_CLUSTERS.forEach((cluster, i) => {
      const el = clusterRefs.current[i];
      if (!el) return;

      if (clusterTweens.current[i]) clusterTweens.current[i]?.kill();

      clusterTweens.current[i] = gsap.fromTo(
        el,
        {
          opacity: 0,
          scale: 0.35,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          delay: cluster.delay,
          ease: "power2.out",
        }
      );
    });

    // Trigger Falling Petals (Gugur)
    PETAL_DEFINITIONS.forEach((petal, i) => {
      dropPetalRef.current(i, petal.baseDelay);
    });
  };

  // 4. Leave Handler: Flowers Melt Away in Reverse Cascade -> Return to Bare Branch
  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    isMorphingRef.current = true;
    setIsHovered(false);
    startLoop();

    const branch = branchWrapperRef.current;
    if (branch) {
      gsap.to(branch, {
        scale: 0.88,
        opacity: 0.78,
        rotation: 0,
        x: 0,
        y: 0,
        duration: 0.85,
        ease: "power2.inOut",
        onComplete: () => {
          if (ambientTweenRef.current && !isHoveredRef.current) {
            ambientTweenRef.current.resume();
          }
        },
      });
    }

    // Morph filter bell curve for reverse melt
    if (morphProgressTween.current) morphProgressTween.current.kill();
    const progress = { val: 0 };
    morphProgressTween.current = gsap.to(progress, {
      val: 1,
      duration: 0.75,
      ease: "power2.inOut",
      onUpdate: () => {
        const p = progress.val;
        const bell = Math.sin(p * Math.PI);
        animRef.current.scale = bell * 5.5;
        animRef.current.blur = bell * 1.3;
        animRef.current.alphaThreshold = 1 + bell * 16;
        animRef.current.alphaOffset = -(bell * 6.0);
      },
      onComplete: () => {
        isMorphingRef.current = false;
        animRef.current.scale = 0;
        animRef.current.blur = 0;
        animRef.current.alphaThreshold = 1;
        animRef.current.alphaOffset = 0;
        updateFilterDOM();
      },
    });

    // Dissolve flower clusters in reverse cascade
    const totalClusters = BLOOM_CLUSTERS.length;
    BLOOM_CLUSTERS.forEach((_, i) => {
      const el = clusterRefs.current[i];
      if (!el) return;

      if (clusterTweens.current[i]) clusterTweens.current[i]?.kill();

      const reverseDelay = (totalClusters - 1 - i) * 0.07;
      clusterTweens.current[i] = gsap.to(el, {
        opacity: 0,
        scale: 0.35,
        duration: 0.55,
        delay: reverseDelay,
        ease: "power2.inOut",
      });
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`absolute top-0 right-0 z-20 pointer-events-auto cursor-pointer select-none overflow-visible w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] ${className}`}
    >
      {/* Liquid Gooey Morph Filter for Flowers (MorphText Architecture) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter
            id={filterId}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.035 0.045"
              numOctaves="2"
              result="noise"
              seed="9"
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

      {/* Layer 1: Authentic Japanese Sumi-e Bare Wooden Branch (Always visible in resting state) */}
      <div
        ref={branchWrapperRef}
        className="relative w-full h-full pointer-events-none will-change-transform"
        style={{ transformOrigin: "98% 28%" }}
      >
        <img
          src="/sakura-bare-branch.png?v=4"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      {/* Layer 2: Sequential Flower Bloom Clusters with MorphText Liquid Filter */}
      <div
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ filter: `url(#${filterId})` }}
      >
        {BLOOM_CLUSTERS.map((cluster, i) => (
          <div
            key={i}
            ref={(el) => {
              clusterRefs.current[i] = el;
            }}
            className="absolute inset-0 pointer-events-none opacity-0 will-change-transform"
            style={{
              transformOrigin: `${cluster.originX} ${cluster.originY}`,
            }}
          >
            <img
              src={cluster.src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain pointer-events-none select-none"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}
      </div>

      {/* Layer 3: Dynamic Falling Petals (Gugur / Sakura Fubuki) */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {PETAL_DEFINITIONS.map((petal, i) => (
          <div
            key={i}
            ref={(el) => {
              petalRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute pointer-events-none opacity-0 will-change-transform"
            style={{
              left: 0,
              top: 0,
              width: petal.size,
              height: Math.round(petal.size * 1.3),
            }}
          >
            <img
              src={petal.src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(219,39,119,0.12)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
