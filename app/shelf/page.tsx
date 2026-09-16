import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ShelfGrid } from "@/components/public/shelf-grid";
import {
  getShelfItems,
  getSiteProfile,
  getVisibleSocialLinks,
} from "@/lib/queries/public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shelf — Cinema, Records & Literature",
  description:
    "A personal ledger of films, sound recordings, and foundational books shaping craft and perspective.",
  openGraph: {
    title: "Shelf — Cinema, Records & Literature",
    description:
      "A personal ledger of films, sound recordings, and foundational books shaping craft and perspective.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelf — Cinema, Records & Literature",
    description:
      "A personal ledger of films, sound recordings, and foundational books shaping craft and perspective.",
  },
};

export default async function ShelfPage() {
  const profile = await getSiteProfile();
  const socialLinks = await getVisibleSocialLinks(profile?.id ?? null);
  const items = await getShelfItems();

  const name = profile?.full_name || "Adi Alfian Hafis";

  return (
    <div className="flex min-h-full flex-1 flex-col" suppressHydrationWarning>
      <SiteHeader name={name} />

      <main className="flex-1">
        {/* ——— Masthead ——— */}
        <section className="border-b border-border bg-background pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <p
              className="text-xs font-medium tracking-[0.2em] uppercase text-muted mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Shelf &bull; Media Archive
            </p>
            <h1
              className="max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal tracking-[-0.02em] leading-[1.04] text-foreground text-balance"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cinema, records &amp; essential readings.
            </h1>
            <p className="mt-8 max-w-2xl text-lg sm:text-xl text-muted font-normal leading-relaxed text-balance">
              A personal ledger of films, sound recordings, and literature that inform my perspective on aesthetics, human nature, and structural durability.
            </p>
          </div>
        </section>

        {/* ——— Shelf Ledger & Filter ——— */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <ShelfGrid items={items} />
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
