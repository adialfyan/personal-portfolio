import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/public/markdown-renderer";
import { ReadingProgress } from "@/components/public/reading-progress";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import {
  getPublishedWritingSlugs,
  getSiteProfile,
  getVisibleSocialLinks,
  getWritingBySlug,
} from "@/lib/queries/public";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedWritingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  if (!writing) return { title: "Document Not Found" };

  const description = writing.summary ?? writing.subtitle ?? "Technical whitepaper & systems monograph.";

  return {
    title: `${writing.title} — Writing`,
    description,
    openGraph: {
      title: `${writing.title} — Writing`,
      description,
      type: "article",
      publishedTime: writing.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${writing.title} — Writing`,
      description,
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  paper: "Paper",
  architecture: "Architecture",
  essay: "Essay",
  note: "Field Note",
};

export default async function WritingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);

  if (!writing) {
    notFound();
  }

  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);
  const name = profile?.full_name || "Adi Alfian Hafis";

  const dateStr = writing.published_at
    ? new Date(writing.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const categoryLabel =
    CATEGORY_LABELS[writing.category] ?? writing.category;

  return (
    <div className="flex min-h-full flex-1 flex-col" suppressHydrationWarning>
      <ReadingProgress />
      <SiteHeader name={name} />

      <main className="flex-1">
        <article className="mx-auto max-w-[1440px] px-6 pt-12 pb-24 md:px-10 md:pt-20 md:pb-32">
          
          {/* Breadcrumb & Metadata Header */}
          <div className="max-w-4xl">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted mb-8">
              <Link href="/writing" className="hover:text-foreground transition-colors">
                Writing
              </Link>
              <span className="mx-2.5">&mdash;</span>
              <span className="text-foreground">{categoryLabel}</span>
            </p>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.02em] leading-[1.08] text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {writing.title}
            </h1>

            {writing.subtitle && (
              <p className="mt-6 text-xl sm:text-2xl text-muted font-normal leading-relaxed">
                {writing.subtitle}
              </p>
            )}

            {/* Meta Strip */}
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs font-medium tracking-[0.18em] uppercase text-muted">
              <div className="flex flex-wrap items-center gap-3">
                {dateStr && <span>{dateStr}</span>}
                {dateStr && <span>&bull;</span>}
                <span>{writing.reading_time_minutes} min read</span>
              </div>

              {writing.tags && writing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {writing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border/80 px-2.5 py-1 text-[10px] tracking-wider text-muted rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article Markdown Body */}
          <div className="mt-16 pt-12 border-t border-border/60 max-w-3xl">
            <MarkdownRenderer content={writing.content} />
          </div>

          {/* Back Navigation */}
          <div className="mt-20 pt-10 border-t border-border max-w-3xl">
            <Link
              href="/writing"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted hover:text-foreground transition-colors"
            >
              <span>&larr;</span>
              <span>All Writings</span>
            </Link>
          </div>

        </article>
      </main>

      <SiteFooter
        email={profile?.email ?? null}
        socialLinks={socialLinks}
        location={profile?.location ?? null}
      />
    </div>
  );
}
