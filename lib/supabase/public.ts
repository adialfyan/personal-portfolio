import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less public client for anonymous reads.
 * Safe for build-time (generateStaticParams/sitemap) and public pages —
 * RLS public policies govern access, no session needed.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
