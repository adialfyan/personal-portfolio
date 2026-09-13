import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Server-only. Bypasses RLS.
 * Use only after verifying the caller is an admin.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    throw new Error("Missing Supabase service-role environment variables.");
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
