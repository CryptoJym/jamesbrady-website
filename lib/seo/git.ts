import { execFileSync } from "node:child_process";

// Server-only. Kept out of lib/seo/site.ts because that module is imported by
// client components, and webpack resolves `node:` imports statically even when
// the call is lazy.

/**
 * Git last-commit date (YYYY-MM-DD) for a set of paths, used as the sitemap
 * `lastModified` for hand-built TSX routes (geo-seo-spec §5.3). Requires full
 * history — a shallow clone collapses every date to the clone date, which
 * verify-seo check 3 catches. Returns null rather than lying.
 */
export function gitLastModified(paths: string[]): string | null {
  const dates = paths
    .map((p) => {
      try {
        // --follow so a route that was MOVED (into a route group, say) keeps
        // the history of the file it came from. Without it, restructuring the
        // app directory would silently reset every archived page's lastmod to
        // the day of the move.
        return execFileSync("git", ["log", "-1", "--follow", "--format=%cI", "--", p], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort().slice(-1)[0].slice(0, 10);
}

/** Git short SHA of the build. Never typed; null rather than a made-up value. */
export function gitShortSha(): string | null {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}
