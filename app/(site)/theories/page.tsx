import type { Metadata } from "next";
import Link from "next/link";

import { Fig } from "@/components/fg/Fig";
import { JsonLd, Provenance } from "@/components/fg/Reading";
import { TheoryLabel } from "@/components/fg/Tray";
import { discoverableTheories, theoriesActive, theoriesPaused } from "@/lib/content";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";

const CAPSULE =
  "The theories index lists open questions worked in public, with each theory's maturity state shown as prominently as its title.";

const COUNT_METHOD = "Theories listed below (maturity at least sketched), counted from the typed content source at build.";

export const metadata: Metadata = pageMetadata({
  path: "/theories",
  title: "Theories",
  description:
    "Open questions worked in public, each labelled by what it actually is: named, sketched, developed, or a live demo.",
  og: { image: "/og/theories.png", imageAlt: "James Brady — theories index" },
});

export default function TheoriesIndexPage() {
  return (
    <main id="main" tabIndex={-1} className="fg-page fga-page">
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/theories",
            name: "Theories",
            description: CAPSULE,
            items: discoverableTheories.map((t) => ({ path: `/theories/${t.slug}`, name: t.name })),
          }),
        )}
      />
      <header className="fg-page__head">
        <p className="fg-eyebrow">Theories</p>
        <h1 className="fg-h1">Open questions, worked in public.</h1>
        <p className="fg-p">{CAPSULE}</p>
        <p className="fg-attrib fga-method">
          The ladder is named, sketched, developed, live demo, with paused as a separate flag, because paused is a
          status, not a rung. <Fig n={theoriesActive} m={`Not paused. ${COUNT_METHOD}`} /> active,{" "}
          <Fig n={theoriesPaused} m={`Paused. ${COUNT_METHOD}`} /> paused. Numbers follow the order the theories first
          appeared.
        </p>
      </header>

      <ol className="fga-rows">
        {discoverableTheories.map((t) => (
          <li key={t.slug} className="fga-row">
            <div className="fga-row__side">
              <TheoryLabel t={t} />
            </div>
            <div className="fga-row__main">
              <h2 className="fga-row__q">
                <Link href={`/theories/${t.slug}`}>{t.title}</Link>
              </h2>
              <p className="fg-muted fga-row__what">{t.what}</p>
              <p className="fga-go" aria-hidden="true">
                Read it →
              </p>
            </div>
          </li>
        ))}
      </ol>

      <Provenance
        source="The typed content source"
        method="Listed where maturity is at least sketched; the count and the rows are the same list"
      />
    </main>
  );
}
