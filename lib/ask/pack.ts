// The grounding pack — chatbot-spec § Shape.
//
// The Ask dock has no vector database. The whole site compiles to one markdown
// document that ships as the second system block, and every section carries the
// URL a visitor can open to check the answer. One content source already feeds
// pages, JSON-LD, llms.txt, ai-manifest, sitemap and the feed; this is the
// eighth consumer of the same modules, never a second copy of the text.
//
// Three rules this file exists to keep:
//
//   1. NO VOLATILE DATA. No build timestamp, no request id, no visitor field.
//      The pack is the stable cache prefix (chatbot-spec § Request
//      construction). It changes when the CONTENT changes and at no other time,
//      so xAI's automatic prefix cache keys off a deploy rather than a clock.
//   2. GAPS SURVIVE. Body text goes through toPlainText(), which turns every
//      `[JAMES: ...]` gap into the literal `[pending]`. Deleting a gap is how
//      an open question silently becomes a stated fact, and the assistant would
//      then answer from a sentence that closed over a hole.
//   3. NO CLIENT NAMES. Client work is anonymized in the source. The denylist
//      gate scans the generated pack alongside every other public artifact
//      (verify-seo check 10), so this is enforced, not asserted.

import {
  discoverableTheories,
  lab,
  learn,
  now,
  work,
} from "@/lib/content";
import { toPlainText } from "@/lib/content/markdown";
import { CATEGORY_LABEL, MATURITY_LABEL } from "@/lib/content/types";
import type { AnyEntry, ProofSource } from "@/lib/content/types";
import { indexableRoutes } from "@/lib/seo/routes";
import { SITE, absolute } from "@/lib/seo/site";

/** Field label plus value, dropped entirely when the value is empty. */
function field(label: string, value: string | undefined | null): string[] {
  const text = (value ?? "").trim();
  return text ? [`${label}: ${text}`] : [];
}

/**
 * One sentence, one full stop. Content authors end some `method` strings with a
 * period and some without, and joining them produced "Last push 2026-07-20..".
 * Small, but the pack is prose a model reads closely, and doubled punctuation
 * is the kind of noise that ends up quoted back at a visitor.
 */
function sentence(text: string): string {
  const clean = toPlainText(text).replace(/\.+$/, "");
  return clean ? `${clean}.` : "";
}

/**
 * A measured change, written so a missing half says it is missing.
 *
 * "not recorded to $48.46" reads as a claim that the figure moved FROM nothing,
 * which is a different statement from "one figure exists and the earlier one
 * was never recorded". Absent evidence is written as absent (SITE-BRIEF house
 * rule 0.3), because this is the exact text the assistant answers from.
 */
function changeSpan(delta: { before?: string; after?: string; range?: string }): string {
  if (delta.range) return delta.range;
  if (delta.before && delta.after) return `${delta.before} to ${delta.after}`;
  if (delta.after) return `${delta.after}, with no earlier figure recorded`;
  if (delta.before) return `${delta.before}, with no later figure recorded`;
  return "no figure recorded";
}

function proofLines(proof: ProofSource[]): string[] {
  if (proof.length === 0) return [];
  return [
    "Proof:",
    ...proof.map((p) => {
      const where = p.url
        ? p.url
        : p.artifact
          ? `artifact ${p.artifact}${p.redacted ? " (redacted)" : ""}`
          : "no link recorded";
      return `  - ${sentence(p.label)} Method: ${sentence(p.method)} Captured ${p.capturedAt}. Where: ${where}`;
    }),
  ];
}

function commonLines(entry: AnyEntry): string[] {
  return [
    ...field("Answer capsule", toPlainText(entry.answerCapsule)),
    ...field("Summary", toPlainText(entry.summary)),
    `Published ${entry.datePublished}. Last modified ${entry.dateModified}.`,
  ];
}

function section(title: string, path: string, lines: string[]): string {
  return [`### ${title}`, `Source: ${absolute(path)}`, ...lines].join("\n");
}

function bodyBlock(entry: AnyEntry): string[] {
  const text = toPlainText(entry.body);
  return text ? ["Full text:", text] : [];
}

/**
 * Build the pack. Pure function of the content collections and the route
 * capsules — same input, same bytes, every time. scripts/build-pack.mjs freezes
 * the output into lib/ask/grounding-pack.generated.ts, and verify-ask
 * regenerates and compares so the committed copy cannot drift from its source.
 */
