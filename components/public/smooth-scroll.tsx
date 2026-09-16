"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let lenis: Lenis | null = null;
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;

    // Smooth anchor navigation (e.g. /#work, #work)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("#") || href.startsWith("/#")) {
        const hash = href.includes("#") ? href.split("#")[1] : null;
        if (hash) {
          const targetEl = document.getElementById(hash);
          if (targetEl) {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: -60, duration: 1.0 });
            } else {
              targetEl.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Initialize Lenis only on fine-pointer (desktop/laptop) devices
    // Touch devices use native 120Hz GPU compositor scrolling for optimal battery and latency
    let onTick: ((time: number) => void) | null = null;

    if (isPointerFine) {
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        smoothWheel: true,
        syncTouch: false,
      });

      lenis.on("scroll", ScrollTrigger.update);

      onTick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(500, 33);
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      if (onTick) gsap.ticker.remove(onTick);
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
