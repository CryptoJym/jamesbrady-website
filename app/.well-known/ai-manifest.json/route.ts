import { discoverableTheories, lab, learn, offers, work } from "@/lib/content";
import { indexableRoutes } from "@/lib/seo/routes";
import { NEW_REWARD_ID, PERSON_ID, UTLYZE_ID } from "@/lib/schema/entities";
import { gitShortSha } from "@/lib/seo/git";
import { BUILD_ISO, SITE, absolute } from "@/lib/seo/site";

export const dynamic = "force-static";

/**
 * ai-manifest.json — generated, never hand-edited. `generatedAt` and
 * `contentVersion` come from the build. There is no `last_updated` literal;
 * the old hand-maintained file carried one and it froze in 2025.
 */
export function GET() {
  const routes = indexableRoutes();

  const body = {
    name: SITE.name,
    description: SITE.descriptor,
    url: absolute("/"),
    canonicalHost: SITE.host,
    person: { "@id": PERSON_ID },
    organizations: [{ "@id": UTLYZE_ID }, { "@id": NEW_REWARD_ID }],
    generatedAt: BUILD_ISO,
    contentVersion: gitShortSha(),
    routes: routes.map((r) => ({
      path: r.path,
      url: absolute(r.path),
      title: r.title,
      capsule: r.capsule,
      dateModified: r.lastModified,
      collection: r.collection,
    })),
    collections: [
      { name: "offers", count: offers.length },
      { name: "work", count: work.length },
      { name: "theories", count: discoverableTheories.length },
      { name: "lab", count: lab.filter((l) => !l.noindex).length },
      { name: "learn", count: learn.length },
      { name: "now", count: 1 },
    ],
    machineReadable: [
      absolute("/feed.xml"),
      absolute("/sitemap.xml"),
      absolute("/llms.txt"),
      absolute("/api/catalog"),
    ],
    citationPolicy: SITE.citationPolicy,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
