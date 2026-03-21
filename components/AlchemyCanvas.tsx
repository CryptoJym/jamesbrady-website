"use client";

import { useEffect, useRef } from "react";

const GOLD = "#D4A853";
const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;

function rgba(alpha: number): string {
  return `rgba(212,168,83,${alpha})`;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  life: number;
  phase: number;
}

function resetParticle(
  p: Particle,
  maxR: number
): void {
  p.angle = Math.random() * TAU;
  p.radius = maxR * (0.12 + Math.random() * 0.82);
  p.speed =
    (0.00015 + Math.random() * 0.0006) * (Math.random() > 0.5 ? 1 : -1);
  p.size = 0.4 + Math.random() * 1.8;
  p.alpha = 0.04 + Math.random() * 0.14;
  p.life = 1;
  p.phase = Math.random() * TAU;
}

function drawPoly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sides: number,
  rot: number,
  color: string,
  lw: number
) {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (TAU * i) / sides + rot;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
}

export default function AlchemyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let time = 0;
    let maxR = 0;
    const particles: Particle[] = [];
    const maxParticles = 80;
    let mouseX = -9999;
    let mouseY = -9999;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.parentElement?.getBoundingClientRect();
      width = rect?.width || window.innerWidth;
      height = rect?.height || window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width * 0.55;
      cy = height * 0.5;
      maxR = Math.min(width, height) * 0.4;
    }

    function onMouse(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function drawCircleRings(t: number) {
      const rings = [0.18, 0.3, 0.45, 0.58, 0.72, 0.86, 1.0];
      for (let i = 0; i < rings.length; i++) {
        const r = maxR * rings[i];
        const pulse = 1 + Math.sin(t * 0.0004 + i * 0.9) * 0.006;
        const alpha = 0.02 + 0.035 * (1 - rings[i]);
        ctx!.beginPath();
        ctx!.arc(cx, cy, r * pulse, 0, TAU);
        ctx!.strokeStyle = rgba(alpha);
        ctx!.lineWidth = i === 0 || i === rings.length - 1 ? 0.8 : 0.4;
        ctx!.stroke();
      }
    }

    function drawHexLayers(t: number) {
      const layers = [
        { r: 0.22, speed: 0.00014, sides: 6, alpha: 0.08, lw: 0.6 },
        { r: 0.42, speed: -0.00009, sides: 6, alpha: 0.055, lw: 0.5 },
        { r: 0.62, speed: 0.00006, sides: 12, alpha: 0.04, lw: 0.4 },
        { r: 0.82, speed: -0.00004, sides: 6, alpha: 0.03, lw: 0.3 },
      ];
      for (const l of layers) {
        drawPoly(
          ctx!,
          cx,
          cy,
          maxR * l.r,
          l.sides,
          t * l.speed,
          rgba(l.alpha),
          l.lw
        );
      }
    }

    function drawTriangles(t: number) {
      const rot = t * 0.0001;
      const r = maxR * 0.38;
      drawPoly(ctx!, cx, cy, r, 3, rot, rgba(0.06), 0.7);
      drawPoly(ctx!, cx, cy, r * 0.9, 3, -rot + Math.PI / 3, rgba(0.045), 0.5);
    }

    function drawFlowerOfLife(t: number) {
      const r = maxR * 0.16;
      const alpha = 0.03 + Math.sin(t * 0.0003) * 0.008;
      const baseRot = t * 0.00005;
      for (let i = 0; i < 6; i++) {
        const a = (TAU * i) / 6 + baseRot;
        ctx!.beginPath();
        ctx!.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r, 0, TAU);
        ctx!.strokeStyle = rgba(alpha);
        ctx!.lineWidth = 0.35;
        ctx!.stroke();
      }
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, TAU);
      ctx!.strokeStyle = rgba(alpha);
      ctx!.lineWidth = 0.35;
      ctx!.stroke();
    }

    function drawRadials(t: number) {
      const count = 24;
      for (let i = 0; i < count; i++) {
        const a = (TAU * i) / count + t * 0.00003;
        const innerR = maxR * 0.04;
        const outerR = maxR * 0.98;
        const x1 = cx + Math.cos(a) * innerR;
        const y1 = cy + Math.sin(a) * innerR;
        const x2 = cx + Math.cos(a) * outerR;
        const y2 = cy + Math.sin(a) * outerR;

        const grad = ctx!.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, rgba(0));
        grad.addColorStop(0.2, rgba(i % 4 === 0 ? 0.035 : 0.018));
        grad.addColorStop(0.8, rgba(i % 4 === 0 ? 0.035 : 0.018));
        grad.addColorStop(1, rgba(0));

        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = i % 4 === 0 ? 0.4 : 0.2;
        ctx!.stroke();
      }
    }

    function drawOrbitingDots(t: number) {
      const layers = [
        { r: 0.22, count: 6, speed: 0.0003, size: 2, alpha: 0.18 },
        { r: 0.42, count: 8, speed: -0.00022, size: 1.5, alpha: 0.14 },
        { r: 0.62, count: 12, speed: 0.00016, size: 1.2, alpha: 0.1 },
        { r: 0.82, count: 18, speed: -0.0001, size: 0.8, alpha: 0.07 },
      ];
      for (const l of layers) {
        for (let i = 0; i < l.count; i++) {
          const a = (TAU * i) / l.count + t * l.speed;
          const px = cx + Math.cos(a) * maxR * l.r;
          const py = cy + Math.sin(a) * maxR * l.r;
          ctx!.beginPath();
          ctx!.arc(px, py, l.size, 0, TAU);
          ctx!.fillStyle = rgba(l.alpha);
          ctx!.fill();
        }
      }
    }

    function drawGoldenSpiral(t: number) {
      const pulse = 1 + Math.sin(t * 0.0008) * 0.02;
      const spiralR = maxR * 0.32 * pulse;
      const spiralRot = t * 0.00012;

      ctx!.save();
      ctx!.translate(cx, cy);

      for (let mirror = 0; mirror < 2; mirror++) {
        ctx!.save();
        ctx!.rotate(mirror * Math.PI + spiralRot);
        ctx!.beginPath();
        const steps = 240;
        for (let i = 0; i < steps; i++) {
          const prog = i / steps;
          const angle = prog * TAU * 2.8;
          const r = spiralR * Math.pow(PHI, (angle / TAU) * 0.5 - 1) * 0.3;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        const spiralAlpha = 0.08 + Math.sin(t * 0.0006) * 0.03;
        ctx!.strokeStyle = rgba(spiralAlpha);
        ctx!.lineWidth = 0.7;
        ctx!.stroke();
        ctx!.restore();
      }

      ctx!.restore();
    }

    function drawTickMarks(t: number) {
      const rot = t * 0.00005;
      for (let i = 0; i < 72; i++) {
        const a = (TAU * i) / 72 + rot;
        const isMajor = i % 6 === 0;
        const inner = maxR * (isMajor ? 0.96 : 0.98);
        const outer = maxR * (isMajor ? 1.04 : 1.01);
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx!.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx!.strokeStyle = rgba(isMajor ? 0.07 : 0.025);
        ctx!.lineWidth = isMajor ? 0.6 : 0.25;
        ctx!.stroke();
      }
    }

    function drawCenterSymbol(t: number) {
      const r = maxR * 0.055;
      const alpha = 0.14 + Math.sin(t * 0.0007) * 0.04;

      // Circle
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, TAU);
      ctx!.strokeStyle = rgba(alpha);
      ctx!.lineWidth = 0.8;
      ctx!.stroke();

      // Dot at center
      ctx!.beginPath();
      ctx!.arc(cx, cy, 1.5, 0, TAU);
      ctx!.fillStyle = rgba(alpha * 1.2);
      ctx!.fill();

      // Cross
      const ext = r * 1.8;
      ctx!.beginPath();
      ctx!.moveTo(cx - ext, cy);
      ctx!.lineTo(cx + ext, cy);
      ctx!.moveTo(cx, cy - ext);
      ctx!.lineTo(cx, cy + ext);
      ctx!.strokeStyle = rgba(alpha * 0.5);
      ctx!.lineWidth = 0.4;
      ctx!.stroke();
    }

    function drawDecorativeArcs(t: number) {
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + t * 0.00006;
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR * 0.94, a, a + Math.PI * 0.28);
        ctx!.strokeStyle = rgba(0.022);
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = (TAU * i) / 3 + t * -0.00008;
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR * 0.52, a, a + Math.PI * 0.35);
        ctx!.strokeStyle = rgba(0.018);
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }

    function drawParticles(t: number) {
      for (const p of particles) {
        p.angle += p.speed;
        p.life -= 0.0008;
        if (p.life <= 0) resetParticle(p, maxR);

        const wobble = Math.sin(t * 0.0008 + p.phase) * 6;
        const px = cx + Math.cos(p.angle) * (p.radius + wobble);
        const py = cy + Math.sin(p.angle) * (p.radius + wobble);
        const fadeIn = Math.min(1, (1 - p.life) * 4);
        const fadeOut = Math.min(1, p.life * 4);
        const alpha = p.alpha * fadeIn * fadeOut;

        ctx!.beginPath();
        ctx!.arc(px, py, p.size, 0, TAU);
        ctx!.fillStyle = rgba(alpha);
        ctx!.fill();
      }
    }

    function drawMouseGlow() {
      if (mouseX < 0 || mouseY < 0) return;
      const grad = ctx!.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        150
      );
      grad.addColorStop(0, rgba(0.035));
      grad.addColorStop(1, rgba(0));
      ctx!.fillStyle = grad;
      ctx!.fillRect(mouseX - 150, mouseY - 150, 300, 300);
    }

    function drawVignetteEdges() {
      // Subtle vignette to help the geometry fade into the background
      const grad = ctx!.createRadialGradient(
        cx,
        cy,
        maxR * 0.6,
        cx,
        cy,
        maxR * 1.4
      );
      grad.addColorStop(0, "rgba(10,10,10,0)");
      grad.addColorStop(1, "rgba(10,10,10,0.7)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, width, height);
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);

      drawRadials(time);
      drawCircleRings(time);
      drawHexLayers(time);
      drawTriangles(time);
      drawFlowerOfLife(time);
      drawOrbitingDots(time);
      drawGoldenSpiral(time);
      drawTickMarks(time);
      drawDecorativeArcs(time);
      drawCenterSymbol(time);
      drawParticles(time);
      drawMouseGlow();
      drawVignetteEdges();

      time += 16;
      animationId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", onMouseLeave);

    for (let i = 0; i < maxParticles; i++) {
      const p: Particle = {
        angle: 0,
        radius: 0,
        speed: 0,
        size: 0,
        alpha: 0,
        life: 0,
        phase: 0,
      };
      resetParticle(p, maxR);
      p.life = Math.random();
      particles.push(p);
    }

    frame();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: "auto" }}
      aria-hidden="true"
    />
  );
}
