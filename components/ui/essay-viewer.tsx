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

// AO Config — Japandi accent palette
const AO_CONFIG = {
  ao1: {
    label: "Knowledge",
    color: "var(--information-base)",
    bgLight: "var(--information-lighter)",
    borderLight: "var(--information-light)",
  },
  ao2: {
    label: "Application",
    color: "var(--success-dark)",
    bgLight: "var(--success-lighter)",
    borderLight: "var(--success-light)",
  },
  ao3: {
    label: "Analysis",
    color: "var(--feature-base)",
    bgLight: "var(--feature-lighter)",
    borderLight: "var(--feature-light)",
  },
  ao4: {
    label: "Evaluation",
    color: "var(--away-base)",
    bgLight: "var(--away-lighter)",
    borderLight: "var(--away-light)",
  },
};

// AO Badge Component — Japandi pill style
function AOBadge({ ao, className }: { ao: string; className?: string }) {
  const config = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center text-2xs font-bold uppercase tracking-wider px-2 py-0.5 border",
        className
      )}
      style={{
        borderRadius: "2rem",
        color: config.color,
        background: config.bgLight,
        borderColor: config.borderLight,
      }}
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
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4"
        style={{
          borderRadius: "0.75rem",
          background: "var(--n-2)",
          border: "2px solid var(--n-3)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-caption2 font-semibold font-inter text-n-4 uppercase tracking-wider mr-2">View:</span>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "h-8 px-3.5 text-xs font-semibold transition-all border",
              viewMode === "all"
                ? "text-white border-transparent"
                : "text-n-5 border-n-3 hover:border-n-4"
            )}
            style={{
              borderRadius: "2rem",
              background: viewMode === "all" ? "var(--n-7)" : "var(--n-1)",
            }}
          >
            All
          </button>
          <button
            onClick={() => setViewMode("earned")}
            className={cn(
              "h-8 px-3.5 text-xs font-semibold transition-all border inline-flex items-center gap-1.5",
              viewMode === "earned"
                ? "text-white border-transparent"
                : "text-n-5 border-n-3 hover:border-n-4"
            )}
            style={{
              borderRadius: "2rem",
              background: viewMode === "earned" ? "var(--success-dark)" : "var(--n-1)",
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className={cn("font-bold", viewMode !== "earned" && "text-[#3A7266]")}>+{totalEarnedPoints}</span>
            <span className="text-xs opacity-70">({earnedCount})</span>
          </button>
          <button
            onClick={() => setViewMode("lost")}
            className={cn(
              "h-8 px-3.5 text-xs font-semibold transition-all border inline-flex items-center gap-1.5",
              viewMode === "lost"
                ? "text-white border-transparent"
                : "text-n-5 border-n-3 hover:border-n-4"
            )}
            style={{
              borderRadius: "2rem",
              background: viewMode === "lost" ? "var(--error-base)" : "var(--n-1)",
            }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className={cn("font-bold", viewMode !== "lost" && "text-[#BF6B6B]")}>Issues</span>
            <span className="text-xs opacity-70">({lostCount})</span>
          </button>
        </div>

        {onToggleDetailedFeedback && (
          <div className="flex items-center gap-3 pl-4" style={{ borderLeft: "1px solid var(--n-3)" }}>
            {showDetailedFeedback ? (
              <Eye className="w-4 h-4 text-n-5" />
            ) : (
              <EyeOff className="w-4 h-4 text-n-4" />
            )}
            <span className="text-caption2 font-semibold font-inter text-n-5">Details</span>
            <Switch
              checked={showDetailedFeedback}
              onCheckedChange={onToggleDetailedFeedback}
              className="data-[state=checked]:bg-primary-1"
            />
          </div>
        )}
      </div>

      {/* Essay Content */}
      <div className="card-jp overflow-hidden">
        <div className="p-6">
          <p className="text-[15px] leading-[1.9] text-n-5 whitespace-pre-wrap font-[system-ui]">
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
                    "relative inline",
                    isEarned && "highlight-earned",
                    isLost && "highlight-lost"
                  )}
                >
                  {segment.text}
                  {isLost && !showDetailedFeedback && (
                    <span
                      className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white rounded-full align-middle"
                      style={{
                        background: "var(--error-base)",
                        boxShadow: "0 1px 3px rgba(191, 107, 107, 0.3)",
                      }}
                    >
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
            <div
              className="overflow-hidden border"
              style={{
                borderRadius: "1.25rem",
                borderColor: "var(--error-light)",
                background: "linear-gradient(135deg, var(--error-lighter), white)",
              }}
            >
              <div
                className="px-5 py-3.5"
                style={{ borderBottom: "1px solid var(--error-light)" }}
              >
                <h3
                  className="text-base2 font-semibold font-inter flex items-center gap-2"
                  style={{ color: "var(--error-base)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "var(--error-base)" }}
                  />
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
                      <div
                        className="overflow-hidden border"
                        style={{
                          borderRadius: "0.75rem",
                          borderColor: "var(--error-light)",
                          background: "white",
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-[rgba(191,107,107,0.03)]">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: "var(--error-base)" }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: "var(--error-base)" }} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span
                                  className="inline-flex items-center text-2xs font-bold uppercase tracking-wider px-2 py-0.5 border"
                                  style={{
                                    borderRadius: "2rem",
                                    background: "var(--error-lighter)",
                                    color: "var(--error-base)",
                                    borderColor: "var(--error-light)",
                                  }}
                                >
                                  Issue
                                </span>
                              </div>
                              <p className="text-base2 text-n-5 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div
                            className="px-4 pb-4 pt-0 space-y-3"
                            style={{ borderTop: "1px solid var(--error-light)" }}
                          >
                            <div
                              className="pt-3 p-4 border"
                              style={{
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, var(--error-lighter), white)",
                                borderColor: "var(--error-light)",
                              }}
                            >
                              <p
                                className="text-2xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: "var(--error-base)" }}
                              >
                                Issue
                              </p>
                              <p className="text-base2 text-n-5 leading-relaxed">{item.issue}</p>
                            </div>
                            <div
                              className="p-4 border"
                              style={{
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, var(--away-lighter), white)",
                                borderColor: "var(--away-light)",
                              }}
                            >
                              <p
                                className="text-2xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                                style={{ color: "var(--away-base)" }}
                              >
                                <Lightbulb className="w-3 h-3" />
                                How to Fix
                              </p>
                              <p className="text-base2 text-n-5 leading-relaxed">{item.howToFix}</p>
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
            <div
              className="overflow-hidden border"
              style={{
                borderRadius: "1.25rem",
                borderColor: "var(--success-light)",
                background: "linear-gradient(135deg, var(--success-lighter), white)",
              }}
            >
              <div
                className="px-5 py-3.5"
                style={{ borderBottom: "1px solid var(--success-light)" }}
              >
                <h3
                  className="text-base2 font-semibold font-inter flex items-center gap-2"
                  style={{ color: "var(--success-dark)" }}
                >
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
                      <div
                        className="overflow-hidden border"
                        style={{
                          borderRadius: "0.75rem",
                          borderColor: "var(--success-light)",
                          background: "white",
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-[rgba(74,139,127,0.03)]">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: "var(--success-dark)" }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: "var(--success-dark)" }} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span
                                  className="inline-flex items-center text-2xs font-bold px-2 py-0.5 border"
                                  style={{
                                    borderRadius: "2rem",
                                    background: "var(--success-lighter)",
                                    color: "var(--success-dark)",
                                    borderColor: "var(--success-light)",
                                  }}
                                >
                                  +{item.points}
                                </span>
                              </div>
                              <p className="text-base2 text-n-5 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div
                            className="px-4 pb-4 pt-0"
                            style={{ borderTop: "1px solid var(--success-light)" }}
                          >
                            <div
                              className="pt-3 p-4 border"
                              style={{
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, var(--success-lighter), white)",
                                borderColor: "var(--success-light)",
                              }}
                            >
                              <p
                                className="text-2xs font-bold uppercase tracking-wider mb-2"
                                style={{ color: "var(--success-dark)" }}
                              >
                                Why This Earned Marks
                              </p>
                              <p className="text-base2 text-n-5 leading-relaxed">{item.reason}</p>
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
        <DialogContent
          className="sm:max-w-md border"
          style={{
            borderRadius: "1.25rem",
            borderColor: activeFeedback?.type === "earned" ? "var(--success-light)" : "var(--error-light)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AOBadge ao={activeFeedback?.data.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span
                  className="font-semibold flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--success-dark)" }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  +{(activeFeedback?.data as MarkEarned)?.points} marks
                </span>
              ) : (
                <span
                  className="font-semibold flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--error-base)" }}
                >
                  <AlertCircle className="w-4 h-4" />
                  Issue Found
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Quote */}
            <div
              className="p-4 border"
              style={{
                borderRadius: "0.75rem",
                background: "var(--n-2)",
                borderColor: "var(--n-3)",
              }}
            >
              <p className="text-base2 italic text-n-5 leading-relaxed">
                &ldquo;{activeFeedback?.data.quote}&rdquo;
              </p>
            </div>

            {/* Feedback content */}
            {activeFeedback?.type === "earned" ? (
              <div
                className="p-4 border"
                style={{
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, var(--success-lighter), white)",
                  borderColor: "var(--success-light)",
                }}
              >
                <p
                  className="text-2xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "var(--success-dark)" }}
                >
                  Why this earned marks
                </p>
                <p className="text-base2 text-n-5 leading-relaxed">
                  {(activeFeedback?.data as MarkEarned)?.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="p-4 border"
                  style={{
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, var(--error-lighter), white)",
                    borderColor: "var(--error-light)",
                  }}
                >
                  <p
                    className="text-2xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--error-base)" }}
                  >
                    Issue
                  </p>
                  <p className="text-base2 text-n-5 leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.issue}
                  </p>
                </div>
                <div
                  className="p-4 border"
                  style={{
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, var(--away-lighter), white)",
                    borderColor: "var(--away-light)",
                  }}
                >
                  <p
                    className="text-2xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                    style={{ color: "var(--away-base)" }}
                  >
                    <Lightbulb className="w-3 h-3" />
                    How to Fix
                  </p>
                  <p className="text-base2 text-n-5 leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.howToFix}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-caption1 text-n-4 pt-2">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-2 border"
            style={{
              borderRadius: "2rem",
              background: "var(--success-lighter)",
              borderColor: "var(--success-light)",
            }}
          />
          <span>Marks Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-2 border"
            style={{
              borderRadius: "2rem",
              background: "var(--error-lighter)",
              borderColor: "var(--error-light)",
            }}
          />
          <span>Issues (click for details)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
