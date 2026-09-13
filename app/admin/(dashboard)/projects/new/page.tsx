import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  await requireAdmin("/admin/projects/new");

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/projects" className="hover:text-accent">
          Projects
        </Link>{" "}
        / New
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        New project
      </h1>
      <ProjectForm project={null} />
    </div>
  );
}
