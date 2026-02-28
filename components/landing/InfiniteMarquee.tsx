"use client";

/**
 * InfiniteMarquee — horizontally scrolling ticker, infinite loop via CSS animation.
 * ReactBits-style infinite scroll component.
 */
export default function InfiniteMarquee({
  items,
  speed = 35,
  gap = 16,
  className = "",
  itemClassName = "",
  direction = "left",
}: {
  items: string[];
  speed?: number;
  gap?: number;
  className?: string;
  itemClassName?: string;
  direction?: "left" | "right";
}) {
  // Duplicate items so the loop is seamless
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden relative ${className}`}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

      <div
        className="flex w-max"
        style={{
          gap: `${gap}px`,
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`shrink-0 rounded-full bg-white ring-1 ring-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap ${itemClassName}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
