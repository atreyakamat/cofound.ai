"use client";

import { useEffect, useRef } from "react";

/**
 * Particles — floating dot field on a canvas.
 * ReactBits Particles-style background component.
 */
export default function Particles({
  count = 60,
  color = "#6366f1",
  speed = 0.3,
  size = 2,
  className = "",
}: {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * speed * 0.5,
      vy: (Math.random() - 0.5) * speed * 0.5,
      opacity: 0.1 + Math.random() * 0.5,
    }));

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      dots.forEach((d) => {
        d.x += d.vx / width * 100;
        d.y += d.vy / height * 100;

        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        if (d.y < 0) d.y = 1;
        if (d.y > 1) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x * width, d.y * height, size * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(d.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [count, color, speed, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
