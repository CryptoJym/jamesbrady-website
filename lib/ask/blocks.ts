// Block to view. The decision half of the renderer, kept out of React so it can
// be tested by `node` without a browser (verify-ask --offline).
//
// FORWARD COMPATIBILITY IS THE POINT. chatbot-spec REPLY_SCHEMA v1 is explicitly
// "forward-compatible for v2 rich cards": v2 adds comparison tables and full
// project cards under the same schema. A v1 renderer meeting a v2 block must
// show the visitor something true rather than an empty space or a crash, so an
// unknown type falls back to text — and the fallback reads whatever string the
// block does carry instead of throwing the content away.

export type RefFamily = "work" | "theory";

export type BlockView =
  | { kind: "text"; markdown: string }
  | { kind: "sources"; pages: { title: string; url: string }[] }
  | { kind: "ref"; family: RefFamily; href: string; slug: string; blurb: string }
  | { kind: "reach"; reason: string }
  | { kind: "decline"; message: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A slug only ever becomes a path here, and only if it is a slug. */
export function refHref(family: RefFamily, slug: string): string | null {
  if (!SLUG.test(slug)) return null;
  return family === "work" ? `/work/${slug}` : `/theories/${slug}`;
}

/** First usable string on an unrecognised block, so a v2 block still says something. */
function salvageText(block: Record<string, unknown>): string | null {
  for (const key of ["markdown", "message", "text", "blurb", "reason", "summary", "title"]) {
    const value = block[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function describeBlock(input: unknown): BlockView {
  if (typeof input !== "object" || input === null) {
    return { kind: "text", markdown: "" };
  }
  const block = input as Record<string, unknown>;

  switch (block.type) {
    case "text":
      return { kind: "text", markdown: typeof block.markdown === "string" ? block.markdown : "" };

    case "sources": {
      const pages = Array.isArray(block.pages)
        ? block.pages
            .filter(
              (page): page is { title: string; url: string } =>
                typeof page === "object" &&
                page !== null &&
                typeof (page as { title?: unknown }).title === "string" &&
                typeof (page as { url?: unknown }).url === "string",
            )
            .map((page) => ({ title: page.title, url: page.url }))
        : [];
      return { kind: "sources", pages };
    }

    case "project_ref":
    case "theory_ref": {
      const family: RefFamily = block.type === "project_ref" ? "work" : "theory";
      const slug = typeof block.slug === "string" ? block.slug : "";
      const href = refHref(family, slug);
      const blurb = typeof block.blurb === "string" ? block.blurb : "";
      // A ref whose slug is not a slug is not a link. It degrades to its own
      // words rather than becoming an anchor pointing somewhere unintended.
      if (!href) return { kind: "text", markdown: blurb };
      return { kind: "ref", family, href, slug, blurb };
    }

    case "reach_james":
      return { kind: "reach", reason: typeof block.reason === "string" ? block.reason : "" };

    case "decline":
      return { kind: "decline", message: typeof block.message === "string" ? block.message : "" };

    default:
      return { kind: "text", markdown: salvageText(block) ?? "" };
  }
}
