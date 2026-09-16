export interface Profile {
  id: string;
  full_name: string | null;
  professional_title: string | null;
  short_intro: string | null;
  long_bio: string | null;
  location: string | null;
  timezone: string | null;
  available_for_work: boolean;
  availability_text: string | null;
  email: string | null;
  resume_url: string | null;
  portrait_path: string | null;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  profile_id: string | null;
  platform: string;
  label: string | null;
  url: string;
  sort_order: number;
  is_visible: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  project_type: string | null;
  role: string | null;
  client: string | null;
  year: string | null;
  duration: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  cover_image_path: string | null;
  live_url: string | null;
  repository_url: string | null;
  overview: string | null;
  problem: string | null;
  approach: string | null;
  technical_decisions: string | null;
  outcome: string | null;
  reflection: string | null;
  published_at: string | null;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  type: string | null;
  label: string | null;
  url: string;
  sort_order: number;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
}

export interface ProjectCard extends Project {
  technologies: Technology[];
}

export interface ProjectDetail extends Project {
  technologies: Technology[];
  links: ProjectLink[];
  media: ProjectMedia[];
}

// ---------------------------------------------------------------------------
// Writings (Papers, Essays, Notes, Architecture Whitepapers)
// ---------------------------------------------------------------------------
export type WritingCategory = "paper" | "essay" | "note" | "architecture";

export interface Writing {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  summary: string | null;
  content: string;
  category: WritingCategory;
  reading_time_minutes: number;
  status: string;
  is_featured: boolean;
  sort_order: number;
  cover_image_path: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export type WritingCard = Omit<Writing, "content">;

// ---------------------------------------------------------------------------
// Shelf (Films, Music, Books, Curated Culture Archive)
// ---------------------------------------------------------------------------
export type ShelfMediaType = "film" | "music" | "book" | "article";

export interface ShelfItem {
  id: string;
  title: string;
  media_type: ShelfMediaType;
  creator: string;
  year: string | null;
  notes: string | null;
  rating: number | null;
  cover_image_path: string | null;
  external_url: string | null;
  is_favorite: boolean;
  sort_order: number;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

