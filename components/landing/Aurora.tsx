"use client";

import { useEffect, useRef } from "react";

/**
 * Aurora — animated gradient mesh background (ReactBits-style)
 * Renders a canvas with drifting color orbs using requestAnimationFrame.
 */
export default function Aurora({
  colorStops = ["#6366f1", "#8b5cf6", "#a78bfa"],
  speed = 0.4,
  className = "",
}: {
  colorStops?: string[];
  speed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const orbs = colorStops.map((color, i) => ({
      color,
      x: 0.2 + (i * 0.3),
      y: 0.3 + (i * 0.2),
      r: 0.45 + i * 0.05,
      ox: Math.random() * Math.PI * 2,
      oy: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        const cx = (orb.x + Math.sin(t * speed + orb.ox) * 0.18) * width;
        const cy = (orb.y + Math.cos(t * speed * 0.7 + orb.oy) * 0.14) * height;
        const r = orb.r * Math.min(width, height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, orb.color + "55");
        grad.addColorStop(0.5, orb.color + "22");
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      t += 0.01;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [colorStops, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: "normal" }}
    />
  );
}
