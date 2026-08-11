import type { MetadataRoute } from "next";

import { indexableRoutes } from "@/lib/seo/routes";
import { absolute } from "@/lib/seo/site";

/**
 * Sitemap with a REAL per-URL lastModified (geo-seo-spec §5.3).
 *
 * Entry routes use their own dateModified; index routes use max(children);
 * hand-built TSX routes use the git last-commit date of their own files.
 * changeFrequency and priority are dropped — major engines ignore them and
 * they invite hand-typed drift.
 *
 * CI must check out with full history (fetch-depth: 0), or the git dates
 * collapse to the clone date. verify-seo check 6 catches that.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes().map((r) => ({
    url: absolute(r.path),
    lastModified: new Date(`${r.lastModified}T00:00:00Z`),
  }));
}
