import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllWritingsAdmin } from "@/lib/queries/admin";

export default async function WritingsAdminPage() {
  await requireAdmin("/admin/writings");
  const writings = await getAllWritingsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="text-4xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Writings
        </h1>
        <Link
          href="/admin/writings/new"
          className="bg-dark px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-neutral-800"
        >
          + New writing
        </Link>
      </div>
      <p className="mt-2 mb-10 leading-relaxed text-muted">
        Manage technical whitepapers, system architecture monographs, and essays. Published writings appear in /writing and featured ones on the homepage.
      </p>

      {writings.length === 0 ? (
        <p className="border-t border-border py-6 leading-relaxed text-muted">
          No writings yet.
        </p>
      ) : (
        <div className="border-t border-border">
          {writings.map((w) => (
            <Link
              key={w.id}
              href={`/admin/writings/${w.id}`}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border py-4 hover:text-accent"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-muted">
                  {String(w.sort_order).padStart(2, "0")}
                </span>
                <span
                  className="text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {w.title}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-4 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                <span className="text-foreground">{w.category}</span>
                <span>{w.reading_time_minutes}m read</span>
                {w.is_featured && <span className="text-accent">Featured</span>}
                <span
                  className={
                    w.status === "published" ? "text-foreground font-semibold" : undefined
                  }
                >
                  {w.status}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
