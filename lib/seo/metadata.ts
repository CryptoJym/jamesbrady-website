import type { Metadata } from "next";

import { SITE } from "./site";

/**
 * The one way a route may declare its metadata (geo-seo-spec §3.3).
 *
 * Returns a self-referencing canonical, plus openGraph and twitter blocks that
 * always carry title, description, image and imageAlt. A route that hand-rolls
 * `export const metadata` is a review reject — the live site canonicalized
 * every subpage to the homepage until the 2026-08-11 hotfix, and a shared
 * helper is what stops that returning.
 *
 * `path` is relative and resolves against `metadataBase`, matching PR #2.
 * Trailing slashes are off everywhere except the site root.
 */
export function pageMetadata(input: {
  path: string;
  title: string;
  description: string;
  og: { image: string; imageAlt: string; title?: string; description?: string };
  noindex?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const { path, title, description, og, noindex, type = "website" } = input;

  if (!path.startsWith("/")) {
    throw new Error(`[seo] pageMetadata path must be site-relative, got "${path}"`);
  }
  if (path !== "/" && path.endsWith("/")) {
    throw new Error(`[seo] trailing slashes are off; got "${path}"`);
  }
  if (!og?.image || !og?.imageAlt) {
    throw new Error(`[seo] per-page OG image + alt are required at template level ("${path}")`);
  }

  const ogTitle = og.title ?? title;
  const ogDescription = og.description ?? description;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: type === "profile" ? "profile" : type,
      locale: "en_US",
      siteName: SITE.name,
      url: path,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: og.image, width: 1200, height: 630, alt: og.imageAlt }],
      ...(input.publishedTime && type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [{ url: og.image, alt: og.imageAlt }],
    },
  };
}
