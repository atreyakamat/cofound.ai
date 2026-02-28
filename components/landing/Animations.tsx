"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

/**
 * AnimatedCounter — large stat number with animated underline bar on entry.
 */
export function AnimatedStat({
  value,
  label,
  delay = 0,
}: {
  value: ReactNode;
  label: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative text-center group"
    >
      <p className="text-4xl font-extrabold text-brand-600 tabular-nums">{value}</p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: delay + 0.25, ease: "easeOut" }}
        style={{ originX: 0.5 }}
        className="h-0.5 bg-brand-200 rounded-full my-2 mx-auto w-8"
      />
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}

/**
 * GlowButton — a button with animated glow ring on hover.
 */
export function GlowButton({
  children,
  className = "",
  glowColor = "rgba(99,102,241,0.4)",
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  href?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const style = {
    boxShadow: hovered ? `0 0 32px 4px ${glowColor}` : "0 0 0px 0px transparent",
    transition: "box-shadow 0.3s ease",
  };

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={className}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * FadeStagger — staggers children in sequentially on scroll entry.
 */
export function FadeStagger({
  children,
  stagger = 0.08,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function FadeItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
