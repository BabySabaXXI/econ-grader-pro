"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, List, Lightbulb, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkEarned, MarkLost } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
}

interface ActiveFeedback {
  type: "earned" | "lost";
  data: MarkEarned | MarkLost;
}

// AO Config — mapped to NeuraTalk semantic palette
const AO_CONFIG = {
  ao1: {
    label: "Knowledge",
    color: "bg-[--information-base]",
    bgLight: "bg-[--information-lighter]",
    text: "text-[--information-base]",
    border: "border-[--information-light]",
  },
  ao2: {
    label: "Application",
    color: "bg-[--success-base]",
    bgLight: "bg-[--success-lighter]",
    text: "text-[--success-base]",
    border: "border-[--success-light]",
  },
  ao3: {
    label: "Analysis",
    color: "bg-[--feature-base]",
    bgLight: "bg-[--feature-lighter]",
    text: "text-[--feature-base]",
    border: "border-[--feature-light]",
  },
  ao4: {
    label: "Evaluation",
    color: "bg-[--away-base]",
    bgLight: "bg-[--away-lighter]",
    text: "text-[--away-base]",
    border: "border-[--away-light]",
  },
};

// AO Badge Component
function AOBadge({ ao, className }: { ao: string; className?: string }) {
  const config = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
        config.text,
        config.bgLight,
        config.border,
        className
      )}
    >
      {ao.toUpperCase()}
    </span>
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
      if (highlight.start > currentPos) {
        segments.push({
          text: essay.slice(currentPos, highlight.start),
          type: "normal",
          startIndex: currentPos,
          endIndex: highlight.start,
        });
      }

      segments.push({
        text: essay.slice(highlight.start, highlight.end),
        type: highlight.type,
        data: highlight.data,
        startIndex: highlight.start,
        endIndex: highlight.end,
      });

      currentPos = highlight.end;
    }

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
    (type: "earned" | "lost", data: MarkEarned | MarkLost) => {
      setActiveFeedback({ type, data });
    },
    []
  );

  const earnedCount = marksEarned.length;
  const lostCount = marksLost.length;
  const totalEarnedPoints = marksEarned.reduce((sum, m) => sum + m.points, 0);

  return (
    <div className={cn("relative space-y-5", className)} ref={containerRef}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[--bg-weak-50] rounded-2xl border border-[--stroke-soft-200]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-label-xs font-inter text-[--text-soft-400] uppercase tracking-wider mr-2">View:</span>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "h-8 px-3.5 text-xs font-medium rounded-full transition-all border",
              viewMode === "all"
                ? "bg-[--strong-950] text-white border-transparent"
                : "bg-white text-[--text-sub-600] border-[--stroke-soft-200] hover:border-[--stroke-sub-300]"
            )}
          >
            All
          </button>
          <button
            onClick={() => setViewMode("earned")}
            className={cn(
              "h-8 px-3.5 text-xs font-medium rounded-full transition-all border inline-flex items-center gap-1.5",
              viewMode === "earned"
                ? "bg-[--success-base] text-white border-transparent"
                : "bg-white text-[--text-sub-600] border-[--stroke-soft-200] hover:border-[--stroke-sub-300]"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "earned" && "text-[--success-base]")}>+{totalEarnedPoints}</span>
            <span className="text-xs opacity-70">({earnedCount})</span>
          </button>
          <button
            onClick={() => setViewMode("lost")}
            className={cn(
              "h-8 px-3.5 text-xs font-medium rounded-full transition-all border inline-flex items-center gap-1.5",
              viewMode === "lost"
                ? "bg-[--error-base] text-white border-transparent"
                : "bg-white text-[--text-sub-600] border-[--stroke-soft-200] hover:border-[--stroke-sub-300]"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "lost" && "text-[--error-base]")}>Issues</span>
            <span className="text-xs opacity-70">({lostCount})</span>
          </button>
        </div>

        {onToggleDetailedFeedback && (
          <div className="flex items-center gap-3 pl-4 border-l border-[--stroke-soft-200]">
            {showDetailedFeedback ? (
              <Eye className="w-4 h-4 text-[--text-sub-600]" />
            ) : (
              <EyeOff className="w-4 h-4 text-[--text-soft-400]" />
            )}
            <span className="text-label-xs font-inter text-[--text-sub-600]">Details</span>
            <Switch
              checked={showDetailedFeedback}
              onCheckedChange={onToggleDetailedFeedback}
              className="data-[state=checked]:bg-[--blue-500]"
            />
          </div>
        )}
      </div>

      {/* Essay Content */}
      <div className="card-neura overflow-hidden">
        <div className="p-6">
          <p className="text-[15px] leading-[1.9] text-[--text-sub-600] whitespace-pre-wrap font-[system-ui]">
            {visibleSegments.map((segment, index) => {
              if (segment.type === "normal") {
                return <span key={index}>{segment.text}</span>;
              }

              const isEarned = segment.type === "earned";
              const isLost = segment.type === "lost";

              return (
                <span
                  key={index}
                  onClick={() =>
                    segment.data &&
                    handleHighlightClick(
                      segment.type as "earned" | "lost",
                      segment.data
                    )
                  }
                  className={cn(
                    "relative inline cursor-pointer rounded-sm px-1 py-0.5 transition-all duration-200",
                    isEarned && "highlight-earned",
                    isLost && "highlight-lost"
                  )}
                >
                  {segment.text}
                  {isLost && !showDetailedFeedback && (
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-[--error-base] text-white rounded-full align-middle shadow-sm">
                      !
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Detailed Feedback Panel */}
      {showDetailedFeedback && (
        <div className="space-y-5">
          {/* Lost Marks Section */}
          {marksLost.length > 0 && (
            <div className="rounded-xl border border-[--error-light] bg-gradient-to-br from-[--error-lighter] to-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[--error-light]">
                <h3 className="text-label-sm font-inter text-[--error-base] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[--error-base] animate-pulse" />
                  Issues Found ({marksLost.length})
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {marksLost.map((item, idx) => {
                  const itemId = `lost-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <div className="rounded-xl border border-[--error-light] bg-white overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-[--error-lighter]/50 transition-colors">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[--error-base]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[--error-base]" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[--error-lighter] text-[--error-base] border border-[--error-light]">
                                  Issue
                                </span>
                              </div>
                              <p className="text-p-sm text-[--text-sub-600] italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[--error-light]">
                            <div className="pt-3 p-4 rounded-xl bg-gradient-to-br from-[--error-lighter] to-white border border-[--error-light]">
                              <p className="text-[10px] font-bold text-[--error-base] uppercase tracking-wider mb-2">
                                Issue
                              </p>
                              <p className="text-p-sm text-[--text-sub-600] leading-relaxed">{item.issue}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-[--away-lighter] to-white border border-[--away-light]">
                              <p className="text-[10px] font-bold text-[--away-base] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Lightbulb className="w-3 h-3" />
                                How to Fix
                              </p>
                              <p className="text-p-sm text-[--text-sub-600] leading-relaxed">{item.howToFix}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          )}

          {/* Earned Marks Section */}
          {marksEarned.length > 0 && (
            <div className="rounded-xl border border-[--success-light] bg-gradient-to-br from-[--success-lighter] to-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[--success-light]">
                <h3 className="text-label-sm font-inter text-[--success-base] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marks Earned (+{totalEarnedPoints} from {marksEarned.length} items)
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {marksEarned.map((item, idx) => {
                  const itemId = `earned-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <div className="rounded-xl border border-[--success-light] bg-white overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-[--success-lighter]/50 transition-colors">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[--success-base]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[--success-base]" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[--success-lighter] text-[--success-base] border border-[--success-light]">
                                  +{item.points}
                                </span>
                              </div>
                              <p className="text-p-sm text-[--text-sub-600] italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t border-[--success-light]">
                            <div className="pt-3 p-4 rounded-xl bg-gradient-to-br from-[--success-lighter] to-white border border-[--success-light]">
                              <p className="text-[10px] font-bold text-[--success-base] uppercase tracking-wider mb-2">
                                Why This Earned Marks
                              </p>
                              <p className="text-p-sm text-[--text-sub-600] leading-relaxed">{item.reason}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <Dialog open={!!activeFeedback} onOpenChange={() => setActiveFeedback(null)}>
        <DialogContent className={cn(
          "sm:max-w-md rounded-2xl border",
          activeFeedback?.type === "earned" ? "border-[--success-light]" : "border-[--error-light]"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AOBadge ao={activeFeedback?.data.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span className="text-[--success-base] font-semibold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  +{(activeFeedback?.data as MarkEarned)?.points} marks
                </span>
              ) : (
                <span className="text-[--error-base] font-semibold flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Issue Found
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Quote */}
            <div className="p-4 rounded-xl bg-[--bg-weak-50] border border-[--stroke-soft-200]">
              <p className="text-p-sm italic text-[--text-sub-600] leading-relaxed">
                &ldquo;{activeFeedback?.data.quote}&rdquo;
              </p>
            </div>

            {/* Feedback content */}
            {activeFeedback?.type === "earned" ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[--success-lighter] to-white border border-[--success-light]">
                <p className="text-[10px] font-bold text-[--success-base] uppercase tracking-wider mb-2">
                  Why this earned marks
                </p>
                <p className="text-p-sm text-[--text-sub-600] leading-relaxed">
                  {(activeFeedback?.data as MarkEarned)?.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[--error-lighter] to-white border border-[--error-light]">
                  <p className="text-[10px] font-bold text-[--error-base] uppercase tracking-wider mb-2">
                    Issue
                  </p>
                  <p className="text-p-sm text-[--text-sub-600] leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.issue}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[--away-lighter] to-white border border-[--away-light]">
                  <p className="text-[10px] font-bold text-[--away-base] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3" />
                    How to Fix
                  </p>
                  <p className="text-p-sm text-[--text-sub-600] leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.howToFix}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-p-xs text-[--text-soft-400] pt-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded-full bg-[--success-lighter] border border-[--success-light]" />
          <span>Marks Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded-full bg-[--error-lighter] border border-[--error-light]" />
          <span>Issues (click for details)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
