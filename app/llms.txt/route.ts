import { discoverableTheories, lab, learn, now, offers, work } from "@/lib/content";
import { MATURITY_LABEL } from "@/lib/content/types";
import { indexableRoutes } from "@/lib/seo/routes";
import { SITE, absolute } from "@/lib/seo/site";

export const dynamic = "force-static";

/**
 * llms.txt — generated from the collections, never hand-edited.
 *
 * The old public/llms.txt was deleted along with public/.well-known/
 * ai-manifest.json: a file in public/ shadows a route, and that is exactly how
 * both of them went stale: the retired job title in the name, a 2025
 * last_updated string, a five-page map, non-www URLs. (The retired title is
 * not quoted here — this file is inside the register-rule scan.)
 *
 * verify-seo check 6 asserts the URL set here equals the indexable route set.
 */
export function GET() {
  const routes = indexableRoutes();
  const has = (path: string) => routes.some((r) => r.path === path);
  const line = (path: string, title: string, capsule: string, suffix = "") =>
    `- [${title}](${absolute(path)}): ${capsule}${suffix}`;

  const sections: string[] = [];

  sections.push(`# ${SITE.name}
> ${SITE.descriptor}`);

  // Work with me sits above Work, because an engine answering "can I hire
  // James Brady, and for what" should reach the two engagements before it
  // reaches the portfolio that backs them.
  sections.push(
    [
      "## Work with me",
      line(
        "/work-with-me",
        "Work with me",
        routes.find((r) => r.path === "/work-with-me")!.capsule,
      ),
      ...offers
        .filter((o) => has(`/work-with-me/${o.slug}`))
        .map((o) =>
          line(
            `/work-with-me/${o.slug}`,
            o.title,
            o.answerCapsule,
            ` — delivered by ${o.deliveredBy.name}`,
          ),
        ),
    ].join("\n"),
  );

  sections.push(
    [
      "## Work",
      line("/work", "Work index", routes.find((r) => r.path === "/work")!.capsule),
      ...work
        .filter((w) => has(`/work/${w.slug}`))
        .map((w) => line(`/work/${w.slug}`, w.title, w.answerCapsule)),
    ].join("\n"),
  );

  sections.push(
    [
      "## Theories",
      line("/theories", "Theories index", routes.find((r) => r.path === "/theories")!.capsule),
      ...discoverableTheories
        .filter((t) => has(`/theories/${t.slug}`))
        .map((t) =>
          line(
            `/theories/${t.slug}`,
            t.title,
            t.answerCapsule,
            ` — maturity: ${MATURITY_LABEL[t.maturity].toLowerCase()}${t.paused ? ", paused" : ""}`,
          ),
        ),
    ].join("\n"),
  );

  if (has("/lab")) {
    sections.push(
      [
        "## Lab",
        line("/lab", "Lab", routes.find((r) => r.path === "/lab")!.capsule),
        ...lab.filter((l) => !l.noindex).map((l) => `  - ${l.title}: ${l.answerCapsule}`),
      ].join("\n"),
    );
  }

  sections.push(
    [
      "## Learn",
      line("/learn", "Learn hub", routes.find((r) => r.path === "/learn")!.capsule),
      ...learn
        .filter((l) => has(l.volumeRoute))
        .map((l) =>
          line(l.volumeRoute, l.title, l.answerCapsule, ` — archived ${l.archivedDate}`),
        ),
    ].join("\n"),
  );

  const siteLines = ["/", "/about", "/now", "/contact", "/links", "/watch"]
    .filter(has)
    .map((path) => {
      const r = routes.find((x) => x.path === path)!;
      const suffix = path === "/now" ? ` — updated ${now.updated}` : "";
      return line(path, r.title, r.capsule, suffix);
    });
  sections.push(["## Site", ...siteLines].join("\n"));

  sections.push(
    [
      "## Machine-readable",
      `- ${absolute("/feed.xml")}`,
      `- ${absolute("/.well-known/ai-manifest.json")}`,
      `- ${absolute("/sitemap.xml")}`,
      // Ruling (B), 2026-08-11: robots keeps Disallow /api/ but adds an
      // explicit Allow for this one deliberate machine-readable endpoint.
      `- ${absolute("/api/catalog")}`,
    ].join("\n"),
  );

  sections.push(`## Terms
${SITE.citationPolicy}`);

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
