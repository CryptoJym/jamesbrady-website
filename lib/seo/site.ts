// Site-level constants and build stamps.
//
// Host discipline (GEO ruling A, 2026-08-11): www.jamesbrady.org is canonical
// everywhere — canonicals, feed, JSON-LD Person.url and ai-manifest all
// normalize to www. Bare jamesbrady.org must not appear in any source or
// generated artifact (verify-seo check 12).

export const SITE_HOST = "https://www.jamesbrady.org";

export const SITE = {
  host: SITE_HOST,
  name: "James Brady",
  title: "James Brady — builds AI systems that show their work",
  /** The one-line site descriptor used by llms.txt and ai-manifest. */
  descriptor:
    "James Brady builds AI systems that show their work. One person, operating at fleet scale — documenting what actually works.",
  description: "One person, operating at fleet scale — documenting what actually works.",
  location: "Lehi, UT",
  email: "james@utlyze.com",
  citationPolicy:
    "Content © James Brady. Cite the source URL. Figures are computed at build; method is stated on-page.",
} as const;

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return path === "/" ? `${SITE_HOST}/` : `${SITE_HOST}${path}`;
}

/**
 * Build timestamp, frozen at module evaluation. Every "BUILT" nameplate field
 * and the console rail's index stamp read from here, so one build stamps one
 * value everywhere.
 */
export const BUILD_TIME = new Date();

export const BUILD_ISO = BUILD_TIME.toISOString();
export const BUILD_DAY = BUILD_ISO.slice(0, 10);

/** "2026-08-11 09:14 MT" — the comp's stamp format. */
export const BUILD_STAMP = (() => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(BUILD_TIME);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} MT`;
})();
