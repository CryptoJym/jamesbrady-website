import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { ArchiveNotice, JsonLd, Provenance, RecordList } from "@/components/fg/Reading";
import { VolumeSection } from "@/components/fg/Volume";
import { catalog } from "@/lib/catalog";
import { learn } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";

/**
 * THE MANUSCRIPT — archived, and re-skinned in place in the Fulgurite system.
 *
 * SAME URL, and the full catalog survives: every category, every tool, every description, every install line and
 * every source link is read from lib/catalog.ts. /api/catalog reads the same module, so the page a person sees and the
 * JSON a machine fetches cannot disagree.
 *
 * THE NUMBERS ARE THE STORY. This page is where the site's worst defect lived: an old build printed a hand-typed tool
 * count eight times the real one. So the counts here are reduced from the catalog module at render time, each with its
 * method one tap away, and nothing on this page is a numeral somebody typed.
 */

const VOLUME = learn.find((v) => v.slug === "manuscript")!;
const CAPSULE = buildRoutes().find((r) => r.path === "/manuscript")!.capsule;

/** Computed, never typed. The defect this page exists to not repeat. */
const TOOL_COUNT = catalog.reduce((n, c) => n + c.tools.length, 0);
const CATEGORY_COUNT = catalog.length;

export const metadata: Metadata = pageMetadata({
  path: "/manuscript",
  title: "Tool catalog",
  description:
    "The Manuscript: a catalog of tools and MCP servers grouped by the job each one does, with an install line and a source link for every entry. Archived.",
  og: {
    image: "/og/manuscript.png",
    imageAlt: "James Brady — The Manuscript, archived",
  },
});

export default function ManuscriptPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page fga-volume">
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/manuscript",
            name: "Tool catalog",
            description: CAPSULE,
            items: catalog.map((c) => ({
              path: `/manuscript#${c.id}`,
              name: c.name,
            })),
          }),
        )}
      />

      <header className="fg-page__head">
        <p className="fg-eyebrow">The Manuscript · Archived</p>
        <h1 className="fg-h1">Tool catalog.</h1>
        <p className="fg-p">{CAPSULE}</p>
      </header>

      <ArchiveNotice date={VOLUME.archivedDate}>
        This volume is kept for reference and is no longer maintained, so a tool listed here may have moved, changed
        name or stopped being developed. It stays at its original URL. The same catalog is served as JSON at{" "}
        <a href="/api/catalog">/api/catalog</a>, and the three volumes are introduced together on{" "}
        <Link href="/learn">the learn hub</Link>.
      </ArchiveNotice>

      <VolumeSection
        id="catalog"
        eyebrow="What is in it"
        heading="A shelf, arranged by the job each tool does."
        aside="Every entry names what the tool does, how to install it, and where its source lives, so a reader can check it rather than take the recommendation."
      >
        {/* Both figures are reduced from lib/catalog.ts at render time, and the line under each names the file, so
            the number and the way to check it arrive together. */}
        <div className="fga-readout" role="group" aria-label="Catalog readout, computed">
          <div>
            <span className="fga-readout__n">
              <Fig n={TOOL_COUNT} m="Summed across every category's tool list in lib/catalog.ts, at build." />
            </span>
            <span className="fga-readout__k">
              Tools listed · summed across every category&rsquo;s tool list in lib/catalog.ts
            </span>
          </div>
          <div>
            <span className="fga-readout__n">
              <Fig n={CATEGORY_COUNT} m="The length of the category list in lib/catalog.ts, at build." />
            </span>
            <span className="fga-readout__k">Categories · the length of the same list this page renders below</span>
          </div>
        </div>
        <RecordList
          rows={[
            ["Source", "lib/catalog.ts"],
            ["Method", "catalog.reduce((n, c) => n + c.tools.length, 0)"],
            ["Also at", "/api/catalog (same module, as JSON)"],
          ]}
        />
        <ul className="fga-jump" aria-label="Categories">
          {catalog.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`}>{c.name}</a>
            </li>
          ))}
        </ul>
      </VolumeSection>

      {catalog.map((category, i) => (
        <VolumeSection
          key={category.id}
          id={category.id}
          num={String(i + 1).padStart(2, "0")}
          eyebrow="Category"
          heading={category.name}
          aside={category.description}
        >
          <ul className="fga-tools">
            {category.tools.map((tool) => (
              <li key={tool.name} className="fga-tool">
                <h3>
                  <a href={tool.github} rel="noopener noreferrer">
                    {tool.name}
                  </a>
                </h3>
                <p>{tool.description}</p>
                <code>{tool.install}</code>
                <p className="fga-tool__src" aria-hidden="true">
                  Source →
                </p>
              </li>
            ))}
          </ul>
        </VolumeSection>
      ))}

      <VolumeSection
        id="catalog-limits"
        className="fga-vsec--limits"
        eyebrow="Honest limits"
        heading="What this catalog does not tell you."
        aside="Inclusion here is not a ranking and it is not an endorsement of current quality. Each entry was checked when it was added; the volume is archived, so none of them has been rechecked since the archive date above. Follow the source link before you install anything."
      />

      <Provenance
        source="lib/catalog.ts — the same module /api/catalog serves"
        method="Counts reduced from the catalog at render time; no figure on this page is typed"
      />
    </main>
  );
}
