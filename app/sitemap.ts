import type { MetadataRoute } from "next";
import { CLUBS } from "@/lib/clubs";
import { SITE } from "@/lib/site";
import { getEventSlugs } from "@/sanity/lib/queries";

// Rebuilt at most once an hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const eventSlugs = await getEventSlugs();
  const now = new Date();

  const staticPages = ["", "/events", "/gallery", "/executive-team", "/contact"].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
  }));

  const clubPages = CLUBS.map((club) => ({
    url: `${SITE.url}/clubs/${club.slug}`,
    lastModified: now,
  }));

  const eventPages = eventSlugs.map((slug) => ({
    url: `${SITE.url}/events/${slug}`,
    lastModified: now,
  }));

  return [...staticPages, ...clubPages, ...eventPages];
}