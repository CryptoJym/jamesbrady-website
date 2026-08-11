import { catalog } from "@/lib/catalog";

/**
 * The machine-readable tool catalog. robots.txt disallows /api/ and then
 * explicitly allows this one path, per ruling (B), 2026-08-11.
 *
 * The `name` and `url` here are public surface, so they are held to the same
 * two rules as every rendered page (independent review, P1-3):
 *   · register rule — the retired mystical job title is gone (geo-seo §8.11
 *     lists this string by name as a known violation to clear);
 *   · host discipline — www, never bare jamesbrady.org (§8.12, ruling A).
 * verify-seo checks 8 and 12 now scan app/api/** and lib/catalog.ts, so this
 * cannot drift back unnoticed.
 */
export function GET() {
  return Response.json({
    name: "James Brady — Tool Catalog",
    url: "https://www.jamesbrady.org/manuscript",
    total_tools: catalog.reduce((n, c) => n + c.tools.length, 0),
    total_categories: catalog.length,
    categories: catalog,
  });
}
