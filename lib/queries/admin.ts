import { createClient } from "@/lib/supabase/server";
import type { Profile, ProjectDetail, SocialLink, Technology, Writing, ShelfItem } from "./types";

export async function getAdminProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getAdminProfile:", error.message);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export interface AdminProjectListItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  year: string | null;
  updated_at: string;
}

export async function getAllProjects(): Promise<AdminProjectListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, slug, status, is_featured, sort_order, year, updated_at")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("getAllProjects:", error.message);
    return [];
  }
  return (data as AdminProjectListItem[]) ?? [];
}

export async function getAdminProjectById(
  id: string,
): Promise<ProjectDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `*,
       project_technologies ( technologies ( id, name, slug ) ),
       project_links ( id, project_id, type, label, url, sort_order ),
       project_media ( id, project_id, image_path, caption, sort_order )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getAdminProjectById:", error.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  const join = (row.project_technologies ?? []) as {
    technologies: { id: string; name: string; slug: string } | null;
  }[];
  const technologies = join
    .map((j) => j.technologies)
    .filter((t): t is { id: string; name: string; slug: string } => Boolean(t));
  return {
    ...(row as object),
    technologies,
    links: (row.project_links ?? []) as ProjectDetail["links"],
    media: (row.project_media ?? []) as ProjectDetail["media"],
  } as ProjectDetail;
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getAllSocialLinks:", error.message);
    return [];
  }
  return (data as SocialLink[]) ?? [];
}

export async function getMessageStats() {
  const supabase = await createClient();
  const { count: unread } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "unread");
  return { unread: unread ?? 0 };
}

export async function getAllTechnologies(): Promise<Technology[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technologies")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("getAllTechnologies:", error.message);
    return [];
  }
  return (data as Technology[]) ?? [];
}

// ---------------------------------------------------------------------------
// Writings Admin Queries
// ---------------------------------------------------------------------------
export interface AdminWritingListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  reading_time_minutes: number;
  status: string;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  updated_at: string;
}

export async function getAllWritingsAdmin(): Promise<AdminWritingListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("writings")
    .select("id, title, slug, category, reading_time_minutes, status, is_featured, sort_order, published_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("getAllWritingsAdmin:", error.message);
    return [];
  }
  return (data as AdminWritingListItem[]) ?? [];
}

export async function getAdminWritingById(id: string): Promise<Writing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("writings")
    .select("*, writing_tags(tag)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getAdminWritingById:", error.message);
    return null;
  }
  const row = data as Record<string, unknown>;
  const tags = Array.isArray(row.writing_tags)
    ? (row.writing_tags as Array<{ tag: string }>).map((t) => t.tag)
    : [];
  return {
    ...(row as object),
    tags,
  } as Writing;
}

// ---------------------------------------------------------------------------
// Shelf Admin Queries
// ---------------------------------------------------------------------------
export async function getAllShelfItemsAdmin(): Promise<ShelfItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelf_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("logged_at", { ascending: false });
  if (error) {
    console.error("getAllShelfItemsAdmin:", error.message);
    return [];
  }
  return (data as ShelfItem[]) ?? [];
}

export async function getAdminShelfItemById(id: string): Promise<ShelfItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelf_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getAdminShelfItemById:", error.message);
    return null;
  }
  return data as ShelfItem;
}

