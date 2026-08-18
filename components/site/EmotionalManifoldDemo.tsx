"use client";

import { useEffect, useRef, useState } from "react";

import { cliffordParamsFromHuman } from "@/lib/attractorMapping";

const AXES = [
  { key: "energy", label: "Energy", min: 0, max: 100, start: 55 },
  { key: "valence", label: "Valence", min: -100, max: 100, start: 10 },
  { key: "complexity", label: "Complexity", min: 0, max: 100, start: 40 },
  { key: "novelty", label: "Novelty", min: 0, max: 100, start: 35 },
  { key: "introspection", label: "Introspection", min: 0, max: 100, start: 45 },
  { key: "focus", label: "Focus", min: 0, max: 100, start: 60 },
] as const;

type AxisKey = (typeof AXES)[number]["key"];

function plot(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  axes: Record<AxisKey, number>,
  reduced: boolean,
) {
  const params = cliffordParamsFromHuman({
    energy: axes.energy / 100,
    valence: axes.valence / 100,
    complexity: axes.complexity / 100,
    novelty: axes.novelty / 100,
    introspection: axes.introspection / 100,
    focus: axes.focus / 100,
    dim1: axes.introspection / 100,
    dim2: axes.focus / 100,
  });
  ctx.clearRect(0, 0, w, h);
  const ink = getComputedStyle(document.documentElement)
    .getPropertyValue("--sig")
    .trim();
  if (!ink) return;
  ctx.fillStyle = ink;
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
    ctx.globalAlpha = 0.08;
    ctx.fillRect(px, py, 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function EmotionalManifoldDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [axes, setAxes] = useState<Record<AxisKey, number>>({
    energy: 55,
    valence: 10,
    complexity: 40,
    novelty: 35,
    introspection: 45,
    focus: 60,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      plot(ctx, rect.width, rect.height, axes, reduced);
    };
    draw();
  }, [axes]);

  return (
    <div className="lens">
      <p className="lens__flag">Paused · a lens, not a measurement</p>
      <canvas ref={canvasRef} className="lens__c" aria-hidden="true" />
      <div className="lens__axes">
        {AXES.map((axis) => (
          <label key={axis.key} className="lens__axis">
            <span>
              {axis.label}
              <b>{axes[axis.key]}</b>
            </span>
            <input
              type="range"
              min={axis.min}
              max={axis.max}
              value={axes[axis.key]}
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
      <p className="lens__note">
        Six axes arrived at in conversation with a language model, not derived
        from a study. Drag them. The field is Clifford ink from those numbers.
        It does not validate a feeling.
      </p>
    </div>
  );
}
