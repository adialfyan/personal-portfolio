"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, removeImage } from "@/lib/supabase/upload";
import { getAllTechnologies } from "@/lib/queries/admin";

export interface ProjectFormState {
  status: "idle" | "error";
  message?: string;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function syncTechnologies(
  projectId: string,
  names: string[],
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("project_technologies")
    .delete()
    .eq("project_id", projectId);
  if (names.length === 0) return;

  const existing = await getAllTechnologies();
  const ids: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const found = existing.find((t) => t.slug === slug);
    if (found) {
      ids.push(found.id);
      continue;
    }
    const { data } = await supabase
      .from("technologies")
      .insert({ name, slug })
      .select("id")
      .single();
    if (data) ids.push((data as { id: string }).id);
  }
  if (ids.length) {
    await supabase
      .from("project_technologies")
      .insert(ids.map((technology_id) => ({ project_id: projectId, technology_id })));
  }
}

export async function saveProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin("/admin/projects");

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { status: "error", message: "Title is required." };

  const rawSlug = str(formData, "slug") ?? slugify(title);
  const slug = slugify(rawSlug);
  if (!slug) return { status: "error", message: "Slug is required." };

  const supabase = await createClient();

  // Slug uniqueness (excluding self).
  const { data: clash } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash && (clash as { id: string }).id !== id) {
    return {
      status: "error",
      message: `Slug "${slug}" is already used by another project.`,
    };
  }

  let coverPath = str(formData, "existing_cover_path");
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      const uploaded = await uploadImage(cover, "projects");
      if (coverPath) await removeImage(coverPath);
      coverPath = uploaded;
    } catch (e) {
      return {
        status: "error",
        message: e instanceof Error ? e.message : "Cover upload failed.",
      };
    }
  }

  const status = str(formData, "status") ?? "draft";
  const payload = {
    title,
    slug,
    summary: str(formData, "summary"),
    project_type: str(formData, "project_type"),
    role: str(formData, "role"),
    client: str(formData, "client"),
    year: str(formData, "year"),
    duration: str(formData, "duration"),
    status,
    is_featured: formData.get("is_featured") === "on",
    sort_order: Number(str(formData, "sort_order") ?? "0") || 0,
    cover_image_path: coverPath,
    live_url: str(formData, "live_url"),
    repository_url: str(formData, "repository_url"),
    overview: str(formData, "overview"),
    problem: str(formData, "problem"),
    approach: str(formData, "approach"),
    technical_decisions: str(formData, "technical_decisions"),
    outcome: str(formData, "outcome"),
    reflection: str(formData, "reflection"),
    updated_at: new Date().toISOString(),
    ...(status === "published"
      ? { published_at: new Date().toISOString() }
      : {}),
  };

  let projectId = id;
  if (id) {
    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...payload, created_by: (await requireAdmin()).id })
      .select("id")
      .single();
    if (error || !data) {
      return { status: "error", message: error?.message ?? "Insert failed." };
    }
    projectId = (data as { id: string }).id;
  }

  const techInput = str(formData, "technologies") ?? "";
  const names = techInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await syncTechnologies(projectId!, names);

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`/admin/projects/${projectId}`);
  }
  return { status: "idle" };
}

export async function deleteProject(formData: FormData) {
  await requireAdmin("/admin/projects");
  const id = str(formData, "id");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  const cover = (data as { cover_image_path: string | null } | null)
    ?.cover_image_path;
  if (cover) await removeImage(cover);

  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/projects");
}
