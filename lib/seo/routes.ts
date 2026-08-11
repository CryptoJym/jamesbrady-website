// The route universe.
//
// verify-seo asserts sitemap === this list. A route present in one and not the
// other is itself a failure, so there is exactly one place to add a page.

import {
  learn,
  lab,
  indexableLab,
  maxModified,
  now,
  theories,
  discoverableTheories,
  work,
} from "@/lib/content";
import { gitLastModified } from "./git";

export type RouteRecord = {
  path: string;
  /** ISO date. Entry routes use dateModified; hand-built routes use git. */
  lastModified: string;
  title: string;
  capsule: string;
  collection: string;
  noindex?: boolean;
};

/** Fallback when git history is unavailable — the newest content date. */
const CONTENT_FLOOR = maxModified([...work, ...theories, ...learn, ...lab, now]);

function gitOr(paths: string[], fallback: string): string {
  return gitLastModified(paths) ?? fallback;
}

export function buildRoutes(): RouteRecord[] {
  const rows: RouteRecord[] = [];

  rows.push({
    path: "/",
    lastModified: gitOr(
      ["app/(site)/page.tsx", "app/(site)/layout.tsx", "content"],
      CONTENT_FLOOR,
    ),
    title: "James Brady — builds AI systems that show their work",
    capsule:
      "James Brady builds AI systems that show their work, and every figure on this site is computed from its source at build rather than typed by hand.",
    collection: "site",
  });

  rows.push({
    path: "/work",
    lastModified: maxModified(work),
    title: "Work",
    capsule:
      "The work index lists products, open-source projects, client work and experiments, filtered in the browser with a count read from what is on screen.",
    collection: "work",
  });
  for (const entry of work) {
    rows.push({
      path: `/work/${entry.slug}`,
      lastModified: entry.dateModified,
      title: entry.title,
      capsule: entry.answerCapsule,
      collection: "work",
    });
  }

  rows.push({
    path: "/theories",
    lastModified: maxModified(discoverableTheories),
    title: "Theories",
    capsule:
      "The theories index lists open questions worked in public, with each theory's maturity state shown as prominently as its title.",
    collection: "theories",
  });
  for (const entry of discoverableTheories) {
    rows.push({
      path: `/theories/${entry.slug}`,
      lastModified: entry.dateModified,
      title: entry.title,
      capsule: entry.answerCapsule,
      collection: "theories",
    });
  }

  rows.push({
    path: "/lab",
    lastModified: maxModified(lab),
    title: "Lab",
    capsule:
      "The lab holds interactive artifacts, each one shipping with a written explanation page; an artifact without one is excluded from search engines by the loader.",
    collection: "lab",
  });

  rows.push({
    path: "/learn",
    lastModified: maxModified(learn),
    title: "Learn",
    capsule:
      "The learn hub introduces three archived volumes — the Primer, the Manuscript and the Workshop — each kept at its original URL with a dated archive badge.",
    collection: "learn",
  });

  rows.push({
    path: "/about",
    lastModified: gitOr(["app/(site)/about/page.tsx"], CONTENT_FLOOR),
    title: "About",
    capsule:
      "James Brady operates two entities: Utlyze, the studio, and New Reward, the agency. The about page also answers how one person checks work before it ships.",
    collection: "site",
  });

  rows.push({
    path: "/contact",
    lastModified: gitOr(["app/(site)/contact/page.tsx", "lib/contact.ts"], CONTENT_FLOOR),
    title: "Contact",
    capsule:
      "Contact routes a qualified enquiry to James Brady through the existing lead gateway, and states plainly what makes a project a strong fit.",
    collection: "site",
  });

  rows.push({
    path: "/now",
    lastModified: now.updated,
    title: now.title,
    capsule: now.answerCapsule,
    collection: "now",
  });

  // Volumes and the two profile routes keep their URLs (ruling G). No moves,
  // no redirects — a redirect on any of these five is a defect.
  const legacy: { path: string; files: string[]; title: string; capsule: string }[] = [
    {
      path: "/primer",
      files: ["app/(legacy)/primer/page.tsx", "app/primer/page.tsx"],
      title: "The Primer",
      capsule: learn[0].answerCapsule,
    },
    {
      path: "/manuscript",
      files: ["app/(legacy)/manuscript/page.tsx", "app/manuscript/page.tsx"],
      title: "The Manuscript",
      capsule: learn[1].answerCapsule,
    },
    {
      path: "/workshop",
      files: ["app/(legacy)/workshop/page.tsx", "app/workshop/page.tsx"],
      title: "The Workshop",
      capsule: learn[2].answerCapsule,
    },
    {
      path: "/links",
      files: ["app/(legacy)/links/page.tsx", "app/links/page.tsx"],
      title: "Links",
      capsule:
        "The links page collects James Brady's public profiles and project destinations in one place, kept at its original URL.",
    },
    {
      path: "/watch",
      files: ["app/(legacy)/watch/page.tsx", "app/watch/page.tsx"],
      title: "Watch",
      capsule:
        "The watch page holds recorded walkthroughs, frozen with the archive and kept at its original URL.",
    },
  ];
  for (const l of legacy) {
    rows.push({
      path: l.path,
      lastModified: gitOr(l.files, CONTENT_FLOOR),
      title: l.title,
      capsule: l.capsule,
      collection: "archive",
    });
  }

  return rows;
}

/** Indexable routes only — what llms.txt, ai-manifest and the sitemap advertise. */
export function indexableRoutes(): RouteRecord[] {
  const noindexLab = lab.length > 0 && indexableLab.length === 0;
  return buildRoutes().filter((r) => {
    if (r.noindex) return false;
    if (r.path === "/lab" && noindexLab) return false;
    return true;
  });
}
