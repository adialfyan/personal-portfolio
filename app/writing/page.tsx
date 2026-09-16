import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import {
  getAllPublishedWritings,
  getSiteProfile,
  getVisibleSocialLinks,
} from "@/lib/queries/public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing — Essays, Papers & Architecture Notes",
  description:
    "Technical whitepapers, systems engineering monographs, and essays on durable software architecture.",
  openGraph: {
    title: "Writing — Essays, Papers & Architecture Notes",
    description:
      "Technical whitepapers, systems engineering monographs, and essays on durable software architecture.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing — Essays, Papers & Architecture Notes",
    description:
      "Technical whitepapers, systems engineering monographs, and essays on durable software architecture.",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  paper: "Paper",
  architecture: "Architecture",
  essay: "Essay",
  note: "Field Note",
};

export default async function WritingPage() {
  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);
  const writings = await getAllPublishedWritings();

  const name = profile?.full_name || "Adi Alfian Hafis";

  return (
    <div className="flex min-h-full flex-1 flex-col" suppressHydrationWarning>
      <SiteHeader name={name} />

      <main className="flex-1">
        {/* ——— Header ——— */}
        <section className="border-b border-border bg-background pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <p
              className="text-xs font-medium tracking-[0.2em] uppercase text-muted mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Writing &bull; Archive
            </p>
            <h1
              className="max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal tracking-[-0.02em] leading-[1.04] text-foreground text-balance"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Architecture whitepapers, systems engineering &amp; essays.
            </h1>
            <p className="mt-8 max-w-2xl text-lg sm:text-xl text-muted font-normal leading-relaxed text-balance">
              Technical examinations of double-entry ledgers, banking clearing pipelines, and reflections on durable software craft.
            </p>
          </div>
        </section>

        {/* ——— Articles List ——— */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <div className="border-b border-border pb-4 mb-8 flex items-baseline justify-between text-xs font-medium tracking-[0.2em] uppercase text-muted">
              <span>Published Entries</span>
              <span>{writings.length} Documents</span>
            </div>

            <ol className="divide-y divide-border">
              {writings.map((writing, index) => {
                const dateStr = writing.published_at
                  ? new Date(writing.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent";

                const categoryLabel =
                  CATEGORY_LABELS[writing.category] ?? writing.category;

                return (
                  <li key={writing.id} className="py-10 md:py-14 first:pt-4">
                    <Link
                      href={`/writing/${writing.slug}`}
                      className="group block"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium tracking-[0.18em] uppercase text-muted">
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <span>&bull;</span>
                          <span className="text-foreground">{categoryLabel}</span>
                          <span>&bull;</span>
                          <span>{writing.reading_time_minutes} min read</span>
                        </div>
                        <span className="text-xs font-medium tracking-wider text-muted md:text-right">
                          {dateStr}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-6">
                        <div className="max-w-4xl">
                          <h2
                            className="text-2xl sm:text-3xl md:text-4xl text-foreground font-normal tracking-tight group-hover:underline transition-all"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {writing.title}
                          </h2>
                          {writing.subtitle && (
                            <p className="mt-3 text-base sm:text-lg text-muted/90 font-normal leading-relaxed">
                              {writing.subtitle}
                            </p>
                          )}
                          {writing.summary && (
                            <p className="mt-2 text-sm sm:text-base text-muted/70 font-normal leading-relaxed max-w-3xl">
                              {writing.summary}
                            </p>
                          )}
                        </div>

                        <span
                          aria-hidden="true"
                          className="text-xl text-muted group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0 pt-1"
                        >
                          ↗
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>

      <SiteFooter
        email={profile?.email ?? null}
        socialLinks={socialLinks}
        location={profile?.location ?? null}
      />
    </div>
  );
}
