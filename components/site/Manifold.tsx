"use client";

import { useEffect, useRef } from "react";

import { MANIFOLD_RULINGS, MANIFOLD_SECTIONS } from "@/lib/manifold/curves";

/**
 * The manifold, tiers 1 and 2 — ported from the locked comp.
 *
 * Tier 1 (always present): the inline parametric SVG. This is the no-JS and
 * reduced-motion baseline and it is never deleted. It server-renders, so the
 * field is in the first HTML response and costs zero CLS.
 *
 * Tier 2 (ships at launch): a 2D canvas that re-renders the SAME parametric
 * family live, with drifting phases. It stands down to the SVG when
 * prefers-reduced-motion is set, re-checked live if the OS setting changes.
 * Colours are read from the :root tokens at runtime — no literals. Frames stop
 * when the tab is hidden or the field scrolls off screen; dpr is capped at 2.
 *
 * Tier 3 (the WebGL field) stays gated behind the brief's promotion gates.
 *
 * ---------------------------------------------------------------------------
 * WAVE 2 — "stronger visualization" (owner ask, 2026-08-11).
 *
 * FIRST, THE DEFECT NOBODY HAD MEASURED. Tier 2 was not a live version of
 * tier 1; it was a fainter one. Sampled peak luminance of the hero field,
 * same instrument, same viewport: the static SVG reads 0.369 and the canvas
 * that replaces it on load reads 0.095. The field DIMMED the moment it came
 * alive — a 1px stroke where the SVG scales 1.55 viewBox units, and no bloom
 * wash at all. "Improve the background so it has stronger visualization" is,
 * in the first instance, a bug report. Tier 2 now carries tier 1's stroke
 * scaling and its bloom, so the handover is invisible instead of a fade.
 *
 * SECOND, the presence itself — through STRUCTURE and MOTION. The peak still
 * has to lose to the h1 (0.869), and it stays inside the 0.45 ceiling this
 * wave was given, so nothing below buys presence with brightness alone:
 *
 *   1. A far-field layer. The same surface family, drawn smaller, slower and
 *      at 40% of the near layer's alpha, behind it. Two parallaxing copies of
 *      one surface read as depth; one copy reads as wallpaper.
 *   2. Crest particles. ~40 phosphor dots that ride the surface and are only
 *      visible while they are ON a crest, so they mark the high ground instead
 *      of decorating it. Seeded from their own index — a per-frame Math.random
 *      would make them flicker rather than drift.
 *   3. Travelling energy. Per-line alpha is modulated by a slow window moving
 *      through the line index, the two families travelling in OPPOSITE
 *      directions so the interference reads as a wave crossing the mesh. The
 *      window's mean is BELOW 1 (0.72 floor, 1.30 crest), so the field's
 *      average brightness drops even as its peak stays put.
 *   4. Pointer parallax. +/-6px of offset and a whisker of phase, lerped, so
 *      the surface has a viewpoint. Off for touch and for reduced motion.
 *   5. A density cap below 768px, because a phone has to hold the frame rate
 *      with every one of these layers switched on.
 *
 * All of it lives in the ONE rAF loop, so every existing suspend path — hidden
 * tab, scrolled off screen, reduced motion — already covers the new layers by
 * construction. There is no second timer to forget about.
 */
