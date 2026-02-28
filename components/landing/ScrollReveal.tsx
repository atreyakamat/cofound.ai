"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * ScrollReveal — fades children in from below when they enter the viewport.
 * ReactBits-style scroll-triggered reveal.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 32,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      initial={{ opacity: 0, y }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
