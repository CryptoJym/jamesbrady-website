import { catalog } from "@/lib/catalog";

export function GET() {
  return Response.json({
    name: "James Brady — AI Alchemist Tool Catalog",
    url: "https://jamesbrady.org/manuscript",
    total_tools: catalog.reduce((n, c) => n + c.tools.length, 0),
    total_categories: catalog.length,
    categories: catalog,
  });
}
