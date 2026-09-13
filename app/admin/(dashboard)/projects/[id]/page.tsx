import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminProjectById } from "@/lib/queries/admin";
import { deleteProject } from "../actions";
import { ProjectForm } from "../project-form";

export default async function EditProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/projects/${id}`);

  const project = await getAdminProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/projects" className="hover:text-accent">
          Projects
        </Link>{" "}
        / {project.slug}
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {project.title}
      </h1>
      <ProjectForm project={project} deleteAction={deleteProject} />
    </div>
  );
}
