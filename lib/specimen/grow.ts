// Grows the fulgurite from what James built. Pure data in, plain arrays out: no three.js here,
// so the same shape can be rendered in the browser and exported for a still.
//
// The rules of the object, which the page states in plain words:
//   · Depth is time. The surface is his first public work with AI, in 2023; the tip is the day the data was read.
//   · Each thread is a side of the specimen. Each repository is a fork on its thread's side. Unthreaded
//     repositories are twigs on the trunk.
//   · Work with no public repository (a client's system, a company, a class) grows a fork of its own, from the
//     day it began (content/built).
//   · Each fork carries its work's status. Live and shipped work is the clearest, brightest glass.
//   · Each merged pull request is a bead of glass, placed at the depth of its merge date.
//   · Each result for a client, and each group of people taught, is a bead of the second kind: larger, brighter.
//   · Private work is frosted: it is drawn, but nothing inside it is shown.
//   · Work that was cut ends in a clean break.
//   · Thickness follows activity; the tip's heat follows the last seven days.
//
// Deterministic: a seeded generator, so every visitor sees the same object for the same data.

import type { Built, BuiltStatus } from "@/content/built";
import type { Thread } from "@/content/history/threads";

export type Snapshot = {
  generatedAt: string;
  totals: { mergedPublicAll: number; mergedPublic30d: number; publicRepos: number; publicStars: number };
  repos: { name: string; created: string; pushed: string; stars: number; fork: boolean; merges: string[] }[];
  upstream: { name: string; date: string }[];
  anonymous: { ownRepos: string[]; otherPeoplesRepos: string[] };
  releases: Record<string, { tag: string; date: string }[]>;
};

export type Vec3 = [number, number, number];

export type Tube = {
  id: string;
  kind: "trunk" | "branch" | "twig" | "private";
  thread: string | null;
  label: string | null;
  repo: string | null;
  /** The piece of work (content/built) this fork is, when it is one. */
  item: string | null;
  /** Its status: live and shipped glass is the clearest. Null where no study item covers the fork. */
  status: BuiltStatus | null;
  points: Vec3[];
  radii: number[];
  /** Normalised time (0 = surface, 1 = tip) at each point. */
  t: number[];
  /** 0..1 glow at each point: the growing tips of work with merges in the last seven days. */
  heat: number[];
  frosted: boolean;
  cut: boolean;
  start: string;
  end: string;
};

/** A merged change, or an outcome: a result for a client, or people taught. */
export type Bead = { p: Vec3; r: number; thread: string | null; date: string; kind: "merge" | "outcome"; item: string | null };

export type ScaleMark = { date: string; label: string; y: number; major: boolean };

export type Specimen = {
  tubes: Tube[];
  beads: Bead[];
  scale: ScaleMark[];
  height: number;
  /** Merges in the seven days before the snapshot, which heat the tip. */
  heat: number;
  generatedAt: string;
};

const DAY = 864e5;
const toDay = (d: string) => Math.floor(Date.parse(d.slice(0, 10) + "T00:00:00Z") / DAY);
const fromDay = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);

/** The surface: nothing grows above his first public work with AI. */
const SURFACE = "2023-03-01";

/** A content date (YYYY, YYYY-MM or YYYY-MM-DD) as a day: a month's start, middle or end. */
function dayOf(d: string, at: "start" | "mid" | "end"): string {
  if (d.length === 10) return d;
  if (d.length === 7) return `${d}-${at === "start" ? "01" : at === "mid" ? "15" : "28"}`;
  return `${d}-${at === "start" ? "01-01" : at === "mid" ? "07-01" : "12-28"}`;
}

/** Time warp: quiet years are short, busy months are long. The page's depth scale shows the real dates. */
function makeDepth(now: string) {
  const anchors: [number, number][] = [
    [toDay(SURFACE), 0.0],
    [toDay("2024-09-01"), 0.05],
    [toDay("2025-05-01"), 0.11],
    [toDay("2025-10-01"), 0.35],
    [toDay("2026-04-01"), 0.49],
    [toDay("2026-08-01"), 0.67],
    [toDay("2026-09-01"), 0.81],
    [toDay(now) + 1, 1.0],
  ];
  return (date: string) => {
    const d = toDay(date);
    if (d <= anchors[0][0]) return 0;
    for (let i = 1; i < anchors.length; i++) {
      const [d1, y1] = anchors[i];
      const [d0, y0] = anchors[i - 1];
      if (d <= d1) return y0 + ((d - d0) / Math.max(1, d1 - d0)) * (y1 - y0);
    }
    return 1;
  };
}

