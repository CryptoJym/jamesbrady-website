"use client";

// Every figure's method opens on hover or focus, in a box below the number (app/fg.css, .fg-fig__m). A number near the
// right edge of a column opened its method past the edge of the screen, where the page's overflow clip cut it off
// unread; one near the foot of the screen opened below it. When a method opens, this moves its box back inside the
// screen, or above the number if there is more room there. On a phone the method is a sheet fixed to the foot of the
// screen, which is always inside it, so it is left alone. Without script the box opens where it always did.

import { useEffect } from "react";

const MARGIN = 8;

export default function FigPlacement() {
  useEffect(() => {
    const place = (fig: HTMLElement) => {
      const m = fig.querySelector<HTMLElement>(".fg-fig__m");
      if (!m) return;
      m.style.removeProperty("translate");
      m.style.removeProperty("top");
      m.style.removeProperty("bottom");
      requestAnimationFrame(() => {
        const s = getComputedStyle(m);
        if (s.display === "none" || s.position === "fixed") return;
        const r = m.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const vh = window.innerHeight;
        let dx = 0;
        if (r.right > vw - MARGIN) dx = vw - MARGIN - r.right;
        if (r.left + dx < MARGIN) dx = MARGIN - r.left;
        if (dx) m.style.translate = `${Math.round(dx)}px 0`;
        const f = fig.getBoundingClientRect();
        if (r.bottom > vh - MARGIN && f.top - r.height - 16 > MARGIN) {
          m.style.top = "auto";
          m.style.bottom = "calc(100% + 8px)";
        }
      });
    };
    const on = (e: Event) => {
      const fig = (e.target as Element | null)?.closest?.(".fg-fig") as HTMLElement | null;
      if (fig) place(fig);
    };
    document.addEventListener("pointerover", on);
    document.addEventListener("focusin", on);
    return () => {
      document.removeEventListener("pointerover", on);
      document.removeEventListener("focusin", on);
    };
  }, []);
  return null;
}
