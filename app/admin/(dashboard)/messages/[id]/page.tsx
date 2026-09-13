import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getMessageById } from "@/lib/queries/messages";
import { setMessageStatus } from "../actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTIONS = [
  { status: "read", label: "Mark read" },
  { status: "unread", label: "Mark unread" },
  { status: "archived", label: "Archive" },
  { status: "spam", label: "Mark spam" },
] as const;

export default async function MessageDetailPage({
  params,
}: PageProps<"/admin/messages/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/messages/${id}`);

  const message = await getMessageById(id);
  if (!message) notFound();

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
        <Link href="/admin/messages" className="hover:text-accent">
          Messages
        </Link>{" "}
        / {message.status}
      </p>

      <h1
        className="mt-4 text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {message.subject || "No subject"}
      </h1>
      <p className="mt-3 font-mono text-xs tracking-[0.2em] uppercase text-muted">
        {message.name} — {message.email} — {formatDate(message.created_at)}
      </p>

      <div className="mt-8 border border-border p-6 leading-relaxed whitespace-pre-line">
        {message.message}
      </div>

      <div className="mt-6">
        <a
          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "Your message")}`}
          className="inline-block bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent"
        >
          Reply via email ↗
        </a>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {ACTIONS.filter((a) => a.status !== message.status).map((a) => (
          <form key={a.status} action={setMessageStatus}>
            <input type="hidden" name="id" value={message.id} />
            <input type="hidden" name="status" value={a.status} />
            <button
              type="submit"
              className="border border-border px-4 py-2 font-mono text-xs tracking-[0.2em] uppercase text-muted hover:border-accent hover:text-accent"
            >
              {a.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