export function buildGroundingPack(): string {
  const routes = indexableRoutes();
  const capsuleFor = (path: string) => routes.find((r) => r.path === path);

  const parts: string[] = [];

  parts.push(
    [
      `# ${SITE.name} — site content pack`,
      "",
      `Every fact the assistant may state lives below. ${SITE.descriptor}`,
      `Canonical host: ${SITE.host}. Location: ${SITE.location}. Contact: ${SITE.email}.`,
      "",
      "How to read this pack:",
      "- Each section starts with the URL that section came from. Cite that URL.",
      "- `[pending]` marks a fact James has not supplied yet. Say the fact is not published; never fill the hole.",
      "- Client work is anonymized on purpose. No client is named here, so no client can be named in an answer.",
      `- ${SITE.citationPolicy}`,
    ].join("\n"),
  );

  // ---- Site pages -------------------------------------------------------
  // Ruling (D), 2026-08-11: /links and /watch join the pack with the rest of
  // the hand-built routes, from the same route table llms.txt and the sitemap
  // read. A page that is in the sitemap and not in the pack is a page the
  // assistant would deny exists.
  const entryPaths = new Set([
    ...work.map((w) => `/work/${w.slug}`),
    ...discoverableTheories.map((t) => `/theories/${t.slug}`),
  ]);
  const sitePages = routes.filter((r) => !entryPaths.has(r.path));

  parts.push(
    [
      "## Pages",
      ...sitePages.map((r) => section(r.title, r.path, [...field("What it covers", r.capsule)])),
    ].join("\n\n"),
  );

  // ---- Work -------------------------------------------------------------
  parts.push(
    [
      "## Work",
      `Systems listed: ${work.length}. This count is computed from the content source, never typed.`,
      ...work.map((entry) =>
        section(entry.title, `/work/${entry.slug}`, [
          `Kind: ${entry.categories.map((c) => CATEGORY_LABEL[c]).join(", ")}`,
          ...commonLines(entry),
          ...field("Stack", entry.stack.join(", ")),
          ...field(
            "Timeframe",
            entry.timeframe.end
              ? `${entry.timeframe.start} to ${entry.timeframe.end}`
              : `${entry.timeframe.start}, ongoing`,
          ),
          ...(entry.repo
            ? [
                `Repository: ${entry.repo.owner}/${entry.repo.name}, ${entry.repo.public ? "public" : "private"}${
                  entry.repo.license ? `, ${entry.repo.license} licensed` : ""
                }${
                  entry.repo.stars !== undefined && entry.repo.snapshotAt
                    ? `. Stars: ${entry.repo.stars}, read on ${entry.repo.snapshotAt}`
                    : ""
                }`,
              ]
            : []),
          ...(entry.anonymized
            ? [
                "Anonymized: yes. Client name and identifying details withheld per agreement; screenshots and metrics otherwise unaltered.",
              ]
            : []),
          ...(entry.deltas.length
            ? [
                "Measured changes:",
                ...entry.deltas.map(
                  (d) =>
                    `  - ${toPlainText(d.metric)}: ${changeSpan(d)}. ` +
                    `Method: ${sentence(d.method)} Timeframe: ${d.timeframe}`,
                ),
              ]
            : []),
          ...proofLines(entry.proof),
          ...(entry.proofMetric
            ? [
                `Home proof slot: ${
                  entry.proofMetric.placeholder || entry.proofMetric.value === undefined
                    ? "no figure derivable yet"
                    : `${entry.proofMetric.prefix ?? ""}${entry.proofMetric.value} ${entry.proofMetric.unit}`
                }. Method: ${sentence(entry.proofMetric.method)} State: ${entry.proofMetric.state}`,
              ]
            : []),
          ...(entry.liveUrls?.length
            ? [
                "Live links checked:",
                ...entry.liveUrls.map((l) => `  - ${l.url} returned ${l.status} on ${l.checkedAt}`),
              ]
            : []),
          ...bodyBlock(entry),
        ]),
      ),
    ].join("\n\n"),
  );

  // ---- Theories ---------------------------------------------------------
  parts.push(
    [
      "## Theories",
      `Theories listed: ${discoverableTheories.length}. A theory at "named only" maturity is deliberately absent from this pack and from every discovery surface.`,
      ...discoverableTheories.map((entry) =>
        section(entry.title, `/theories/${entry.slug}`, [
          `Theory name: ${entry.name}`,
          `Maturity: ${MATURITY_LABEL[entry.maturity]}${entry.paused ? ", paused" : ""}`,
          ...field("Claim", toPlainText(entry.claim)),
          ...field("Abstract", toPlainText(entry.abstract)),
          ...field("In one line", toPlainText(entry.what)),
          ...commonLines(entry),
          ...(entry.artifactUrl
            ? [`Artifact: ${toPlainText(entry.artifactLabel ?? "artifact")} at ${entry.artifactUrl}`]
            : []),
          ...(entry.history.length
            ? [
                "History:",
                ...entry.history.map((h) => `  - ${h.date}: ${h.state}. ${toPlainText(h.note)}`),
              ]
            : []),
          ...proofLines(entry.proof),
          ...bodyBlock(entry),
        ]),
      ),
    ].join("\n\n"),
  );

  // ---- Lab --------------------------------------------------------------
  parts.push(
    [
      "## Lab",
      ...lab.map((entry) =>
        section(entry.title, "/lab", [
          `State: ${entry.stateWord} (${entry.state})`,
          ...field("Written explanation", entry.explanationUrl),
          ...(entry.noindex ? ["Excluded from search engines: yes."] : []),
          ...commonLines(entry),
          ...proofLines(entry.proof),
          ...bodyBlock(entry),
        ]),
      ),
    ].join("\n\n"),
  );

  // ---- Learn ------------------------------------------------------------
  parts.push(
    [
      "## Learn: the archived volumes",
      ...learn.map((entry) =>
        section(entry.title, entry.volumeRoute, [
          `Archived ${entry.archivedDate}. Kept at its original URL.`,
          ...commonLines(entry),
          ...bodyBlock(entry),
        ]),
      ),
    ].join("\n\n"),
  );

  // ---- Now --------------------------------------------------------------
  parts.push(
    [
      "## Now",
      section(now.title, "/now", [
        `Updated ${now.updated}. Say the update date rather than "recently".`,
        ...commonLines(now),
        ...bodyBlock(now),
      ]),
    ].join("\n\n"),
  );

  const capsuleContact = capsuleFor("/contact");
  parts.push(
    [
      "## Reaching James",
      section("How a visitor reaches James", "/contact", [
        ...field("What it covers", capsuleContact?.capsule),
        `Email: ${SITE.email}.`,
        "When a visitor wants to work with James, get in touch, hire him, or send a message, answer with a reach_james block. Never collect a name, an email address, or any other personal detail in your own text: the block renders a form that does that, with consent.",
      ]),
    ].join("\n\n"),
  );

  return `${parts.join("\n\n")}\n`;
}
