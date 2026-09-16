import Link from "next/link";
import { BouncyLine } from "@/components/public/bouncy-line";

interface SiteHeaderProps {
  name?: string;
}

export function SiteHeader({ name }: SiteHeaderProps) {
  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm"
    >
      <div
        suppressHydrationWarning
        className="mx-auto flex max-w-[1440px] items-center justify-end px-6 py-4 md:px-10"
      >
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 text-xs font-medium tracking-[0.2em] uppercase md:gap-8"
        >
          <Link href="/#work" className="text-muted hover:text-foreground transition-colors">
            Work
          </Link>
          <Link href="/writing" className="text-muted hover:text-foreground transition-colors">
            Writing
          </Link>
          <Link href="/shelf" className="text-muted hover:text-foreground transition-colors">
            Shelf
          </Link>
          <Link href="/about" className="text-muted hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-muted hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
      <BouncyLine className="absolute bottom-0 left-0 right-0" />
    </header>
  );
}
