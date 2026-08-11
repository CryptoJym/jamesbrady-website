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
 */
export function Manifold() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mf = wrapRef.current;
    const cv = canvasRef.current;
    if (!mf || !cv || !cv.getContext) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let on = false;
    let seen = true;
    const t0 = performance.now();

    const css = getComputedStyle(document.documentElement);
    const tok = (n: string) => css.getPropertyValue(n).trim();
    const SIG = tok("--sig") || "#3FD9A0";
    const DEEP = tok("--sig-deep") || "#1F7A5C";

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
    const mix = (k: number) => {
      const r = [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * k));
      return `rgba(${r[0]},${r[1]},${r[2]},`;
    };

    let W = 0, H = 0, S = 1, OX = 0, OY = 0, DPR = 1;
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
    };

    // Same surface family as the SVG generator, with drifting phases.
    const z = (u: number, v: number, t: number) =>
      Math.sin(1.05 * u + 0.22 * t) * Math.cos(0.85 * v - 0.16 * t) +
      0.42 * Math.sin(0.55 * (u + v) + 0.12 * t) +
      0.22 * Math.cos(1.5 * v + 0.09 * t) -
      0.18 * Math.sin(0.9 * u - 0.07 * t);

    const NU = 23, NV = 9, SAMP = 56;
    const U0 = -2.2, U1 = 3.4, V0 = -1.6, V1 = 2.6;

    const P = (u: number, v: number, t: number): [number, number, number] => {
      const zz = z(u, v, t);
      const x = 560 + ((u - U0) / (U1 - U0)) * 1560 + ((v - V0) / (V1 - V0)) * 120 - 160;
      const y = 210 + ((v - V0) / (V1 - V0)) * 700 + ((u - U0) / (U1 - U0)) * 180 - zz * 98;
      return [OX + x * S, OY + y * S, zz];
    };

    const line = (pts: [number, number, number][], fam: number) => {
      let zm = 0;
      for (let i = 0; i < pts.length; i++) zm += pts[i][2];
      zm /= pts.length;
      const k = Math.max(0, Math.min(1, (zm + 1.6) / 3.2)); // height 0..1
      const a = fam * (0.55 + 0.45 * k); // audited ramp
      ctx.strokeStyle = `${mix(0.25 + 0.75 * k)}${a})`;
      ctx.lineWidth = 1 * DPR;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * DPR, pts[0][1] * DPR);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * DPR, pts[i][1] * DPR);
      ctx.stroke();
      if (k > 0.78) {
        // crest glow: one wide faint pass, no shadowBlur cost
        ctx.strokeStyle = `${mix(1)}${a * 0.14})`;
        ctx.lineWidth = 5 * DPR;
        ctx.stroke();
      }
    };

    const frame = (nowMs: number) => {
      raf = 0;
      // The SVG stands down only once real ink exists — a hidden-tab load
      // must never blank the field.
      if (!mf.classList.contains("is-live")) mf.classList.add("is-live");
      const t = (nowMs - t0) / 1000;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < NU; i++) {
        const u = U0 + ((U1 - U0) * i) / (NU - 1);
        const pts: [number, number, number][] = [];
        for (let j = 0; j < SAMP; j++) pts.push(P(u, V0 + ((V1 - V0) * j) / (SAMP - 1), t));
        line(pts, 0.45);
      }
      for (let i = 0; i < NV; i++) {
        const v = V0 + ((V1 - V0) * i) / (NV - 1);
        const pts: [number, number, number][] = [];
        for (let j = 0; j < SAMP; j++) pts.push(P(U0 + ((U1 - U0) * j) / (SAMP - 1), v, t));
        line(pts, 0.3);
      }
      if (on && seen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (on) return;
      on = true;
      size();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      on = false;
      mf.classList.remove("is-live");
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

    mq.addEventListener("change", decide);
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
