"use client";

import { useState, useMemo } from "react";
import type { ShelfItem, ShelfMediaType } from "@/lib/queries/types";

interface ShelfGridProps {
  items: ShelfItem[];
}

type FilterOption = "all" | ShelfMediaType;

const MEDIA_LABELS: Record<ShelfMediaType, string> = {
  film: "Film",
  music: "Music",
  book: "Book",
  article: "Article",
};

export function ShelfGrid({ items }: ShelfGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const counts = useMemo(() => {
    return {
      all: items.length,
      film: items.filter((i) => i.media_type === "film").length,
      music: items.filter((i) => i.media_type === "music").length,
      book: items.filter((i) => i.media_type === "book").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.media_type === activeFilter);
  }, [items, activeFilter]);

  const filters: { key: FilterOption; label: string; count: number }[] = [
    { key: "all", label: "All Items", count: counts.all },
    { key: "film", label: "Cinema", count: counts.film },
    { key: "music", label: "Music & Records", count: counts.music },
    { key: "book", label: "Literature", count: counts.book },
  ];

  const getSourceLabel = (url: string | null) => {
    if (!url) return "Reference";
    if (url.includes("letterboxd.com")) return "Letterboxd";
    if (url.includes("spotify.com")) return "Spotify";
    if (url.includes("bandcamp.com")) return "Bandcamp";
    if (url.includes("goodreads.com")) return "Goodreads";
    return "View Source";
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-border pb-6 mb-10">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-xs font-medium tracking-[0.18em] uppercase transition-colors rounded-none cursor-pointer select-none ${
                isActive
                  ? "bg-dark text-ivory"
                  : "bg-surface text-muted hover:text-foreground hover:bg-neutral-200"
              }`}
            >
              {filter.label}{" "}
              <span className="opacity-70 ml-1.5">({filter.count})</span>
            </button>
          );
        })}
      </div>

      {/* Ledger Header */}
      <div className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-border text-xs font-medium tracking-[0.2em] uppercase text-muted">
        <div className="col-span-1">No.</div>
        <div className="col-span-2">Medium</div>
        <div className="col-span-6">Title &amp; Reflection</div>
        <div className="col-span-3 text-right">Source</div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-border">
        {filteredItems.map((item, index) => {
          const sourceLabel = getSourceLabel(item.external_url);
          const mediaLabel = MEDIA_LABELS[item.media_type] ?? item.media_type;

          return (
            <article
              key={item.id}
              className="py-8 md:py-10 -mx-3 px-3 sm:-mx-4 sm:px-4 rounded-sm transition-colors duration-150 hover:bg-neutral-50/70 group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                {/* Index Number */}
                <div className="col-span-1 text-xs font-medium tracking-[0.18em] uppercase text-muted pt-1">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Medium & Meta */}
                <div className="col-span-2">
                  <div className="flex flex-wrap md:flex-col gap-2 md:gap-1 text-xs font-medium tracking-[0.18em] uppercase">
                    <span className="text-foreground">{mediaLabel}</span>
                    {item.year && (
                      <span className="text-muted">{item.year}</span>
                    )}
                    {item.is_favorite && (
                      <span className="text-xs font-medium text-foreground tracking-wider mt-1 inline-block">
                        &bull; Essential
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-6 space-y-3">
                  <div>
                    <h3
                      className="text-2xl sm:text-3xl font-normal tracking-tight text-foreground"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium tracking-wide text-muted">
                      by {item.creator}
                    </p>
                  </div>

                  {item.notes && (
                    <p className="text-base text-foreground/85 leading-relaxed font-normal">
                      {item.notes}
                    </p>
                  )}

                  {item.rating && (
                    <div
                      className="flex items-center gap-1 text-xs text-foreground tracking-widest"
                      aria-label={`Rating: ${item.rating} stars`}
                    >
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <span key={i} className="text-sm leading-none">
                          &#9733;
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Link */}
                <div className="col-span-3 pt-1 md:text-right">
                  {item.external_url ? (
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.18em] uppercase text-muted hover:text-foreground transition-colors group-hover:text-foreground"
                    >
                      <span>{sourceLabel}</span>
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        ↗
                      </span>
                    </a>
                  ) : (
                    <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted/50">
                      Archive Entry
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-muted">
            <p className="text-sm font-medium tracking-[0.18em] uppercase">
              No entries found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
