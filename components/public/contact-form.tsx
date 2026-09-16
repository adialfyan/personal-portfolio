"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const payload = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Something went wrong.");
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-border p-8">
        <p
          className="text-3xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Message received.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-border bg-transparent px-4 py-3 leading-relaxed outline-none placeholder:text-muted focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-medium tracking-[0.2em] uppercase text-muted">
            Name
          </span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium tracking-[0.2em] uppercase text-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-medium tracking-[0.2em] uppercase text-muted">
          Subject <span className="opacity-60">(optional)</span>
        </span>
        <input
          name="subject"
          maxLength={150}
          placeholder="Project inquiry"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-medium tracking-[0.2em] uppercase text-muted">
          Message
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Tell me about your project, timeline, and goals."
          className={`${inputClass} resize-y`}
        />
      </label>
      {/* Honeypot — humans never fill this. */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {status === "error" && error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-dark px-8 py-4 text-xs font-medium tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message ↗"}
      </button>
    </form>
  );
}
