import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { WritingForm } from "../writing-form";

export default async function NewWritingPage() {
  await requireAdmin("/admin/writings/new");

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/writings" className="hover:text-accent">
          Writings
        </Link>{" "}
        / New
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        New writing
      </h1>
      <WritingForm writing={null} />
    </div>
  );
}
