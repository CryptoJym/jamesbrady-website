import type { WorkEntry } from "@/lib/content/types";

/**
 * RECATEGORIZED PER OWNER RECORDS 2026-08-11 (independent review, P2-9).
 *
 * seopr1.com was filed as `client-work` and `anonymized: true`, which put a
 * withheld-names note on a page with no client on it. The owner's own records
 * are explicit — "SEOPR1 own marketing site" — so it is James's marketing
 * property, not client work: category `products` only, `anonymized: false`,
 * and the anonymization note is gone from the body. That ruling also resolves
 * the second [JAMES:] mark this entry carried, which asked exactly this
 * question. The performance-number mark stays open: no measurement exists yet.
 */
export const entry: WorkEntry = {
  collection: "work",
  slug: "seopr1",
  title: "seopr1.com",
  kicker: "Marketing site that has to prove itself",
  categories: ["products"],
  answerCapsule:
    "seopr1.com is a five-page marketing site for AI-search visibility, built so the site itself survives the scrutiny the service invites. Pages ship as static HTML with one framework dependency; a WebGL tuning fork tied to scroll carries the hero, and every effect has an explicit fallback. If WebGL is missing, the whole DOM experience remains and only the 3D drops. Nothing important lives inside the animation.",
  summary:
    "A five-page site selling AI-search visibility, built speed-first: static pages, one dependency, and an explicit fallback for every effect.",
  datePublished: "2026-08-11",
  dateModified: "2026-08-11",
  entities: ["person:james", "org:new-reward"],
  stack: [
    "Astro 6",
    "three.js r128",
    "GSAP + ScrollTrigger",
    "Lenis",
    "SVG filters",
    "Vercel",
  ],
  timeframe: { start: "2026-07" },
  anonymized: false,
  footFacts: [
    { label: "Live" },
    {
      count: 1,
      unit: "production dependency",
      method:
        "Read from package.json in CryptoJym/seopr1-site via the GitHub API on 2026-08-11: astro ^6.2.2 is the only production dependency.",
    },
  ],
  repo: {
    owner: "CryptoJym",
    name: "seopr1-site",
    public: true,
    stars: 0,
    snapshotAt: "2026-08-11",
    lastPush: "2026-08-11",
  },
  liveUrls: [{ url: "https://seopr1.com", checkedAt: "2026-08-11", status: 200 }],
  deltas: [],
  proof: [
    {
      label: "Live site — seopr1.com",
      url: "https://seopr1.com",
      method: "HTTP GET, returned 200.",
      capturedAt: "2026-08-11",
    },
    {
      label: "Repository — CryptoJym/seopr1-site",
      url: "https://github.com/CryptoJym/seopr1-site",
      method:
        "GitHub API read, public repo. One production dependency (astro ^6.2.2). Five pages. robots.txt, sitemap.xml and an OG image ship with the site.",
      capturedAt: "2026-08-11",
    },
  ],
  og: {
    image: "/og/work.png",
    imageAlt: "James Brady — case study: seopr1.com, a speed-first marketing site",
  },
  body: `## The problem

A site that sells AI-search visibility has a credibility trap built into it. If the site itself is slow, invisible to crawlers, or generic, the pitch is dead on arrival. It also has a plain business job: explain a new service to professional firms who have not heard of it, and book a call.

## What I built

A five-page site built for speed first and motion second. The hero carries a 3D tuning fork rendered in WebGL, tied to scroll. Ripple and wave layers sit behind the copy. The whole thing ships as static pages with one framework dependency, so the visual ambition does not cost load time.

## How it works in plain words

The site is built with Astro, which sends plain HTML and adds interactivity only where it is needed. The 3D fork runs on WebGL through three.js, driven by GSAP ScrollTrigger, so the object turns as you read.

The interesting part is what happens when the fancy layer is not available. If WebGL is missing, the code keeps the whole DOM experience, reveals and theme included, and drops only the 3D. On small screens the wave canvas is switched off entirely, and a legibility plate sits behind copy wherever the fork would pass under text. Nothing important lives inside the animation.

Structured data describes the service in the page source, so an assistant reading the page gets the same explanation a person does. Booking runs through an embedded scheduler, so the call happens in one click instead of a form and a wait.

## What is not measured here

Accessibility and fallback behaviour are in the source rather than asserted here: the WebGL branch has an explicit no-WebGL path, and decorative canvases carry \`aria-hidden\`.

[JAMES: supply a performance number with its method. A Lighthouse or CrUX score for seopr1.com, with the date and the device profile. The site brief bans typed numbers, so this needs a real measurement you approve.]

## Stack

Astro 6. three.js r128. GSAP with ScrollTrigger. Lenis for smooth scroll. SVG filters for ripple distortion. Deployed on Vercel. Booking through an embedded scheduler widget.`,
};
