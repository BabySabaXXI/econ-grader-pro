"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Eye, List, ArrowRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkEarned, MarkLost } from "@/lib/types";

interface EssayViewerProps {
  essay: string;
  marksEarned: MarkEarned[];
  marksLost: MarkLost[];
  className?: string;
  showDetailedFeedback?: boolean;
  onToggleDetailedFeedback?: () => void;
}

interface HighlightSegment {
  text: string;
  type: "normal" | "earned" | "lost";
  data?: MarkEarned | MarkLost;
  startIndex: number;
  endIndex: number;
  id: string;
}

interface ActiveFeedback {
  type: "earned" | "lost";
  data: MarkEarned | MarkLost;
  segmentId: string;
}

// Chain of Reasoning Arrow Component
function ReasoningChain({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="px-2 py-1 text-xs bg-[var(--bg-200)] rounded-md text-[var(--text-300)] border border-[var(--bg-300)]">
            {step}
          </span>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-500)] flex-shrink-0" />
          )}
        </span>
      ))}
    </div>
  );
}

// Inline Feedback Tooltip Component
function InlineFeedbackTooltip({
  type,
  data,
  onClose,
}: {
  type: "earned" | "lost";
  data: MarkEarned | MarkLost;
  onClose: () => void;
}) {
  const isEarned = type === "earned";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className={cn(
        "absolute left-full ml-4 top-0 z-50 w-72 p-4 rounded-xl shadow-claude-lg border-2",
        isEarned
          ? "bg-emerald-50 border-emerald-300"
          : "bg-red-50 border-red-300"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4 text-[var(--text-400)]" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
            isEarned ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}
        >
          {data.ao.toUpperCase()}
        </span>
        {isEarned ? (
          <span className="text-sm font-bold text-emerald-600">
            +{(data as MarkEarned).points} mark{(data as MarkEarned).points > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-sm font-bold text-red-600 flex items-center gap-1">
            <Minus className="w-3 h-3" />
            Mark Lost
          </span>
        )}
      </div>

      {/* Content */}
      {isEarned ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
            Why this earned marks
          </p>
          <p className="text-xs text-[var(--text-200)] leading-relaxed">
            {(data as MarkEarned).reason}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">
              Issue
            </p>
            <p className="text-xs text-[var(--text-200)] leading-relaxed">
              {(data as MarkLost).issue}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
              How to Fix
            </p>
            <p className="text-xs text-[var(--text-200)] leading-relaxed">
              {(data as MarkLost).howToFix}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function EssayViewer({
  essay,
  marksEarned,
  marksLost,
  className,
  showDetailedFeedback = false,
  onToggleDetailedFeedback,
}: EssayViewerProps) {
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "earned" | "lost">("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Find all highlight positions and create segments
  const highlightedSegments = useMemo(() => {
    const segments: HighlightSegment[] = [];
    const highlights: Array<{
      start: number;
      end: number;
      type: "earned" | "lost";
      data: MarkEarned | MarkLost;
      id: string;
    }> = [];

    // Find positions of earned marks
    marksEarned.forEach((mark, idx) => {
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
          id: `earned-${idx}-${index}`,
        });
        searchStart = index + 1;
        index = essayLower.indexOf(quote, searchStart);
      }
    });

    // Find positions of lost marks
    marksLost.forEach((mark, idx) => {
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
          id: `lost-${idx}-${index}`,
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
          id: `normal-${currentPos}`,
        });
      }

      // Add highlighted segment
      segments.push({
        text: essay.slice(highlight.start, highlight.end),
        type: highlight.type,
        data: highlight.data,
        startIndex: highlight.start,
        endIndex: highlight.end,
        id: highlight.id,
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
        id: `normal-${currentPos}`,
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
      data: MarkEarned | MarkLost,
      segmentId: string
    ) => {
      e.stopPropagation();

      // Toggle: if clicking the same segment, close it
      if (activeFeedback?.segmentId === segmentId) {
        setActiveFeedback(null);
      } else {
        setActiveFeedback({ type, data, segmentId });
      }
    },
    [activeFeedback]
  );

  // Close feedback when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveFeedback(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const earnedCount = marksEarned.length;
  const lostCount = marksLost.length;
  const totalEarnedPoints = marksEarned.reduce((sum, m) => sum + m.points, 0);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Top controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-[var(--bg-200)] rounded-xl">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-[var(--text-400)] mr-1">Filter:</span>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewMode === "all"
                ? "bg-[var(--accent)] text-[var(--bg-0)] shadow-sm"
                : "bg-[var(--bg-100)] text-[var(--text-300)] hover:bg-[var(--bg-300)] border border-[var(--bg-300)]"
            )}
          >
            All
          </button>
          <button
            onClick={() => setViewMode("earned")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
              viewMode === "earned"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-[var(--bg-100)] text-[var(--text-300)] hover:bg-emerald-50 border border-[var(--bg-300)]"
            )}
          >
            <CheckCircle className="w-3 h-3" />
            <span className="text-emerald-600 font-bold">+{totalEarnedPoints}</span>
            <span>({earnedCount})</span>
          </button>
          <button
            onClick={() => setViewMode("lost")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
              viewMode === "lost"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-[var(--bg-100)] text-[var(--text-300)] hover:bg-red-50 border border-red-200"
            )}
          >
            <Minus className="w-3 h-3 text-red-500" />
            <span className="text-red-600 font-bold">Lost</span>
            <span>({lostCount})</span>
          </button>
        </div>

        {/* Detailed Feedback Toggle */}
        {onToggleDetailedFeedback && (
          <button
            onClick={onToggleDetailedFeedback}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2",
              showDetailedFeedback
                ? "bg-violet-600 text-white shadow-md"
                : "bg-[var(--bg-100)] text-violet-600 hover:bg-violet-50 border border-violet-200"
            )}
          >
            <List className="w-4 h-4" />
            {showDetailedFeedback ? "Hide" : "Show"} Detailed Feedback
          </button>
        )}
      </div>

      {/* Essay content with highlights - with extra padding on right for inline feedback */}
      <div className="relative p-8 pr-16 bg-[var(--bg-100)] rounded-2xl border border-[var(--bg-300)] shadow-claude">
        <p className="text-base leading-[2.2] text-[var(--text-200)] whitespace-pre-wrap font-[system-ui]">
          {visibleSegments.map((segment) => {
            if (segment.type === "normal") {
              return <span key={segment.id}>{segment.text}</span>;
            }

            const isEarned = segment.type === "earned";
            const isLost = segment.type === "lost";
            const isActive = activeFeedback?.segmentId === segment.id;

            return (
              <span key={segment.id} className="relative inline-feedback">
                <motion.span
                  onClick={(e) =>
                    segment.data &&
                    handleHighlightClick(
                      e,
                      segment.type as "earned" | "lost",
                      segment.data,
                      segment.id
                    )
                  }
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "relative inline cursor-pointer rounded-md px-1 py-0.5 transition-all duration-200",
                    isEarned && "bg-emerald-100 hover:bg-emerald-200 text-emerald-900",
                    isLost && "bg-red-100 hover:bg-red-200 text-red-900 border-b-2 border-red-400",
                    isActive && isEarned && "bg-emerald-200 ring-2 ring-emerald-500 ring-offset-1",
                    isActive && isLost && "bg-red-200 ring-2 ring-red-500 ring-offset-1"
                  )}
                >
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-[2px] rounded-full",
                      isEarned ? "bg-emerald-500" : "bg-red-500"
                    )}
                  />
                  {segment.text}
                  {/* Inline indicator for lost marks */}
                  {isLost && !showDetailedFeedback && (
                    <span className="ml-1 inline-flex items-center px-1 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                      !
                    </span>
                  )}
                </motion.span>

                {/* Inline Feedback Tooltip - positioned at the same level */}
                <AnimatePresence>
                  {isActive && segment.data && (
                    <InlineFeedbackTooltip
                      type={segment.type as "earned" | "lost"}
                      data={segment.data}
                      onClose={() => setActiveFeedback(null)}
                    />
                  )}
                </AnimatePresence>
              </span>
            );
          })}
        </p>
      </div>

      {/* Detailed Feedback Panel - Shows when toggle is enabled */}
      <AnimatePresence>
        {showDetailedFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Lost Marks Section - Show First for Priority */}
            {marksLost.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h4 className="text-sm font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  MARKS LOST ({marksLost.length} issues)
                </h4>
                <div className="space-y-3">
                  {marksLost.map((item, idx) => {
                    const itemId = `lost-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-lg border border-red-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExpanded(itemId)}
                          className="w-full p-4 text-left flex items-start gap-3 hover:bg-red-50/50 transition-colors"
                        >
                          <span className="flex-shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded uppercase">
                                {item.ao}
                              </span>
                              <span className="text-xs font-semibold text-red-600">Mark Lost</span>
                            </div>
                            <p className="text-sm text-[var(--text-300)] italic truncate">
                              &ldquo;{item.quote}&rdquo;
                            </p>
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4 pb-4 border-t border-red-100"
                            >
                              <div className="pt-4 space-y-4">
                                <div className="p-3 rounded-lg bg-red-50">
                                  <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Issue</p>
                                  <p className="text-sm text-[var(--text-200)]">{item.issue}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">How to Fix</p>
                                  <p className="text-sm text-[var(--text-200)]">{item.howToFix}</p>
                                </div>
                                {/* Chain of reasoning for context */}
                                <div className="p-3 rounded-lg bg-[var(--bg-200)]">
                                  <p className="text-[10px] font-semibold text-[var(--text-400)] uppercase tracking-wider mb-1">Better Approach</p>
                                  <ReasoningChain steps={["Define concept", "Apply to context", "Analyze effects", "Evaluate significance"]} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Earned Marks Section */}
            {marksEarned.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h4 className="text-sm font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  MARKS EARNED (+{totalEarnedPoints} points from {marksEarned.length} items)
                </h4>
                <div className="space-y-3">
                  {marksEarned.map((item, idx) => {
                    const itemId = `earned-${idx}`;
                    const isExpanded = expandedItems.has(itemId);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-lg border border-emerald-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExpanded(itemId)}
                          className="w-full p-4 text-left flex items-start gap-3 hover:bg-emerald-50/50 transition-colors"
                        >
                          <span className="flex-shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-emerald-500" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded uppercase">
                                {item.ao}
                              </span>
                              <span className="text-xs font-bold text-emerald-600">+{item.points}</span>
                            </div>
                            <p className="text-sm text-[var(--text-300)] italic truncate">
                              &ldquo;{item.quote}&rdquo;
                            </p>
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4 pb-4 border-t border-emerald-100"
                            >
                              <div className="pt-4 space-y-3">
                                <div className="p-3 rounded-lg bg-emerald-50">
                                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Why This Earned Marks</p>
                                  <p className="text-sm text-[var(--text-200)]">{item.reason}</p>
                                </div>
                                {/* Chain showing the successful reasoning */}
                                <div className="p-3 rounded-lg bg-[var(--bg-200)]">
                                  <p className="text-[10px] font-semibold text-[var(--text-400)] uppercase tracking-wider mb-1">Your Reasoning Chain</p>
                                  <ReasoningChain steps={item.reason.split(/[,.]/).filter(s => s.trim().length > 0 && s.trim().length < 50).slice(0, 4).map(s => s.trim())} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-400)]">
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 rounded bg-emerald-200 border border-emerald-400" />
          <span>Green = Marks Earned (click for details)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 rounded bg-red-200 border border-red-400" />
          <span>Red = Marks Lost (click for how to fix)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
