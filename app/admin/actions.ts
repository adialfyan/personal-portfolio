"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Revalidate all public content after a mutation. */
export async function revalidatePublic() {
  revalidatePath("/", "layout");
}

export async function assertAdmin() {
  await requireAdmin();
}
