"use client";

import { motion } from "framer-motion";

/**
 * SplitText — animates each character in a string with a staggered entrance.
 * Uses framer-motion for Next.js compatibility.
 * Inspired by the ReactBits SplitText component.
 */
export default function SplitText({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  stagger = 0.03,
  once = true,
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const chars = text.split("");

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className={`inline-block ${charClassName}`}
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
          variants={{
            hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                delay: delay + i * stagger,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
