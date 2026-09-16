import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllShelfItemsAdmin } from "@/lib/queries/admin";

export default async function ShelfAdminPage() {
  await requireAdmin("/admin/shelf");
  const items = await getAllShelfItemsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="text-4xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shelf
        </h1>
        <Link
          href="/admin/shelf/new"
          className="bg-dark px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-neutral-800"
        >
          + Add item
        </Link>
      </div>
      <p className="mt-2 mb-10 leading-relaxed text-muted">
        Manage films, vinyl / music records, and foundational literature. Items are displayed in /shelf and curator picks appear on the homepage.
      </p>

      {items.length === 0 ? (
        <p className="border-t border-border py-6 leading-relaxed text-muted">
          No items on the shelf yet.
        </p>
      ) : (
        <div className="border-t border-border">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/shelf/${item.id}`}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border py-4 hover:text-accent"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-muted">
                  {String(item.sort_order).padStart(2, "0")}
                </span>
                <span
                  className="text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </span>
                <span className="text-xs text-muted">by {item.creator}</span>
              </span>
              <span className="flex flex-wrap items-center gap-4 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                <span className="text-foreground">{item.media_type}</span>
                {item.year && <span>{item.year}</span>}
                {item.rating && <span>{item.rating}★</span>}
                {item.is_favorite && <span className="text-accent">Curator Pick</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
