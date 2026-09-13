import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects } from "@/lib/queries/admin";

export default async function ProjectsPage() {
  await requireAdmin("/admin/projects");
  const projects = await getAllProjects();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1
          className="text-4xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="bg-dark px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent"
        >
          + New project
        </Link>
      </div>
      <p className="mt-2 mb-10 leading-relaxed text-muted">
        Only published projects appear on the public site. Featured projects
        (up to three) show on the homepage.
      </p>

      {projects.length === 0 ? (
        <p className="border-t border-border py-6 leading-relaxed text-muted">
          No projects yet.
        </p>
      ) : (
        <div className="border-t border-border">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}`}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border py-4 hover:text-accent"
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-muted">
                  {String(p.sort_order).padStart(2, "0")}
                </span>
                <span
                  className="text-xl tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-4 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                <span>/{p.slug}</span>
                {p.year && <span>{p.year}</span>}
                {p.is_featured && <span className="text-accent">Featured</span>}
                <span
                  className={
                    p.status === "published" ? "text-foreground" : undefined
                  }
                >
                  {p.status}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
