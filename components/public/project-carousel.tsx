"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectCard } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";

interface ProjectCarouselProps {
  projects: ProjectCard[];
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const hasDraggedRef = useRef(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Estimate active index based on card scroll position
    const cardWidth = el.firstElementChild?.clientWidth ?? 400;
    const gap = 24;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(projects.length - 1, Math.max(0, index)));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState, { passive: true });
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [projects.length]);

  const scrollToCard = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (card) {
      el.scrollTo({
        left: card.offsetLeft - 24,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToCard(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < projects.length - 1) {
      scrollToCard(activeIndex + 1);
    }
  };

  // Drag to scroll handling
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      scrollLeft: el.scrollLeft,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartRef.current.x;
    if (Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = dragStartRef.current.scrollLeft - delta;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const el = scrollRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className="relative w-full">
      {/* Carousel Header Controls */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
            {String(activeIndex + 1).padStart(2, "0")} &mdash; {String(projects.length).padStart(2, "0")}
          </span>
          <span className="h-px w-8 bg-border hidden sm:inline-block" />
          <span className="hidden sm:inline-block text-[11px] font-medium tracking-wider uppercase text-muted/70">
            Drag or use arrows to navigate
          </span>
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canScrollLeft}
            aria-label="Previous project"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-all hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canScrollRight}
            aria-label="Next project"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-all hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`flex gap-6 overflow-x-auto pb-8 pt-2 scroll-smooth select-none cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {projects.map((project, i) => {
          const coverUrl = getMediaUrl(project.cover_image_path);
          return (
            <article
              key={project.id}
              className="flex-shrink-0 w-[310px] sm:w-[420px] md:w-[480px] lg:w-[520px] group flex flex-col"
            >
              <Link
                href={`/work/${project.slug}`}
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                  }
                }}
                className="block h-full flex flex-col rounded-2xl border border-border bg-white p-5 sm:p-6 transition-all duration-300 hover:border-neutral-400 hover:shadow-md"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-surface">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={project.title}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 768px) 320px, 520px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface text-muted text-xs tracking-wider uppercase">
                      Preview
                    </div>
                  )}
                  {/* Floating index badge */}
                  <div className="absolute top-3 left-3 rounded-full border border-border/80 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-foreground shadow-xs">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Card Meta & Title */}
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <div>
                    {project.project_type && (
                      <span className="block text-[11px] font-medium tracking-widest uppercase text-muted">
                        {project.project_type}
                      </span>
                    )}
                    <h3
                      className="mt-1 text-2xl sm:text-3xl tracking-tight text-foreground transition-colors group-hover:text-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h3>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-xl text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground"
                  >
                    ↗
                  </span>
                </div>

                {/* Summary */}
                {project.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-2">
                    {project.summary}
                  </p>
                )}

                {/* Tech & Year Footer */}
                <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full border border-border/80 bg-surface/60 px-2 py-0.5 text-[10px] font-medium tracking-wider text-muted"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-medium tracking-wider text-muted">
                    {project.year ?? "2024"}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* Progress Track Bar */}
      <div className="mt-4 h-0.5 w-full bg-border/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground transition-all duration-300 ease-out"
          style={{
            width: `${((activeIndex + 1) / projects.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
