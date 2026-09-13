import Link from "next/link";

interface SiteHeaderProps {
  name: string;
}

export function SiteHeader({ name }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.2em] uppercase hover:text-accent"
        >
          {name}
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 font-mono text-xs tracking-[0.2em] uppercase md:gap-8"
        >
          <Link href="/#work" className="hover:text-accent">
            Work
          </Link>
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
