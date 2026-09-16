"use client";

import { useActionState, useState } from "react";
import type { ShelfItem } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";
import { saveShelfItem, type ShelfFormState } from "./actions";

const initial: ShelfFormState = { status: "idle" };

const field =
  "w-full border border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted focus:border-accent";
const label =
  "mb-2 block font-mono text-xs tracking-[0.2em] uppercase text-muted";

interface Props {
  item: ShelfItem | null;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}

export function ShelfForm({ item, deleteAction }: Props) {
  const [state, action, pending] = useActionState(saveShelfItem, initial);
  const coverUrl = getMediaUrl(item?.cover_image_path);

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {item && <input type="hidden" name="id" value={item.id} />}
      {item?.cover_image_path && (
        <input
          type="hidden"
          name="existing_cover_path"
          value={item.cover_image_path}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Title *</span>
          <input
            name="title"
            required
            defaultValue={item?.title ?? ""}
            placeholder="e.g. Stalker, Selected Ambient Works, Designing Data-Intensive Applications"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Medium Type *</span>
          <select
            name="media_type"
            defaultValue={item?.media_type ?? "film"}
            className={field}
          >
            <option value="film">Cinema / Film</option>
            <option value="music">Music / Vinyl / Record</option>
            <option value="book">Literature / Book / Paper</option>
            <option value="article">Article / Monograph</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Creator / Author / Director *</span>
          <input
            name="creator"
            required
            defaultValue={item?.creator ?? ""}
            placeholder="e.g. Andrei Tarkovsky, Aphex Twin, Martin Kleppmann"
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Release Year</span>
          <input
            name="year"
            defaultValue={item?.year ?? ""}
            placeholder="e.g. 1979, 1992, 2023"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className={label}>Personal Reflection / Impression</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={item?.notes ?? ""}
          placeholder="A personal reflection on the work, why it matters, or its artistic / architectural impact..."
          className={field}
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-3">
        <label className="block">
          <span className={label}>Rating (1 - 5)</span>
          <select
            name="rating"
            defaultValue={item?.rating ? String(item.rating) : "5"}
            className={field}
          >
            <option value="5">★★★★★ (5 - Essential)</option>
            <option value="4">★★★★☆ (4 - Recommended)</option>
            <option value="3">★★★☆☆ (3 - Notable)</option>
            <option value="2">★★☆☆☆ (2 - Fair)</option>
            <option value="1">★☆☆☆☆ (1 - Poor)</option>
          </select>
        </label>

        <label className="block">
          <span className={label}>Date Logged</span>
          <input
            type="date"
            name="logged_at"
            defaultValue={item?.logged_at ?? new Date().toISOString().split("T")[0]}
            className={field}
          />
        </label>

        <label className="block">
          <span className={label}>Sort Order</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={item?.sort_order ?? 0}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 items-center">
        <label className="block">
          <span className={label}>External Reference URL</span>
          <input
            type="url"
            name="external_url"
            defaultValue={item?.external_url ?? ""}
            placeholder="https://letterboxd.com/... or https://open.spotify.com/..."
            className={field}
          />
        </label>

        <label className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            name="is_favorite"
            defaultChecked={item?.is_favorite ?? false}
            className="h-4 w-4 rounded-none accent-black"
          />
          <span className="font-mono text-xs tracking-[0.2em] uppercase">
            Curator Pick (Show on Homepage)
          </span>
        </label>
      </div>

      <div>
        <span className={label}>Cover Artwork (Optional)</span>
        {coverUrl && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={item?.title ?? "Cover"}
              className="max-h-48 border border-border object-cover"
            />
          </div>
        )}
        <input
          type="file"
          name="cover"
          accept="image/*"
          className="font-mono text-xs"
        />
      </div>

      {state.status === "error" && (
        <p className="border border-red-500/50 bg-red-50 p-4 text-xs text-red-600">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-dark px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Saving..." : item ? "Update Entry" : "Add to Shelf"}
        </button>

        {item && deleteAction && (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm("Are you sure you want to remove this item from your shelf?")) {
                  e.preventDefault();
                }
              }}
              className="font-mono text-xs tracking-[0.2em] uppercase text-red-600 hover:underline cursor-pointer"
            >
              Delete
            </button>
          </form>
        )}
      </div>
    </form>
  );
}
