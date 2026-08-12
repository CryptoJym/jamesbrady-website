// Page prose that carries pending-from-James gaps.
//
// It used to live inside app/(site)/about/page.tsx and app/(site)/contact/
// page.tsx as local consts, which meant nothing else could read it. Two things
// now need to: the buyer render mode, which pairs each gap with a third-person
// phrasing, and /now, which lists every open question the whole site is still
// carrying. Prose a second consumer has to read is content, so it lives here
// with the collections rather than inside one template.
//
// The `[JAMES: …]` marks are untouched, including the text inside them
// (content-register Part 4.2). What is new is `publicNotes`: one third-person
// sentence per gap, in gap order, stating the same absence to a reader who is
// not the owner. Both renderings say the fact is missing; only the address
// changes.

export type SiteProse = {
  id: string;
  /** The route this prose renders on, for the /now register. */
  path: string;
  /** What a reader of /now sees as the source of the question. */
  where: string;
  body: string;
  /** One per gap, in gap order. The build throws if a gap has no note. */
  publicNotes: string[];
};

/*
 * "One person, operating at fleet scale" is OWNER-APPROVED COPY, not an
 * unresolved question (review addendum, A7). SITE-BRIEF.md line 8 sets the
 * support line verbatim and the decisions log ratifies it on 2026-08-11
 * ("Hero: 'builds AI systems that show their work' + fleet-scale support. —
 * James"). The [JAMES:] clearance mark that used to sit under the doctrine
 * section asked whether the fleet could be described in public at all; that
 * ruling answers it, so the mark is resolved and the copy stands.
 *
 * Still open here, and deliberately: the human story, the multi-year goal,
 * the real photograph, the entity-structure confirmation, and the one
 * measured throughput figure. Those are facts nobody but James has.
 */
export const aboutStory: SiteProse = {
  id: "about-story",
  path: "/about",
  where: "About, the short version",
  publicNotes: [
    "The personal history behind this work is not published here yet.",
    "Neither is the multi-year goal, in James Brady's own words.",
    "A photograph of James Brady has not been published here yet either.",
    "How these two names sit together as legal entities is not confirmed on this page yet, so the split above is the working description rather than the paperwork.",
  ],
  body: `## The short version

James Brady builds AI systems that show their work. One person, operating at fleet scale, documenting what actually works. Based in Lehi, Utah.

[JAMES: the human story. Two or three paragraphs, in your voice, covering: how you got here, what you were doing before this, and why you work this way instead of some other way. This is the single biggest gap on the page. Everything else below is process, and process without a person reads like a manual.]

[JAMES: one sentence on what you are trying to build over the next few years. Not a mission statement. The actual goal.]

[JAMES: a real photograph. The site brief lists a real photo asset as a build gate.]

## Who does what

Three names show up across this site, and they are not the same thing.

**James Brady** is the person. The theories, the open-source projects, and the writing are mine.

**Utlyze** is the studio. It builds products and takes on custom software and systems work.

**New Reward** is the agency. It does the visibility work: measuring how findable a business is in search and inside AI assistants, and then fixing it.

I operate both. When a page on this site says a client engagement, it names the industry and not the company, unless that company has given written permission to be named.

[JAMES: confirm this split is how you want it stated, and confirm the legal entity names and structure. Is Utlyze the parent, is New Reward a brand under it, or are they separate? This paragraph should match reality exactly, because it is the one a lawyer or a prospective client will read closely.]`,
};

export const aboutDoctrine: SiteProse = {
  id: "about-doctrine",
  path: "/about",
  where: "About, how the work gets checked",
  publicNotes: [
    "The throughput figure has been measured but is not published here yet, so this section stays qualitative.",
  ],
  body: `**Machines hold the gates, not memory.** Required checks run on every change. A merge queue tests changes together, in order, before they land, so two changes that each pass alone but break together get caught before a person sees them. None of this depends on anyone remembering to run something.

**Numbers are computed, not typed.** Every number on this site is derived from its source when the page is built. The old version of this site displayed a hand-typed count that was wrong by a factor of eight. That class of mistake is now impossible here, by construction.

**Irreversible things stop for a human.** Sending a client message, spending money, publishing, deploying, deleting data. Agents prepare those. A person approves them. That gate is the design, and not something I am working around.

[JAMES: one measured throughput number would make this section land, with its method and window. Something in the shape of "N changes merged in a 7-day window, every one through the same required checks". You have measured this. Approve a figure and a window, or this section stays qualitative.]

## What I use, and what is not mine

\`OpenClaw\` is a third-party project. I run and extend a self-hosted instance of it, with custom skills, a gateway, and hardware hookups. I did not build OpenClaw.

\`architect-loop\` is a fork of a project by Dan McInerney. I run a heavily customized copy daily and have contributed a fix upstream. The original design is his.

I mention both because a portfolio that quietly absorbs other people's work is exactly the kind of thing this site is supposed to be the opposite of.`,
};

export const contactQualify: SiteProse = {
  id: "contact-qualify",
  path: "/contact",
  where: "Contact, what makes a strong fit",
  publicNotes: [
    "The three points above are carried over from the earlier site. A qualification in James Brady's own words is not published here yet.",
  ],
  body: `## What makes a strong fit

- A real operating problem, not an AI demo looking for a home.
- Access to the people, the process, or the data the system has to serve.
- A willingness to define what success means before choosing the tools.

## What this is not

If what you want is a headcount replacement, a number to put in a deck, or a system nobody will be allowed to check, we will both have a bad time. The work on this site is built to be inspected. That only pays off if you want it inspected.

[JAMES: what makes someone a strong fit to reach out, in one or two lines, in your words? The three bullets above are carried over from the current site. A real qualification in your voice would be stronger than a generic one.]`,
};

/** Every prose block on a hand-built page that carries at least one gap. */
export const siteProse: SiteProse[] = [aboutStory, aboutDoctrine, contactQualify];
