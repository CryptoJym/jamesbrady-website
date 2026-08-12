import type { Metadata } from "next";
import Link from "next/link";

import {
  ArchiveBand,
  Dot,
  JsonLd,
  Nameplate,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { catalog } from "@/lib/catalog";
import { learn } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";

/**
 * THE MANUSCRIPT — reskinned in place, wave 4.
 *
 * SAME URL, and the full catalog survives: every category, every tool, every
 * description, every install line and every source link is read from
 * lib/catalog.ts exactly as before. /api/catalog reads the same module, so the
 * page a person sees and the JSON a machine fetches cannot disagree.
 *
 * THE TITLE. "Curated AI Tool Catalog" becomes "Tool catalog" — plain register,
 * and the same words /api/catalog already uses for its `name`. The volume keeps
 * its own name, The Manuscript, in the kicker: that is a proper noun and the
 * learn hub introduces it by that name.
 *
 * THE NUMBERS ARE THE STORY. This page is where the site's worst defect lived:
 * the old build printed "298 Tools cataloged" while the computed count was 36.
 * So the counts here are reduced from the catalog module at render time and
 * carry a provenance plate that names the file they came from. Nothing on this
 * page is a numeral somebody typed.
 */

const VOLUME = learn.find((v) => v.slug === "manuscript")!;
const CAPSULE = buildRoutes().find((r) => r.path === "/manuscript")!.capsule;

/** Computed, never typed. The defect this page exists to not repeat. */
const TOOL_COUNT = catalog.reduce((n, c) => n + c.tools.length, 0);
const CATEGORY_COUNT = catalog.length;

/** Two-digit display, matching the readout on every other page. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

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
    <main id="main" tabIndex={-1}>
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

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>The Manuscript</span>
            <i aria-hidden="true">/</i>
            <span>Archived</span>
          </p>
          <h1>Tool catalog.</h1>
          <p className="page-lead">{CAPSULE}</p>
        </div>
      </div>

      <ArchiveBand date={VOLUME.archivedDate}>
        This volume is kept for reference and is no longer maintained, so a tool
        listed here may have moved, changed name or stopped being developed. It
        stays at its original URL. The same catalog is served as JSON at{" "}
        <a href="/api/catalog">/api/catalog</a>, and the three volumes are
        introduced together on <Link href="/learn">the learn hub</Link>.
      </ArchiveBand>

      <section className="work work--bare">
        <div className="wrap">
          <SectionHead
            eyebrow="What is in it"
            heading="A shelf, arranged by the job each tool does."
            aside="Every entry names what the tool does, how to install it, and where its source lives, so a reader can check it rather than take the recommendation."
          />

          {/*
            The readout panel, doing the one job it exists for. An earlier build
            of this site printed a hand-typed "298 Tools cataloged" against a
            real count of 36. Both figures below are reduced from lib/catalog.ts
            at render time and the sub-line names the file, so the number and
            the way to check it arrive together.
          */}
          <div className="panel panel--readout">
            <div className="panel__head">
              <span>Catalog readout</span>
              <span>
                <Dot state="active" /> Computed
              </span>
            </div>
            <ul className="readout">
              <li className="has-sub">
                <span className="ln">
                  <span className="k">Tools listed</span>
                  <span className="rule" aria-hidden="true" />
                  <span className="v v--sig">{pad(TOOL_COUNT)}</span>
                </span>
                <span className="sub">
                  Summed across every category&rsquo;s tool list in
                  lib/catalog.ts
                </span>
              </li>
              <li className="has-sub">
                <span className="ln">
                  <span className="k">Categories</span>
                  <span className="rule" aria-hidden="true" />
                  <span className="v">{pad(CATEGORY_COUNT)}</span>
                </span>
                <span className="sub">
                  The length of the same list this page renders below
                </span>
              </li>
            </ul>
          </div>

          <Nameplate
            fields={[
              { label: "Source", value: "lib/catalog.ts" },
              {
                label: "Method",
                value: "catalog.reduce((n, c) => n + c.tools.length, 0)",
              },
              { label: "Also at", value: "/api/catalog (same module, as JSON)" },
            ]}
          />

          <p className="chip-row">
            {catalog.map((c) => (
              <a className="chip" href={`#${c.id}`} key={c.id}>
                {c.name}
              </a>
            ))}
          </p>
        </div>
      </section>

      {catalog.map((category, i) => (
        <section className="work" id={category.id} key={category.id}>
          <div className="wrap">
            <SectionHead
              num={String(i + 1).padStart(2, "0")}
              eyebrow="Category"
              heading={category.name}
              aside={category.description}
            />
            {/*
              .grid-work resets the `cards` counter, so each category numbers
              its own tools from 01 and the numeral is generated rather than
              written down. A card that is removed cannot leave a gap behind.
            */}
            <div className="grid-work grid-work--2">
              {category.tools.map((tool) => (
                <article className="card" key={tool.name}>
                  <div className="card__top">
                    <span className="card__idx" aria-hidden="true" />
                    <span className="card__cat">{category.name}</span>
                  </div>
                  <h3 className="card__title">
                    <a
                      className="card__link"
                      href={tool.github}
                      rel="noopener noreferrer"
                    >
                      {tool.name}
                    </a>
                  </h3>
                  <p className="card__body">{tool.description}</p>
                  <p className="card__cmd">{tool.install}</p>
                  <p className="card__foot">
                    <span>Source</span>{" "}
                    <span className="arw" aria-hidden="true">
                      →
                    </span>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="work">
        <div className="wrap">
          <SectionHead
            eyebrow="Honest limits"
            heading="What this catalog does not tell you."
            aside="Inclusion here is not a ranking and it is not an endorsement of current quality. Each entry was checked when it was added; the volume is archived, so none of them has been rechecked since the archive date above. Follow the source link before you install anything."
          />
          <PageNameplate
            source="lib/catalog.ts — the same module /api/catalog serves"
            method="Counts reduced from the catalog at render time; no figure on this page is typed"
          />
        </div>
      </section>
    </main>
  );
}
