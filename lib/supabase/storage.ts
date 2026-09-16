import { createClient } from "@supabase/supabase-js";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    return createClient(url, anon);
  } catch {
    return null;
  }
}

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (
    path.startsWith("/") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  const client = getStorageClient();
  if (!client) return null;
  const { data } = client.storage.from("portfolio-media").getPublicUrl(path);
  return data.publicUrl;
}
