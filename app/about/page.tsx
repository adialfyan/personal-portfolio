import type { Metadata } from "next";
import Link from "next/link";
import { DitherImage } from "@/components/public/dither-image";
import { Reveal } from "@/components/public/reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteProfile, getVisibleSocialLinks } from "@/lib/queries/public";
import { getMediaUrl } from "@/lib/supabase/storage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, capabilities, and current focus of a full-stack developer.",
};

const CAPABILITIES = [
  "Product Development",
  "Frontend Engineering",
  "Backend Systems",
  "Database Design",
  "Interface Implementation",
  "Deployment & Maintenance",
];

export default async function AboutPage() {
  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);

  const name = profile?.full_name ?? "Personal Portfolio";
  const portraitUrl = getMediaUrl(profile?.portrait_path);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader name={name} />

      <main className="flex-1">
        <section className="mx-auto max-w-[1440px] px-6 pt-14 pb-16 md:px-10 md:pt-20 md:pb-24">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
            About / 01
          </p>
          <h1
            className="mt-6 max-w-5xl text-[clamp(3rem,9vw,7rem)] leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {profile?.professional_title ?? "Full-stack Developer"}
          </h1>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-10 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
            <div className="col-span-4 md:col-span-5">
              {portraitUrl ? (
                <DitherImage
                  src={portraitUrl}
                  alt={name}
                  className="border border-border"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center border border-border bg-surface">
                  <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
                    Portrait — set in admin
                  </span>
                </div>
              )}
              <dl className="mt-8 space-y-4 font-mono text-xs tracking-[0.2em] uppercase">
                {profile?.location && (
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="text-muted">Based in</dt>
                    <dd>{profile.location}</dd>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="text-muted">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${profile.email}`}
                        className="hover:text-accent"
                      >
                        {profile.email}
                      </a>
                    </dd>
                  </div>
                )}
                {(profile?.available_for_work ||
                  profile?.availability_text) && (
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="text-muted">Status</dt>
                    <dd className="text-accent">
                      {profile.availability_text ?? "Available for work"}
                    </dd>
                  </div>
                )}
                {profile?.resume_url && (
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <dt className="text-muted">Résumé</dt>
                    <dd>
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        Download ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="col-span-4 md:col-span-7">
              <Reveal>
                <p className="max-w-2xl text-xl leading-relaxed md:text-2xl">
                  {profile?.short_intro ??
                    "I design and build web products from interface to infrastructure."}
                </p>
              </Reveal>
              {profile?.long_bio ? (
                <div className="mt-8 max-w-2xl space-y-5 leading-relaxed whitespace-pre-line">
                  {profile.long_bio}
                </div>
              ) : (
                <p className="mt-8 max-w-2xl leading-relaxed text-muted">
                  A longer biography lives here once it is added in the admin
                  dashboard.
                </p>
              )}

              <h2 className="mt-14 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                Capabilities
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {CAPABILITIES.map((c) => (
                  <li
                    key={c}
                    className="border-t border-border py-3 font-mono text-xs tracking-[0.2em] uppercase"
                  >
                    {c}
                  </li>
                ))}
              </ul>

              {socialLinks.length > 0 && (
                <>
                  <h2 className="mt-14 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                    Elsewhere
                  </h2>
                  <ul className="mt-4">
                    {socialLinks.map((link) => (
                      <li
                        key={link.id}
                        className="border-t border-border py-3 last:border-b"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between hover:text-accent"
                        >
                          <span className="font-mono text-xs tracking-[0.2em] uppercase">
                            {link.label ?? link.platform}
                          </span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Link
                href="/contact"
                className="mt-14 inline-block bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent"
              >
                Get in touch ↗
              </Link>
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
