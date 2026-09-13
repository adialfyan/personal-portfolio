import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
          Admin / Sign in
        </p>
        <h1
          className="mt-4 text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="mt-4 max-w-sm leading-relaxed text-muted">
          Enter your admin email. We&apos;ll send a one-time sign-in link — no
          password needed.
        </p>

        {error === "not_admin" && (
          <p className="mt-6 border border-accent p-4 text-sm leading-relaxed text-accent">
            This account is not an admin. Add your user id to the{" "}
            <code className="font-mono">admin_users</code> table first.
          </p>
        )}
        {error === "auth" && (
          <p className="mt-6 border border-accent p-4 text-sm leading-relaxed text-accent">
            The sign-in link is invalid or expired. Request a new one.
          </p>
        )}

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
