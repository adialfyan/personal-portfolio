"use client";

import { useActionState, useState } from "react";
import type { ProjectDetail } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";
import { saveProject, type ProjectFormState } from "./actions";

const initial: ProjectFormState = { status: "idle" };

const field =
  "w-full border border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted focus:border-accent";
const label =
  "mb-2 block font-mono text-xs tracking-[0.2em] uppercase text-muted";

interface Props {
  project: ProjectDetail | null;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}

export function ProjectForm({ project, deleteAction }: Props) {
  const [state, action, pending] = useActionState(saveProject, initial);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const coverUrl = getMediaUrl(project?.cover_image_path);

  function handleTitle(value: string) {
    setTitle(value);
    if (!project) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  }

  const techDefault = (project?.technologies ?? [])
    .map((t) => t.name)
    .join(", ");

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {project && <input type="hidden" name="id" value={project.id} />}
      {project?.cover_image_path && (
        <input
          type="hidden"
          name="existing_cover_path"
          value={project.cover_image_path}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Title *</span>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Slug *</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className={label}>One-line summary</span>
        <textarea
          name="summary"
          rows={2}
          defaultValue={project?.summary ?? ""}
          className={`${field} resize-y`}
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Project type</span>
          <input
            name="project_type"
            defaultValue={project?.project_type ?? ""}
            placeholder="Web application"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Role</span>
          <input
            name="role"
            defaultValue={project?.role ?? ""}
            placeholder="Full-stack Developer"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Client</span>
          <input
            name="client"
            defaultValue={project?.client ?? ""}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Year</span>
          <input
            name="year"
            defaultValue={project?.year ?? ""}
            placeholder="2026"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Duration</span>
          <input
            name="duration"
            defaultValue={project?.duration ?? ""}
            placeholder="6 weeks"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Sort order</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={project?.sort_order ?? 0}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Status</span>
          <select
            name="status"
            defaultValue={project?.status ?? "draft"}
            className={field}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="block">
          <span className={label}>Live URL</span>
          <input
            name="live_url"
            defaultValue={project?.live_url ?? ""}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Repository URL</span>
          <input
            name="repository_url"
            defaultValue={project?.repository_url ?? ""}
            className={field}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_featured"
          name="is_featured"
          type="checkbox"
          defaultChecked={project?.is_featured ?? false}
          className="h-4 w-4 accent-[#ff4f00]"
        />
        <label htmlFor="is_featured" className={label + " mb-0"}>
          Featured on homepage
        </label>
      </div>

      <label className="block">
        <span className={label}>Technologies (comma-separated)</span>
        <input
          name="technologies"
          defaultValue={techDefault}
          placeholder="Next.js, TypeScript, Supabase"
          className={field}
        />
        <span className="mt-2 block text-xs text-muted">
          New names are created automatically.
        </span>
      </label>

      <label className="block">
        <span className={label}>Cover image</span>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt="Current cover"
            className="mb-3 h-40 border border-border object-cover"
          />
        )}
        <input
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="block w-full text-sm text-muted file:mr-4 file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-xs file:tracking-[0.2em] file:uppercase"
        />
      </label>

      <div className="space-y-6 border-t border-border pt-8">
        {(
          [
            ["overview", "Overview"],
            ["problem", "Problem"],
            ["approach", "Approach"],
            ["technical_decisions", "Technical Decisions"],
            ["outcome", "Outcome"],
            ["reflection", "Reflection"],
          ] as const
        ).map(([key, text]) => (
          <label key={key} className="block">
            <span className={label}>{text}</span>
            <textarea
              name={key}
              rows={4}
              defaultValue={(project?.[key] as string | null) ?? ""}
              className={`${field} resize-y`}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Saving…" : project ? "Save changes" : "Create project"}
        </button>
        {state.status === "error" && (
          <span role="alert" className="text-sm text-accent">
            {state.message}
          </span>
        )}
        {project && deleteAction && (
          <button
            type="submit"
            formAction={deleteAction}
            className="ml-auto font-mono text-xs tracking-[0.2em] uppercase text-muted hover:text-accent"
          >
            Delete project
          </button>
        )}
      </div>
    </form>
  );
}
