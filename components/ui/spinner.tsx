"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: number;
  className?: string;
}

function Spinner({ size = 40, className }: SpinnerProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin"
        style={{ animationDuration: "1.4s" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-stone-200"
        />
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80, 200"
          strokeDashoffset="0"
          className="text-stone-700"
          animate={{
            strokeDasharray: ["1, 200", "89, 200", "89, 200"],
            strokeDashoffset: [0, -35, -124],
          }}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </motion.svg>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-4"
      >
        <Spinner size={48} />
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-stone-600"
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export { Spinner, LoadingOverlay };
