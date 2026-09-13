"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminProfile } from "@/lib/queries/admin";

export interface SocialFormState {
  status: "idle" | "error";
  message?: string;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

export async function saveSocialLink(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  await requireAdmin("/admin/social-links");

  const platform = str(formData, "platform");
  const url = str(formData, "url");
  if (!platform) return { status: "error", message: "Platform is required." };
  if (!url) return { status: "error", message: "URL is required." };

  const profile = await getAdminProfile();
  const supabase = await createClient();
  const id = str(formData, "id");

  const payload = {
    profile_id: profile?.id ?? null,
    platform,
    label: str(formData, "label"),
    url,
    sort_order: Number(str(formData, "sort_order") ?? "0") || 0,
    is_visible: formData.get("is_visible") === "on",
  };

  if (id) {
    const { error } = await supabase
      .from("social_links")
      .update(payload)
      .eq("id", id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { error } = await supabase.from("social_links").insert(payload);
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");
  return { status: "idle" };
}

export async function deleteSocialLink(formData: FormData) {
  await requireAdmin("/admin/social-links");
  const id = str(formData, "id");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("social_links").delete().eq("id", id);
  revalidatePath("/", "layout");
}
