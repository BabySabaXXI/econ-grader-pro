"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, List, Lightbulb, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkEarned, MarkLost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// AO Config
const AO_CONFIG = {
  ao1: { label: "Knowledge", color: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  ao2: { label: "Application", color: "bg-emerald-500", bgLight: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  ao3: { label: "Analysis", color: "bg-violet-500", bgLight: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  ao4: { label: "Evaluation", color: "bg-amber-500", bgLight: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
};

// AO Badge Component
function AOBadge({ ao, className }: { ao: string; className?: string }) {
  const config = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5",
        config.text,
        config.bgLight,
        config.border,
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
    <div className={cn("relative space-y-5", className)} ref={containerRef}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mr-2">View:</span>
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
            className={cn(
              "h-8 text-xs rounded-lg",
              viewMode === "all" && "bg-neutral-900"
            )}
          >
            All
          </Button>
          <Button
            variant={viewMode === "earned" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("earned")}
            className={cn(
              "h-8 text-xs gap-1.5 rounded-lg",
              viewMode === "earned" && "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "earned" && "text-emerald-600")}>+{totalEarnedPoints}</span>
            <span className={cn("text-xs opacity-70")}>({earnedCount})</span>
          </Button>
          <Button
            variant={viewMode === "lost" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("lost")}
            className={cn(
              "h-8 text-xs gap-1.5 rounded-lg",
              viewMode === "lost" && "bg-red-600 hover:bg-red-700"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className={cn("font-semibold", viewMode !== "lost" && "text-red-600")}>Issues</span>
            <span className={cn("text-xs opacity-70")}>({lostCount})</span>
          </Button>
        </div>

        {onToggleDetailedFeedback && (
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            {showDetailedFeedback ? (
              <Eye className="w-4 h-4 text-neutral-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-neutral-400" />
            )}
            <span className="text-xs font-medium text-neutral-600">Details</span>
            <Switch
              checked={showDetailedFeedback}
              onCheckedChange={onToggleDetailedFeedback}
              className="data-[state=checked]:bg-neutral-900"
            />
          </div>
        )}
      </div>

      {/* Essay Content */}
      <Card className="border-neutral-200/60 overflow-hidden">
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
                    "relative inline cursor-pointer rounded-sm px-1 py-0.5 transition-all duration-200",
                    isEarned && "bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 border-b-2 border-emerald-500",
                    isLost && "bg-red-100/80 hover:bg-red-200/80 text-red-900 border-b-2 border-red-500"
                  )}
                >
                  {segment.text}
                  {isLost && !showDetailedFeedback && (
                    <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full align-middle shadow-sm">
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
        <div className="space-y-5">
          {/* Lost Marks Section */}
          {marksLost.length > 0 && (
            <Card className="border-red-200/60 bg-gradient-to-br from-red-50/50 to-white overflow-hidden">
              <CardHeader className="pb-3 border-b border-red-100">
                <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Issues Found ({marksLost.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {marksLost.map((item, idx) => {
                  const itemId = `lost-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <Card className="border-red-200/60 bg-white overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-red-50/50 transition-colors">
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
                                <Badge variant="destructive" className="text-[10px] font-medium">
                                  Issue
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
                            <div className="pt-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/30 border border-red-100">
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">
                                Issue
                              </p>
                              <p className="text-sm text-neutral-700 leading-relaxed">{item.issue}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200">
                              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Lightbulb className="w-3 h-3" />
                                How to Fix
                              </p>
                              <p className="text-sm text-neutral-700 leading-relaxed">{item.howToFix}</p>
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
            <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden">
              <CardHeader className="pb-3 border-b border-emerald-100">
                <CardTitle className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Marks Earned (+{totalEarnedPoints} from {marksEarned.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {marksEarned.map((item, idx) => {
                  const itemId = `earned-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible
                      key={idx}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(itemId)}
                    >
                      <Card className="border-emerald-200/60 bg-white overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-emerald-50/50 transition-colors">
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
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px] font-semibold">
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
                            <div className="pt-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                                Why This Earned Marks
                              </p>
                              <p className="text-sm text-neutral-700 leading-relaxed">{item.reason}</p>
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
          "sm:max-w-md rounded-2xl",
          activeFeedback?.type === "earned" ? "border-emerald-200" : "border-red-200"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AOBadge ao={activeFeedback?.data.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  +{(activeFeedback?.data as MarkEarned)?.points} marks
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Issue Found
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Quote */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-sm italic text-neutral-600 leading-relaxed">
                &ldquo;{activeFeedback?.data.quote}&rdquo;
              </p>
            </div>

            {/* Feedback content */}
            {activeFeedback?.type === "earned" ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  Why this earned marks
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {(activeFeedback?.data as MarkEarned)?.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/30 border border-red-200">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">
                    Issue
                  </p>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.issue}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 pt-2">
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
