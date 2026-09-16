"use client";

import { useEffect, useRef, useState } from "react";

interface DitherImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Max canvas dimension in px (perf). */
  resolution?: number;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const INK: [number, number, number] = [23, 23, 20];
const PAPER: [number, number, number] = [238, 233, 223];

/**
 * Ordered-dither portrait with pointer color-reveal.
 * Falls back to a static grayscale <img> on reduced motion,
 * load failure, or CORS-tainted canvas.
 */
export function DitherImage({
  src,
  alt,
  className,
  resolution = 560,
}: DitherImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (fallback) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;


    let disposed = false;
    let raf = 0;
    let io: IntersectionObserver | null = null;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (disposed) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setFallback(true);
        return;
      }

      const scale = Math.min(
        1,
        resolution / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.width = w;
      canvas.height = h;

      // Cover-fit draw into an offscreen canvas.
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const offCtx = off.getContext("2d", { willReadFrequently: true });
      if (!offCtx) {
        setFallback(true);
        return;
      }
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = w / h;
      let dw = w;
      let dh = h;
      if (imgRatio > boxRatio) dh = Math.round(w / imgRatio);
      else dw = Math.round(h * imgRatio);
      // Fill to cover: draw larger and center-crop.
      const cw = imgRatio > boxRatio ? Math.round(h * imgRatio) : w;
      const ch = imgRatio > boxRatio ? h : Math.round(w / imgRatio);
      void dw;
      void dh;
      offCtx.drawImage(img, (w - cw) / 2, (h - ch) / 2, cw, ch);

      let original: ImageData;
      try {
        original = offCtx.getImageData(0, 0, w, h);
      } catch {
        // CORS-tainted: cannot read pixels.
        setFallback(true);
        return;
      }

      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const r = original.data[i * 4];
        const g = original.data[i * 4 + 1];
        const b = original.data[i * 4 + 2];
        gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }

      const out = ctx.createImageData(w, h);
      let pointer: { x: number; y: number } | null = null;
      let visible = true;
      let drift = 0;
      let lastDrift = 0;

      const REVEAL_RADIUS = 0.22; // fraction of width

      const render = (now: number) => {
        if (!visible || document.hidden) return;
        if (now - lastDrift > 140) {
          drift = Math.sin(now / 2400) * 0.03;
          lastDrift = now;
        }
        const R = w * REVEAL_RADIUS;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const threshold = (BAYER_4X4[y % 4][x % 4] + 0.5) / 16 + drift;
            const isInk = gray[i] < threshold;
            let r = isInk ? INK[0] : PAPER[0];
            let g = isInk ? INK[1] : PAPER[1];
            let b = isInk ? INK[2] : PAPER[2];

            if (pointer) {
              const dx = (x - pointer.x) / R;
              const dy = (y - pointer.y) / R;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < 1) {
                const t = 1 - d * d * (3 - 2 * d); // smoothstep-ish
                const or = original.data[i * 4];
                const og = original.data[i * 4 + 1];
                const ob = original.data[i * 4 + 2];
                r = Math.round(r + (or - r) * t);
                g = Math.round(g + (og - g) * t);
                b = Math.round(b + (ob - b) * t);
              }
            }

            out.data[i * 4] = r;
            out.data[i * 4 + 1] = g;
            out.data[i * 4 + 2] = b;
            out.data[i * 4 + 3] = 255;
          }
        }
        ctx.putImageData(out, 0, 0);
      };

      let needsRender = false;

      const scheduleRender = () => {
        if (needsRender || disposed || !visible) return;
        needsRender = true;
        raf = requestAnimationFrame((now) => {
          needsRender = false;
          render(now);
        });
      };

      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer = {
          x: ((e.clientX - rect.left) / rect.width) * w,
          y: ((e.clientY - rect.top) / rect.height) * h,
        };
        scheduleRender();
      };

      const onLeave = () => {
        pointer = null;
        scheduleRender();
      };

      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          if (visible) scheduleRender();
        },
        { threshold: 0 }
      );
      io.observe(wrap);

      wrap.addEventListener("pointermove", onMove, { passive: true });
      wrap.addEventListener("pointerleave", onLeave, { passive: true });

      // Initial render once
      render(performance.now());

      // Store cleanup on element for the effect teardown below.
      (wrap as unknown as { __ditherCleanup?: () => void }).__ditherCleanup =
        () => {
          wrap.removeEventListener("pointermove", onMove);
          wrap.removeEventListener("pointerleave", onLeave);
        };
    };

    img.onerror = () => {
      if (!disposed) setFallback(true);
    };

    img.src = src;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      const cleanup = (
        wrap as unknown as { __ditherCleanup?: () => void }
      ).__ditherCleanup;
      cleanup?.();
    };
  }, [src, resolution, fallback]);

  if (fallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ filter: "grayscale(1) contrast(1.1)" }}
      />
    );
  }

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="h-auto w-full"
      />
    </div>
  );
}
