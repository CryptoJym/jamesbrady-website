import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd, PageNameplate, SectionHead } from "@/components/site/instruments";
import { DoorRow } from "@/components/site/offers";
import { offers } from "@/lib/content";
import { SAME_AS } from "@/lib/schema/entities";
import { collectionGraph, serializeGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import { buildRoutes } from "@/lib/seo/routes";
import { SITE } from "@/lib/seo/site";

const CAPSULE = buildRoutes().find((r) => r.path === "/links")!.capsule;

export const metadata: Metadata = pageMetadata({
  path: "/links",
  title: "Links",
  description:
    "James Brady's public profiles, the two ways to work with him, and the recorded walkthroughs, in one place.",
  og: { image: "/og/links.png", imageAlt: "James Brady — links" },
});

/**
 * THE BRIDGE.
 *
 * /links is where a video viewer lands, and until wave 3 it landed on the old
 * gold-and-black skin: a different palette, a different type stack, a footer
 * with no route to the work, and a heading that named a framing the register
 * rules retired. A follower arriving from a short video met what looked like a
 * different person's website and had nothing to do next. The URL is unchanged
 * (ruling G, link equity); the skin and the destinations are.
 *
 * PROFILE LIST. Read from SAME_AS in lib/schema/entities.ts, which is also the
 * `sameAs` array in the Person node. One list, so a profile cannot appear in
 * the entity graph and not on the page a human reads, or the other way round.
 *
 * The X and TikTok rows print their FULL URL as the visible value. That is the
 * retired-brand ruling working as written: the token is permitted as those two
 * exact URLs and nowhere else, so the URL is the only shape the label may take.
 */
const PROFILES: { label: string; href: string; note: string; display: string }[] = [
  {
    label: "GitHub",
    href: SAME_AS[0],
    display: "github.com/CryptoJym",
    note: "Every public repository on this site, and the commits behind them.",
  },
  {
    label: "LinkedIn",
    href: SAME_AS[1],
    display: "linkedin.com/in/jamesbrady1",
    note: "Work history and the longer-form posts.",
  },
  {
    label: "X",
    href: SAME_AS[2],
    display: SAME_AS[2],
    note: "Short notes while the work is happening.",
  },
  {
    label: "TikTok",
    href: SAME_AS[3],
    display: SAME_AS[3],
    note: "Short video, usually a system doing something rather than a talking head.",
  },
  {
    label: "Bluesky",
    href: SAME_AS[4],
    display: "bsky.app/profile/utlyzeit.bsky.social",
    note: "The same notes, on the other network.",
  },
  {
    label: "YouTube",
    href: SAME_AS[5],
    display: "youtube.com/channel/UCA_9udyLWeGoJy12vc5TmfA",
    note: "Longer recordings. The channel-ID URL is the verified one.",
  },
  {
    label: "Email",
    href: `mailto:${SITE.email}`,
    display: SITE.email,
    note: "Straight to James. Slower than the form, and it reaches the same person.",
  },
];

const ON_THIS_SITE: { href: string; label: string; note: string }[] = [
  { href: "/work", label: "Work", note: "Products, open source, client work, experiments." },
  { href: "/theories", label: "Theories", note: "Open questions, labelled by how far along they are." },
  { href: "/lab", label: "Lab", note: "Things you can poke at in a browser." },
  { href: "/learn", label: "Learn", note: "Three archived volumes, kept at their original URLs." },
  // "written summary", not "transcript" — wave 4 relabelled the text block
  // under each recording for what it is, and this is one of the two other
  // places the old claim was repeated.
  { href: "/watch", label: "Watch", note: "Recorded walkthroughs, narrated, each with a written summary." },
  { href: "/now", label: "Now", note: "What is actually happening this month, including what is stuck." },
  { href: "/about", label: "About", note: "Who does what, and how the work gets checked." },
  { href: "/contact", label: "Contact", note: "The enquiry form, and what makes a strong fit." },
];

export default function LinksPage() {
  const [getFound, buildSystem] = offers;

  return (
    <main id="main" tabIndex={-1}>
      <JsonLd
        json={serializeGraph(
          collectionGraph({
            path: "/links",
            name: "Links",
            description: CAPSULE,
            items: [
              ...offers.map((o) => ({
                path: `/work-with-me/${o.slug}`,
                name: o.title,
              })),
              ...ON_THIS_SITE.map((l) => ({ path: l.href, name: l.label })),
            ],
          }),
        )}
      />

      <div className="wrap">
        <div className="page-head">
          <p className="kicker">
            <span>Links</span>
            <i aria-hidden="true">/</i>
            <span>{SITE.location}</span>
          </p>
          <h1>Everything, in one place.</h1>
          <p className="page-lead">{CAPSULE}</p>
        </div>
      </div>

      <section className="doorway doorway--bare" aria-labelledby="links-doors">
        <div className="wrap">
          <h2 className="doorway__h" id="links-doors">
            If you came from a video, start here.
          </h2>
          <DoorRow
            label="Ways to work with James Brady"
            doors={[
              {
                label: "Get my business found",
                who: "For an owner whose customers cannot find them",
                detail: `${getFound.summary} Delivered by ${getFound.deliveredBy.name}.`,
                href: `/work-with-me/${getFound.slug}`,
              },
              {
                label: "Build me a system",
                who: "For a founder or an operator with a build to run",
                detail: `${buildSystem.summary} Delivered by ${buildSystem.deliveredBy.name}.`,
                href: `/work-with-me/${buildSystem.slug}`,
              },
              {
                label: "Watch one get built",
                who: "For anyone who would rather see it than read it",
                detail:
                  "Narrated walkthroughs, each with a written summary, kept at their original URL alongside the archive.",
                href: "/watch",
              },
            ]}
          />
        </div>
      </section>

      <section className="work" aria-labelledby="profiles">
        <div className="wrap">
          <SectionHead
            num="01"
            eyebrow="Profiles"
            heading="Where else James Brady posts."
            aside="The same list the site publishes in its structured data, so a machine reading the entity graph and a person reading this page get the same answer."
          />
          <div className="grid-work grid-work--2">
            {PROFILES.map((p) => (
              <article className="card card--link" key={p.label}>
                <div className="card__top">
                  <span className="card__idx" aria-hidden="true" />
                  <span className="card__cat">{p.label}</span>
                </div>
                <h3 className="card__title">
                  <a
                    className="card__link"
                    href={p.href}
                    rel={p.href.startsWith("mailto:") ? undefined : "me noopener noreferrer"}
                  >
                    {p.display}
                  </a>
                </h3>
                <p className="card__body">{p.note}</p>
                <p className="card__foot">
                  <span>Open</span>{" "}
                  <span className="arw" aria-hidden="true">
                    →
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="work" aria-labelledby="on-site">
        <div className="wrap">
          <SectionHead
            num="02"
            eyebrow="On this site"
            heading="The pages worth knowing about."
            aside="Nothing here is behind a form, and nothing important lives only in the chat dock."
          />
          <ul className="linklist">
            {ON_THIS_SITE.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>
                  <span className="linklist__label">
                    {l.label}
                    <span className="arw" aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className="linklist__note">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
          <PageNameplate
            source="lib/schema/entities.ts (the same sameAs list the Person node publishes)"
            method="Profiles read from one array; no second copy is maintained for this page"
          />
        </div>
      </section>
    </main>
  );
}
