"use client";

import { motion, useAnimationFrame, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

/**
 * MagneticButton — button that magnetically pulls toward the cursor.
 * ReactBits-style magnetic interaction.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX.set((e.clientX - cx) * strength);
    mouseY.set((e.clientY - cy) * strength);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <div className={className}>{children}</div>
    </motion.div>
  );
}
