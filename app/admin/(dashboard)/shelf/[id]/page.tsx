import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminShelfItemById } from "@/lib/queries/admin";
import { deleteShelfItem } from "../actions";
import { ShelfForm } from "../shelf-form";

export default async function EditShelfItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/shelf/${id}`);

  const item = await getAdminShelfItemById(id);
  if (!item) notFound();

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/shelf" className="hover:text-accent">
          Shelf
        </Link>{" "}
        / {item.title}
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {item.title}
      </h1>
      <ShelfForm item={item} deleteAction={deleteShelfItem} />
    </div>
  );
}
