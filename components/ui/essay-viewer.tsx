"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
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
  rect: DOMRect | null;
}

export function EssayViewer({
  essay,
  marksEarned,
  marksLost,
  className,
}: EssayViewerProps) {
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "earned" | "lost">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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
      if (!mark.quote) return;
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
      if (!mark.quote) return;
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
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      setActiveFeedback({
        type,
        data,
        rect,
      });
    },
    []
  );

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        activeFeedback
      ) {
        setActiveFeedback(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeFeedback]);

  const earnedCount = marksEarned.length;
  const lostCount = marksLost.length;

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* View mode toggle */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-stone-50 rounded-xl">
        <span className="text-xs font-medium text-stone-500 mr-2">Filter:</span>
        <button
          onClick={() => setViewMode("all")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-all",
            viewMode === "all"
              ? "bg-stone-800 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          )}
        >
          All Marks
        </button>
        <button
          onClick={() => setViewMode("earned")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2",
            viewMode === "earned"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-emerald-50 border border-stone-200"
          )}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Earned ({earnedCount})
        </button>
        <button
          onClick={() => setViewMode("lost")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2",
            viewMode === "lost"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-rose-50 border border-stone-200"
          )}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Lost ({lostCount})
        </button>
      </div>

      {/* Essay content with highlights */}
      <div className="relative p-8 bg-white rounded-2xl border border-stone-200 shadow-sm">
        <p className="text-base leading-[2] text-stone-700 whitespace-pre-wrap font-[system-ui]">
          {visibleSegments.map((segment, index) => {
            if (segment.type === "normal") {
              return <span key={index}>{segment.text}</span>;
            }

            const isEarned = segment.type === "earned";
            const isActive = activeFeedback?.data === segment.data;

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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative inline cursor-pointer rounded-md px-1 py-0.5 transition-all duration-200",
                  isEarned
                    ? "bg-emerald-100/80 hover:bg-emerald-200"
                    : "bg-rose-100/80 hover:bg-rose-200",
                  isActive &&
                    (isEarned
                      ? "bg-emerald-200 ring-2 ring-emerald-400 ring-offset-1"
                      : "bg-rose-200 ring-2 ring-rose-400 ring-offset-1")
                )}
              >
                <span
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] rounded-full",
                    isEarned ? "bg-emerald-500" : "bg-rose-500"
                  )}
                />
                {segment.text}
              </motion.span>
            );
          })}
        </p>
      </div>

      {/* Feedback popup - positioned in center of screen */}
      <AnimatePresence>
        {activeFeedback && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setActiveFeedback(null)}
            />

            {/* Popup card - centered modal */}
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "fixed z-50 w-[420px] max-w-[90vw] p-6 rounded-2xl shadow-2xl border-2",
                "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                activeFeedback.type === "earned"
                  ? "bg-white border-emerald-200"
                  : "bg-white border-rose-200"
              )}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveFeedback(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>

              {/* Header with badge and points */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                    activeFeedback.type === "earned"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  {activeFeedback.data.ao.toUpperCase()}
                </span>
                {activeFeedback.type === "earned" && (
                  <span className="text-lg font-bold text-emerald-600">
                    +{(activeFeedback.data as MarkEarned).points} mark
                    {(activeFeedback.data as MarkEarned).points > 1 ? "s" : ""}
                  </span>
                )}
                {activeFeedback.type === "lost" && (
                  <span className="text-lg font-bold text-rose-600">
                    Mark Lost
                  </span>
                )}
              </div>

              {/* Quote */}
              <div className="p-4 rounded-xl bg-stone-50 mb-4">
                <p className="text-sm italic text-stone-600 leading-relaxed">
                  &ldquo;{activeFeedback.data.quote}&rdquo;
                </p>
              </div>

              {/* Feedback content */}
              {activeFeedback.type === "earned" ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                    Why this earned marks
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {(activeFeedback.data as MarkEarned).reason}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                      Issue
                    </p>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {(activeFeedback.data as MarkLost).issue}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                      How to Fix
                    </p>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {(activeFeedback.data as MarkLost).howToFix}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 rounded bg-emerald-200 border border-emerald-300" />
          <span>Click green highlights to see earned marks</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 rounded bg-rose-200 border border-rose-300" />
          <span>Click red highlights to see improvement areas</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
