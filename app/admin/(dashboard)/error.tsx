"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-20">
      <h1
        className="text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Something broke
      </h1>
      <p className="mt-2 mb-8 leading-relaxed text-muted">
        This dashboard section failed to load.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
