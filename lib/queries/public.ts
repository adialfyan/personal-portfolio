import { createPublicClient } from "@/lib/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ProjectCard,
  ProjectDetail,
  Profile,
  SocialLink,
  Technology,
  Writing,
  WritingCard,
  WritingCategory,
  ShelfItem,
  ShelfMediaType,
} from "./types";
import { CURATED_WRITINGS } from "@/lib/data/curated-writings";
import { CURATED_SHELF } from "@/lib/data/curated-shelf";

/**
 * Returns null when Supabase env is missing (e.g. build without env vars).
 * Callers degrade to empty defaults instead of crashing prerender.
 */
function getDb(): SupabaseClient | null {
  try {
    return createPublicClient();
  } catch {
    return null;
  }
}

interface ProjectTechJoin {
  technologies: Technology | Technology[] | null;
}

function mapTechnologies(
  join: ProjectTechJoin[] | null | undefined,
): Technology[] {
  if (!join) return [];
  const out: Technology[] = [];
  for (const row of join) {
    const t = row.technologies;
    if (Array.isArray(t)) out.push(...t);
    else if (t) out.push(t);
  }
  return out;
}

const projectCardSelect = `
  *,
  project_technologies (
    technologies ( id, name, slug )
  )
`;

import { DEFAULT_PROFILE } from "@/lib/data/profile-data";

export async function getSiteProfile(): Promise<Profile | null> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        return data as Profile;
      }
    } catch (e) {
      console.warn("getSiteProfile fallback:", e);
    }
  }
  return DEFAULT_PROFILE;
}

export async function getVisibleSocialLinks(
  profileId: string | null,
): Promise<SocialLink[]> {
  if (!profileId || profileId === "00000000-0000-0000-0000-000000000000") return [];
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getVisibleSocialLinks:", error.message);
    return [];
  }
  return (data as SocialLink[]) ?? [];
}

import { CURATED_PROJECTS } from "@/lib/data/curated-projects";

export async function getFeaturedProjects(): Promise<ProjectCard[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(projectCardSelect)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .limit(10);
      if (!error && data && data.length > 0) {
        return (data as Array<Record<string, unknown>>).map((row) => ({
          ...(row as object),
          technologies: mapTechnologies(
            row.project_technologies as ProjectTechJoin[] | null,
          ),
        })) as ProjectCard[];
      }
    } catch (e) {
      console.warn("getFeaturedProjects using curated fallback:", e);
    }
  }
  return CURATED_PROJECTS;
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("slug")
        .eq("status", "published");
      if (!error && data && data.length > 0) {
        return data.map((r) => r.slug);
      }
    } catch (e) {
      console.warn("getPublishedProjectSlugs fallback:", e);
    }
  }
  return CURATED_PROJECTS.map((p) => p.slug);
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `${projectCardSelect},
           project_links ( id, project_id, type, label, url, sort_order ),
           project_media ( id, project_id, image_path, caption, sort_order )`,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .order("sort_order", {
          referencedTable: "project_links",
          ascending: true,
        })
        .order("sort_order", {
          referencedTable: "project_media",
          ascending: true,
        })
        .maybeSingle();
      if (!error && data) {
        const row = data as Record<string, unknown>;
        return {
          ...(row as object),
          technologies: mapTechnologies(
            row.project_technologies as ProjectTechJoin[] | null,
          ),
          links: (row.project_links ?? []) as ProjectDetail["links"],
          media: (row.project_media ?? []) as ProjectDetail["media"],
        } as ProjectDetail;
      }
    } catch (e) {
      console.warn("getProjectBySlug fallback:", e);
    }
  }
  return CURATED_PROJECTS.find((p) => p.slug === slug) ?? null;
}

