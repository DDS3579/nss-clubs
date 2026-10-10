import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The content editor is for the team only
      disallow: "/studio",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}