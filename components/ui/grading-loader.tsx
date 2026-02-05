"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GradingLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onComplete?: () => void;
}

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function GradingLoader({
  isLoading,
  message = "Analyzing your essay...",
  progress,
}: GradingLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [barCount] = useState(48);

  const messages = useMemo(
    () => [
      "Reading through your essay...",
      "Checking AO1: Knowledge & Understanding...",
      "Evaluating AO2: Application to context...",
      "Assessing AO3: Chains of analysis...",
      "Reviewing AO4: Evaluation quality...",
      "Identifying key strengths...",
      "Finding areas for improvement...",
      "Matching against mark scheme criteria...",
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
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading, messages]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center"
          style={{ minHeight: "calc(100vh - 14rem)" }}
        >
          {/* Central animation container */}
          <div className="flex flex-col items-center w-full max-w-lg px-6">
            {/* Large waveform visualizer */}
            <div
              className="relative w-full flex items-center justify-center gap-[3px] mb-12"
              style={{ height: "160px" }}
            >
              {Array.from({ length: barCount }).map((_, i) => {
                const center = barCount / 2;
                const distFromCenter = Math.abs(i - center) / center;
                const maxHeight = 140 * (1 - distFromCenter * 0.7);
                const minHeight = 8;
                const delay = i * 0.04;

                return (
                  <motion.div
                    key={i}
                    initial={{ height: minHeight, opacity: 0 }}
                    animate={{
                      height: [
                        minHeight,
                        maxHeight * 0.6,
                        minHeight * 2,
                        maxHeight,
                        minHeight * 1.5,
                        maxHeight * 0.4,
                        minHeight,
                      ],
                      opacity: [0.3, 0.7, 0.4, 0.9, 0.5, 0.6, 0.3],
                    }}
                    transition={{
                      height: {
                        duration: 3.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay,
                      },
                      opacity: {
                        duration: 3.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay,
                      },
                    }}
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: "4px",
                      background: `linear-gradient(180deg, var(--primary-1), var(--primary-2))`,
                      opacity: 0.3,
                    }}
                  />
                );
              })}

              {/* Subtle glow behind center */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, var(--primary-muted) 0%, transparent 70%)",
                }}
              />
            </div>

            {/* Progress indicator */}
            <div
              className="w-full max-w-xs mb-8"
              style={{
                height: "2px",
                background: "var(--n-3)",
                borderRadius: "1px",
                overflow: "hidden",
              }}
            >
              {progress !== undefined ? (
                <motion.div
                  className="h-full"
                  style={{ background: "var(--primary-1)", borderRadius: "1px" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  className="h-full"
                  style={{
                    width: "40%",
                    background: "var(--primary-1)",
                    borderRadius: "1px",
                  }}
                  animate={{ x: ["-40%", "300%"] }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              )}
            </div>

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: springEase }}
                className="text-sm text-n-5 text-center tracking-[-0.01em]"
              >
                {currentMessage}
              </motion.p>
            </AnimatePresence>

            {/* Subtle label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[11px] text-n-4 mt-4 tracking-[-0.01em]"
            >
              Powered by Claude AI
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GradingLoader;
