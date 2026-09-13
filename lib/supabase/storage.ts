import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const storageClient = createClient(url, anon);

/** Resolve a `portfolio-media/...` storage path to a public URL. */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = storageClient
    .storage
    .from("portfolio-media")
    .getPublicUrl(path);
  return data.publicUrl;
}
