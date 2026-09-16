import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ShelfForm } from "../shelf-form";

export default async function NewShelfItemPage() {
  await requireAdmin("/admin/shelf/new");

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/shelf" className="hover:text-accent">
          Shelf
        </Link>{" "}
        / New
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Add to Shelf
      </h1>
      <ShelfForm item={null} />
    </div>
  );
}
