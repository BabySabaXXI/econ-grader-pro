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
  color: string;
}

interface GradingLoaderProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  gridSize?: number;
  cellGap?: number;
  blinkSpeed?: number;
  onComplete?: () => void;
}

// Brainwave-inspired color palette for the grid dots
const GRID_COLORS = [
  "#0084FF", // primary-1 blue
  "#3E90F0", // accent-2 light blue
  "#8E55EA", // accent-3 purple
  "#3FDD78", // primary-2 green
  "#DDA73F", // accent-5 gold
  "#6C7275", // n-4 neutral
  "#E8ECEF", // n-3 light
  "#343839", // n-5 dark
  "#8C6584", // accent-4 mauve
];

export function GradingLoader({
  isLoading,
  message = "Analyzing your essay...",
  progress,
  gridSize = 10,
  cellGap = 5,
  blinkSpeed = 1800,
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
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading, messages]);

  // Generate grid with Brainwave colors
  useEffect(() => {
    const cols = 18;
    const rows = 14;
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
          initialOpacity: Math.random() * 0.5 + 0.2,
          color: GRID_COLORS[Math.floor(Math.random() * GRID_COLORS.length)],
        });
      }
    }
    setGridCells(cells);
  }, [gridSize, cellGap, blinkSpeed]);

  const gridWidth = 18 * (gridSize + cellGap);
  const gridHeight = 14 * (gridSize + cellGap);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16"
        >
          {/* Grid Animation — Brainwave colored dots on dark bg */}
          <div
            className="relative overflow-hidden mb-10"
            style={{
              width: gridWidth,
              height: gridHeight,
              borderRadius: "1.25rem",
              background: "var(--n-7)",
              boxShadow:
                "0 0.75rem 2.5rem -0.75rem rgba(0, 0, 0, 0.3), 0 0 1rem 0.25rem rgba(0, 0, 0, 0.08)",
            }}
          >
            <style jsx>{`
              @keyframes gridBlink {
                0%,
                100% {
                  opacity: 0.15;
                }
                50% {
                  opacity: 0.85;
                }
              }
            `}</style>

            {gridCells.map((cell) => (
              <div
                key={cell.id}
                style={{
                  position: "absolute",
                  left: cell.x + 12,
                  top: cell.y + 12,
                  width: gridSize,
                  height: gridSize,
                  backgroundColor: cell.color,
                  opacity: cell.initialOpacity,
                  borderRadius: "3px",
                  animation: `gridBlink ${blinkSpeed}ms infinite`,
                  animationDelay: `${cell.blinkDelay}ms`,
                }}
              />
            ))}

            {/* Subtle radial gradient overlay for depth */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 30%, rgba(20,23,24,0.4) 100%)",
              }}
            />
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div
              className="w-48 h-1.5 overflow-hidden mb-5"
              style={{
                background: "var(--n-3)",
                borderRadius: "0.75rem",
              }}
            >
              <motion.div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--primary-1), var(--accent-3))",
                  borderRadius: "0.75rem",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Message — cycling with smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-base2 text-n-4 text-center font-inter"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>

          {/* Powered by label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-caption1 text-n-4/50 mt-4 font-inter"
          >
            Powered by Claude AI
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GradingLoader;