export async function getAdjacentProjects(
  slug: string,
): Promise<{ previous: ProjectCard | null; next: ProjectCard | null }> {
  const empty = { previous: null, next: null };
  const supabase = getDb();
  let list: Array<{ id: string; title: string; slug: string }> = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, slug, sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        list = data;
      }
    } catch (e) {
      console.warn("getAdjacentProjects fallback:", e);
    }
  }

  if (list.length === 0) {
    list = CURATED_PROJECTS.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
    }));
  }

  const idx = list.findIndex((p) => p.slug === slug);
  if (idx === -1) return empty;

  const toCard = (
    p: { id: string; title: string; slug: string } | undefined,
  ): ProjectCard | null => {
    if (!p) return null;
    const full = CURATED_PROJECTS.find((c) => c.slug === p.slug);
    if (full) return full;
    return { ...p, technologies: [] } as unknown as ProjectCard;
  };

  return {
    previous: toCard(list[idx - 1]),
    next: toCard(list[idx + 1]),
  };
}

// ---------------------------------------------------------------------------
// Writings (Papers, Essays, Notes) Public Queries
// ---------------------------------------------------------------------------
export async function getFeaturedWritings(): Promise<WritingCard[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("writings")
        .select("id, title, slug, subtitle, summary, category, reading_time_minutes, status, is_featured, sort_order, cover_image_path, published_at, created_at, updated_at")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as WritingCard[];
      }
    } catch (e) {
      console.warn("getFeaturedWritings fallback:", e);
    }
  }
  return CURATED_WRITINGS.filter((w) => w.is_featured).map(({ content: _, ...rest }) => rest);
}

export async function getAllPublishedWritings(category?: WritingCategory): Promise<WritingCard[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      let query = supabase
        .from("writings")
        .select("id, title, slug, subtitle, summary, category, reading_time_minutes, status, is_featured, sort_order, cover_image_path, published_at, created_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (category) {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as WritingCard[];
      }
    } catch (e) {
      console.warn("getAllPublishedWritings fallback:", e);
    }
  }
  return CURATED_WRITINGS
    .filter((w) => (category ? w.category === category : true))
    .map(({ content: _, ...rest }) => rest);
}

export async function getPublishedWritingSlugs(): Promise<string[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("writings")
        .select("slug")
        .eq("status", "published");
      if (!error && data && data.length > 0) {
        return data.map((r) => r.slug);
      }
    } catch (e) {
      console.warn("getPublishedWritingSlugs fallback:", e);
    }
  }
  return CURATED_WRITINGS.map((w) => w.slug);
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("writings")
        .select("*, writing_tags(tag)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!error && data) {
        const row = data as Record<string, unknown>;
        const tags = Array.isArray(row.writing_tags)
          ? (row.writing_tags as Array<{ tag: string }>).map((t) => t.tag)
          : [];
        return {
          ...(row as object),
          tags,
        } as Writing;
      }
    } catch (e) {
      console.warn("getWritingBySlug fallback:", e);
    }
  }
  return CURATED_WRITINGS.find((w) => w.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Shelf (Films, Music, Books) Public Queries
// ---------------------------------------------------------------------------
export async function getShelfItems(mediaType?: ShelfMediaType): Promise<ShelfItem[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      let query = supabase
        .from("shelf_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("logged_at", { ascending: false });
      if (mediaType) {
        query = query.eq("media_type", mediaType);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as ShelfItem[];
      }
    } catch (e) {
      console.warn("getShelfItems fallback:", e);
    }
  }
  return CURATED_SHELF.filter((item) => (mediaType ? item.media_type === mediaType : true));
}

export async function getFavoriteShelfItems(): Promise<ShelfItem[]> {
  const supabase = getDb();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("shelf_items")
        .select("*")
        .eq("is_favorite", true)
        .order("sort_order", { ascending: true })
        .order("logged_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as ShelfItem[];
      }
    } catch (e) {
      console.warn("getFavoriteShelfItems fallback:", e);
    }
  }
  return CURATED_SHELF.filter((item) => item.is_favorite);
}

