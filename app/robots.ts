import type { MetadataRoute } from "next";

import { SITE, absolute } from "@/lib/seo/site";

/**
 * Ruling (B), 2026-08-11: robots keeps `Disallow: /api/` but adds an explicit
 * `Allow: /api/catalog`. The catalog is a deliberate machine-readable endpoint
 * and it is advertised in llms.txt and the manifest, so blanket-disallowing it
 * while advertising it was a contradiction. Order matters: the more specific
 * Allow wins for that one path.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/catalog"],
      disallow: ["/api/"],
    },
    sitemap: absolute("/sitemap.xml"),
    host: SITE.host,
  };
}
