"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  children?: React.ReactNode;
  color?: string;
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 6,
  className,
  trackClassName,
  indicatorClassName,
  children,
  color,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={cn("text-stone-100", trackClassName)}
        />
        {/* Indicator */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || "currentColor"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          strokeLinecap="round"
          className={cn("text-stone-900", indicatorClassName)}
        />
      </svg>
      {children && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

interface LinearProgressProps {
  value: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  color?: string;
}

function LinearProgress({
  value,
  className,
  trackClassName,
  indicatorClassName,
  color,
}: LinearProgressProps) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-stone-100",
        trackClassName,
        className
      )}
    >
      <motion.div
        className={cn("h-full rounded-full bg-stone-900", indicatorClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={color ? { backgroundColor: color } : undefined}
      />
    </div>
  );
}

export { CircularProgress, LinearProgress };
