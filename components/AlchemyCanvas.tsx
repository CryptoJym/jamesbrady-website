"use client";

import { useEffect, useRef } from "react";

const GOLD = "#D4A853";
const GOLD_DIM = "rgba(212, 168, 83, 0.15)";
const GOLD_FAINT = "rgba(212, 168, 83, 0.06)";
const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
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
    const particles: Particle[] = [];
    const maxParticles = 60;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = height / 2;
    }

    function spawnParticle() {
      const angle = Math.random() * TAU;
      const radius = Math.random() * Math.min(width, height) * 0.4;
      particles.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        size: 1 + Math.random() * 1.5,
      });
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
        }
      }
      while (particles.length < maxParticles) {
        spawnParticle();
      }
    }

    function drawParticles(ctx: CanvasRenderingContext2D) {
      for (const p of particles) {
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fillStyle = `rgba(212, 168, 83, ${alpha})`;
        ctx.fill();
      }
    }

    function drawTransmutationCircle(
      ctx: CanvasRenderingContext2D,
      t: number
    ) {
      const baseRadius = Math.min(width, height) * 0.3;
      const rotation = t * 0.0002;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, TAU);
      ctx.strokeStyle = GOLD_DIM;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Second ring
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.85, 0, TAU);
      ctx.strokeStyle = GOLD_FAINT;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.6, 0, TAU);
      ctx.strokeStyle = GOLD_DIM;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Core ring
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 0.25, 0, TAU);
      ctx.strokeStyle = GOLD_FAINT;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Rotating inscribed hexagon
      ctx.save();
      ctx.rotate(rotation);
      const sides = 6;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * TAU;
        const x = Math.cos(angle) * baseRadius * 0.85;
        const y = Math.sin(angle) * baseRadius * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = GOLD_FAINT;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Connect hexagon vertices to center
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * TAU;
        const x = Math.cos(angle) * baseRadius * 0.85;
        const y = Math.sin(angle) * baseRadius * 0.85;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = GOLD_FAINT;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
      ctx.restore();

      // Counter-rotating triangle
      ctx.save();
      ctx.rotate(-rotation * 1.5);
      ctx.beginPath();
      for (let i = 0; i <= 3; i++) {
        const angle = (i / 3) * TAU - Math.PI / 2;
        const x = Math.cos(angle) * baseRadius * 0.6;
        const y = Math.sin(angle) * baseRadius * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = GOLD_DIM;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();

      // Inverted triangle (slower rotation)
      ctx.save();
      ctx.rotate(rotation * 0.7);
      ctx.beginPath();
      for (let i = 0; i <= 3; i++) {
        const angle = (i / 3) * TAU + Math.PI / 2;
        const x = Math.cos(angle) * baseRadius * 0.6;
        const y = Math.sin(angle) * baseRadius * 0.6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = GOLD_FAINT;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();

      // Tick marks around outer ring
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * TAU + rotation * 0.5;
        const inner = baseRadius * 0.95;
        const outer = baseRadius * (i % 3 === 0 ? 1.05 : 1.02);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.strokeStyle = i % 3 === 0 ? GOLD_DIM : GOLD_FAINT;
        ctx.lineWidth = i % 3 === 0 ? 0.8 : 0.3;
        ctx.stroke();
      }

      // Twelve divisions with small circles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * TAU + rotation * 0.3;
        const r = baseRadius * 0.85;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, TAU);
        ctx.fillStyle = GOLD_FAINT;
        ctx.fill();
      }

      ctx.restore();
    }

    function drawGoldenSpiral(ctx: CanvasRenderingContext2D, t: number) {
      const pulse = 1 + Math.sin(t * 0.001) * 0.03;
      const baseRadius = Math.min(width, height) * 0.28 * pulse;
      const spiralRotation = t * 0.00015;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spiralRotation);

      // Draw two mirrored golden spirals
      for (let mirror = 0; mirror < 2; mirror++) {
        ctx.save();
        ctx.rotate(mirror * Math.PI);

        ctx.beginPath();
        const steps = 200;
        for (let i = 0; i < steps; i++) {
          const progress = i / steps;
          const angle = progress * TAU * 2.5;
          const r = baseRadius * Math.pow(PHI, (angle / TAU) * 0.5 - 1) * 0.3;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const spiralAlpha = 0.1 + Math.sin(t * 0.0008) * 0.04;
        ctx.strokeStyle = `rgba(212, 168, 83, ${spiralAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

    function drawConnectingLines(ctx: CanvasRenderingContext2D, t: number) {
      const baseRadius = Math.min(width, height) * 0.3;
      const rotation = t * 0.0002;
      const points: [number, number][] = [];

      ctx.save();
      ctx.translate(cx, cy);

      // Collect vertices from hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * TAU + rotation;
        points.push([
          Math.cos(angle) * baseRadius * 0.85,
          Math.sin(angle) * baseRadius * 0.85,
        ]);
      }

      // Collect vertices from triangles
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * TAU - Math.PI / 2 - rotation * 1.5;
        points.push([
          Math.cos(angle) * baseRadius * 0.6,
          Math.sin(angle) * baseRadius * 0.6,
        ]);
      }

      // Connect non-adjacent vertices with faint lines
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 2; j < points.length; j++) {
          if (j - i === 1) continue;
          const dx = points[j][0] - points[i][0];
          const dy = points[j][1] - points[i][1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = baseRadius * 1.5;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.04;
            ctx.beginPath();
            ctx.moveTo(points[i][0], points[i][1]);
            ctx.lineTo(points[j][0], points[j][1]);
            ctx.strokeStyle = `rgba(212, 168, 83, ${alpha})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      drawTransmutationCircle(ctx!, time);
      drawGoldenSpiral(ctx!, time);
      drawConnectingLines(ctx!, time);
      updateParticles();
      drawParticles(ctx!);

      time += 16;
      animationId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    // Seed initial particles
    for (let i = 0; i < maxParticles; i++) {
      spawnParticle();
      // Pre-age them so they don't all appear at once
      particles[i].life = Math.random() * particles[i].maxLife * 0.8;
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
