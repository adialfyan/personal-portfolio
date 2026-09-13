import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects, getMessageStats } from "@/lib/queries/admin";

export default async function AdminOverview() {
  const admin = await requireAdmin("/admin");
  const [projects, stats] = await Promise.all([
    getAllProjects(),
    getMessageStats(),
  ]);

  const counts = {
    total: projects.length,
    published: projects.filter((p) => p.status === "published").length,
    drafts: projects.filter((p) => p.status === "draft").length,
    featured: projects.filter((p) => p.is_featured).length,
  };

  return (
    <div>
      <h1
        className="text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Overview
      </h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {admin.displayName ?? admin.email}
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Projects", value: counts.total, href: "/admin/projects" },
          { label: "Published", value: counts.published, href: "/admin/projects" },
          { label: "Drafts", value: counts.drafts, href: "/admin/projects" },
          { label: "Unread messages", value: stats.unread, href: "/admin/messages" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-border p-5 transition-colors hover:border-accent"
          >
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
              {card.label}
            </p>
            <p
              className="mt-2 text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {String(card.value).padStart(2, "0")}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex items-baseline justify-between">
        <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
          Recent projects
        </h2>
        <Link
          href="/admin/projects"
          className="font-mono text-xs tracking-[0.2em] uppercase hover:text-accent"
        >
          Manage →
        </Link>
      </div>

      <div className="mt-4">
        {projects.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={`/admin/projects/${p.id}`}
            className="flex items-center justify-between border-t border-border py-4 last:border-b hover:text-accent"
          >
            <span className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted">
                {String(p.sort_order).padStart(2, "0")}
              </span>
              <span>{p.title}</span>
            </span>
            <span className="flex items-center gap-4 font-mono text-xs tracking-[0.2em] uppercase text-muted">
              {p.is_featured && <span className="text-accent">Featured</span>}
              <span>{p.status}</span>
            </span>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="border-t border-border py-6 text-sm text-muted">
            No projects yet.{" "}
            <Link href="/admin/projects/new" className="text-accent">
              Create one ↗
            </Link>
          </p>
        )}
      </div>

      {counts.featured !== 3 && (
        <p className="mt-8 text-sm text-muted">
          Homepage shows up to 3 featured projects. Currently {counts.featured}{" "}
          featured.
        </p>
      )}
    </div>
  );
}
