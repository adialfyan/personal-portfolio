import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminWritingById } from "@/lib/queries/admin";
import { deleteWriting } from "../actions";
import { WritingForm } from "../writing-form";

export default async function EditWritingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/writings/${id}`);

  const writing = await getAdminWritingById(id);
  if (!writing) notFound();

  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/writings" className="hover:text-accent">
          Writings
        </Link>{" "}
        / {writing.slug}
      </p>
      <h1
        className="mt-4 mb-10 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {writing.title}
      </h1>
      <WritingForm writing={writing} deleteAction={deleteWriting} />
    </div>
  );
}
