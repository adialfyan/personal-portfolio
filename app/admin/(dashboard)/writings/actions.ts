"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, removeImage } from "@/lib/supabase/upload";

export interface WritingFormState {
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

async function syncWritingTags(writingId: string, tags: string[]): Promise<void> {
  const supabase = await createClient();
  await supabase.from("writing_tags").delete().eq("writing_id", writingId);
  if (tags.length === 0) return;

  const records = tags.map((tag) => ({
    writing_id: writingId,
    tag: tag.toLowerCase().trim(),
  }));

  await supabase.from("writing_tags").insert(records);
}

export async function saveWriting(
  _prev: WritingFormState,
  formData: FormData
): Promise<WritingFormState> {
  const admin = await requireAdmin("/admin/writings");

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { status: "error", message: "Title is required." };

  const rawSlug = str(formData, "slug") ?? slugify(title);
  const slug = slugify(rawSlug);
  if (!slug) return { status: "error", message: "Slug is required." };

  const content = str(formData, "content") ?? "";
  if (!content) return { status: "error", message: "Content is required." };

  const supabase = await createClient();

  // Slug uniqueness
  const { data: clash } = await supabase
    .from("writings")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash && (clash as { id: string }).id !== id) {
    return {
      status: "error",
      message: `Slug "${slug}" is already used by another writing.`,
    };
  }

  let coverPath = str(formData, "existing_cover_path");
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      const uploaded = await uploadImage(cover, "writings");
      if (coverPath) await removeImage(coverPath);
      coverPath = uploaded;
    } catch (e) {
      return {
        status: "error",
        message: e instanceof Error ? e.message : "Cover upload failed.",
      };
    }
  }

  // Calculate reading time (words / 200 wpm, minimum 1 min)
  const wordCount = content.trim().split(/\s+/).length;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));
  const readingTime = Number(str(formData, "reading_time_minutes")) || calculatedReadingTime;

  const status = str(formData, "status") ?? "draft";
  const category = str(formData, "category") ?? "paper";

  const payload = {
    title,
    slug,
    subtitle: str(formData, "subtitle"),
    summary: str(formData, "summary"),
    content,
    category,
    reading_time_minutes: readingTime,
    status,
    is_featured: formData.get("is_featured") === "on",
    sort_order: Number(str(formData, "sort_order") ?? "0") || 0,
    cover_image_path: coverPath,
    updated_at: new Date().toISOString(),
    ...(status === "published"
      ? { published_at: new Date().toISOString() }
      : {}),
  };

  let writingId = id;
  if (id) {
    const { error } = await supabase
      .from("writings")
      .update(payload)
      .eq("id", id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { data, error } = await supabase
      .from("writings")
      .insert({ ...payload, created_by: admin.id })
      .select("id")
      .single();
    if (error || !data) {
      return { status: "error", message: error?.message ?? "Insert failed." };
    }
    writingId = (data as { id: string }).id;
  }

  const tagInput = str(formData, "tags") ?? "";
  const tags = tagInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await syncWritingTags(writingId!, tags);

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`/admin/writings/${writingId}`);
  }
  return { status: "idle" };
}

export async function deleteWriting(formData: FormData) {
  await requireAdmin("/admin/writings");
  const id = str(formData, "id");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("writings")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  const cover = (data as { cover_image_path: string | null } | null)
    ?.cover_image_path;
  if (cover) await removeImage(cover);

  await supabase.from("writings").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/writings");
}
