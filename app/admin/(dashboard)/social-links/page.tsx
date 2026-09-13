import { requireAdmin } from "@/lib/auth";
import { getAllSocialLinks } from "@/lib/queries/admin";
import { deleteSocialLink } from "./actions";
import { SocialLinkRow } from "./social-link-row";

export default async function SocialLinksPage() {
  await requireAdmin("/admin/social-links");
  const links = await getAllSocialLinks();

  return (
    <div>
      <h1
        className="text-4xl tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Social Links
      </h1>
      <p className="mt-2 mb-10 leading-relaxed text-muted">
        Shown in the footer and on the contact page. Order controls display
        sequence; hidden links stay private.
      </p>

      <div className="border-b border-border">
        {links.map((link) => (
          <SocialLinkRow
            key={link.id}
            link={link}
            deleteAction={deleteSocialLink}
          />
        ))}
      </div>

      <h2 className="mt-12 font-mono text-xs tracking-[0.2em] uppercase text-muted">
        Add link
      </h2>
      <div className="border-b border-border">
        <SocialLinkRow link={null} deleteAction={deleteSocialLink} />
      </div>
    </div>
  );
}
