import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "@/lib/validations/contact";

// Tiny in-memory rate limit: 5 submissions / 10 min per IP.
// Single-instance best effort; upgrade to Turnstile/Redis if abused.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_HITS) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return null;
  return createClient(url, secret);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  // Honeypot filled → act like it worked, drop silently.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabase = serviceClient();
  if (!supabase) {
    console.error("contact API: missing Supabase server env");
    return NextResponse.json(
      { error: "Message service is not configured." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
    status: "unread",
  });

  if (error) {
    console.error("contact API insert:", error.message);
    return NextResponse.json(
      { error: "Could not save your message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
