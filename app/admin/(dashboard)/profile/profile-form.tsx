"use client";

import { useActionState } from "react";
import type { Profile } from "@/lib/queries/types";
import { getMediaUrl } from "@/lib/supabase/storage";
import { saveProfile, type FormState } from "./actions";

const initial: FormState = { status: "idle" };

const field =
  "w-full border border-border bg-transparent px-4 py-3 outline-none placeholder:text-muted focus:border-accent";
const label = "mb-2 block font-mono text-xs tracking-[0.2em] uppercase text-muted";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState(saveProfile, initial);
  const portraitUrl = getMediaUrl(profile?.portrait_path);

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {portraitUrl && (
        <div>
          <span className={label}>Current portrait</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitUrl}
            alt="Current portrait"
            className="h-48 w-48 border border-border object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Full name</span>
          <input name="full_name" defaultValue={profile?.full_name ?? ""} className={field} />
        </label>
        <label className="block">
          <span className={label}>Professional title</span>
          <input
            name="professional_title"
            defaultValue={profile?.professional_title ?? ""}
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className={label}>Short intro</span>
        <textarea
          name="short_intro"
          rows={2}
          defaultValue={profile?.short_intro ?? ""}
          className={`${field} resize-y`}
        />
      </label>

      <label className="block">
        <span className={label}>Long biography</span>
        <textarea
          name="long_bio"
          rows={8}
          defaultValue={profile?.long_bio ?? ""}
          className={`${field} resize-y`}
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Location</span>
          <input name="location" defaultValue={profile?.location ?? ""} className={field} />
        </label>
        <label className="block">
          <span className={label}>Timezone</span>
          <input name="timezone" defaultValue={profile?.timezone ?? ""} className={field} />
        </label>
        <label className="block">
          <span className={label}>Email</span>
          <input name="email" type="email" defaultValue={profile?.email ?? ""} className={field} />
        </label>
        <label className="block">
          <span className={label}>Résumé URL</span>
          <input name="resume_url" defaultValue={profile?.resume_url ?? ""} className={field} />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="available_for_work"
          name="available_for_work"
          type="checkbox"
          defaultChecked={profile?.available_for_work ?? false}
          className="h-4 w-4 accent-[#ff4f00]"
        />
        <label htmlFor="available_for_work" className={label + " mb-0"}>
          Available for work
        </label>
      </div>

      <label className="block">
        <span className={label}>Availability text</span>
        <input
          name="availability_text"
          defaultValue={profile?.availability_text ?? ""}
          placeholder="Available for selected work"
          className={field}
        />
      </label>

      <label className="block">
        <span className={label}>Portrait image</span>
        <input
          name="portrait"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="block w-full text-sm text-muted file:mr-4 file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-xs file:tracking-[0.2em] file:uppercase"
        />
        <span className="mt-2 block text-xs text-muted">
          JPEG, PNG, WebP, or AVIF. Max 4 MB. Stored in Supabase Storage.
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-dark px-6 py-4 font-mono text-xs tracking-[0.2em] uppercase text-ivory transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {state.status === "success" && (
          <span className="text-sm text-muted">{state.message}</span>
        )}
        {state.status === "error" && (
          <span role="alert" className="text-sm text-accent">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
