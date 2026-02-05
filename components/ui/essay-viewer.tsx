"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Eye,
  EyeOff,
} from "lucide-react";
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

// Types
interface EssayViewerProps {
  essay: string;
  marksEarned: MarkEarned[];
  marksLost: MarkLost[];
  className?: string;
  showDetailedFeedback?: boolean;
  onToggleDetailedFeedback?: () => void;
}

interface HighlightSpan {
  start: number;
  end: number;
  type: "earned" | "lost";
  ao: string;
  points?: number;
  reason?: string;
  issue?: string;
  howToFix?: string;
}

interface ActiveFeedback {
  type: "earned" | "lost";
  span: HighlightSpan;
}

// AO Config
const AO_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  ao1: {
    label: "Knowledge",
    color: "var(--info-text)",
    bg: "var(--info-muted)",
    border: "var(--info-border)",
  },
  ao2: {
    label: "Application",
    color: "var(--success-text)",
    bg: "var(--success-muted)",
    border: "var(--success-border)",
  },
  ao3: {
    label: "Analysis",
    color: "var(--purple-text)",
    bg: "var(--purple-muted)",
    border: "var(--purple-border)",
  },
  ao4: {
    label: "Evaluation",
    color: "var(--warning-text)",
    bg: "var(--warning-muted)",
    border: "var(--warning-border)",
  },
};

function AOBadge({ ao }: { ao: string }) {
  const config = AO_CONFIG[ao];
  if (!config) return null;
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border"
      style={{
        borderRadius: "0.25rem",
        color: config.color,
        background: config.bg,
        borderColor: config.border,
      }}
    >
      {ao.toUpperCase()}
    </span>
  );
}

// Robust client-side fuzzy matching for highlights
function findHighlightSpans(
  essay: string,
  marksEarned: MarkEarned[],
  marksLost: MarkLost[]
): HighlightSpan[] {
  const spans: HighlightSpan[] = [];
  const essayLower = essay.toLowerCase();

  // Helper: find best match for a quote in the essay
  function findBestMatch(
    quote: string
  ): { start: number; end: number } | null {
    if (!quote || quote.length < 3) return null;

    const quoteLower = quote.toLowerCase().trim();

    // Try exact match first
    let idx = essayLower.indexOf(quoteLower);
    if (idx !== -1) {
      return { start: idx, end: idx + quoteLower.length };
    }

    // Try with cleaned whitespace (normalize spaces)
    const cleanQuote = quoteLower.replace(/\s+/g, " ");
    const cleanEssay = essayLower.replace(/\s+/g, " ");
    idx = cleanEssay.indexOf(cleanQuote);
    if (idx !== -1) {
      // Map back to original positions
      let originalIdx = 0;
      let cleanIdx = 0;
      while (cleanIdx < idx && originalIdx < essay.length) {
        if (/\s/.test(essay[originalIdx])) {
          while (
            originalIdx < essay.length - 1 &&
            /\s/.test(essay[originalIdx + 1])
          ) {
            originalIdx++;
          }
        }
        originalIdx++;
        cleanIdx++;
      }
      const start = originalIdx;
      // Find end
      let matchLen = 0;
      let endIdx = start;
      while (matchLen < cleanQuote.length && endIdx < essay.length) {
        endIdx++;
        if (!(/\s/.test(essay[endIdx - 1]) && /\s/.test(essay[endIdx] || ""))) {
          matchLen++;
        }
      }
      return { start, end: Math.min(endIdx, essay.length) };
    }

    // Try truncated match — use first 60% of the quote
    if (quoteLower.length > 20) {
      const truncated = quoteLower.slice(
        0,
        Math.floor(quoteLower.length * 0.6)
      );
      idx = essayLower.indexOf(truncated);
      if (idx !== -1) {
        // Try to extend the match to the full quote length
        const end = Math.min(idx + quoteLower.length, essay.length);
        return { start: idx, end };
      }
    }

    // Try matching by first significant words (at least 3 words)
    const words = quoteLower.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 3) {
      const searchPhrase = words.slice(0, 4).join(" ");
      idx = essayLower.indexOf(searchPhrase);
      if (idx === -1) {
        // Try just first 3 words
        const shorter = words.slice(0, 3).join(" ");
        idx = essayLower.indexOf(shorter);
      }
      if (idx !== -1) {
        // Extend to approximate original length
        const end = Math.min(idx + Math.max(quoteLower.length, 20), essay.length);
        return { start: idx, end };
      }
    }

    return null;
  }

  // Find positions for earned marks
  for (const mark of marksEarned) {
    const match = findBestMatch(mark.quote);
    if (match) {
      spans.push({
        start: match.start,
        end: match.end,
        type: "earned",
        ao: mark.ao,
        points: mark.points,
        reason: mark.reason,
      });
    }
  }

  // Find positions for lost marks
  for (const mark of marksLost) {
    const match = findBestMatch(mark.quote);
    if (match) {
      spans.push({
        start: match.start,
        end: match.end,
        type: "lost",
        ao: mark.ao,
        issue: mark.issue,
        howToFix: mark.howToFix,
      });
    }
  }

  // Sort by start position and remove overlaps
  spans.sort((a, b) => a.start - b.start);
  const nonOverlapping: HighlightSpan[] = [];
  let lastEnd = 0;
  for (const span of spans) {
    if (span.start >= lastEnd) {
      nonOverlapping.push(span);
      lastEnd = span.end;
    }
  }

  return nonOverlapping;
}

