"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cliffordParamsFromHuman } from "@/lib/attractorMapping";

const AXES = [
  { key: "energy", label: "Energy", min: 0, max: 100 },
  { key: "valence", label: "Valence", min: -100, max: 100 },
  { key: "complexity", label: "Complexity", min: 0, max: 100 },
  { key: "novelty", label: "Novelty", min: 0, max: 100 },
  { key: "introspection", label: "Introspection", min: 0, max: 100 },
  { key: "focus", label: "Focus", min: 0, max: 100 },
] as const;

type AxisKey = (typeof AXES)[number]["key"];
type Axes = Record<AxisKey, number>;

const DEFAULT_AXES: Axes = {
  energy: 55,
  valence: 10,
  complexity: 40,
  novelty: 35,
  introspection: 45,
  focus: 60,
};

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 600;
const STILL_STEPS = 4000;

function paramsFor(axes: Axes) {
  return cliffordParamsFromHuman({
    energy: axes.energy / 100,
    valence: axes.valence / 100,
    complexity: axes.complexity / 100,
    novelty: axes.novelty / 100,
    introspection: axes.introspection / 100,
    focus: axes.focus / 100,
    dim1: axes.introspection / 100,
    dim2: axes.focus / 100,
  });
}

/** A real first frame for reduced-motion and no-JS visitors. */
function stillPath(axes: Axes) {
  const params = paramsFor(axes);
  const scale = Math.min(VIEWBOX_WIDTH, VIEWBOX_HEIGHT) * 0.22;
  const points: string[] = [];
  let x = 0.1;
  let y = 0.1;

  for (let i = 0; i < STILL_STEPS; i++) {
    const nx = Math.sin(params.a * y) + params.c * Math.cos(params.a * x);
    const ny = Math.sin(params.b * x) + params.d * Math.cos(params.b * y);
    x = nx;
    y = ny;
    if (i < 40) continue;
    const px = VIEWBOX_WIDTH * 0.5 + x * scale;
    const py = VIEWBOX_HEIGHT * 0.5 + y * scale;
    points.push(`M${px.toFixed(2)} ${py.toFixed(2)}h0.01`);
  }

  return points.join("");
}

function plot(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  axes: Axes,
  reduced: boolean,
) {
  const params = paramsFor(axes);
  ctx.clearRect(0, 0, w, h);
  const ink = getComputedStyle(document.documentElement)
    .getPropertyValue("--sig")
    .trim();
  if (!ink) return;
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.08;
  let x = 0.1;
  let y = 0.1;
  const steps = reduced ? 4000 : 18000;
  const scale = Math.min(w, h) * 0.22;
  for (let i = 0; i < steps; i++) {
    const nx = Math.sin(params.a * y) + params.c * Math.cos(params.a * x);
    const ny = Math.sin(params.b * x) + params.d * Math.cos(params.b * y);
    x = nx;
    y = ny;
    if (i < 40) continue;
    const px = w * 0.5 + x * scale;
    const py = h * 0.5 + y * scale;
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function EmotionalManifoldDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [axes, setAxes] = useState<Axes>(DEFAULT_AXES);
  const [canvasReady, setCanvasReady] = useState(false);
  const fallbackPath = useMemo(() => stillPath(axes), [axes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      plot(ctx, rect.width, rect.height, axes, motionQuery.matches);
      setCanvasReady(true);
    };
    draw();

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw);
    observer?.observe(canvas);
    motionQuery.addEventListener("change", draw);
    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener("change", draw);
    };
  }, [axes]);

  return (
    <div
      className={`lens${canvasReady ? " lens--ready" : ""}`}
      id="emotional-manifold"
      role="group"
      aria-labelledby="lens-title"
      aria-describedby="lens-note"
    >
      <p className="lens__flag">Paused · a lens, not a measurement</p>
      <h2 className="lens__title" id="lens-title">
        The emotional manifold
      </h2>
      <div className="lens__visual" aria-hidden="true">
        <svg
          className="lens__still"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <path d={fallbackPath} />
        </svg>
        <canvas ref={canvasRef} className="lens__c" />
      </div>
      <div className="lens__axes">
        {AXES.map((axis) => (
          <label key={axis.key} className="lens__axis">
            <span id={`lens-${axis.key}-label`}>
              {axis.label}
              <b>{axes[axis.key]}</b>
            </span>
            <input
              type="range"
              min={axis.min}
              max={axis.max}
              value={axes[axis.key]}
              aria-label={axis.label}
              aria-labelledby={`lens-${axis.key}-label`}
              onChange={(e) =>
                setAxes((cur) => ({
                  ...cur,
                  [axis.key]: Number(e.target.value),
                }))
              }
            />
          </label>
        ))}
      </div>
      <p className="lens__note" id="lens-note">
        Six axes arrived at in conversation with a language model, not derived
        from a study. Drag them. The field is Clifford ink from those numbers.
        It does not validate a feeling.
      </p>
    </div>
  );
}
