"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="mb-2 block font-mono text-xs tracking-[0.2em] uppercase text-muted">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full border border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted focus:border-accent"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send magic link ↗"}
      </button>

      {state.status === "sent" && state.message && (
        <p className="border border-border p-4 text-sm leading-relaxed">
          {state.message}
        </p>
      )}
      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-accent">
          {state.message}
        </p>
      )}
    </form>
  );
}