export function EssayViewer({
  essay,
  marksEarned,
  marksLost,
  className,
  showDetailedFeedback = false,
  onToggleDetailedFeedback,
}: EssayViewerProps) {
  const [activeFeedback, setActiveFeedback] = useState<ActiveFeedback | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"all" | "earned" | "lost">("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [apiSpans, setApiSpans] = useState<HighlightSpan[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Try API-based highlight matching, fall back to client-side
  useEffect(() => {
    if (marksEarned.length === 0 && marksLost.length === 0) return;

    const controller = new AbortController();
    fetch("/api/highlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essay, marksEarned, marksLost }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.highlights && data.highlights.length > 0 && !data.fallback) {
          setApiSpans(data.highlights);
        }
      })
      .catch(() => {
        // silently fall back to client-side
      });

    return () => controller.abort();
  }, [essay, marksEarned, marksLost]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Use API spans if available, otherwise client-side matching
  const highlightSpans = useMemo(() => {
    if (apiSpans && apiSpans.length > 0) return apiSpans;
    return findHighlightSpans(essay, marksEarned, marksLost);
  }, [essay, marksEarned, marksLost, apiSpans]);

  // Filter based on view mode
  const visibleSpans = useMemo(() => {
    if (viewMode === "all") return highlightSpans;
    return highlightSpans.filter((s) => s.type === viewMode);
  }, [highlightSpans, viewMode]);

  // Build rendered segments from spans
  const renderedSegments = useMemo(() => {
    const segments: Array<{
      text: string;
      span?: HighlightSpan;
    }> = [];

    let pos = 0;
    for (const span of visibleSpans) {
      if (span.start > pos) {
        segments.push({ text: essay.slice(pos, span.start) });
      }
      segments.push({
        text: essay.slice(span.start, span.end),
        span,
      });
      pos = span.end;
    }
    if (pos < essay.length) {
      segments.push({ text: essay.slice(pos) });
    }

    return segments;
  }, [essay, visibleSpans]);

  const handleHighlightClick = useCallback(
    (span: HighlightSpan) => {
      setActiveFeedback({ type: span.type, span });
    },
    []
  );

  const earnedCount = marksEarned.length;
  const lostCount = marksLost.length;
  const totalEarnedPoints = marksEarned.reduce((sum, m) => sum + m.points, 0);

  return (
    <div className={cn("relative space-y-4", className)} ref={containerRef}>
      {/* Filter controls */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3"
        style={{
          borderRadius: "0.5rem",
          background: "var(--n-1)",
          border: "1px solid var(--n-3)",
        }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-n-4 uppercase tracking-wider mr-1.5">
            Show:
          </span>
          {(
            [
              { key: "all", label: "All" },
              {
                key: "earned",
                label: `+${totalEarnedPoints}`,
                count: earnedCount,
                activeColor: "var(--success-text)",
                activeBg: "var(--success)",
              },
              {
                key: "lost",
                label: "Issues",
                count: lostCount,
                activeColor: "var(--error-text)",
                activeBg: "var(--error)",
              },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setViewMode(filter.key)}
              className={cn(
                "h-7 px-2.5 text-[11px] font-medium transition-all rounded-md inline-flex items-center gap-1.5",
                viewMode === filter.key
                  ? "text-white"
                  : "text-n-5 hover:text-n-7 bg-white border border-n-3"
              )}
              style={
                viewMode === filter.key
                  ? {
                      background:
                        filter.key === "all"
                          ? "var(--n-7)"
                          : (filter as { activeBg?: string }).activeBg,
                    }
                  : undefined
              }
            >
              {filter.key === "earned" && (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {filter.key === "lost" && <AlertCircle className="w-3 h-3" />}
              <span className="font-semibold">{filter.label}</span>
              {"count" in filter && (
                <span className="opacity-60">({filter.count})</span>
              )}
            </button>
          ))}
        </div>

        {onToggleDetailedFeedback && (
          <div className="flex items-center gap-2">
            {showDetailedFeedback ? (
              <Eye className="w-3.5 h-3.5 text-n-5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-n-4" />
            )}
            <span className="text-[11px] font-medium text-n-5">Details</span>
            <Switch
              checked={showDetailedFeedback}
              onCheckedChange={onToggleDetailedFeedback}
              className="data-[state=checked]:bg-[var(--primary-1)]"
            />
          </div>
        )}
      </div>

      {/* Essay content with highlights */}
      <div
        className="card-surface overflow-hidden"
        style={{ borderRadius: "0.5rem" }}
      >
        <div className="p-5">
          <p className="text-[14px] leading-[1.85] text-n-6 whitespace-pre-wrap">
            {renderedSegments.map((segment, index) => {
              if (!segment.span) {
                return <span key={index}>{segment.text}</span>;
              }

              const isEarned = segment.span.type === "earned";
              const isLost = segment.span.type === "lost";

              return (
                <span
                  key={index}
                  onClick={() => segment.span && handleHighlightClick(segment.span)}
                  className={cn(
                    "relative inline cursor-pointer",
                    isEarned && "highlight-earned",
                    isLost && "highlight-lost"
                  )}
                >
                  {segment.text}
                  {isLost && !showDetailedFeedback && (
                    <span
                      className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] font-bold text-white rounded-full align-middle"
                      style={{
                        background: "var(--error)",
                        boxShadow: "0 1px 2px rgba(239, 68, 68, 0.3)",
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

      {/* Detailed feedback panels */}
      {showDetailedFeedback && (
        <div className="space-y-4">
          {/* Lost marks */}
          {marksLost.length > 0 && (
            <div
              className="overflow-hidden"
              style={{
                borderRadius: "0.5rem",
                border: "1px solid var(--error-border)",
                background: "white",
              }}
            >
              <div
                className="px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--error-border)",
                  background: "var(--error-muted)",
                }}
              >
                <h3
                  className="text-[13px] font-semibold flex items-center gap-2"
                  style={{ color: "var(--error-text)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Issues Found ({marksLost.length})
                </h3>
              </div>
              <div className="p-3 space-y-2">
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
                        className="overflow-hidden"
                        style={{
                          borderRadius: "0.375rem",
                          border: "1px solid var(--n-3)",
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-3 text-left flex items-start gap-2.5 transition-colors hover:bg-n-1">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown
                                  className="w-3.5 h-3.5"
                                  style={{ color: "var(--error-text)" }}
                                />
                              ) : (
                                <ChevronRight
                                  className="w-3.5 h-3.5"
                                  style={{ color: "var(--error-text)" }}
                                />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <AOBadge ao={item.ao} />
                              </div>
                              <p className="text-[13px] text-n-5 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div
                            className="px-3 pb-3 space-y-2"
                            style={{
                              borderTop: "1px solid var(--n-3)",
                            }}
                          >
                            <div
                              className="pt-2.5 p-3"
                              style={{
                                borderRadius: "0.375rem",
                                background: "var(--error-muted)",
                              }}
                            >
                              <p
                                className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: "var(--error-text)" }}
                              >
                                Issue
                              </p>
                              <p className="text-[13px] text-n-5 leading-relaxed">
                                {item.issue}
                              </p>
                            </div>
                            <div
                              className="p-3"
                              style={{
                                borderRadius: "0.375rem",
                                background: "var(--warning-muted)",
                              }}
                            >
                              <p
                                className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                                style={{ color: "var(--warning-text)" }}
                              >
                                <Lightbulb className="w-3 h-3" />
                                How to Fix
                              </p>
                              <p className="text-[13px] text-n-5 leading-relaxed">
                                {item.howToFix}
                              </p>
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

          {/* Earned marks */}
          {marksEarned.length > 0 && (
            <div
              className="overflow-hidden"
              style={{
                borderRadius: "0.5rem",
                border: "1px solid var(--success-border)",
                background: "white",
              }}
            >
              <div
                className="px-4 py-3"
                style={{
                  borderBottom: "1px solid var(--success-border)",
                  background: "var(--success-muted)",
                }}
              >
                <h3
                  className="text-[13px] font-semibold flex items-center gap-2"
                  style={{ color: "var(--success-text)" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Marks Earned (+{totalEarnedPoints} from {marksEarned.length}{" "}
                  items)
                </h3>
              </div>
              <div className="p-3 space-y-2">
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
                        className="overflow-hidden"
                        style={{
                          borderRadius: "0.375rem",
                          border: "1px solid var(--n-3)",
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-3 text-left flex items-start gap-2.5 transition-colors hover:bg-n-1">
                            <span className="flex-shrink-0 mt-0.5">
                              {isExpanded ? (
                                <ChevronDown
                                  className="w-3.5 h-3.5"
                                  style={{ color: "var(--success-text)" }}
                                />
                              ) : (
                                <ChevronRight
                                  className="w-3.5 h-3.5"
                                  style={{ color: "var(--success-text)" }}
                                />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <AOBadge ao={item.ao} />
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5"
                                  style={{
                                    borderRadius: "0.25rem",
                                    background: "var(--success-muted)",
                                    color: "var(--success-text)",
                                  }}
                                >
                                  +{item.points}
                                </span>
                              </div>
                              <p className="text-[13px] text-n-5 italic line-clamp-2">
                                &ldquo;{item.quote}&rdquo;
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div
                            className="px-3 pb-3"
                            style={{
                              borderTop: "1px solid var(--n-3)",
                            }}
                          >
                            <div
                              className="pt-2.5 p-3"
                              style={{
                                borderRadius: "0.375rem",
                                background: "var(--success-muted)",
                              }}
                            >
                              <p
                                className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: "var(--success-text)" }}
                              >
                                Why This Earned Marks
                              </p>
                              <p className="text-[13px] text-n-5 leading-relaxed">
                                {item.reason}
                              </p>
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

      {/* Click feedback modal */}
      <Dialog
        open={!!activeFeedback}
        onOpenChange={() => setActiveFeedback(null)}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            borderRadius: "0.75rem",
            border: `1px solid ${activeFeedback?.type === "earned" ? "var(--success-border)" : "var(--error-border)"}`,
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AOBadge ao={activeFeedback?.span.ao || ""} />
              {activeFeedback?.type === "earned" ? (
                <span
                  className="font-semibold flex items-center gap-1.5 text-[13px]"
                  style={{ color: "var(--success-text)" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />+
                  {activeFeedback?.span.points} marks
                </span>
              ) : (
                <span
                  className="font-semibold flex items-center gap-1.5 text-[13px]"
                  style={{ color: "var(--error-text)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Issue Found
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {/* Quote */}
            <div
              className="p-3"
              style={{
                borderRadius: "0.375rem",
                background: "var(--n-1)",
                border: "1px solid var(--n-3)",
              }}
            >
              <p className="text-[13px] italic text-n-5 leading-relaxed">
                &ldquo;
                {activeFeedback?.span
                  ? essay.slice(
                      activeFeedback.span.start,
                      activeFeedback.span.end
                    )
                  : ""}
                &rdquo;
              </p>
            </div>

            {/* Details */}
            {activeFeedback?.type === "earned" ? (
              <div
                className="p-3"
                style={{
                  borderRadius: "0.375rem",
                  background: "var(--success-muted)",
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--success-text)" }}
                >
                  Why this earned marks
                </p>
                <p className="text-[13px] text-n-5 leading-relaxed">
                  {activeFeedback.span.reason}
                </p>
              </div>
            ) : activeFeedback?.type === "lost" ? (
              <div className="space-y-2">
                <div
                  className="p-3"
                  style={{
                    borderRadius: "0.375rem",
                    background: "var(--error-muted)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--error-text)" }}
                  >
                    Issue
                  </p>
                  <p className="text-[13px] text-n-5 leading-relaxed">
                    {activeFeedback.span.issue}
                  </p>
                </div>
                <div
                  className="p-3"
                  style={{
                    borderRadius: "0.375rem",
                    background: "var(--warning-muted)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                    style={{ color: "var(--warning-text)" }}
                  >
                    <Lightbulb className="w-3 h-3" />
                    How to Fix
                  </p>
                  <p className="text-[13px] text-n-5 leading-relaxed">
                    {activeFeedback.span.howToFix}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 text-[11px] text-n-4 pt-1">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-1.5"
            style={{
              borderRadius: "1px",
              background: "rgba(34, 197, 94, 0.4)",
            }}
          />
          <span>Marks Earned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-1.5"
            style={{
              borderRadius: "1px",
              background: "rgba(239, 68, 68, 0.4)",
            }}
          />
          <span>Issues (click for details)</span>
        </div>
      </div>
    </div>
  );
}

export default EssayViewer;
