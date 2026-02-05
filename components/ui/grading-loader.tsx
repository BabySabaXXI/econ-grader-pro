"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GradingLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onComplete?: () => void;
}

const LOADER_COLORS = [
  "var(--n-4)",
  "var(--n-5)",
  "var(--accent-sage)",
  "var(--accent-indigo)",
  "var(--accent-clay)",
  "var(--accent-stone)",
  "var(--accent-terracotta)",
];

const naturalEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function GradingLoader({
  isLoading,
  message = "Analyzing your essay...",
  progress,
}: GradingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  const messages = useMemo(
    () => [
      "Analyzing your essay...",
      "Checking knowledge & understanding...",
      "Evaluating application...",
      "Assessing chains of analysis...",
      "Reviewing evaluation quality...",
      "Identifying strengths...",
      "Finding areas for improvement...",
      "Generating detailed feedback...",
    ],
    []
  );

  useEffect(() => {
    if (!isLoading) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setCurrentMessage(messages[index]);
    }, 2800);
    return () => clearInterval(interval);
  }, [isLoading, messages]);

  // Generate a grid of dots with staggered animation
  const dots = useMemo(() => {
    const items = [];
    const cols = 12;
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          id: `${r}-${c}`,
          delay: (r * cols + c) * 0.02 + Math.random() * 0.3,
          color: LOADER_COLORS[Math.floor(Math.random() * LOADER_COLORS.length)],
          size: Math.random() > 0.7 ? 6 : 4,
        });
      }
    }
    return items;
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20"
        >
          {/* Minimal Dot Grid */}
          <div
            className="relative mb-10 overflow-hidden"
            style={{
              width: 240,
              height: 160,
              borderRadius: "0.75rem",
              background: "var(--n-7)",
            }}
          >
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-5">
              {dots.map((dot) => (
                <motion.div
                  key={dot.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.15, 0.6, 0.15],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2.5 + Math.random(),
                    delay: dot.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: dot.size,
                    height: dot.size,
                    borderRadius: "50%",
                    background: dot.color,
                  }}
                />
              ))}
            </div>

            {/* Subtle vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 40%, rgba(28,27,24,0.5) 100%)",
              }}
            />
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div
              className="w-40 h-1 overflow-hidden mb-5"
              style={{
                background: "var(--n-3)",
                borderRadius: "0.5rem",
              }}
            >
              <motion.div
                className="h-full"
                style={{
                  background: "var(--primary-1)",
                  borderRadius: "0.5rem",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}

          {/* Cycling message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: naturalEase }}
              className="text-base2 text-n-4 text-center font-inter"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-caption2 text-n-4/40 mt-3 font-inter"
          >
            Powered by Claude AI
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GradingLoader;
