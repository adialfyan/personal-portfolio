import { requireAdmin } from "@/lib/auth";
import { getAdminProfile } from "@/lib/queries/admin";
import { ProfileForm } from "./profile-form";

export default async function AdminProfilePage() {
  await requireAdmin("/admin/profile");
  const profile = await getAdminProfile();

  return (
    <div>
      <h1
        className="text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Profile
      </h1>
      <p className="mt-2 mb-10 leading-relaxed text-muted">
        Identity, biography, portrait, and availability shown across the public
        site.
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
