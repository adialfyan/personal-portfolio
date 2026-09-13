import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less public client for anonymous reads.
 * Safe for build-time (generateStaticParams/sitemap) and public pages —
 * RLS public policies govern access, no session needed.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing Supabase public environment variables.");
  }
  return createClient(url, anon);
}
