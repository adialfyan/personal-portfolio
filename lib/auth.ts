import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

/** Current auth user, or null. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require an authenticated user that is present in `admin_users`.
 * Redirects to login otherwise.
 *
 * Uses the `is_admin()` RPC (SECURITY DEFINER) so it does not depend on a
 * SELECT policy over `admin_users`.
 */
export async function requireAdmin(nextPath = "/admin"): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    redirect("/admin/login?error=not_admin");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      (user.user_metadata?.display_name as string | undefined) ?? null,
  };
}
