"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  status: "idle" | "sent" | "error";
  message?: string;
}

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (host ? `${proto}://${host}` : "http://localhost:3000");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/admin`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Could not send the magic link.",
    };
  }

  return {
    status: "sent",
    message: `Check ${email} for a sign-in link.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
