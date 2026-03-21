"use client";

import { useRef, useEffect } from "react";

const TAU = Math.PI * 2;

function rgba(alpha: number): string {
  return `rgba(212,168,83,${alpha})`;
}

type DividerVariant = "metatron" | "wave" | "hexline" | "vesica";

interface SectionDividerProps {
  variant?: DividerVariant;
  className?: string;
}

export default function SectionDivider({
  variant = "metatron",
  className = "",
}: SectionDividerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement?.clientWidth || 800;
    const h = 48;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cy = h / 2;
    const cx = w / 2;

    ctx.clearRect(0, 0, w, h);

    if (variant === "metatron") {
      // Metatron's cube fragment: overlapping circles with connecting lines
      const r = 10;
      const spacing = r * 2;
      const count = Math.ceil(w / spacing) + 2;
      const startX = cx - (count / 2) * spacing;

      // Central line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = rgba(0.04);
      ctx.lineWidth = 0.3;
      ctx.stroke();

      for (let i = 0; i < count; i++) {
        const x = startX + i * spacing;
        const distFromCenter = Math.abs(x - cx) / (w * 0.5);
        const alpha = Math.max(0, 0.08 * (1 - distFromCenter * 0.8));

        // Small circles
        ctx.beginPath();
        ctx.arc(x, cy, r, 0, TAU);
        ctx.strokeStyle = rgba(alpha * 0.6);
        ctx.lineWidth = 0.4;
        ctx.stroke();

        // Hexagonal connection to neighbors
        if (i < count - 1) {
          const nx = startX + (i + 1) * spacing;
          ctx.beginPath();
          ctx.moveTo(x + r, cy);
          ctx.lineTo(nx - r, cy);
          ctx.strokeStyle = rgba(alpha * 0.3);
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }

        // Small dots at intersections
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(x, cy, 1.5, 0, TAU);
          ctx.fillStyle = rgba(alpha * 0.8);
          ctx.fill();
        }
      }

      // Decorative diamonds at center
      const diamondCount = 5;
      for (let i = 0; i < diamondCount; i++) {
        const x = cx + (i - 2) * spacing * 2;
        const distFromCenter = Math.abs(x - cx) / (w * 0.3);
        const alpha = Math.max(0, 0.06 * (1 - distFromCenter));
        const s = 5;
        ctx.beginPath();
        ctx.moveTo(x, cy - s);
        ctx.lineTo(x + s, cy);
        ctx.lineTo(x, cy + s);
        ctx.lineTo(x - s, cy);
        ctx.closePath();
        ctx.strokeStyle = rgba(alpha);
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }

    if (variant === "wave") {
      // Sinusoidal sacred wave
      const amplitude = 8;
      const freq = 0.015;

      for (let layer = 0; layer < 3; layer++) {
        const offset = layer * 2;
        const layerAlpha = 0.06 - layer * 0.015;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 1) {
          const distFromCenter = Math.abs(x - cx) / (w * 0.5);
          const fade = Math.max(0, 1 - distFromCenter);
          const y =
            cy + Math.sin(x * freq + offset) * amplitude * fade;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(layerAlpha);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Dots at wave peaks
      for (let x = 0; x <= w; x += 40) {
        const distFromCenter = Math.abs(x - cx) / (w * 0.5);
        const fade = Math.max(0, 1 - distFromCenter);
        const alpha = 0.1 * fade;
        ctx.beginPath();
        ctx.arc(x, cy, 1, 0, TAU);
        ctx.fillStyle = rgba(alpha);
        ctx.fill();
      }
    }

    if (variant === "hexline") {
      // Chain of small hexagons
      const hexR = 6;
      const spacing = hexR * 3;
      const count = Math.ceil(w / spacing) + 2;
      const startX = cx - (count / 2) * spacing;

      // Base line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = rgba(0.025);
      ctx.lineWidth = 0.3;
      ctx.stroke();

      for (let i = 0; i < count; i++) {
        const x = startX + i * spacing;
        const distFromCenter = Math.abs(x - cx) / (w * 0.5);
        const alpha = Math.max(0, 0.07 * (1 - distFromCenter * 0.7));

        ctx.beginPath();
        for (let s = 0; s <= 6; s++) {
          const a = (TAU * s) / 6 + Math.PI / 6;
          const px = x + Math.cos(a) * hexR;
          const py = cy + Math.sin(a) * hexR;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(alpha);
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }
    }

    if (variant === "vesica") {
      // Vesica piscis chain
      const r = 14;
      const overlap = r * 0.6;
      const spacing = r * 2 - overlap;
      const count = Math.ceil(w / spacing) + 2;
      const startX = cx - (count / 2) * spacing;

      for (let i = 0; i < count; i++) {
        const x = startX + i * spacing;
        const distFromCenter = Math.abs(x - cx) / (w * 0.5);
        const alpha = Math.max(0, 0.05 * (1 - distFromCenter * 0.7));

        ctx.beginPath();
        ctx.arc(x - overlap / 2, cy, r, 0, TAU);
        ctx.strokeStyle = rgba(alpha * 0.5);
        ctx.lineWidth = 0.3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x + overlap / 2, cy, r, 0, TAU);
        ctx.strokeStyle = rgba(alpha * 0.5);
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }

    const handleResize = () => {
      const newW = canvas.parentElement?.clientWidth || 800;
      canvas.width = newW * dpr;
      canvas.style.width = `${newW}px`;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [variant]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full" aria-hidden="true" />
    </div>
  );
}
