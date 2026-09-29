"use client";

// The sculpture beside the home page's text: the Blender render of the grown record (scripts/specimen/fulgurite.py
// --variant plate, cut for the web by scripts/specimen/sculpture.py). First paint is the whole plate, never more than
// 150 KB, in the server's HTML.
//
// On a wide screen it stands beside the text, in its own column. Before the descent it shows the whole object;
// through the descent it travels down the glass with the reader, each era at the depth of its own months, and it
// holds at the tip until the tip's figures are read; then the whole object again. It is one image, moved and
// magnified as a pure function of the scroll position, so it cannot jump, and only one picture is ever shown: the
// first-paint plate until a sharper copy of the same render is decoded, then that copy, swapped in a single frame.
// On a narrow screen (900 px or less) it stands in its own space at the top and each era carries its own window of
// glass (EraWindow), so nothing ever sits over the words. Reduced motion keeps the whole object still.
//
// Hovering a thread's name in the text, or a fork on the sculpture, lights that thread's branches on the render, and a
// fork's note names it; on a touch screen, tapping does the same in the nearest window. The light is three.js,
// computing the same object through the plate's own camera (components/specimen/light.ts); it loads after the page.

import { useEffect, useRef, useState } from "react";

import type { SpecimenLight } from "@/components/specimen/light";
import { SCULPTURE } from "@/lib/specimen/sculpture.generated";

import StrikeFilm from "./StrikeFilm";

const PW = SCULPTURE.plate.width;
const PH = SCULPTURE.plate.height;
/** How far the descent magnifies the plate: the stage then holds about seven of the specimen's twelve depths. */
const ZOOM = 2.2;
const POSTERS = [450, 640, 900] as const;
const SRCSET = POSTERS.map((w) => `/specimen/plate-${w}.webp ${w}w`).join(", ");
/** The plate's width on screen: half its height, which is the stage's height less its insets (see app/fg.css). */
const SIZES = "(min-width: 901px) calc(50vh - 48px), 27vh";

type Note = { title: string; note: string; x: number; y: number };
type LightModule = typeof import("@/components/specimen/lightData");

