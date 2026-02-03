"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Lightbulb, Eye, EyeOff } from "lucide-react";
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

// AO Badge Component
function AOBadge({ ao }: { ao: string }) {
  const badges: Record<string, string> = {
    ao1: "badge-ao1",
    ao2: "badge-ao2",
    ao3: "badge-ao3",
    ao4: "badge-ao4",
  };
  return <span className={badges[ao] || "badge-info"}>{ao.toUpperCase()}</span>;
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

    highlights.sort((a, b) => a.start - b.start);

    const nonOverlapping: typeof highlights = [];
    let lastEnd = 0;
    for (const h of highlights) {
      if (h.start >= lastEnd) {
        nonOverlapping.push(h);
        lastEnd = h.end;
      }
    }

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

  const lostCount = marksLost.length;
  const totalEarnedPoints = marksEarned.reduce((sum, m) => sum + m.points, 0);

  return (
    <div className={cn("relative space-y-6", className)} ref={containerRef}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl card-inset">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-caption mr-2">View</span>
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200",
              viewMode === "all"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={viewMode === "all" ? { boxShadow: "var(--shadow-sm)" } : {}}
          >
            All
          </button>
          <button
            onClick={() => setViewMode("earned")}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5",
              viewMode === "earned"
                ? "bg-card"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={viewMode === "earned" ? { boxShadow: "var(--shadow-sm)", color: "hsl(var(--success))" } : {}}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            +{totalEarnedPoints}
          </button>
          <button
            onClick={() => setViewMode("lost")}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-1.5",
              viewMode === "lost"
                ? "bg-card"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={viewMode === "lost" ? { boxShadow: "var(--shadow-sm)", color: "hsl(var(--error))" } : {}}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {lostCount} Issues
          </button>
        </div>

        {onToggleDetailedFeedback && (
          <div className="flex items-center gap-3">
            {showDetailedFeedback ? (
              <Eye className="w-4 h-4 text-foreground" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground">Details</span>
            <Switch
              checked={showDetailedFeedback}
              onCheckedChange={onToggleDetailedFeedback}
            />
          </div>
        )}
      </div>

      {/* Essay Content */}
      <div className="card-inset p-6 rounded-2xl">
        <p className="text-[15px] leading-[1.9] text-foreground/90 whitespace-pre-wrap">
          {visibleSegments.map((segment, index) => {
            if (segment.type === "normal") {
              return <span key={index}>{segment.text}</span>;
            }

            return (
              <span
                key={index}
                onClick={() =>
                  segment.data &&
                  handleHighlightClick(segment.type as "earned" | "lost", segment.data)
                }
                className={cn(
                  "highlight-earned",
                  segment.type === "lost" && "highlight-lost"
                )}
              >
                {segment.text}
                {segment.type === "lost" && !showDetailedFeedback && (
                  <span
                    className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full align-middle"
                    style={{
                      backgroundColor: "hsl(var(--error))",
                      color: "white",
                      boxShadow: "var(--shadow-xs)"
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

      {/* Detailed Feedback Panel */}
      {showDetailedFeedback && (
        <div className="space-y-6">
          {/* Lost Marks Section */}
          {marksLost.length > 0 && (
            <div className="card-premium rounded-2xl overflow-hidden" style={{ borderColor: "hsl(var(--error) / 0.2)" }}>
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "hsl(var(--error))", animation: "pulse-soft 2s infinite" }}
                  />
                  <span className="text-sm font-semibold" style={{ color: "hsl(var(--error))" }}>
                    Issues Found ({marksLost.length})
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {marksLost.map((item, idx) => {
                  const itemId = `lost-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible key={idx} open={isExpanded} onOpenChange={() => toggleExpanded(itemId)}>
                      <div className="card-inset rounded-xl overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-accent/50 transition-colors">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: "hsl(var(--error))" }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--error))" }} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span className="badge-error text-[10px]">Issue</span>
                              </div>
                              <p className="text-sm text-muted-foreground italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/30">
                            <div className="pt-3 p-4 rounded-xl" style={{ background: "hsl(var(--error-muted))" }}>
                              <p className="text-caption mb-2" style={{ color: "hsl(var(--error))" }}>Issue</p>
                              <p className="text-sm leading-relaxed">{item.issue}</p>
                            </div>
                            <div className="p-4 rounded-xl" style={{ background: "hsl(var(--warning-muted))" }}>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Lightbulb className="w-3 h-3" style={{ color: "hsl(var(--warning))" }} />
                                <p className="text-caption" style={{ color: "hsl(var(--warning))" }}>How to Fix</p>
                              </div>
                              <p className="text-sm leading-relaxed">{item.howToFix}</p>
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
            <div className="card-premium rounded-2xl overflow-hidden" style={{ borderColor: "hsl(var(--success) / 0.2)" }}>
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
                  <span className="text-sm font-semibold" style={{ color: "hsl(var(--success))" }}>
                    Marks Earned (+{totalEarnedPoints})
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {marksEarned.map((item, idx) => {
                  const itemId = `earned-${idx}`;
                  const isExpanded = expandedItems.has(itemId);
                  return (
                    <Collapsible key={idx} open={isExpanded} onOpenChange={() => toggleExpanded(itemId)}>
                      <div className="card-inset rounded-xl overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-accent/50 transition-colors">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AOBadge ao={item.ao} />
                                <span className="badge-success text-[10px] font-semibold">+{item.points}</span>
                              </div>
                              <p className="text-sm text-muted-foreground italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t border-border/30">
                            <div className="pt-3 p-4 rounded-xl" style={{ background: "hsl(var(--success-muted))" }}>
                              <p className="text-caption mb-2" style={{ color: "hsl(var(--success))" }}>Why This Earned Marks</p>
                              <p className="text-sm leading-relaxed">{item.reason}</p>
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
          className="sm:max-w-md rounded-2xl"
          style={{
            borderColor: activeFeedback?.type === "earned"
              ? "hsl(var(--success) / 0.3)"
              : "hsl(var(--error) / 0.3)"
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <AOBadge ao={activeFeedback?.data.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span className="flex items-center gap-1.5" style={{ color: "hsl(var(--success))" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  +{(activeFeedback?.data as MarkEarned)?.points} marks
                </span>
              ) : (
                <span className="flex items-center gap-1.5" style={{ color: "hsl(var(--error))" }}>
                  <AlertCircle className="w-4 h-4" />
                  Issue Found
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="card-inset p-4 rounded-xl">
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                &ldquo;{activeFeedback?.data.quote}&rdquo;
              </p>
            </div>

            {activeFeedback?.type === "earned" ? (
              <div className="p-4 rounded-xl" style={{ background: "hsl(var(--success-muted))" }}>
                <p className="text-caption mb-2" style={{ color: "hsl(var(--success))" }}>
                  Why this earned marks
                </p>
                <p className="text-sm leading-relaxed">
                  {(activeFeedback?.data as MarkEarned)?.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl" style={{ background: "hsl(var(--error-muted))" }}>
                  <p className="text-caption mb-2" style={{ color: "hsl(var(--error))" }}>
                    Issue
                  </p>
                  <p className="text-sm leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.issue}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "hsl(var(--warning-muted))" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3 h-3" style={{ color: "hsl(var(--warning))" }} />
                    <p className="text-caption" style={{ color: "hsl(var(--warning))" }}>
                      How to Fix
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {(activeFeedback?.data as MarkLost)?.howToFix}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded highlight-earned" />
          <span>Marks Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 rounded highlight-lost" />
          <span>Issues (click for details)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