function rng(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const monthOf = (d: string) => d.slice(0, 7);

/** Does this piece of work grow a fork of its own (it has no repository, private branch or dated span to colour)? */
export const growsOwnBranch = (b: Built) => !b.repos?.length && !b.privateBranch && !b.outside && !b.span;

export function grow(snapshot: Snapshot, threads: Thread[], opts: { height?: number; built?: Built[] } = {}): Specimen {
  const H = opts.height ?? 12;
  const built = opts.built ?? [];
  const now = snapshot.generatedAt.slice(0, 10);
  const depth = makeDepth(now);
  const yOf = (date: string) => -H * depth(date);
  const tubes: Tube[] = [];
  const beads: Bead[] = [];

  // Every piece of work names a thread that exists, and every repository it claims is in the public record: a typo
  // would otherwise leave a fork uncoloured, silently.
  const threadIds = new Set(threads.map((t) => t.id));
  const named = new Set(snapshot.repos.map((r) => r.name.toLowerCase()));
  for (const b of built) {
    if (!b.outside && !threadIds.has(b.thread)) throw new Error(`[specimen] ${b.id}: no thread "${b.thread}"`);
    const th = threads.find((t) => t.id === b.thread);
    for (const r of b.repos ?? []) {
      if (!named.has(r.toLowerCase())) throw new Error(`[specimen] ${b.id}: ${r} is not in the public-record snapshot`);
    }
    if (b.privateBranch && !th?.private?.some((p) => p.label === b.privateBranch)) {
      throw new Error(`[specimen] ${b.id}: thread "${b.thread}" has no private branch "${b.privateBranch}"`);
    }
    if (b.span && !th?.span) throw new Error(`[specimen] ${b.id}: thread "${b.thread}" has no dated span`);
  }
  const itemForRepo = new Map<string, Built>();
  const itemForPrivate = new Map<string, Built>();
  let itemForOutside: Built | null = null;
  const itemForSpan = new Map<string, Built>();
  for (const b of built) {
    for (const r of b.repos ?? []) if (!itemForRepo.has(r.toLowerCase())) itemForRepo.set(r.toLowerCase(), b);
    if (b.privateBranch) itemForPrivate.set(`${b.thread}:${b.privateBranch}`, b);
    if (b.outside) itemForOutside = b;
    if (b.span) itemForSpan.set(b.thread, b);
  }

  // Activity per month, all public merges (named and anonymous), for the trunk's thickness.
  const allMerges = [
    ...snapshot.repos.flatMap((r) => r.merges),
    ...snapshot.anonymous.ownRepos,
    ...snapshot.anonymous.otherPeoplesRepos,
    ...snapshot.upstream.map((u) => u.date),
  ];
  const perMonth = new Map<string, number>();
  for (const d of allMerges) perMonth.set(monthOf(d), (perMonth.get(monthOf(d)) ?? 0) + 1);
  const maxMonth = Math.max(1, ...perMonth.values());
  const activity = (date: string) => Math.sqrt((perMonth.get(monthOf(date)) ?? 0) / maxMonth);

  // ---- The trunk: a strike from the surface to the tip. -------------------------------------------
  // It starts at the first work anything grows from: a public repository, or dated work that grows its own fork.
  const r0 = rng("trunk:" + snapshot.repos.length);
  const trunkPts: Vec3[] = [];
  const trunkR: number[] = [];
  const trunkT: number[] = [];
  const clampSurface = (d: string) => (d < SURFACE ? SURFACE : d);
  const first = [
    ...snapshot.repos.map((r) => r.created),
    ...built.filter(growsOwnBranch).map((b) => clampSurface(dayOf(b.start, "start"))),
  ].reduce((m, d) => (d < m ? d : m), now);
  const d0 = toDay(first);
  const d1 = toDay(now);
  const steps = 96;
  let x = 0;
  let z = 0;
  for (let i = 0; i <= steps; i++) {
    const date = fromDay(Math.round(d0 + ((d1 - d0) * i) / steps));
    if (i > 0) {
      const kink = r0() < 0.22 ? 3.2 : 1;
      x += (r0() - 0.5) * 0.3 * kink - x * 0.1;
      z += (r0() - 0.5) * 0.3 * kink - z * 0.1;
    }
    trunkPts.push([x, yOf(date), z]);
    trunkR.push((0.07 + 0.15 * activity(date)) * (0.8 + 0.4 * r0()));
    trunkT.push(depth(date));
  }
  const trunkHeat = trunkT.map((t) => Math.pow(Math.max(0, (t - 0.9) / 0.1), 3));
  tubes.push({ id: "trunk", kind: "trunk", thread: null, label: null, repo: null, item: null, status: null, points: trunkPts, radii: trunkR, t: trunkT, heat: trunkHeat, frosted: false, cut: false, start: first, end: now });

  // A point on the trunk at a given depth, interpolated.
  const onTube = (pts: Vec3[], y: number): Vec3 => {
    if (y >= pts[0][1]) return [...pts[0]] as Vec3;
    for (let i = 1; i < pts.length; i++) {
      if (y >= pts[i][1]) {
        const a = pts[i - 1];
        const b = pts[i];
        const k = (y - a[1]) / (b[1] - a[1] || 1);
        return [a[0] + (b[0] - a[0]) * k, y, a[2] + (b[2] - a[2]) * k];
      }
    }
    return [...pts[pts.length - 1]] as Vec3;
  };

  // ---- Branch builder: a lightning fork. It leaves its parent at its start date and zigzags outward and
  // down; its length grows with how long the work lasted. Time runs along the branch, start to end.
  const lastActive = (r: Snapshot["repos"][number]) => [r.pushed, ...r.merges].reduce((m, d) => (d > m ? d : m), r.created);
  const recent = (dates: string[]) => {
    const wk = fromDay(toDay(now) - 7);
    return Math.min(1, dates.filter((d) => d > wk).length / 12);
  };

  /** The point on a path at a date, when the path carries its own dates. */
  const atDate = (tube: Tube, date: string): Vec3 => {
    const s = toDay(tube.start);
    const e = Math.max(s + 1, toDay(tube.end));
    const f = Math.min(1, Math.max(0, (toDay(date) - s) / (e - s)));
    const x = f * (tube.points.length - 1);
    const i = Math.min(tube.points.length - 2, Math.floor(x));
    const k = x - i;
    const a = tube.points[i];
    const b = tube.points[i + 1] ?? a;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  };

  function branch(opt: {
    id: string; kind: Tube["kind"]; thread: string | null; label: string | null; repo: string | null;
    item?: Built | null;
    from: Vec3; start: string; end: string; angle: number; tilt: number; base: number; length: number;
    frosted?: boolean; cut?: boolean; hot?: number; seed: string;
  }): Tube {
    const rr = rng(opt.seed);
    const s = toDay(opt.start);
    const e = Math.max(s + 1, toDay(opt.end));
    const n = Math.max(3, Math.min(34, Math.round(opt.length / 0.11)));
    const step = opt.length / n;
    let th = opt.angle;
    let ph = opt.tilt;
    const pts: Vec3[] = [[...opt.from] as Vec3];
    const radii: number[] = [];
    const ts: number[] = [];
    const heat: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (i % 2 === 0 || rr() < 0.35) {
        th += (rr() - 0.5) * 0.9;
        ph = Math.min(1.25, Math.max(0.35, ph + (rr() - 0.5) * 0.45));
      }
      const [px, py, pz] = pts[i - 1];
      pts.push([px + Math.cos(th) * Math.sin(ph) * step, py - Math.cos(ph) * step, pz + Math.sin(th) * Math.sin(ph) * step]);
    }
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const date = fromDay(Math.round(s + (e - s) * f));
      const taper = opt.cut ? 1 - 0.35 * f : 1 - 0.78 * Math.pow(f, 1.4);
      radii.push(Math.max(0.006, opt.base * taper * (0.85 + 0.3 * rr())));
      ts.push(depth(date));
      heat.push(opt.hot ? opt.hot * Math.pow(f, 6) : 0);
    }
    const tube: Tube = {
      id: opt.id, kind: opt.kind, thread: opt.thread, label: opt.label, repo: opt.repo,
      item: opt.item?.id ?? null, status: opt.item?.status ?? null,
      points: pts, radii, t: ts, heat, frosted: !!opt.frosted, cut: !!opt.cut, start: fromDay(s), end: fromDay(e),
    };
    tubes.push(tube);
    return tube;
  }

  const spanLength = (start: string, end: string, lo: number, hi: number) => {
    const days = Math.max(1, toDay(end) - toDay(start));
    return lo + (hi - lo) * Math.pow(Math.min(1, Math.log10(1 + days) / Math.log10(1 + 700)), 1.6);
  };

  const beadOn = (tube: Tube, date: string, thread: string | null, rr: () => number, kind: Bead["kind"] = "merge", item: string | null = null) => {
    const c = tube.kind === "trunk" ? onTube(tube.points, yOf(date)) : atDate(tube, date);
    const x = tube.kind === "trunk" ? 0 : Math.round(((toDay(date) - toDay(tube.start)) / Math.max(1, toDay(tube.end) - toDay(tube.start))) * (tube.points.length - 1));
    const k = tube.kind === "trunk" ? tube.points.findIndex((p) => p[1] <= c[1]) : x;
    const rad = tube.radii[Math.min(tube.radii.length - 1, Math.max(0, k))] ?? 0.03;
    const a = rr() * Math.PI * 2;
    const off = rad * (0.8 + 0.25 * rr());
    // An outcome is the larger bead: a drop of glass two to three times a merge's size.
    const r = kind === "outcome" ? 0.034 + 0.012 * rr() : 0.012 + 0.012 * rr();
    beads.push({ p: [c[0] + Math.cos(a) * off, c[1] + (rr() - 0.5) * rad, c[2] + Math.sin(a) * off], r, thread, date, kind, item });
  };

  // ---- Repositories. Each one forks from the trunk at its creation date (depth is time). Repositories in
  // the same thread leave on the same side, so a thread reads as a sector of the specimen. ---------------
  const threadOf = new Map<string, Thread>();
  threads.forEach((th) => th.repos.forEach((r) => threadOf.set(r.toLowerCase(), th)));
  const sector = new Map<string, number>();
  threads.forEach((th, i) => sector.set(th.id, (i / (threads.length + 1)) * Math.PI * 2 + 0.3));
  const looseSector = (threads.length / (threads.length + 1)) * Math.PI * 2 + 0.3;

  const rr = rng("repos");
  for (const r of snapshot.repos) {
    const th = threadOf.get(r.name.toLowerCase()) ?? null;
    const end = lastActive(r);
    const big = r.merges.length >= 8 || toDay(end) - toDay(r.created) > 60;
    const isCut = !!th?.cuts?.find((c) => c.repo?.toLowerCase() === r.name.toLowerCase());
    const base = th ? sector.get(th.id)! : looseSector;
    const spread = th ? 0.55 : 1.6;
    const tube = branch({
      id: `repo:${r.name}`, kind: big ? "branch" : "twig", thread: th?.id ?? null, label: null, repo: r.name,
      item: itemForRepo.get(r.name.toLowerCase()) ?? null,
      from: onTube(trunkPts, yOf(r.created)), start: r.created, end,
      angle: base + (rr() - 0.5) * spread, tilt: 0.62 + 0.4 * rr(),
      base: 0.018 + 0.07 * Math.min(1, Math.sqrt(r.merges.length / 120)),
      length: spanLength(r.created, end, 0.3, 3.6),
      cut: isCut, hot: recent(r.merges), seed: "repo:" + r.name,
    });
    for (const d of r.merges) beadOn(tube, d, th?.id ?? null, rr);
  }

  // Private work: frosted forks in their thread's sector. Work with no repository (teaching): a plain fork.
  threads.forEach((th) => {
    (th.private ?? []).forEach((p, k) => {
      branch({
        id: `private:${th.id}:${k}`, kind: "private", thread: th.id, label: p.label, repo: null,
        item: itemForPrivate.get(`${th.id}:${p.label}`) ?? null,
        from: onTube(trunkPts, yOf(p.start)), start: p.start, end: p.end ?? now,
        angle: sector.get(th.id)! + 0.35, tilt: 0.75, base: 0.05, length: spanLength(p.start, p.end ?? now, 0.3, 3.2),
        frosted: true, seed: `private:${th.id}:${k}`,
      });
    });
    if (th.span) {
      branch({
        id: `span:${th.id}`, kind: "branch", thread: th.id, label: th.name, repo: null,
        item: itemForSpan.get(th.id) ?? null,
        from: onTube(trunkPts, yOf(th.span.start)), start: th.span.start, end: th.span.end ?? now,
        angle: sector.get(th.id)!, tilt: 0.8, base: 0.03, length: spanLength(th.span.start, th.span.end ?? now, 0.3, 3.2),
        cut: th.status === "retired" || !!th.span.cut, seed: `span:${th.id}`,
      });
    }
  });

  // ---- Anonymous work. Unnamed own repositories bead the trunk; outside work is its own fork. -------
  const trunk = tubes[0];
  const ra = rng("anon");
  for (const d of snapshot.anonymous.ownRepos) beadOn(trunk, d, null, ra);
  const outside = [...snapshot.anonymous.otherPeoplesRepos].sort();
  if (outside.length) {
    const ob = branch({
      id: "thread:outside", kind: "branch", thread: "outside", label: "Client work", repo: null,
      item: itemForOutside,
      from: onTube(trunkPts, yOf(outside[0])), start: outside[0], end: outside[outside.length - 1],
      angle: looseSector + 0.9, tilt: 0.8, base: 0.04, length: spanLength(outside[0], outside[outside.length - 1], 0.3, 3.6),
      seed: "outside",
    });
    for (const d of outside) beadOn(ob, d, "outside", ra);
  }
  for (const u of snapshot.upstream) {
    const host = tubes.find((t) => t.repo?.toLowerCase() === "cryptojym/architect-loop") ?? trunk;
    beadOn(host, host.kind === "trunk" ? u.date : host.end, "methods", ra);
  }

  // ---- Work with no public repository: a client's system, a company, a class. Each grows a fork of its own
  // from the day it began, on its thread's side, as thick as the studies ranked it. Not frosted: the site says
  // what it is and what it did. ------------------------------------------------------------------------
  const rb = rng("built");
  for (const b of built.filter(growsOwnBranch)) {
    const start = clampSurface(dayOf(b.start, "start"));
    const endRaw = b.end ? dayOf(b.end, "end") : now;
    const end = endRaw > now ? now : endRaw < start ? start : endRaw;
    const long = toDay(end) - toDay(start) > 60;
    branch({
      id: `item:${b.id}`, kind: long || b.rank <= 40 ? "branch" : "twig", thread: b.thread, label: b.name, repo: null,
      item: b,
      from: onTube(trunkPts, yOf(start)), start, end,
      angle: sector.get(b.thread)! + (rb() - 0.5) * 0.9, tilt: 0.6 + 0.4 * rb(),
      base: 0.022 + 0.05 * (1 - Math.min(1, (b.rank - 1) / 60)),
      length: spanLength(start, end, 0.35, 3.4),
      seed: `item:${b.id}`,
    });
  }

  // ---- Outcomes: the second kind of bead, on the fork of the work that produced them. A dated outcome sits at
  // its date; an undated one sits evenly along its work's dates (and the page prints no date for it). ----------
  const ro = rng("outcomes");
  const tubeOf = (b: Built): Tube | undefined =>
    tubes.find((t) => t.item === b.id && !t.frosted && t.repo === null) ??
    tubes.find((t) => t.item === b.id);
  for (const b of built) {
    const list = b.outcomes ?? [];
    if (!list.length) continue;
    const tube = tubeOf(b);
    if (!tube) throw new Error(`[specimen] ${b.id}: its outcomes have no fork to sit on`);
    const undated = list.filter((o) => !o.date);
    const s = toDay(tube.start);
    const e = Math.max(s + 1, toDay(tube.end));
    list.forEach((o) => {
      const date = o.date
        ? dayOf(o.date, "mid")
        : fromDay(Math.round(s + ((e - s) * (undated.indexOf(o) + 1)) / (undated.length + 1)));
      beadOn(tube, date, tube.thread, ro, "outcome", b.id);
    });
  }

  // ---- Depth scale and heat. -----------------------------------------------------------------------
  const scale: ScaleMark[] = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let y = Number(first.slice(0, 4)); y <= Number(now.slice(0, 4)); y++) {
    for (let m = 1; m <= 12; m++) {
      const date = `${y}-${String(m).padStart(2, "0")}-01`;
      if (date < first.slice(0, 8) + "01" || date > now) continue;
      const major = m === 1 || date === first.slice(0, 8) + "01";
      const busy = y === 2026 && m >= 4;
      if (!major && !busy && m % 3 !== 1) continue;
      scale.push({ date, label: major ? `${months[m - 1]} ${y}` : months[m - 1], y: yOf(date), major });
    }
  }
  const weekAgo = fromDay(toDay(now) - 7);
  const heat = allMerges.filter((d) => d > weekAgo).length;

  return { tubes, beads, scale, height: H, heat, generatedAt: snapshot.generatedAt };
}
