import { createClient } from "@/lib/supabase/server";

export type MessageStatus = "unread" | "read" | "archived" | "spam";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
  read_at: string | null;
}

export async function getMessages(
  status: MessageStatus | "all",
): Promise<ContactMessage[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) {
    console.error("getMessages:", error.message);
    return [];
  }
  return (data as ContactMessage[]) ?? [];
}

export async function getMessageById(
  id: string,
): Promise<ContactMessage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getMessageById:", error.message);
    return null;
  }
  return data as ContactMessage;
}
