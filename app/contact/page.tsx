import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/reveal";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteProfile, getVisibleSocialLinks } from "@/lib/queries/public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation — project inquiries and collaboration.",
};

export default async function ContactPage() {
  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);

  const name = profile?.full_name || "Adi Alfian Hafis";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader name={name} />

      <main className="flex-1">
        <section className="bg-dark text-ivory">
          <div className="mx-auto max-w-[1440px] px-6 pt-14 pb-16 md:px-10 md:pt-20 md:pb-24">
            <Reveal>
              <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-60">
                Have something interesting in mind?
              </p>
              <h1
                className="mt-6 max-w-5xl text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Let&apos;s talk <span className="opacity-50">↗</span>
              </h1>
            </Reveal>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium tracking-[0.2em] uppercase opacity-70">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="transition-opacity hover:opacity-100"
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
                  className="transition-opacity hover:opacity-100"
                >
                  {link.label ?? link.platform} ↗
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <div className="grid grid-cols-4 gap-10 md:grid-cols-12">
            <div className="col-span-4 md:col-span-4">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
                What to include
              </h2>
              <ul className="mt-4 space-y-3 leading-relaxed text-muted">
                <li>— What you want to build</li>
                <li>— Timeline and scope</li>
                <li>— Links to anything relevant</li>
              </ul>
              <p className="mt-6 leading-relaxed text-muted">
                Prefer email? Write directly
                {profile?.email ? (
                  <>
                    {" "}
                    to{" "}
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-foreground underline underline-offset-4 hover:text-accent"
                    >
                      {profile.email}
                    </a>
                  </>
                ) : (
                  " via the address above"
                )}
                .
              </p>
            </div>
            <div className="col-span-4 md:col-span-7 md:col-start-6">
              <ContactForm />
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
