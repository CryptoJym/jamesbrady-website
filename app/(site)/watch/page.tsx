import type { Metadata } from "next";
import Link from "next/link";

import {
  ArchiveBand,
  JsonLd,
  PageNameplate,
  SectionHead,
} from "@/components/site/instruments";
import { WATCH_ARCHIVED, watch } from "@/content/watch";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";

/**
 * WATCH — reskinned in place, wave 4.
 *
 * SAME URL (ruling G, 2026-08-11: link equity). All three recordings, their
 * descriptions and their text blocks survive; the data moved to
 * content/watch/index.ts so the archive date is read from a source rather than
 * written into the template, the way every other dated thing on this site is.
 *
 * REGISTER. The first recording carried the retired mystical framing in its
 * title, its text block, and BOTH of its asset paths. A file path inside a
 * `src` attribute is rendered HTML and the register scan reads rendered HTML,
 * so the assets were renamed alongside the copy. The recordings themselves are
 * byte-identical; the module note in content/watch/index.ts records the old and
 * new names, and why the text block is labelled a summary rather than a
 * transcript.
 */

const CAPSULE = buildRoutes().find((r) => r.path === "/watch")!.capsule;

export const metadata: Metadata = pageMetadata({
  path: "/watch",
  title: "Watch",
  description:
    "Recorded walkthroughs from James Brady, each with a direct MP4 and a written summary. Archived alongside the volumes and kept at its original URL.",
  og: { image: "/og/watch.png", imageAlt: "James Brady — Watch, archived" },
});

export default function WatchPage() {
  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/watch",
            name: "Watch",
            description: CAPSULE,
            items: watch.map((v) => ({ path: `/watch#${v.id}`, name: v.title })),
          }),
        )}
      />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>Watch</span>
            <i aria-hidden="true">/</i>
            <span>Archived</span>
          </p>
          <h1>Recorded walkthroughs.</h1>
          <p className="page-lead">{CAPSULE}</p>
        </div>
      </div>

      <ArchiveBand date={WATCH_ARCHIVED}>
        These recordings are kept for reference and no new ones are being made.
        They stay at their original URL. Each one plays here and also downloads
        as a plain MP4, so nothing depends on this page staying up. What is
        current is on <Link href="/now">now</Link>, and the written volumes are
        on <Link href="/learn">the learn hub</Link>.
      </ArchiveBand>

      <section className="work work--bare">
        <div className="wrap">
          <SectionHead
            eyebrow="Recordings"
            heading="Three, each with the file behind it."
            aside="Every recording is served from this site rather than embedded from a platform, so it plays with no third-party script and downloads as an ordinary file."
          />
        </div>
      </section>

      {watch.map((video, i) => (
        <section className="work" id={video.id} key={video.id}>
          <div className="wrap">
            <SectionHead
              num={String(i + 1).padStart(2, "0")}
              eyebrow="Walkthrough"
              heading={video.title}
              aside={video.description}
            />

            <figure className="vid">
              {/* No <track>: no caption file exists for these recordings, and
                  the "Honest limits" section at the foot of this page says so
                  rather than the page implying otherwise. */}
              <video controls preload="metadata" playsInline poster={video.poster}>
                <source src={video.src} type="video/mp4" />
              </video>
              <figcaption className="vid__row">
                <a href={video.src} rel="noopener noreferrer">
                  Open the MP4
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                </a>
                <a href={video.src} download>
                  Download
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                </a>
              </figcaption>
            </figure>

            {/*
              Labelled "Summary", not "Transcript". Three sentences against a
              multi-minute recording was never a transcript, and the first of
              these was rewritten out of the retired register in this wave,
              which makes it definitively not verbatim. Calling a paraphrase a
              transcript would replace one register defect with an honesty one.
            */}
            <div className="defs defs--after">
              <div>
                <p className="defs__label">Summary</p>
                <p className="defs__detail">{video.summary}</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="work">
        <div className="wrap">
          <SectionHead
            eyebrow="Honest limits"
            heading="What is not published here."
            aside="No full transcript or caption file exists for these recordings. The summary under each one is a written description, not a record of what is said, and this page does not claim otherwise. If a transcript is produced later it will appear here and be labelled as one."
          />
          <PageNameplate
            source="content/watch/index.ts — one entry per recording, with the file it plays"
            method="Archive date read from the module; the recordings are served from this site, not embedded"
          />
        </div>
      </section>
    </main>
  );
}
