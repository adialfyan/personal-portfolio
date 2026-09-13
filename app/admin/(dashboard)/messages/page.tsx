import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMessages, type MessageStatus } from "@/lib/queries/messages";

const FILTERS: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
  { value: "spam", label: "Spam" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MessagesPage({
  searchParams,
}: PageProps<"/admin/messages">) {
  await requireAdmin("/admin/messages");
  const params = await searchParams;
  const raw = params.status;
  const filter: MessageStatus | "all" =
    raw === "unread" || raw === "read" || raw === "archived" || raw === "spam"
      ? raw
      : "all";

  const messages = await getMessages(filter);

  return (
    <div>
      <h1
        className="text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Messages
      </h1>
      <p className="mt-2 mb-8 leading-relaxed text-muted">
        Inquiries from the contact form. Reply via your email client.
      </p>

      <div className="flex flex-wrap gap-2 font-mono text-xs tracking-[0.2em] uppercase">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "all" ? "/admin/messages" : `/admin/messages?status=${f.value}`
            }
            className={`border px-4 py-2 ${
              filter === f.value
                ? "border-accent text-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 border-t border-border">
        {messages.length === 0 ? (
          <p className="py-6 leading-relaxed text-muted">
            No messages{filter !== "all" ? ` with status "${filter}"` : ""}.
          </p>
        ) : (
          messages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/messages/${m.id}`}
              className="block border-b border-border py-4 hover:text-accent"
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="flex items-center gap-3">
                  {m.status === "unread" && (
                    <span
                      aria-label="Unread"
                      className="inline-block h-2 w-2 bg-accent"
                    />
                  )}
                  <span className="font-medium">{m.name}</span>
                  <span className="text-sm text-muted">{m.email}</span>
                </span>
                <span className="flex items-center gap-4 font-mono text-xs tracking-[0.2em] uppercase text-muted">
                  <span>{formatDate(m.created_at)}</span>
                  <span>{m.status}</span>
                </span>
              </span>
              <span className="mt-1 block truncate text-sm text-muted">
                {m.subject ? `${m.subject} — ` : ""}
                {m.message}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
