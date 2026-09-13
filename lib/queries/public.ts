import { createPublicClient } from "@/lib/supabase/public";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ProjectCard,
  ProjectDetail,
  Profile,
  SocialLink,
  Technology,
} from "./types";

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

export async function getSiteProfile(): Promise<Profile | null> {
  const supabase = getDb();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getSiteProfile:", error.message);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export async function getVisibleSocialLinks(
  profileId: string | null,
): Promise<SocialLink[]> {
  if (!profileId) return [];
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

export async function getFeaturedProjects(): Promise<ProjectCard[]> {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select(projectCardSelect)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(3);
  if (error) {
    console.error("getFeaturedProjects:", error.message);
    return [];
  }
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    ...(row as object),
    technologies: mapTechnologies(
      row.project_technologies as ProjectTechJoin[] | null,
    ),
  })) as ProjectCard[];
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const supabase = getDb();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("status", "published");
  if (error) {
    console.error("getPublishedProjectSlugs:", error.message);
    return [];
  }
  return ((data ?? []) as Array<{ slug: string }>).map((r) => r.slug);
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  const supabase = getDb();
  if (!supabase) return null;
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
  if (error || !data) {
    if (error) console.error("getProjectBySlug:", error.message);
    return null;
  }
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

export async function getAdjacentProjects(
  slug: string,
): Promise<{ previous: ProjectCard | null; next: ProjectCard | null }> {
  const empty = { previous: null, next: null };
  const supabase = getDb();
  if (!supabase) return empty;
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, slug, sort_order")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getAdjacentProjects:", error.message);
    return empty;
  }
  const list = (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    sort_order: number;
  }>;
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx === -1) return empty;
  const toCard = (
    p: { id: string; title: string; slug: string } | undefined,
  ): ProjectCard | null =>
    p ? ({ ...p, technologies: [] } as unknown as ProjectCard) : null;
  return {
    previous: toCard(list[idx - 1]),
    next: toCard(list[idx + 1]),
  };
}
