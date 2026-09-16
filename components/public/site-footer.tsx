import Link from "next/link";
import { BouncyLine } from "@/components/public/bouncy-line";
import type { SocialLink } from "@/lib/queries/types";

interface SiteFooterProps {
  email: string | null;
  socialLinks: SocialLink[];
  location: string | null;
}

export function SiteFooter({ email, socialLinks, location }: SiteFooterProps) {
  return (
    <footer className="relative w-full">
      <BouncyLine />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 text-xs font-medium tracking-[0.2em] uppercase text-muted md:flex-row md:items-center md:justify-between md:px-10">
        <span>Adi Alfian Hafis &copy; {new Date().getFullYear()}</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {email && (
            <a href={`mailto:${email}`} className="hover:text-accent">
              Email
            </a>
          )}
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {link.label ?? link.platform}
            </a>
          ))}
        </div>
        <Link href="/contact" className="hover:text-accent">
          Contact ↗
        </Link>
      </div>
    </footer>
  );
}
