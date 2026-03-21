import { catalog } from "@/lib/catalog";

export function GET() {
  const now = new Date().toUTCString();

  const items = [
    {
      title: "The Primer — How Coding Systems Work",
      link: "https://jamesbrady.org/primer",
      description:
        "Code, the stack, AI agents, skills, and MCP — explained for humans.",
    },
    {
      title: "The Manuscript — Curated Tools & Servers",
      link: "https://jamesbrady.org/manuscript",
      description: `A curated catalog of ${catalog.reduce((n, c) => n + c.tools.length, 0)} tools across ${catalog.length} categories.`,
    },
    {
      title: "The Workshop — Build Something",
      link: "https://jamesbrady.org/workshop",
      description:
        "Three practical guides: set up an AI agent, install skills, connect MCP servers.",
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>James Brady — AI Alchemist</title>
    <link>https://jamesbrady.org</link>
    <description>AI systems, protocols, and programs on a mathematical substrate. Tools that work.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://jamesbrady.org/feed.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description>${item.description}</description>
      <guid>${item.link}</guid>
    </item>`
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
