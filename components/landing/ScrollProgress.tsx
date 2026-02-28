"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — thin progress bar at the top of the page
 * showing how far down the user has scrolled.
 */
export default function ScrollProgress({ color = "#6366f1" }: { color?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0%", backgroundColor: color }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] rounded-full"
    />
  );
}