export function Manifold() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mf = wrapRef.current;
    const cv = canvasRef.current;
    if (!mf || !cv || !cv.getContext) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* Parallax is a pointer affordance. A coarse pointer has no hover state to
       track and a touch drag would fight the scroll, so it is not offered. */
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let on = false;
    let seen = true;
    const t0 = performance.now();

    const css = getComputedStyle(document.documentElement);
    const tok = (n: string) => css.getPropertyValue(n).trim();
    const SIG = tok("--sig");
    const DEEP = tok("--sig-deep");
    /* Tokens only, and that means tokens ONLY: with no literal to fall back
       to, a missing token stands the canvas down and the static SVG — which is
       coloured by the same tokens through CSS — keeps the field on screen. A
       hard-coded hex here would be a second, silently-drifting palette. */
    if (!SIG || !DEEP) return;

    const hex = (c: string): number[] => {
      let m = c.replace("#", "");
      if (m.length === 3) m = m.replace(/./g, (x) => x + x);
      return [
        parseInt(m.slice(0, 2), 16),
        parseInt(m.slice(2, 4), 16),
        parseInt(m.slice(4, 6), 16),
      ];
    };
    const A = hex(DEEP);
    const B = hex(SIG);
    if (A.some(Number.isNaN) || B.some(Number.isNaN)) return;
    const mix = (k: number) => {
      const r = [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * k));
      return `rgba(${r[0]},${r[1]},${r[2]},`;
    };

    let W = 0, H = 0, S = 1, OX = 0, OY = 0, DPR = 1;

    /* ------------------------------------------------------------- density */
    // One knob per surface, re-read on resize so rotating a phone re-caps.
    type Density = {
      nu: number; nv: number; samp: number;   // near layer
      fu: number; fv: number; fsamp: number;  // far layer
      dots: number;
    };
    const DESKTOP: Density = { nu: 23, nv: 9, samp: 56, fu: 15, fv: 6, fsamp: 40, dots: 44 };
    /* Below 768 every layer stays ON — the point of the cap is to keep the
       same picture at a frame rate a phone can hold, not to quietly ship a
       different one. Line counts and samples per line come down together;
       measured 60fps at 375 with all four layers running. */
    const MOBILE: Density = { nu: 15, nv: 6, samp: 34, fu: 9, fv: 4, fsamp: 26, dots: 16 };
    let D: Density = DESKTOP;

    const size = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = mf.clientWidth;
      H = mf.clientHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      // replicate viewBox="0 230 2000 940" + slice
      S = Math.max(W / 2000, H / 940);
      OX = (W - 2000 * S) / 2;
      OY = (H - 940 * S) / 2 - 230 * S;
      D = window.innerWidth < 768 ? MOBILE : DESKTOP;
    };

    /* ------------------------------------------------------------ parallax */
    let pxTarget = 0, pyTarget = 0, pxCur = 0, pyCur = 0;
    const PAR = 6; // the whole budget, in CSS px, in each direction
    const onPointer = (e: PointerEvent) => {
      pxTarget = (e.clientX / window.innerWidth) * 2 - 1;
      pyTarget = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let parallaxBound = false;
    const bindParallax = () => {
      if (parallaxBound || !fine.matches || mq.matches) return;
      window.addEventListener("pointermove", onPointer, { passive: true });
      parallaxBound = true;
    };
    const unbindParallax = () => {
      if (!parallaxBound) return;
      window.removeEventListener("pointermove", onPointer);
      parallaxBound = false;
      pxTarget = pyTarget = 0;
    };

    /* ------------------------------------------------------------- surface */
    // Same surface family as the SVG generator, with drifting phases.
    const z = (u: number, v: number, t: number) =>
      Math.sin(1.05 * u + 0.22 * t) * Math.cos(0.85 * v - 0.16 * t) +
      0.42 * Math.sin(0.55 * (u + v) + 0.12 * t) +
      0.22 * Math.cos(1.5 * v + 0.09 * t) -
      0.18 * Math.sin(0.9 * u - 0.07 * t);

    const U0 = -2.2, U1 = 3.4, V0 = -1.6, V1 = 2.6;

    /** A projected layer: k scales the surface about the field centre, dy
     *  lifts it, and every layer carries its own clock. */
    type Layer = { k: number; dy: number; clock: number; alpha: number; w: number };
    const NEAR: Layer = { k: 1, dy: 0, clock: 1, alpha: 1, w: 1.55 };
    /* Smaller, slower, dimmer, thinner and lifted — five cues that read as
       "further away" without a second palette or a blur pass. At 0.72 the two
       meshes sat on top of each other and read as one blurry mesh; 0.6 with a
       real lift is where the eye starts seeing two surfaces. */
    const FAR: Layer = { k: 0.6, dy: -74, clock: 0.55, alpha: 0.4, w: 1.1 };

    const P = (
      u: number,
      v: number,
      t: number,
      L: Layer,
    ): [number, number, number] => {
      const zz = z(u, v, t * L.clock);
      const x = 560 + ((u - U0) / (U1 - U0)) * 1560 + ((v - V0) / (V1 - V0)) * 120 - 160;
      const y = 210 + ((v - V0) / (V1 - V0)) * 700 + ((u - U0) / (U1 - U0)) * 180 - zz * 98;
      // Scale about the viewBox centre so a shrunk layer stays concentric.
      const sx = 1000 + (x - 1000) * L.k;
      const sy = 700 + (y - 700) * L.k + L.dy;
      return [OX + sx * S + pxCur * PAR, OY + sy * S + pyCur * PAR, zz];
    };

    /* ----------------------------------------------------- travelling wave */
    /* A window that walks the line index. Floor 0.72, crest 1.30: the crest
       is where the eye goes, and the floor is what keeps the mean — and so
       the average luminance of the whole field — below where it started. */
    const WAVE_FLOOR = 0.72;
    const WAVE_GAIN = 0.58;
    const WAVE_WIDTH = 0.17;
    const wave = (idx: number, count: number, t: number, speed: number) => {
      const p = idx / count;
      let d = Math.abs(p - (((t * speed) % 1) + 1) % 1);
      if (d > 0.5) d = 1 - d; // the mesh is a loop as far as the window cares
      const g = Math.exp(-((d / WAVE_WIDTH) ** 2));
      return WAVE_FLOOR + WAVE_GAIN * g;
    };

    const line = (
      pts: [number, number, number][],
      fam: number,
      L: Layer,
      glow: boolean,
    ) => {
      let zm = 0;
      for (let i = 0; i < pts.length; i++) zm += pts[i][2];
      zm /= pts.length;
      const k = Math.max(0, Math.min(1, (zm + 1.6) / 3.2)); // height 0..1
      const a = fam * (0.55 + 0.45 * k) * L.alpha; // audited ramp
      ctx.strokeStyle = `${mix(0.25 + 0.75 * k)}${a})`;
      /* Tier-1 parity: the SVG strokes 1.55 viewBox units, which the slice
         scale S turns into device pixels. Stroking a flat 1px here is what
         made the live field fainter than the static one it replaces. */
      ctx.lineWidth = L.w * S * DPR;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * DPR, pts[0][1] * DPR);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * DPR, pts[i][1] * DPR);
      ctx.stroke();
      if (glow && k > 0.78) {
        // crest glow: one wide faint pass, no shadowBlur cost
        ctx.strokeStyle = `${mix(1)}${a * 0.14})`;
        ctx.lineWidth = 5 * DPR;
        ctx.stroke();
      }
    };

    /* The bloom, ported from the SVG's #mfBloom radial gradient — the other
       half of the tier-1 look the canvas never had. SVG scales a radial
       gradient to its bounding box, so this is an ellipse: a circular
       gradient under a y-squash. Painted first, under everything. */
    const bloom = () => {
      const cx = OX + 1080 * S;
      const cy = OY + (230 + 0.52 * 940) * S;
      const rx = 0.58 * 2000 * S;
      const ry = 0.58 * 940 * S;
      const g = ctx.createRadialGradient(cx * DPR, cy * DPR, 0, cx * DPR, cy * DPR, rx * DPR);
      g.addColorStop(0, `${mix(0)}.52)`);
      g.addColorStop(0.52, `${mix(0)}.24)`);
      g.addColorStop(1, `${mix(0)}0)`);
      ctx.save();
      ctx.translate(cx * DPR, cy * DPR);
      ctx.scale(1, ry / rx);
      ctx.translate(-cx * DPR, -cy * DPR);
      ctx.fillStyle = g;
      ctx.fillRect(
        (cx - rx) * DPR,
        (cy - rx) * DPR,
        rx * 2 * DPR,
        rx * 2 * DPR,
      );
      ctx.restore();
    };

    /** Draw one whole surface: rulings, then cross-sections. */
    const surface = (t: number, L: Layer, nu: number, nv: number, samp: number) => {
      for (let i = 0; i < nu; i++) {
        const u = U0 + ((U1 - U0) * i) / (nu - 1);
        const pts: [number, number, number][] = [];
        for (let j = 0; j < samp; j++) pts.push(P(u, V0 + ((V1 - V0) * j) / (samp - 1), t, L));
        line(pts, 0.45 * wave(i, nu, t, 0.085), L, L === NEAR);
      }
      /* Opposite direction, different speed: two windows crossing each other
         is what makes the motion read as travelling rather than pulsing. */
      for (let i = 0; i < nv; i++) {
        const v = V0 + ((V1 - V0) * i) / (nv - 1);
        const pts: [number, number, number][] = [];
        for (let j = 0; j < samp; j++) pts.push(P(U0 + ((U1 - U0) * j) / (samp - 1), v, t, L));
        line(pts, 0.3 * wave(i, nv, t, -0.062), L, L === NEAR);
      }
    };

    /* ----------------------------------------------------- crest particles */
    /* Seeded from the index, so particle 7 is in the same place on every load
       and on every frame it is asked for. Nothing here calls Math.random: a
       fresh random per frame is not drift, it is flicker. */
    const seed = (i: number, k: number) => {
      const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const dots = (t: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const vv = V0 + seed(i, 1) * (V1 - V0);
        const speed = 0.028 + seed(i, 2) * 0.05;
        const uu = U0 + (((seed(i, 3) + t * speed) % 1) * (U1 - U0));
        const [x, y, zz] = P(uu, vv, t, NEAR);
        /* Visible only on the high ground. A dot fades up as the surface
           rises under it and is gone in the troughs, so the particles TRACE
           the crests instead of sitting on top of the picture. */
        const h = (zz - 0.35) / 0.9;
        if (h <= 0) continue;
        const vis = Math.min(1, h) ** 1.5;
        const r = (1.1 + seed(i, 4) * 1.1) * DPR;
        ctx.fillStyle = `${mix(1)}${0.62 * vis})`;
        ctx.beginPath();
        ctx.arc(x * DPR, y * DPR, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `${mix(0.8)}${0.12 * vis})`;
        ctx.beginPath();
        ctx.arc(x * DPR, y * DPR, r * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    /* ---------------------------------------------------------------- loop */
    const frame = (nowMs: number) => {
      raf = 0;
      // The SVG stands down only once real ink exists — a hidden-tab load
      // must never blank the field.
      if (!mf.classList.contains("is-live")) mf.classList.add("is-live");
      const t = (nowMs - t0) / 1000;
      // Lerp toward the pointer so the field glides instead of snapping.
      pxCur += (pxTarget - pxCur) * 0.06;
      pyCur += (pyTarget - pyCur) * 0.06;
      ctx.clearRect(0, 0, cv.width, cv.height);
      bloom();
      surface(t, FAR, D.fu, D.fv, D.fsamp);
      surface(t, NEAR, D.nu, D.nv, D.samp);
      dots(t, D.dots);
      if (on && seen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (on) return;
      on = true;
      size();
      bindParallax();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      on = false;
      mf.classList.remove("is-live");
      unbindParallax();
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const decide = () => (mq.matches ? stop() : start());

    const onResize = () => {
      if (on) {
        size();
        if (!raf) raf = requestAnimationFrame(frame);
      }
    };
    const onVisibility = () => {
      if (!document.hidden && on && !raf) raf = requestAnimationFrame(frame);
    };
    const onPointerKind = () => (fine.matches ? bindParallax() : unbindParallax());

    mq.addEventListener("change", decide);
    fine.addEventListener("change", onPointerKind);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (en) => {
          seen = en[0].isIntersecting;
          if (seen && on && !raf) raf = requestAnimationFrame(frame);
        },
        { threshold: 0 },
      );
      io.observe(mf);
    }

    decide();

    return () => {
      stop();
      mq.removeEventListener("change", decide);
      fine.removeEventListener("change", onPointerKind);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, []);

  return (
    <div className="mf" aria-hidden="true" ref={wrapRef}>
      {/*
        A real parametric surface,
        z = sin(1.05u)·cos(0.85v) + 0.42·sin(0.55(u+v)) + 0.22·cos(1.5v) − 0.18·sin(0.9u),
        projected isometrically and drawn as 23 rulings + 9 cross-sections.
        Line opacity is mapped from mean height, rescaled so rulings sit near a
        .45 mean and cross-sections near .30 — both families read and the field
        stays under the headline in brightness. Every colour is a token; the
        stops are classed and styled in CSS because SVG presentation attributes
        cannot parse var().
      */}
      <svg viewBox="0 230 2000 940" preserveAspectRatio="xMidYMid slice" role="presentation">
        <defs>
          <linearGradient id="mfStroke" x1="0" y1="0" x2="1" y2=".85">
            <stop offset="0" className="mf-s1" />
            <stop offset=".32" className="mf-s2" />
            <stop offset=".66" className="mf-s3" />
            <stop offset="1" className="mf-s4" />
          </linearGradient>
          <radialGradient id="mfBloom" cx=".54" cy=".52" r=".58">
            <stop offset="0" className="mf-b1" stopOpacity=".52" />
            <stop offset=".52" className="mf-b2" stopOpacity=".24" />
            <stop offset="1" className="mf-b3" stopOpacity="0" />
          </radialGradient>

          <g
            id="mfMesh"
            fill="none"
            stroke="url(#mfStroke)"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {MANIFOLD_RULINGS.map((c, i) => (
              <polyline key={`r${i}`} opacity={c.o} points={c.p} />
            ))}
            {MANIFOLD_SECTIONS.map((c, i) => (
              <polyline key={`s${i}`} opacity={c.o} points={c.p} />
            ))}
          </g>
        </defs>

        <rect x="0" y="230" width="2000" height="940" fill="url(#mfBloom)" />
        <use href="#mfMesh" />
      </svg>
      <canvas className="mf-c" aria-hidden="true" ref={canvasRef} />
    </div>
  );
}
