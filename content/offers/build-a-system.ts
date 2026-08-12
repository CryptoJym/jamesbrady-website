import type { OfferEntry } from "@/lib/content/types";

export const entry: OfferEntry = {
  collection: "offers",
  slug: "build-a-system",
  title: "Build a system that shows its work",
  kicker: "For a founder or an operator with a build to run",
  capsuleQuestion: "What does a build engagement with the studio look like?",
  answerCapsule:
    "Building a system, here, means a scoped engagement that ships in verified waves: a written scope, work landed in waves that each carry their own evidence, an evidence packet a non-technical owner can read, and a handoff where the client owns the repository, the checks and the deployment. Utlyze, the studio James Brady operates, does this work. Nothing is claimed as done until the place it lives has been read back.",
  summary:
    "A scoped build that ships in verified waves, with an evidence packet at the end and the client owning the repository, the checks and the deployment.",
  datePublished: "2026-08-12",
  dateModified: "2026-08-12",
  entities: ["person:james", "org:utlyze"],
  deliveredBy: {
    name: "Utlyze",
    url: "https://utlyze.com",
    role: "the studio that builds products and takes on custom software and systems work",
  },
  audience: [
    "Founders with a product to get in front of users",
    "Operators with a manual process that has outgrown people",
    "Teams that need agent work done without a research project attached",
    "Anyone who has been handed a build they cannot inspect",
  ],
  steps: [
    {
      label: "Scope",
      detail:
        "What is being built, what it has to be true of, and what would count as done. Written down before anything is built, because a scope agreed in conversation is a scope two people remember differently.",
    },
    {
      label: "Build in verified waves",
      detail:
        "Work lands in waves. Each wave has required checks that run on every change and a merge queue that tests changes together before they land, so two changes that pass alone and break together get caught before you see them.",
    },
    {
      label: "Evidence packet",
      detail:
        "Each wave produces the evidence for its own claims: what was checked, what passed, what did not run, and what is still unknown. Missing checks are named as missing rather than left out.",
    },
    {
      label: "Handoff",
      detail:
        "You get the repository, the checks, the deployment and the documentation. The engagement ends with you able to run it without me.",
    },
  ],
  deliverables: [
    {
      label: "The repository, owned by you",
      detail: "Source, history and issues, under your account rather than mine.",
    },
    {
      label: "The checks that hold it up",
      detail:
        "The required checks and the merge queue travel with the repository. They are the part that keeps working after the engagement ends.",
    },
    {
      label: "A running deployment",
      detail: "Live, under your own accounts and your own billing, with the setup written down.",
    },
    {
      label: "An evidence packet per wave",
      detail:
        "What was claimed, how it was checked, and the state of anything that was not checked. It is what makes the next person able to trust the last one.",
    },
  ],
  budgetBands: ["15k_50k", "50k_plus"],
  inquiryType: "production_build",
  ctaLabel: "Start a build enquiry",
  proof: [
    {
      label: "plimsoll, the open-source cost collector, built this way",
      url: "https://github.com/CryptoJym/plimsoll",
      method: "Public repository, Apache-2.0 licensed. Signals read from the GitHub API.",
      capturedAt: "2026-08-11",
    },
    {
      label: "ofone-skillchain, the open method and its validator",
      url: "https://github.com/CryptoJym/ofone-skillchain",
      method: "Public repository, MIT licensed. Signals read from the GitHub API.",
      capturedAt: "2026-08-11",
    },
    {
      label: "This site, which states the method it was built under",
      url: "https://www.jamesbrady.org/about",
      method: "The reliability answer on this site, in plain words rather than process vocabulary.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work-with-me.png",
    imageAlt: "James Brady — a scoped build that ships in verified waves",
  },
  body: `## What you are actually buying

Most build engagements sell you an outcome and hand you a black box. You get a thing that works on the day it is delivered, and no way to tell, six weeks later, whether it still does.

This one sells you the outcome and the machinery that proves it. The same discipline the rest of this site runs on: required checks on every change, a merge queue so changes are tested together before they land, and a rule that a claim is not a result. If a change is supposed to be live, the live page is what gets read, not the message saying it shipped.

That machinery is not overhead you pay for and never see. It is the thing you keep.

## Why waves

A build that lands in one delivery at the end gives you exactly one moment to find out it went wrong, and by then the budget is spent.

Waves are smaller. Each one is scoped, built, checked, and shown to you with its evidence attached before the next one starts. If a wave produces something you did not want, you have lost a wave, not a project. If it produces something you did want, that value is live rather than sitting on a branch.

## What "checked" means here

Whatever grades the work is separate from what produced it, and the standard is frozen before the work starts. If the thing being tested can edit the test, the test decides nothing.

Work moves along a ladder, and each rung is a different claim: open, then checks passing, then reviewed, then merged, then deployed, then checked live. Saying a higher rung than the true one is treated as a defect. The reliability answer on the about page goes through this in full.

## What you own at the end

The repository, the checks, the deployment and the documentation, under your accounts. No part of the system depends on me still being reachable.

Where a third-party project does part of the work, the engagement says so and names it. A build that quietly absorbs someone else's project and calls it bespoke is the kind of thing this site exists to be the opposite of.

## What this page does not claim

No engagement of this shape has a published client name or a published outcome figure on this site yet. Client work is anonymized by agreement, and named results go up only with written clearance.

What is checkable today is the open-source work, which is public and linked from this page, and this site itself, which is built under the method described above.`,
};
