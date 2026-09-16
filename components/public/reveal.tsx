"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "figure" | "li";
}

/**
 * Editorial mask reveal on scroll entry.
 * Respects prefers-reduced-motion (renders content statically).
 */
export function Reveal({ children, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(8% 0 8% 0)", y: 24, opacity: 0 },
        {
          clipPath: "inset(0% 0 0% 0)",
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "clipPath,transform",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const Tag = as as "div";

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
