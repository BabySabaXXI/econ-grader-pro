"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GradingLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onComplete?: () => void;
}

const naturalEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Skeleton shimmer bar — a single animated line
 */
function SkeletonLine({
  width,
  delay,
  height = 10,
}: {
  width: string;
  delay: number;
  height?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.3 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, delay, ease: naturalEase }}
      className="relative overflow-hidden"
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: "var(--n-3)",
        transformOrigin: "left",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(59, 111, 174, 0.08), transparent)",
          animation: "skeletonShimmer 1.8s ease-in-out infinite",
          animationDelay: `${delay * 0.5}s`,
        }}
      />
    </motion.div>
  );
}

/**
 * Full-page skeleton loading animation
 * Renders as a large document/page placeholder that covers significant screen area
 */
export function GradingLoader({
  isLoading,
  message = "Analyzing your essay...",
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

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: naturalEase }}
          className="flex flex-col items-center justify-start w-full max-w-3xl mx-auto pt-4"
        >
          {/* Large document skeleton — the "page" */}
          <div
            className="w-full relative overflow-hidden"
            style={{
              background: "white",
              borderRadius: "0.875rem",
              border: "1px solid var(--n-3)",
              boxShadow:
                "0 1px 3px rgba(22, 27, 38, 0.04), 0 8px 32px -8px rgba(22, 27, 38, 0.08)",
              minHeight: "70vh",
            }}
          >
            {/* Document header skeleton */}
            <div
              className="px-8 py-6 flex items-center gap-4 max-md:px-5 max-md:py-4 max-md:gap-3"
              style={{
                borderBottom: "1px solid var(--n-3)",
                background: "var(--n-2)",
              }}
            >
              {/* Icon placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: naturalEase }}
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "0.5rem",
                  background: "var(--n-3)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59, 111, 174, 0.06), transparent)",
                    animation: "skeletonShimmer 1.8s ease-in-out infinite",
                  }}
                />
              </motion.div>
              <div className="flex-1 space-y-2.5">
                <SkeletonLine width="45%" delay={0.15} height={14} />
                <SkeletonLine width="30%" delay={0.2} height={8} />
              </div>
              {/* Score placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.25, ease: naturalEase }}
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--n-3)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59, 111, 174, 0.06), transparent)",
                    animation: "skeletonShimmer 1.8s ease-in-out infinite",
                    animationDelay: "0.3s",
                  }}
                />
              </motion.div>
            </div>

            {/* Document body skeleton — main content area */}
            <div className="px-8 py-7 space-y-7 max-md:px-5 max-md:py-5 max-md:space-y-5">
              {/* Paragraph block 1 */}
              <div className="space-y-3">
                <SkeletonLine width="100%" delay={0.3} />
                <SkeletonLine width="95%" delay={0.35} />
                <SkeletonLine width="88%" delay={0.4} />
                <SkeletonLine width="92%" delay={0.45} />
                <SkeletonLine width="60%" delay={0.5} />
              </div>

              {/* Inline card placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55, ease: naturalEase }}
                className="relative overflow-hidden"
                style={{
                  borderRadius: "0.625rem",
                  border: "1px solid var(--n-3)",
                  background: "var(--n-2)",
                  padding: "1.25rem",
                }}
              >
                <div className="space-y-3">
                  <SkeletonLine width="35%" delay={0.6} height={12} />
                  <div className="flex gap-3">
                    <SkeletonLine width="25%" delay={0.65} height={28} />
                    <SkeletonLine width="25%" delay={0.7} height={28} />
                    <SkeletonLine width="25%" delay={0.75} height={28} />
                    <SkeletonLine width="25%" delay={0.8} height={28} />
                  </div>
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(59, 111, 174, 0.03), transparent)",
                    animation: "skeletonShimmer 2.2s ease-in-out infinite",
                    animationDelay: "0.4s",
                  }}
                />
              </motion.div>

              {/* Paragraph block 2 */}
              <div className="space-y-3">
                <SkeletonLine width="100%" delay={0.85} />
                <SkeletonLine width="97%" delay={0.9} />
                <SkeletonLine width="85%" delay={0.95} />
                <SkeletonLine width="90%" delay={1.0} />
                <SkeletonLine width="75%" delay={1.05} />
              </div>

              {/* Two-column cards */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1, ease: naturalEase }}
                className="grid grid-cols-2 gap-4 max-md:gap-3"
              >
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: "0.625rem",
                      border: "1px solid var(--n-3)",
                      background: "var(--n-2)",
                      padding: "1rem",
                    }}
                  >
                    <div className="space-y-2.5">
                      <SkeletonLine width="50%" delay={1.15 + i * 0.08} height={8} />
                      <SkeletonLine width="70%" delay={1.2 + i * 0.08} height={18} />
                      <SkeletonLine width="40%" delay={1.25 + i * 0.08} height={8} />
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(59, 111, 174, 0.03), transparent)",
                        animation: "skeletonShimmer 2.2s ease-in-out infinite",
                        animationDelay: `${0.5 + i * 0.3}s`,
                      }}
                    />
                  </div>
                ))}
              </motion.div>

              {/* Paragraph block 3 */}
              <div className="space-y-3">
                <SkeletonLine width="100%" delay={1.3} />
                <SkeletonLine width="93%" delay={1.35} />
                <SkeletonLine width="87%" delay={1.4} />
                <SkeletonLine width="50%" delay={1.45} />
              </div>

              {/* Bottom list items */}
              <div className="space-y-2.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.5 + i * 0.08,
                      ease: naturalEase,
                    }}
                    className="flex items-center gap-3"
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden flex-shrink-0"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--n-3)",
                      }}
                    />
                    <SkeletonLine
                      width={`${70 + i * 8}%`}
                      delay={1.55 + i * 0.08}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Subtle pulsing overlay on the whole document */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0, 0.015, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "linear-gradient(180deg, rgba(59, 111, 174, 0.04) 0%, transparent 50%, rgba(59, 111, 174, 0.02) 100%)",
              }}
            />
          </div>

          {/* Status message below the document */}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--primary-1)",
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: naturalEase }}
                className="text-base2 text-n-4 text-center font-inter"
              >
                {currentMessage}
              </motion.p>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-caption2 text-n-4/50 font-inter"
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
