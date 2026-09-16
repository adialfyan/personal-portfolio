"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, removeImage } from "@/lib/supabase/upload";

export interface ShelfFormState {
  status: "idle" | "error";
  message?: string;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

export async function saveShelfItem(
  _prev: ShelfFormState,
  formData: FormData
): Promise<ShelfFormState> {
  const admin = await requireAdmin("/admin/shelf");

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { status: "error", message: "Title is required." };

  const creator = str(formData, "creator");
  if (!creator) return { status: "error", message: "Creator / Author / Director is required." };

  const mediaType = str(formData, "media_type") ?? "film";

  const supabase = await createClient();

  let coverPath = str(formData, "existing_cover_path");
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      const uploaded = await uploadImage(cover, "shelf");
      if (coverPath) await removeImage(coverPath);
      coverPath = uploaded;
    } catch (e) {
      return {
        status: "error",
        message: e instanceof Error ? e.message : "Cover upload failed.",
      };
    }
  }

  const ratingStr = str(formData, "rating");
  const rating = ratingStr ? Math.min(5, Math.max(1, parseInt(ratingStr, 10))) : null;

  const payload = {
    title,
    media_type: mediaType,
    creator,
    year: str(formData, "year"),
    notes: str(formData, "notes"),
    rating,
    cover_image_path: coverPath,
    external_url: str(formData, "external_url"),
    is_favorite: formData.get("is_favorite") === "on",
    sort_order: Number(str(formData, "sort_order") ?? "0") || 0,
    logged_at: str(formData, "logged_at") ?? new Date().toISOString().split("T")[0],
    updated_at: new Date().toISOString(),
  };

  let shelfId = id;
  if (id) {
    const { error } = await supabase
      .from("shelf_items")
      .update(payload)
      .eq("id", id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { data, error } = await supabase
      .from("shelf_items")
      .insert({ ...payload, created_by: admin.id })
      .select("id")
      .single();
    if (error || !data) {
      return { status: "error", message: error?.message ?? "Insert failed." };
    }
    shelfId = (data as { id: string }).id;
  }

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`/admin/shelf/${shelfId}`);
  }
  return { status: "idle" };
}

export async function deleteShelfItem(formData: FormData) {
  await requireAdmin("/admin/shelf");
  const id = str(formData, "id");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("shelf_items")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  const cover = (data as { cover_image_path: string | null } | null)
    ?.cover_image_path;
  if (cover) await removeImage(cover);

  await supabase.from("shelf_items").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/shelf");
}
