"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, List, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkEarned, MarkLost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// AO Badge Component
function AOBadge({ ao, className }: { ao: string; className?: string }) {
  const colors: Record<string, string> = {
    ao1: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    ao2: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    ao3: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
    ao4: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wide",
        colors[ao] || "bg-neutral-50 text-neutral-700 border-neutral-200",
        className
      )}
    >
      {ao.toUpperCase()}
    </Badge>
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
    <div className={cn("relative space-y-4", className)} ref={containerRef}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-neutral-50/80 rounded-xl border border-neutral-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-neutral-500 mr-1">View:</span>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className="h-8 text-xs"
          >
            All
          </Button>
          <Button
            variant={viewMode === "earned" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("earned")}
            className={cn(
              "h-8 text-xs gap-1.5",
              viewMode === "earned" && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "earned" && "text-emerald-600")}>+{totalEarnedPoints}</span>
            <span className={cn(viewMode !== "earned" && "text-neutral-500")}>({earnedCount})</span>
          </Button>
          <Button
            variant={viewMode === "lost" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("lost")}
            className={cn(
              "h-8 text-xs gap-1.5",
              viewMode === "lost" && "bg-red-600 hover:bg-red-700"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "lost" && "text-red-600")}>Issues</span>
            <span className={cn(viewMode !== "lost" && "text-neutral-500")}>({lostCount})</span>
          </Button>
        </div>

        {onToggleDetailedFeedback && (
          <Button
            variant={showDetailedFeedback ? "default" : "outline"}
            size="sm"
            onClick={onToggleDetailedFeedback}
            className={cn(
              "h-8 text-xs gap-2",
              showDetailedFeedback && "bg-neutral-900"
            )}
          >
            <List className="w-3.5 h-3.5" />
            {showDetailedFeedback ? "Hide" : "Show"} Details
          </Button>
        )}
      </div>

      {/* Essay Content */}
      <Card className="border-neutral-200/60">
        <CardContent className="p-6">
          <p className="text-[15px] leading-[1.9] text-neutral-700 whitespace-pre-wrap font-[system-ui]">
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
                    "relative inline cursor-pointer rounded px-0.5 py-0.5 transition-all duration-200",
                    isEarned && "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-b-2 border-emerald-500",
                    isLost && "bg-red-100 hover:bg-red-200 text-red-900 border-b-2 border-red-500"
                  )}
                >
                  {segment.text}
                  {isLost && !showDetailedFeedback && (
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full align-middle">
                      !
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        </CardContent>
      </Card>

      {/* Detailed Feedback Panel */}
      {showDetailedFeedback && (
        <div className="space-y-4">
          {/* Lost Marks Section */}
          {marksLost.length > 0 && (
            <Card className="border-red-200/60 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Issues Found ({marksLost.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {marksLost.map((item, idx) => {
                  const itemId = `lost-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <Card className="border-red-200/60 bg-white">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-red-50/50 transition-colors rounded-lg">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-red-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-red-500" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <Badge variant="destructive" className="text-[10px]">
                                  Mark Lost
                                </Badge>
                              </div>
                              <p className="text-sm text-neutral-600 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-red-100">
                            <div className="pt-3 p-3 rounded-lg bg-red-50 border border-red-100">
                              <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">
                                Issue
                              </p>
                              <p className="text-sm text-neutral-700">{item.issue}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                How to Fix
                              </p>
                              <p className="text-sm text-neutral-700">{item.howToFix}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Earned Marks Section */}
          {marksEarned.length > 0 && (
            <Card className="border-emerald-200/60 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marks Earned (+{totalEarnedPoints} from {marksEarned.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {marksEarned.map((item, idx) => {
                  const itemId = `earned-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <Card className="border-emerald-200/60 bg-white">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-emerald-50/50 transition-colors rounded-lg">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-emerald-500" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px]">
                                  +{item.points}
                                </Badge>
                              </div>
                              <p className="text-sm text-neutral-600 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t border-emerald-100">
                            <div className="pt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                                Why This Earned Marks
                              </p>
                              <p className="text-sm text-neutral-700">{item.reason}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <Dialog open={!!activeFeedback} onOpenChange={() => setActiveFeedback(null)}>
        <DialogContent className={cn(
          "sm:max-w-md",
          activeFeedback?.type === "earned" ? "border-emerald-200" : "border-red-200"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AOBadge ao={activeFeedback?.data.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span className="text-emerald-600 font-semibold">
                  +{(activeFeedback?.data as MarkEarned)?.points} marks
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Mark Lost
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quote */}
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-sm italic text-neutral-600 leading-relaxed">
                &ldquo;{activeFeedback?.data.quote}&rdquo;
              </p>
            </div>

            {/* Feedback content */}
            {activeFeedback?.type === "earned" ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  Why this earned marks
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {(activeFeedback?.data as MarkEarned)?.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">
                    Issue
                  </p>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.issue}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    How to Fix
                  </p>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.howToFix}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded bg-emerald-200 border border-emerald-400" />
          <span>Marks Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded bg-red-200 border border-red-400" />
          <span>Issues (click for details)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
