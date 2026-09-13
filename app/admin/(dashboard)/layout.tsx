import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "../actions";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/social-links", label: "Social Links" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="font-mono text-xs tracking-[0.2em] uppercase"
          >
            Admin / {admin.displayName ?? admin.email ?? "Dashboard"}
          </Link>
          <div className="flex items-center gap-5 font-mono text-xs tracking-[0.2em] uppercase">
            <Link
              href="/"
              target="_blank"
              className="text-muted hover:text-accent"
            >
              View site ↗
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="text-muted hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1200px] gap-6 overflow-x-auto px-6 pb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-muted hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
