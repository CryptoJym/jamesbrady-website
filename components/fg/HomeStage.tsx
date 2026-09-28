"use client";

// The specimen beside the home page's text. Before the descent it shows the whole object; through the
// descent the camera travels down the glass with the reader; hovering a thread's name in the text lights
// that thread's branches.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SpecimenView = dynamic(() => import("@/components/specimen/SpecimenView"), { ssr: false });

export default function HomeStage() {
  const [progress, setProgress] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    const descent = document.getElementById("descent");
    if (!descent) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = descent.getBoundingClientRect();
      const mid = window.innerHeight * 0.5;
      // Before the descent and after the tip: the whole object. Through the descent: travel down the glass.
      const tip = document.getElementById("tip-end");
      const past = tip ? tip.getBoundingClientRect().bottom < mid * 0.6 : false;
      if (r.top > mid || past) setProgress(null);
      else setProgress(Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const on = (e: Event) => {
      const t = (e.target as HTMLElement | null)?.closest?.("[data-thread]") as HTMLElement | null;
      setHighlight(t?.dataset.thread ?? null);
    };
    document.addEventListener("pointerover", on);
    document.addEventListener("focusin", on);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointerover", on);
      document.removeEventListener("focusin", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <SpecimenView progress={progress} highlight={highlight} />;
}
