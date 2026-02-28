"use client";

import { useRef, type ReactNode } from "react";

/**
 * TiltCard — 3D perspective tilt on hover, mouse-tracking.
 * ReactBits-style tilting card.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02,1.02,1.02)`;
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
