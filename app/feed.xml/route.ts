import { discoverableTheories, work } from "@/lib/content";
import { SITE, absolute } from "@/lib/seo/site";

export const dynamic = "force-static";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

/**
 * RSS, generated from the collections.
 *
 * Channel lastBuildDate is max(item dateModified), NOT new Date(): a feed
 * whose build date moves without its content moving trains aggregators to
 * ignore it. Every link is www — the old feed emitted bare jamesbrady.org,
 * which undercut the canonicals.
 */
export function GET() {
  const items = [
    ...work.map((w) => ({
      title: w.title,
      path: `/work/${w.slug}`,
      description: w.answerCapsule,
      datePublished: w.datePublished,
      dateModified: w.dateModified,
      category: "Work",
    })),
    ...discoverableTheories.map((t) => ({
      title: t.title,
      path: `/theories/${t.slug}`,
      description: t.answerCapsule,
      datePublished: t.datePublished,
      dateModified: t.dateModified,
      category: "Theories",
    })),
  ]
    .sort((a, b) => (a.dateModified < b.dateModified ? 1 : -1))
    .slice(0, 50);

  const lastBuildDate = rfc822(
    items.map((i) => i.dateModified).sort().slice(-1)[0] ?? items[0].datePublished,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${absolute("/")}</link>
    <description>${esc(SITE.descriptor)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${absolute("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${esc(item.title)}</title>
      <link>${absolute(item.path)}</link>
      <guid isPermaLink="true">${absolute(item.path)}</guid>
      <pubDate>${rfc822(item.datePublished)}</pubDate>
      <category>${esc(item.category)}</category>
      <description>${esc(item.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
