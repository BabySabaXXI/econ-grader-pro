"use client";

import { useEffect, useRef } from "react";
import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

interface HighlightHoverProps {
  children: React.ReactNode;
  className?: string;
  effect?: Transition;
  highlightColor?: string;
  barThickness?: number;
  gapRatio?: number;
  onClick?: () => void;
}

export function HighlightHover({
  children,
  className,
  effect = { type: "spring", stiffness: 260, damping: 24 },
  highlightColor = "#0d0d0d",
  barThickness = 0.12,
  gapRatio = 0.03,
  onClick,
}: HighlightHoverProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const applyVars = () => {
      if (ref.current) {
        const size = parseFloat(getComputedStyle(ref.current).fontSize);
        ref.current.style.setProperty("--hh-bar", `${size * barThickness}px`);
        ref.current.style.setProperty("--hh-gap", `${size * gapRatio}px`);
      }
    };
    applyVars();
    window.addEventListener("resize", applyVars);
    return () => window.removeEventListener("resize", applyVars);
  }, [barThickness, gapRatio]);

  const barVariants = {
    rest: { height: "var(--hh-bar)" },
    hover: { height: "100%", transition: effect },
  };

  const textVariants = {
    rest: { color: "currentColor" },
    hover: { color: highlightColor, transition: effect },
  };

  return (
    <motion.span
      ref={ref}
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={onClick}
      className={cn("relative inline-block cursor-pointer", className)}
    >
      <motion.div
        aria-hidden="true"
        variants={barVariants}
        className="absolute w-full bg-current"
        style={{
          height: "var(--hh-bar)",
          bottom: "calc(-1 * var(--hh-gap))",
        }}
      />
      <motion.span variants={textVariants} className="relative text-current">
        {children}
      </motion.span>
    </motion.span>
  );
}

// Variant for essay highlighting - shows tooltip on hover
interface HighlightedTextProps {
  children: React.ReactNode;
  type: "earned" | "lost";
  tooltip?: string;
  ao?: string;
  points?: number;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function HighlightedText({
  children,
  type,
  tooltip,
  ao,
  points,
  onClick,
  isActive = false,
  className,
}: HighlightedTextProps) {
  const colors = {
    earned: {
      bg: "bg-emerald-100",
      bgHover: "hover:bg-emerald-200",
      border: "border-emerald-300",
      text: "text-emerald-800",
      activeBg: "bg-emerald-200",
    },
    lost: {
      bg: "bg-rose-100",
      bgHover: "hover:bg-rose-200",
      border: "border-rose-300",
      text: "text-rose-800",
      activeBg: "bg-rose-200",
    },
  };

  const color = colors[type];

  return (
    <motion.span
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative inline cursor-pointer rounded px-0.5 py-0.5 transition-colors duration-200",
        color.bg,
        color.bgHover,
        isActive && color.activeBg,
        className
      )}
    >
      {/* Underline indicator */}
      <span
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
          type === "earned" ? "bg-emerald-400" : "bg-rose-400"
        )}
      />

      {/* Text content */}
      <span className={cn("relative", color.text)}>{children}</span>

      {/* Hover tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        className={cn(
          "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap",
          "bg-stone-900 text-white text-xs"
        )}
      >
        <div className="flex items-center gap-2">
          {ao && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase",
                type === "earned"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              )}
            >
              {ao}
            </span>
          )}
          {points !== undefined && (
            <span
              className={
                type === "earned" ? "text-emerald-400" : "text-rose-400"
              }
            >
              {type === "earned" ? `+${points}` : "-"}
            </span>
          )}
        </div>
        {tooltip && <p className="mt-1 text-stone-300">{tooltip}</p>}
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
      </motion.div>
    </motion.span>
  );
}

export default HighlightHover;
