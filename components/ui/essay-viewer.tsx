"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkEarned, MarkLost } from "@/lib/types";

interface EssayViewerProps {
  essay: string;
  marksEarned: MarkEarned[];
  marksLost: MarkLost[];
  className?: string;
}

interface HighlightSegment {
  text: string;
  type: "normal" | "earned" | "lost";
  data?: MarkEarned | MarkLost;
  startIndex: number;
  endIndex: number;
}

interface ActiveFeedback {
  type: "earned" | "lost";
  data: MarkEarned | MarkLost;
  position: { x: number; y: number };
}

export function EssayViewer({
  essay,
  marksEarned,
  marksLost,
  className,
}: EssayViewerProps) {
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "earned" | "lost">("all");

  // Find all highlight positions and create segments
  const highlightedSegments = useMemo(() => {
    const segments: HighlightSegment[] = [];
    const highlights: Array<{
      start: number;
      end: number;
      type: "earned" | "lost";
      data: MarkEarned | MarkLost;
    }> = [];

    // Find positions of earned marks
    marksEarned.forEach((mark) => {
      const quote = mark.quote.toLowerCase();
      const essayLower = essay.toLowerCase();
      let searchStart = 0;
      let index = essayLower.indexOf(quote, searchStart);

      while (index !== -1) {
        highlights.push({
          start: index,
          end: index + mark.quote.length,
          type: "earned",
          data: mark,
        });
        searchStart = index + 1;
        index = essayLower.indexOf(quote, searchStart);
      }
    });

    // Find positions of lost marks
    marksLost.forEach((mark) => {
      const quote = mark.quote.toLowerCase();
      const essayLower = essay.toLowerCase();
      let searchStart = 0;
      let index = essayLower.indexOf(quote, searchStart);

      while (index !== -1) {
        highlights.push({
          start: index,
          end: index + mark.quote.length,
          type: "lost",
          data: mark,
        });
        searchStart = index + 1;
        index = essayLower.indexOf(quote, searchStart);
      }
    });

    // Sort by start position
    highlights.sort((a, b) => a.start - b.start);

    // Remove overlapping highlights (keep first occurrence)
    const nonOverlapping: typeof highlights = [];
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start >= lastEnd) {
        nonOverlapping.push(h);
        lastEnd = h.end;
      }
    }

    // Build segments
    let currentPos = 0;
    for (const highlight of nonOverlapping) {
      // Add normal text before this highlight
      if (highlight.start > currentPos) {
        segments.push({
          text: essay.slice(currentPos, highlight.start),
          type: "normal",
          startIndex: currentPos,
          endIndex: highlight.start,
        });
      }

      // Add highlighted segment
      segments.push({
        text: essay.slice(highlight.start, highlight.end),
        type: highlight.type,
        data: highlight.data,
        startIndex: highlight.start,
        endIndex: highlight.end,
      });

      currentPos = highlight.end;
    }

    // Add remaining text
    if (currentPos < essay.length) {
      segments.push({
        text: essay.slice(currentPos),
        type: "normal",
        startIndex: currentPos,
        endIndex: essay.length,
      });
    }

    return segments;
  }, [essay, marksEarned, marksLost]);

  // Filter segments based on view mode
  const visibleSegments = useMemo(() => {
    if (viewMode === "all") return highlightedSegments;
    return highlightedSegments.map((seg) => {
      if (seg.type === "normal") return seg;
      if (viewMode === "earned" && seg.type === "lost") {
        return { ...seg, type: "normal" as const, data: undefined };
      }
      if (viewMode === "lost" && seg.type === "earned") {
        return { ...seg, type: "normal" as const, data: undefined };
      }
      return seg;
    });
  }, [highlightedSegments, viewMode]);

  const handleHighlightClick = useCallback(
    (
      e: React.MouseEvent,
      type: "earned" | "lost",
      data: MarkEarned | MarkLost
    ) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setActiveFeedback({
        type,
        data,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      });
    },
    []
  );

  const earnedCount = marksEarned.length;
  const lostCount = marksLost.length;

  return (
    <div className={cn("relative", className)}>
      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-stone-50 rounded-lg">
        <span className="text-xs font-medium text-stone-500 mr-2">Show:</span>
        <button
          onClick={() => setViewMode("all")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            viewMode === "all"
              ? "bg-stone-800 text-white"
              : "bg-white text-stone-600 hover:bg-stone-100"
          )}
        >
          All
        </button>
        <button
          onClick={() => setViewMode("earned")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
            viewMode === "earned"
              ? "bg-emerald-600 text-white"
              : "bg-white text-stone-600 hover:bg-emerald-50"
          )}
        >
          <CheckCircle className="w-3 h-3" />
          Earned ({earnedCount})
        </button>
        <button
          onClick={() => setViewMode("lost")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
            viewMode === "lost"
              ? "bg-rose-600 text-white"
              : "bg-white text-stone-600 hover:bg-rose-50"
          )}
        >
          <AlertCircle className="w-3 h-3" />
          Lost ({lostCount})
        </button>
      </div>

      {/* Essay content with highlights */}
      <div className="relative p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
        <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">
          {visibleSegments.map((segment, index) => {
            if (segment.type === "normal") {
              return <span key={index}>{segment.text}</span>;
            }

            const isEarned = segment.type === "earned";
            const isActive =
              activeFeedback?.data === segment.data;

            return (
              <motion.span
                key={index}
                onClick={(e) =>
                  segment.data &&
                  handleHighlightClick(
                    e,
                    segment.type as "earned" | "lost",
                    segment.data
                  )
                }
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "relative inline cursor-pointer rounded px-0.5 -mx-0.5 transition-all duration-200",
                  isEarned
                    ? "bg-emerald-100 hover:bg-emerald-200"
                    : "bg-rose-100 hover:bg-rose-200",
                  isActive && (isEarned ? "bg-emerald-200 ring-2 ring-emerald-400" : "bg-rose-200 ring-2 ring-rose-400")
                )}
              >
                <span
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5",
                    isEarned ? "bg-emerald-400" : "bg-rose-400"
                  )}
                />
                {segment.text}
              </motion.span>
            );
          })}
        </p>
      </div>

      {/* Feedback popup */}
      <AnimatePresence>
        {activeFeedback && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeedback(null)}
              className="fixed inset-0 z-40"
            />

            {/* Popup card */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "fixed z-50 w-80 p-4 rounded-xl shadow-xl border",
                activeFeedback.type === "earned"
                  ? "bg-white border-emerald-200"
                  : "bg-white border-rose-200"
              )}
              style={{
                left: Math.min(
                  Math.max(activeFeedback.position.x - 160, 16),
                  window.innerWidth - 336
                ),
                top: activeFeedback.position.y - 8,
                transform: "translateY(-100%)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveFeedback(null)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4 text-stone-400" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-semibold uppercase",
                    activeFeedback.type === "earned"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  {activeFeedback.data.ao.toUpperCase()}
                </span>
                {activeFeedback.type === "earned" && (
                  <span className="text-sm font-semibold text-emerald-600">
                    +{(activeFeedback.data as MarkEarned).points} mark
                    {(activeFeedback.data as MarkEarned).points > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Quote */}
              <p className="text-sm italic text-stone-600 mb-3 pb-3 border-b border-stone-100">
                &ldquo;{activeFeedback.data.quote}&rdquo;
              </p>

              {/* Feedback content */}
              {activeFeedback.type === "earned" ? (
                <div>
                  <p className="text-sm text-stone-700">
                    {(activeFeedback.data as MarkEarned).reason}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-rose-600 mb-1">
                      Issue:
                    </p>
                    <p className="text-sm text-stone-700">
                      {(activeFeedback.data as MarkLost).issue}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-50 border-l-2 border-stone-300">
                    <p className="text-xs font-medium text-stone-500 mb-1">
                      How to fix:
                    </p>
                    <p className="text-sm text-stone-700">
                      {(activeFeedback.data as MarkLost).howToFix}
                    </p>
                  </div>
                </div>
              )}

              {/* Arrow pointer */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 -mt-1.5 border-r border-b",
                  activeFeedback.type === "earned"
                    ? "bg-white border-emerald-200"
                    : "bg-white border-rose-200"
                )}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded bg-emerald-200" />
          <span>Click green highlights to see earned marks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded bg-rose-200" />
          <span>Click red highlights to see improvement areas</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
