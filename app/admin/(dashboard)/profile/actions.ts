"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/supabase/upload";
import { getAdminProfile } from "@/lib/queries/admin";

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

export async function saveProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin("/admin/profile");

  const existing = await getAdminProfile();

  let portraitPath = existing?.portrait_path ?? null;
  const portrait = formData.get("portrait");
  if (portrait instanceof File && portrait.size > 0) {
    try {
      portraitPath = await uploadImage(portrait, "profile");
    } catch (e) {
      return {
        status: "error",
        message: e instanceof Error ? e.message : "Upload failed.",
      };
    }
  }

  const payload = {
    full_name: str(formData, "full_name"),
    professional_title: str(formData, "professional_title"),
    short_intro: str(formData, "short_intro"),
    long_bio: str(formData, "long_bio"),
    location: str(formData, "location"),
    timezone: str(formData, "timezone"),
    available_for_work: formData.get("available_for_work") === "on",
    availability_text: str(formData, "availability_text"),
    email: str(formData, "email"),
    resume_url: str(formData, "resume_url"),
    portrait_path: portraitPath,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();

  if (existing) {
    const { error } = await supabase
      .from("profile")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      return { status: "error", message: error.message };
    }
  } else {
    const { error } = await supabase.from("profile").insert(payload);
    if (error) {
      return { status: "error", message: error.message };
    }
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}
