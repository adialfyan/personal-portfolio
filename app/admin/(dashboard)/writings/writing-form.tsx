"use client";

import { useActionState, useState } from "react";
import type { Writing } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";
import { saveWriting, type WritingFormState } from "./actions";

const initial: WritingFormState = { status: "idle" };

const field =
  "w-full border border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted focus:border-accent";
const label =
  "mb-2 block font-mono text-xs tracking-[0.2em] uppercase text-muted";

interface Props {
  writing: Writing | null;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}

export function WritingForm({ writing, deleteAction }: Props) {
  const [state, action, pending] = useActionState(saveWriting, initial);
  const [title, setTitle] = useState(writing?.title ?? "");
  const [slug, setSlug] = useState(writing?.slug ?? "");
  const coverUrl = getMediaUrl(writing?.cover_image_path);

  function handleTitle(value: string) {
    setTitle(value);
    if (!writing) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }

  const tagsDefault = (writing?.tags ?? []).join(", ");

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {writing && <input type="hidden" name="id" value={writing.id} />}
      {writing?.cover_image_path && (
        <input
          type="hidden"
          name="existing_cover_path"
          value={writing.cover_image_path}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Title *</span>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            className={field}
          />
        </label>
        <label className="block">
          <span className={label}>Slug *</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Category *</span>
          <select
            name="category"
            defaultValue={writing?.category ?? "paper"}
            className={field}
          >
            <option value="paper">Paper (Research / Technical)</option>
            <option value="architecture">Architecture (System Design)</option>
            <option value="essay">Essay (Monograph / Reflections)</option>
            <option value="note">Field Note (Observation / Log)</option>
          </select>
        </label>
        <label className="block">
          <span className={label}>Status *</span>
          <select
            name="status"
            defaultValue={writing?.status ?? "draft"}
            className={field}
          >
            <option value="draft">Draft (Hidden)</option>
            <option value="published">Published (Public)</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className={label}>Subtitle (optional)</span>
        <input
          name="subtitle"
          defaultValue={writing?.subtitle ?? ""}
          placeholder="Secondary heading or monograph focus..."
          className={field}
        />
      </label>

      <label className="block">
        <span className={label}>Summary (abstract / teaser)</span>
        <textarea
          name="summary"
          rows={3}
          defaultValue={writing?.summary ?? ""}
          placeholder="Concise overview shown in cards and index listings..."
          className={field}
        />
      </label>

      <label className="block">
        <span className={label}>Content (Markdown) *</span>
        <textarea
          name="content"
          required
          rows={18}
          defaultValue={writing?.content ?? ""}
          placeholder="# Introduction&#10;&#10;Write the document body here in standard markdown..."
          className={`${field} font-mono text-xs leading-relaxed`}
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-3">
        <label className="block">
          <span className={label}>Reading Time (minutes)</span>
          <input
            type="number"
            name="reading_time_minutes"
            min={1}
            defaultValue={writing?.reading_time_minutes ?? 5}
            className={field}
          />
        </label>

        <label className="block">
          <span className={label}>Sort Order</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={writing?.sort_order ?? 0}
            className={field}
          />
        </label>

        <label className="flex items-center gap-3 pt-7">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={writing?.is_featured ?? false}
            className="h-4 w-4 rounded-none accent-black"
          />
          <span className="font-mono text-xs tracking-[0.2em] uppercase">
            Feature on Home
          </span>
        </label>
      </div>

      <label className="block">
        <span className={label}>Tags (comma separated)</span>
        <input
          name="tags"
          defaultValue={tagsDefault}
          placeholder="Distributed Systems, Databases, Consensus, Architecture"
          className={field}
        />
      </label>

      <div>
        <span className={label}>Cover Image</span>
        {coverUrl && (
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={writing?.title ?? "Cover"}
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
          {pending ? "Saving..." : writing ? "Update Writing" : "Create Writing"}
        </button>

        {writing && deleteAction && (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={writing.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this writing entry?")) {
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
