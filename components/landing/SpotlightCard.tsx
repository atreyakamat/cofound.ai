"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * SpotlightCard — card that follows the mouse with a radial light spotlight.
 * Inspired by the ReactBits SpotlightCard component.
 */
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(99, 102, 241, 0.15)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`,
      }}
    >
      {/* Static base bg so card isn't transparent */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{ opacity }}
      />
      {children}
    </div>
  );
}
