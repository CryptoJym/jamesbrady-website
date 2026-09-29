"use client";

import { useCallback, useMemo, useState } from "react";

import { STATUS_WORD, built, builtSpan } from "@/content/built";
import snapshot from "@/content/history/history.snapshot.json";
import { OUTSIDE_WORK, threads } from "@/content/history/threads";
import { grow, type Snapshot } from "@/lib/specimen/grow";

import Specimen, { type Hit, type ThreadInfo } from "./Specimen";

const PRIVATE = "Private work: you can see it exists, not inside it.";

/** What the tooltip says about a fork: the work it is, when there is one, with its status and dates. */
function describe(hit: Hit): { title: string; note: string } | null {
  const { tube, thread } = hit;
  const item = tube.item ? built.find((b) => b.id === tube.item) : undefined;
  if (item) {
    const status = `${STATUS_WORD[item.status]} · ${builtSpan(item)}`;
    return { title: item.name, note: tube.frosted ? `${status}. ${PRIVATE}` : status };
  }
  if (tube.kind === "private") return { title: tube.label ?? "Private work", note: PRIVATE };
  return thread ? { title: thread.name, note: thread.note } : null;
}

export default function SpecimenView({ progress = null, highlight = null, className }: { progress?: number | null; highlight?: string | null; className?: string }) {
  const specimen = useMemo(() => grow(snapshot as Snapshot, threads, { built }), []);
  const info: ThreadInfo[] = useMemo(() => [...threads.map((t) => ({ id: t.id, name: t.name, note: t.note })), OUTSIDE_WORK], []);
  const [tip, setTip] = useState<{ title: string; note: string; x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback((ok: boolean) => setReady(ok), []);
  const onHover = useCallback((hit: Hit | null) => {
    const said = hit ? describe(hit) : null;
    setTip(hit && said ? { ...said, x: hit.x, y: hit.y } : null);
  }, []);
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