const ease = (k: number) => {
  const t = Math.min(1, Math.max(0, k));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export default function HomeStage() {
  const host = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const sharp = useRef<HTMLImageElement>(null);
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const h = host.current;
    const c = cam.current;
    const p = poster.current;
    const sh = sharp.current;
    if (!h || !c || !p || !sh) return;
    const stage = h.parentElement;
    const wideQ = window.matchMedia("(min-width: 901px)");
    const reduceQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineQ = window.matchMedia("(hover: hover) and (pointer: fine)");
    type Target = { el: HTMLElement; rect: readonly [number, number, number, number] | null };
    let mod: LightModule | null = null;
    let lightObj: SpecimenLight | null = null;
    let target: Target | null = null;
    let loading: Promise<SpecimenLight | null> | null = null;
    /** Keep the light's canvas the size of what it covers (it moves with the plate, so the scroll never refits it). */
    function refitLight() {
      if (lightObj && target) lightObj.setView(target.rect, target.el.clientWidth, target.el.clientHeight);
    }

    /* ---------------------------------------------------------------- the descent (wide screens) */
    let travel = false;
    let geo = { Ws: 0, h1: 0, wZ: 0, hZ: 0, fy: 0 };
    const measure = () => {
      travel = wideQ.matches && !reduceQ.matches;
      if (!travel) {
        c.removeAttribute("style");
        if (stage) delete stage.dataset.view;
        return;
      }
      const cs = getComputedStyle(h);
      const top = parseFloat(cs.getPropertyValue("--sculpt-top")) || 0;
      const bottom = parseFloat(cs.getPropertyValue("--sculpt-bottom")) || 0;
      const Ws = h.clientWidth;
      const h1 = h.clientHeight - top - bottom;
      const hZ = h1 * ZOOM;
      const wZ = (hZ * PW) / PH;
      geo = { Ws, h1, wZ, hZ, fy: top + h1 / 2 };
      // Laid out at full magnification and scaled down, so the glass is drawn sharp at every depth.
      Object.assign(c.style, { left: "0px", top: "0px", width: `${wZ}px`, height: `${hZ}px`, transformOrigin: "0 0", willChange: "transform" });
    };

    /** Which part of the plate the reader is at: magnification and the plate row at the stage's focus. */
    const view = () => {
      const vh = window.innerHeight;
      const mid = vh / 2;
      const T = 0.55 * vh;
      const eras = SCULPTURE.descent.map((d) => ({ ...d, el: document.querySelector<HTMLElement>(`[data-era="${d.id}"]`) }));
      const tipEnd = document.getElementById("tip-end");
      if (eras.some((e) => !e.el) || !tipEnd) return { z: 1, py: PH / 2 };
      const tops = eras.map((e) => e.el!.getBoundingClientRect().top);
      const end = eras[eras.length - 1].el!.getBoundingClientRect().bottom;
      const A = tops[0];
      // The whole object until the descent begins; then down the glass, era by era.
      if (A >= mid + T) return { z: 1, py: PH / 2 };
      if (A > mid) {
        const k = ease((mid + T - A) / T);
        return { z: lerp(1, ZOOM, k), py: lerp(PH / 2, eras[0].from, k) };
      }
      for (let i = 0; i < eras.length; i++) {
        const t0 = tops[i];
        const t1 = i + 1 < eras.length ? tops[i + 1] : end;
        if (mid < t1) return { z: ZOOM, py: lerp(eras[i].from, eras[i].to, Math.min(1, Math.max(0, (mid - t0) / Math.max(1, t1 - t0)))) };
      }
      // Held at the tip through what went wrong and the tip's figures, until the tip is read; then the whole again.
      const B = tipEnd.getBoundingClientRect().bottom + 0.2 * vh;
      if (B > mid) return { z: ZOOM, py: SCULPTURE.tip };
      if (B > mid - T) {
        const k = ease((mid - B) / T);
        return { z: lerp(ZOOM, 1, k), py: lerp(SCULPTURE.tip, PH / 2, k) };
      }
      return { z: 1, py: PH / 2 };
    };

    let last = "";
    const place = () => {
      if (!travel) return;
      const { z, py } = view();
      const s = z / ZOOM;
      const tx = geo.Ws / 2 - (geo.wZ * s) / 2;
      const ty = geo.fy - (py / PH) * geo.hZ * s;
      const t = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
      if (t !== last) {
        c.style.transform = t;
        last = t;
        const v = z > 1.02 ? "descent" : "whole";
        if (stage && stage.dataset.view !== v) stage.dataset.view = v;
      }
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => (raf = 0, place()));
    };
    const onResize = () => {
      measure();
      last = "";
      place();
      refitLight();
    };
    measure();
    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    wideQ.addEventListener("change", onResize);
    reduceQ.addEventListener("change", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(h);

    /* ------------------------------------------- a sharper copy of the same render, for the descent */
    let cancelled = false;
    const sharpen = () => {
      if (cancelled || !travel || h.dataset.sculptureState === "plate") return;
      const need = geo.hZ * (window.devicePixelRatio || 1);
      const w = need > 2800 * 1.1 ? 2000 : 1400;
      sh.src = `/specimen/plate-${w}.webp`;
      sh.decode()
        .then(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            // one frame: the sharp copy appears exactly where the first paint was, and the first paint goes
            sh.hidden = false;
            p.style.visibility = "hidden";
            h.dataset.sculptureState = "plate";
          });
        })
        .catch(() => {
          /* the first paint stays; nothing else changes */
        });
    };
    const ric = (window as { requestIdleCallback?: Window["requestIdleCallback"] }).requestIdleCallback;
    const idle = (fn: () => void) => (ric ? ric.call(window, fn, { timeout: 2500 }) : window.setTimeout(fn, 600));
    const whenLoaded = (fn: () => void) => (document.readyState === "complete" ? idle(fn) : window.addEventListener("load", () => idle(fn), { once: true }));
    whenLoaded(sharpen);

    /* ------------------------------------------------------------------------ the light */
    const getLight = (t: Target): Promise<SpecimenLight | null> => {
      loading ??= import("@/components/specimen/lightData").then((m) => {
        mod = m;
        lightObj = m.makeLight();
        if (lightObj) h.dataset.light = "ready";
        return lightObj;
      });
      return loading.then((l) => {
        if (l && (!target || target.el !== t.el)) {
          target = t;
          t.el.appendChild(l.canvas);
          l.setView(t.rect, t.el.clientWidth, t.el.clientHeight);
        }
        return l;
      });
    };
    const stageTarget = (): Target => ({ el: c, rect: null });
    const windowTarget = (fig: HTMLElement): Target | null => {
      const id = fig.dataset.window as keyof typeof SCULPTURE.windows | undefined;
      return id && SCULPTURE.windows[id] ? { el: fig, rect: SCULPTURE.windows[id] } : null;
    };

    // What the page is talking about lights up: a hovered or focused thread's name; on a wide screen with a mouse,
    // also the era the pointer is reading (each era section names its thread).
    let pageThread: string | null = null;
    let forkThread: string | null = null;
    const apply = () => {
      const thread = forkThread ?? pageThread;
      if (thread) h.dataset.lit = thread;
      else delete h.dataset.lit;
      if (!thread && !lightObj) return;
      if (wideQ.matches) void getLight(stageTarget()).then((l) => l?.setHighlight(thread));
      else if (lightObj) lightObj.setHighlight(thread);
    };
    const threadFrom = (el: Element | null) => (el?.closest?.("[data-thread]") as HTMLElement | null)?.dataset.thread ?? null;
    const onOver = (e: Event) => {
      if (!wideQ.matches || !fineQ.matches) return;
      pageThread = threadFrom(e.target as Element);
      apply();
    };
    const onFocus = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el.classList?.contains("fg-thread")) return;
      const thread = el.dataset.thread ?? null;
      if (wideQ.matches) {
        pageThread = thread;
        apply();
        return;
      }
      // Narrow: light the thread in this era's own window, where the reader can see it.
      const era = el.closest<HTMLElement>("[data-era]");
      const fig = era?.querySelector<HTMLElement>("[data-window]");
      const t = fig && windowTarget(fig);
      if (t) void getLight(t).then((l) => l?.setHighlight(thread));
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onFocus);

    // A fork under the pointer (wide), or under a tap (narrow): its note, and its thread lit.
    let pickRaf = 0;
    let pending: { x: number; y: number; t: Target; tap: boolean } | null = null;
    const pickNow = () => {
      pickRaf = 0;
      const q = pending;
      if (!q || !lightObj || !mod) return;
      const r = q.t.el.getBoundingClientRect();
      const tube = lightObj.pick((q.x - r.left) / r.width, (q.y - r.top) / r.height);
      const said = tube ? mod.describe(tube) : null;
      const nextThread = tube?.thread ?? null;
      if (nextThread !== forkThread) {
        forkThread = nextThread;
        lightObj.setHighlight(forkThread ?? pageThread);
      }
      setNote(said ? { ...said, x: q.x, y: q.y } : null);
    };
    const queuePick = (x: number, y: number, t: Target, tap: boolean) => {
      pending = { x, y, t, tap };
      void getLight(t).then(() => {
        if (!pickRaf) pickRaf = requestAnimationFrame(pickNow);
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !wideQ.matches) return;
      queuePick(e.clientX, e.clientY, stageTarget(), false);
    };
    const onLeave = () => {
      pending = null;
      forkThread = null;
      setNote(null);
      if (lightObj) lightObj.setHighlight(pageThread);
    };
    h.addEventListener("pointermove", onMove);
    h.addEventListener("pointerleave", onLeave);
    let noteTimer = 0;
    const onTap = (e: MouseEvent) => {
      if (fineQ.matches && wideQ.matches) return;
      const fig = (e.target as Element).closest<HTMLElement>("[data-window]");
      const t = fig ? windowTarget(fig) : (e.target as Element).closest(".fg-sculpt") ? stageTarget() : null;
      if (!t) return;
      queuePick(e.clientX, e.clientY, t, true);
      window.clearTimeout(noteTimer);
      noteTimer = window.setTimeout(() => setNote(null), 4000);
    };
    const onScrollNote = () => setNote((n) => (n && !fineQ.matches ? null : n));
    document.addEventListener("click", onTap);
    window.addEventListener("scroll", onScrollNote, { passive: true });
    // With a mouse on a wide screen the light is ready before the first hover.
    if (wideQ.matches && fineQ.matches) whenLoaded(() => void getLight(stageTarget()));

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      wideQ.removeEventListener("change", onResize);
      reduceQ.removeEventListener("change", onResize);
      ro.disconnect();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onFocus);
      h.removeEventListener("pointermove", onMove);
      h.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("click", onTap);
      window.removeEventListener("scroll", onScrollNote);
      if (raf) cancelAnimationFrame(raf);
      if (pickRaf) cancelAnimationFrame(pickRaf);
      window.clearTimeout(noteTimer);
      lightObj?.dispose();
    };
  }, []);

  return (
    <>
      <div className="fg-sculpt" ref={host} data-sculpture data-sculpture-state="poster">
        <div className="fg-sculpt__cam" ref={cam}>
          {/* The whole plate, rendered in Blender from the record: the first paint, and all a reduced-motion or
              no-script visitor needs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={poster}
            className="fg-sculpt__plate"
            data-layer="plate"
            src="/specimen/plate-640.webp"
            srcSet={SRCSET}
            sizes={SIZES}
            width={450}
            height={900}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={sharp} className="fg-sculpt__plate" data-layer="plate-sharp" alt="" hidden decoding="async" />
        </div>
      </div>
      <StrikeFilm />
      {note && (
        <div className="specimen-tip" role="status" style={{ position: "fixed", left: Math.min(note.x + 14, (typeof window === "undefined" ? 9999 : window.innerWidth) - 296), top: note.y + 12, pointerEvents: "none" }}>
          <b>{note.title}</b>
          <span>{note.note}</span>
        </div>
      )}
    </>
  );
}
