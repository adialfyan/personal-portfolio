import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        404 — Not found
      </p>
      <h1
        className="mt-6 text-6xl tracking-tight md:text-8xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Lost signal.
      </h1>
      <p className="mt-6 max-w-md leading-relaxed text-muted">
        This page doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-10 bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent"
      >
        Back home
      </Link>
    </div>
  );
}
