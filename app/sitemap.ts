import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/lib/queries/public";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedProjectSlugs();
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
    ...slugs.map((slug) => ({
      url: `${siteUrl}/work/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
