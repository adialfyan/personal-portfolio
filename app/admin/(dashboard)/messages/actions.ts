"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { MessageStatus } from "@/lib/queries/messages";

const STATUSES: MessageStatus[] = ["unread", "read", "archived", "spam"];

export async function setMessageStatus(formData: FormData) {
  await requireAdmin("/admin/messages");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as MessageStatus)) return;

  const supabase = await createClient();
  await supabase
    .from("contact_messages")
    .update({
      status,
      read_at:
        status === "read" || status === "archived"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);

  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
