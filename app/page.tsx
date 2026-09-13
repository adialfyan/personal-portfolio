import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DitherField } from "@/components/public/dither-field";
import { Reveal } from "@/components/public/reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import {
  getFeaturedProjects,
  getSiteProfile,
  getVisibleSocialLinks,
} from "@/lib/queries/public";
import { getMediaUrl } from "@/lib/supabase/storage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Full-stack Developer — Portfolio",
  description:
    "Selected work, background, and contact of a full-stack developer building thoughtful web products.",
};

const CAPABILITIES = [
  "Product Development",
  "Frontend Engineering",
  "Backend Systems",
  "Database Design",
  "Interface Implementation",
  "Deployment & Maintenance",
];

export default async function Home() {
  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);
  const projects = await getFeaturedProjects();

  const name = profile?.full_name ?? "Personal Portfolio";
  const title = profile?.professional_title ?? "Full-stack Developer";
  const intro =
    profile?.short_intro ??
    "I design and build web products from interface to infrastructure.";
  const availability =
    profile?.availability_text ??
    (profile?.available_for_work ? "Available for selected work" : null);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader name={name} />

      <main className="flex-1">
        {/* ——— Hero ——— */}
        <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden border-b border-border">
          <DitherField className="absolute inset-0" />
          {/* Readability scrim: keeps the center calm over the dither. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(238,233,223,0.92) 0%, rgba(238,233,223,0.72) 45%, rgba(238,233,223,0) 78%)",
            }}
          />

          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 py-24 text-center md:px-10 md:py-32">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
              Portfolio / 2026
            </p>
            <h1
              className="mt-6 text-[clamp(3.5rem,13vw,10rem)] leading-[0.85] tracking-tight uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-balance">
              {intro}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs tracking-[0.2em] uppercase text-muted">
              {profile?.location && <span>{profile.location}</span>}
              {availability && (
                <span className="text-accent">{availability}</span>
              )}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4 font-mono text-xs tracking-[0.2em] uppercase">
              <Link
                href="/#work"
                className="border border-foreground/40 bg-background/60 px-6 py-4 backdrop-blur-[2px] transition-colors hover:border-accent hover:text-accent"
              >
                View selected work
              </Link>
              <Link
                href="/contact"
                className="bg-dark px-6 py-4 text-ivory transition-colors hover:bg-accent"
              >
                Contact ↗
              </Link>
            </div>
          </div>
        </section>

        {/* ——— Selected Work ——— */}
        <section
          id="work"
          className="border-t border-border scroll-mt-20"
        >
          <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
            <div className="flex items-baseline justify-between">
              <h2
                className="text-5xl tracking-tight md:text-7xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Selected Work
              </h2>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
                / {String(projects.length).padStart(2, "0")}
              </span>
            </div>

            {projects.length === 0 ? (
              <p className="mt-12 max-w-md leading-relaxed text-muted">
                Selected work is being curated. Check back soon — or get in
                touch to hear what is in progress.
              </p>
            ) : (
              <ol className="mt-12 grid grid-cols-4 gap-x-6 gap-y-16 md:grid-cols-12">
                {projects.map((project, i) => {
                  const coverUrl = getMediaUrl(project.cover_image_path);
                  // Asymmetric editorial spans: large / portrait / wide.
                  const span =
                    i === 0
                      ? "col-span-4 md:col-span-7"
                      : i === 1
                        ? "col-span-4 md:col-span-4 md:col-start-9"
                        : "col-span-4 md:col-span-10 md:col-start-2";
                  return (
                    <Reveal
                      as="li"
                      key={project.id}
                      className={span}
                    >
                      <Link
                        href={`/work/${project.slug}`}
                        className="group block"
                      >
                        {coverUrl ? (
                          <span className="block overflow-hidden border border-border">
                            <Image
                              src={coverUrl}
                              alt={project.title}
                              width={1200}
                              height={800}
                              className="aspect-[3/2] w-full object-cover grayscale contrast-125 transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:contrast-100"
                              sizes="(max-width: 768px) 100vw, 70vw"
                            />
                          </span>
                        ) : (
                          <span className="block aspect-[3/2] w-full border border-border bg-surface" />
                        )}
                        <span className="mt-4 flex items-baseline justify-between gap-4">
                          <span className="font-mono text-xs tracking-[0.2em] text-accent">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className="flex-1 text-3xl tracking-tight md:text-4xl"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {project.title}
                          </span>
                          <span aria-hidden="true" className="text-xl">
                            ↗
                          </span>
                        </span>
                        {project.summary && (
                          <span className="mt-2 block max-w-xl leading-relaxed text-muted">
                            {project.summary}
                          </span>
                        )}
                        <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                          {project.role && <span>{project.role}</span>}
                          {project.year && <span>{project.year}</span>}
                          {project.technologies
                            .slice(0, 3)
                            .map((t) => (
                              <span key={t.id}>{t.name}</span>
                            ))}
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
              </ol>
            )}
          </div>
        </section>

        {/* ——— About teaser ——— */}
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-6 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
            <p className="col-span-4 font-mono text-xs tracking-[0.2em] uppercase text-muted md:col-span-3">
              About / 02
            </p>
            <div className="col-span-4 md:col-span-9">
              <Reveal>
                <p
                  className="max-w-4xl text-4xl leading-tight tracking-tight md:text-6xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  I build web experiences that balance clarity, character, and
                  systems.
                </p>
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs tracking-[0.2em] uppercase md:grid-cols-3">
                {CAPABILITIES.map((c) => (
                  <span key={c} className="border-t border-border pt-3">
                    {c}
                  </span>
                ))}
              </div>
              <Link
                href="/about"
                className="mt-10 inline-block font-mono text-xs tracking-[0.2em] uppercase underline underline-offset-8 hover:text-accent"
              >
                More about me ↗
              </Link>
            </div>
          </div>
        </section>

        {/* ——— Contact CTA (inversion) ——— */}
        <section className="bg-dark text-ivory">
          <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-32">
            <Reveal>
              <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
                Have something interesting in mind?
              </p>
              <Link
                href="/contact"
                className="mt-6 block text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Let&apos;s talk <span className="text-accent">↗</span>
              </Link>
            </Reveal>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs tracking-[0.2em] uppercase opacity-70">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-accent hover:opacity-100"
                >
                  {profile.email}
                </a>
              )}
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent hover:opacity-100"
                >
                  {link.label ?? link.platform} ↗
                </a>
              ))}
            </div>
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
