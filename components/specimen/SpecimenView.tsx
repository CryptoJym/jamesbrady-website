"use client";

import { useCallback, useMemo, useState } from "react";

import snapshot from "@/content/history/history.snapshot.json";
import { OUTSIDE_WORK, threads } from "@/content/history/threads";
import { grow, type Snapshot } from "@/lib/specimen/grow";

import Specimen, { type ThreadInfo } from "./Specimen";

export default function SpecimenView({ progress = null, highlight = null, className }: { progress?: number | null; highlight?: string | null; className?: string }) {
  const specimen = useMemo(() => grow(snapshot as Snapshot, threads), []);
  const info: ThreadInfo[] = useMemo(() => [...threads.map((t) => ({ id: t.id, name: t.name, note: t.note })), OUTSIDE_WORK], []);
  const [tip, setTip] = useState<{ title: string; note: string; x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback((ok: boolean) => setReady(ok), []);
  const onHover = useCallback(
    (hit: { thread: ThreadInfo | null; label: string | null; x: number; y: number } | null) =>
      setTip(hit && (hit.thread || hit.label) ? { title: hit.label ?? hit.thread!.name, note: hit.label ? "Private work: you can see it exists, not inside it." : hit.thread!.note, x: hit.x, y: hit.y } : null),
    [],
  );
  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      {!ready && (
        // The same object, rendered in Blender from the same geometry: the first paint, and the fallback without WebGL.
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/specimen/poster.webp" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: "6% 4%" }} />
      )}
      <Specimen specimen={specimen} threads={info} progress={progress} highlight={highlight} onHover={onHover} onReady={onReady} />
      {tip && (
        <div className="specimen-tip" style={{ position: "absolute", left: tip.x + 14, top: tip.y + 10, pointerEvents: "none" }}>
          <b>{tip.title}</b>
          <span>{tip.note}</span>
        </div>
      )}
    </div>
  );
}
