"use client";

import { useActionState } from "react";
import type { SocialLink } from "@/lib/queries/types";
import { saveSocialLink, type SocialFormState } from "./actions";

const initial: SocialFormState = { status: "idle" };

const field =
  "w-full border border-border bg-transparent px-3 py-2 outline-none placeholder:text-muted focus:border-accent";
const label =
  "mb-1 block font-mono text-xs tracking-[0.2em] uppercase text-muted";

interface Props {
  link: SocialLink | null;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

export function SocialLinkRow({ link, deleteAction }: Props) {
  const [state, action, pending] = useActionState(saveSocialLink, initial);

  return (
    <form
      action={action}
      className="grid grid-cols-2 items-end gap-4 border-t border-border py-5 md:grid-cols-12"
    >
      {link && <input type="hidden" name="id" value={link.id} />}
      <div className="md:col-span-2">
        <span className={label}>Platform</span>
        <input
          name="platform"
          required
          defaultValue={link?.platform ?? ""}
          placeholder="GitHub"
          className={field}
        />
      </div>
      <div className="md:col-span-2">
        <span className={label}>Label</span>
        <input
          name="label"
          defaultValue={link?.label ?? ""}
          placeholder="GitHub"
          className={field}
        />
      </div>
      <div className="col-span-2 md:col-span-4">
        <span className={label}>URL</span>
        <input
          name="url"
          required
          defaultValue={link?.url ?? ""}
          placeholder="https://github.com/…"
          className={field}
        />
      </div>
      <div className="md:col-span-1">
        <span className={label}>Order</span>
        <input
          name="sort_order"
          type="number"
          defaultValue={link?.sort_order ?? 0}
          className={field}
        />
      </div>
      <div className="flex items-center gap-2 md:col-span-1">
        <input
          id={`visible-${link?.id ?? "new"}`}
          name="is_visible"
          type="checkbox"
          defaultChecked={link?.is_visible ?? true}
          className="h-4 w-4 accent-[#ff4f00]"
        />
        <label
          htmlFor={`visible-${link?.id ?? "new"}`}
          className="font-mono text-xs tracking-[0.2em] uppercase text-muted"
        >
          Visible
        </label>
      </div>
      <div className="col-span-2 flex items-center gap-4 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-dark px-4 py-2 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent disabled:opacity-50"
        >
          {link ? "Save" : "Add"}
        </button>
        {link && (
          <button
            type="submit"
            formAction={deleteAction}
            className="font-mono text-xs tracking-[0.2em] uppercase text-muted hover:text-accent"
          >
            Delete
          </button>
        )}
      </div>
      {state.status === "error" && (
        <p role="alert" className="col-span-2 text-sm text-accent md:col-span-12">
          {state.message}
        </p>
      )}
    </form>
  );
}
