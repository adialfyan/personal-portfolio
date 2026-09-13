import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/public/reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getPublishedProjectSlugs,
  getSiteProfile,
  getVisibleSocialLinks,
} from "@/lib/queries/public";
import { getMediaUrl } from "@/lib/supabase/storage";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary ?? project.overview ?? undefined,
  };
}

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "problem", label: "Problem" },
  { key: "approach", label: "Approach" },
  { key: "technical_decisions", label: "Technical Decisions" },
  { key: "outcome", label: "Outcome" },
  { key: "reflection", label: "Reflection" },
] as const;

export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [profile, adjacent] = await Promise.all([
    getSiteProfile(),
    getAdjacentProjects(slug),
  ]);
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);

  const name = profile?.full_name ?? "Personal Portfolio";
  const coverUrl = getMediaUrl(project.cover_image_path);
  const sections = SECTIONS.filter((s) => project[s.key]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader name={name} />

      <main className="flex-1">
        <section className="mx-auto max-w-[1440px] px-6 pt-14 pb-12 md:px-10 md:pt-20">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
            <Link href="/#work" className="hover:text-accent">
              Work
            </Link>{" "}
            / {project.year ?? "—"}
          </p>
          <h1
            className="mt-6 max-w-6xl text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.title}
          </h1>
          {project.summary && (
            <p className="mt-6 max-w-2xl text-xl leading-relaxed">
              {project.summary}
            </p>
          )}

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8 font-mono text-xs tracking-[0.2em] uppercase md:grid-cols-4">
            {project.role && (
              <div>
                <dt className="text-muted">Role</dt>
                <dd className="mt-2">{project.role}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt className="text-muted">Year</dt>
                <dd className="mt-2">{project.year}</dd>
              </div>
            )}
            {project.technologies.length > 0 && (
              <div>
                <dt className="text-muted">Stack</dt>
                <dd className="mt-2 leading-loose">
                  {project.technologies.map((t) => t.name).join(" / ")}
                </dd>
              </div>
            )}
            {(project.live_url ||
              project.repository_url ||
              project.links.length > 0) && (
              <div>
                <dt className="text-muted">Links</dt>
                <dd className="mt-2 flex flex-col gap-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      Live site ↗
                    </a>
                  )}
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      Repository ↗
                    </a>
                  )}
                  {project.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      {link.label ?? link.type ?? link.url} ↗
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {coverUrl && (
          <section className="mx-auto max-w-[1440px] px-6 md:px-10">
            <Reveal>
              <span className="block overflow-hidden border border-border">
                <Image
                  src={coverUrl}
                  alt={project.title}
                  width={1600}
                  height={900}
                  className="w-full object-cover"
                  sizes="100vw"
                  priority
                />
              </span>
            </Reveal>
          </section>
        )}

        {sections.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
            <div className="grid grid-cols-4 gap-x-6 gap-y-12 md:grid-cols-12">
              {sections.map((section, i) => (
                <Reveal
                  key={section.key}
                  className="col-span-4 md:col-span-7 md:col-start-3"
                >
                  <p className="font-mono text-xs tracking-[0.2em] uppercase text-accent">
                    {String(i + 1).padStart(2, "0")} / {section.label}
                  </p>
                  <div className="mt-4 max-w-3xl text-lg leading-relaxed whitespace-pre-line">
                    {project[section.key]}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {project.media.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-[1440px] space-y-10 px-6 py-16 md:px-10 md:py-24">
              {project.media.map((m) => {
                const url = getMediaUrl(m.image_path);
                if (!url) return null;
                return (
                  <Reveal key={m.id}>
                    <figure>
                      <span className="block overflow-hidden border border-border">
                        <Image
                          src={url}
                          alt={m.caption ?? project.title}
                          width={1600}
                          height={900}
                          className="w-full object-cover"
                          sizes="100vw"
                        />
                      </span>
                      {m.caption && (
                        <figcaption className="mt-3 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                          {m.caption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        <nav
          aria-label="More projects"
          className="border-t border-border"
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-6 md:px-10">
            <div className="border-r border-border py-10 pr-6">
              {adjacent.previous ? (
                <Link
                  href={`/work/${adjacent.previous.slug}`}
                  className="group block"
                >
                  <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
                    ← Previous
                  </span>
                  <span
                    className="mt-3 block text-2xl tracking-tight group-hover:text-accent md:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {adjacent.previous.title}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/#work"
                  className="block font-mono text-xs tracking-[0.2em] uppercase text-muted hover:text-accent"
                >
                  ← All work
                </Link>
              )}
            </div>
            <div className="py-10 pl-6 text-right">
              {adjacent.next && (
                <Link href={`/work/${adjacent.next.slug}`} className="group block">
                  <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
                    Next →
                  </span>
                  <span
                    className="mt-3 block text-2xl tracking-tight group-hover:text-accent md:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {adjacent.next.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </main>

      <SiteFooter
        email={profile?.email ?? null}
        socialLinks={socialLinks}
        location={profile?.location ?? null}
      />
    </div>
  );
}
