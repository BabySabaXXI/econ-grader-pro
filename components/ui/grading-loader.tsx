"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GridCell {
  id: string;
  x: number;
  y: number;
  blinkDelay: number;
  fadeDelay: number;
  initialOpacity: number;
}

interface GradingLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  gridSize?: number;
  cellShape?: "circle" | "square";
  cellGap?: number;
  cellColor?: string;
  blinkSpeed?: number;
  onComplete?: () => void;
}

export function GradingLoader({
  isLoading,
  message = "Analyzing your essay...",
  progress,
  gridSize = 12,
  cellShape = "circle",
  cellGap = 4,
  cellColor = "#cacfd8",
  blinkSpeed = 1500,
}: GradingLoaderProps) {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [currentMessage, setCurrentMessage] = useState(message);

  const messages = useMemo(
    () => [
      "Analyzing your essay...",
      "Checking AO1: Knowledge & Understanding...",
      "Evaluating AO2: Application...",
      "Assessing AO3: Analysis chains...",
      "Reviewing AO4: Evaluation quality...",
      "Identifying strengths...",
      "Finding areas for improvement...",
      "Generating detailed feedback...",
    ],
    []
  );

  // Cycle through messages
  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setCurrentMessage(messages[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, messages]);

  // Generate grid
  useEffect(() => {
    const cols = 20;
    const rows = 12;
    const cellWithGap = gridSize + cellGap;

    const cells: GridCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          id: `${row}-${col}`,
          x: col * cellWithGap,
          y: row * cellWithGap,
          blinkDelay: Math.random() * blinkSpeed,
          fadeDelay: Math.random() * 600,
          initialOpacity: Math.random() * 0.6 + 0.2,
        });
      }
    }
    setGridCells(cells);
  }, [gridSize, cellGap, blinkSpeed]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16"
        >
          {/* Grid Animation */}
          <div
            className="relative overflow-hidden rounded-2xl mb-8"
            style={{
              width: 20 * (gridSize + cellGap),
              height: 12 * (gridSize + cellGap),
            }}
          >
            <style jsx>{`
              @keyframes blink {
                0%,
                100% {
                  opacity: 0.2;
                }
                50% {
                  opacity: 0.8;
                }
              }
            `}</style>

            {gridCells.map((cell) => (
              <div
                key={cell.id}
                className={cellShape === "circle" ? "rounded-full" : "rounded"}
                style={{
                  position: "absolute",
                  left: cell.x,
                  top: cell.y,
                  width: gridSize,
                  height: gridSize,
                  backgroundColor: cellColor,
                  opacity: cell.initialOpacity,
                  animation: `blink ${blinkSpeed}ms infinite`,
                  animationDelay: `${cell.blinkDelay}ms`,
                }}
              />
            ))}

            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
          </div>

          {/* Progress indicator */}
          {progress !== undefined && (
            <div className="w-48 h-1.5 bg-[--bg-weak-50] rounded-full overflow-hidden mb-4 border border-[--stroke-soft-200]">
              <motion.div
                className="h-full bg-gradient-to-r from-[--blue-500] to-[--blue-300] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-p-sm text-[--text-soft-400] text-center font-inter"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>

          {/* Subtle pulsing ring */}
          <motion.div
            className="absolute w-64 h-64 rounded-full border border-[--stroke-soft-200]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GradingLoader;
