"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Check,
  ArrowRight,
  Sparkles,
  Eye,
  List,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import {
  QUESTION_TYPE_OPTIONS,
  MARK_SCHEMES,
  LEVEL_DESCRIPTORS,
} from "@/lib/constants";
import {
  GradingResult,
  PlanResult,
  QuestionType,
  MarkEarned,
  MarkLost,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/button";
import { AnimatedPillTabs } from "@/components/ui/tabs";
import { AnimatedCard, Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CircularProgress, LinearProgress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { GradingLoader } from "@/components/ui/grading-loader";
import { EssayViewer } from "@/components/ui/essay-viewer";

// ============================================================================
// VIEW STATES TYPE
// ============================================================================

type ViewState = "input" | "loading" | "results";

// ============================================================================
// SCORE COLOR HELPER
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "hsl(142 40% 40%)"; // emerald
  if (percentage >= 60) return "hsl(200 50% 50%)"; // sky
  if (percentage >= 45) return "hsl(38 70% 50%)";  // amber
  return "hsl(0 60% 50%)";                          // rose
}

// ============================================================================
// BACK BUTTON COMPONENT
// ============================================================================

function BackButton({ onClick, label = "Edit Answer" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
      <span className="text-sm font-medium text-stone-600">{label}</span>
    </motion.button>
  );
}

// ============================================================================
// LEVEL BADGE COMPONENT
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const labels: Record<number, string> = {
    5: "Excellent",
    4: "Good",
    3: "Sound",
    2: "Basic",
    1: "Limited",
  };

  const badgeClass = `badge-level-${level}`;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
      badgeClass
    )}>
      Level {level} · {labels[level] || "Unknown"}
    </span>
  );
}

// ============================================================================
// AO SCORE BAR COMPONENT
// ============================================================================

function AOScoreBar({
  label,
  aoKey,
  score,
  maxScore,
  delay = 0,
}: {
  label: string;
  aoKey: string;
  score: number;
  maxScore: number;
  delay?: number;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 py-3"
    >
      <span className="w-10 text-xs font-semibold text-stone-500">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", `ao-bar-${aoKey}`)}
        />
      </div>
      <span className="w-14 text-right text-sm font-semibold text-stone-700">
        {score}/{maxScore}
      </span>
    </motion.div>
  );
}

// ============================================================================
// FEEDBACK ITEM COMPONENT
// ============================================================================

function FeedbackItem({
  text,
  type,
  delay = 0,
}: {
  text: string;
  type: "strength" | "improvement";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "flex gap-3 p-4 rounded-xl",
        type === "strength" ? "feedback-strength" : "feedback-improvement"
      )}
    >
      <span className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
        type === "strength" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
      )}>
        {type === "strength" ? (
          <Check className="w-3 h-3" />
        ) : (
          <ArrowRight className="w-3 h-3" />
        )}
      </span>
      <span className="text-sm text-stone-700 leading-relaxed">{text}</span>
    </motion.div>
  );
}

// ============================================================================
// AO BADGE COMPONENT
// ============================================================================

function AOBadge({ ao, size = "sm" }: { ao: string; size?: "sm" | "md" }) {
  const colors: Record<string, string> = {
    ao1: "bg-sky-100 text-sky-700 border-sky-200",
    ao2: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ao3: "bg-violet-100 text-violet-700 border-violet-200",
    ao4: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center font-semibold uppercase tracking-wider border rounded-md",
      colors[ao] || "bg-stone-100 text-stone-700 border-stone-200",
      size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
    )}>
      {ao.toUpperCase()}
    </span>
  );
}

// ============================================================================
// MARK EARNED ITEM COMPONENT
// ============================================================================

function MarkEarnedItem({
  item,
  delay = 0,
}: {
  item: MarkEarned;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative p-5 rounded-xl bg-white border-l-4 border-emerald-400 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <AOBadge ao={item.ao} />
        <span className="text-sm font-semibold text-emerald-600">+{item.points}</span>
      </div>
      <p className="text-base italic text-stone-700 leading-relaxed mb-3">
        &ldquo;{item.quote}&rdquo;
      </p>
      <p className="text-sm text-stone-500">{item.reason}</p>
    </motion.div>
  );
}

// ============================================================================
// MARK LOST ITEM COMPONENT
// ============================================================================

function MarkLostItem({
  item,
  delay = 0,
}: {
  item: MarkLost;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative p-5 rounded-xl bg-white border-l-4 border-rose-400 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-3">
        <AOBadge ao={item.ao} />
      </div>
      <p className="text-base italic text-stone-700 leading-relaxed mb-2">
        &ldquo;{item.quote}&rdquo;
      </p>
      <p className="text-sm text-stone-500 mb-4">{item.issue}</p>
      <div className="p-4 rounded-lg bg-stone-50 border-l-2 border-stone-300">
        <p className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 mb-1">How to fix</p>
        <p className="text-sm text-stone-600">{item.howToFix}</p>
      </div>
    </motion.div>
  );
}

// ============================================================================
// GRADING RESULT DISPLAY - FULL PAGE VERSION
// ============================================================================

function GradingResultDisplay({
  result,
  questionType,
  essayText,
  onBack,
}: {
  result: GradingResult;
  questionType: QuestionType;
  essayText: string;
  onBack: () => void;
}) {
  const [viewMode, setViewMode] = useState<"essay" | "feedback">("essay");
  const markScheme = MARK_SCHEMES[questionType];
  const hasHighlights = (result.marksEarned?.length || 0) > 0 || (result.marksLost?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto"
    >
      <BackButton onClick={onBack} label="Edit Answer" />

      {/* Overall Score Card - Prominent */}
      <AnimatedCard delay={0} className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <CircularProgress
              value={result.overallPercentage}
              size={140}
              strokeWidth={8}
              color={getScoreColor(result.overallPercentage)}
            >
              <span className="text-3xl font-light text-stone-800">
                {result.overallPercentage}%
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
                Overall
              </span>
            </CircularProgress>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-light text-stone-800 mb-4">
                {result.totalMarks} <span className="text-stone-400 text-xl">/ {markScheme.total}</span>
              </h3>
              <LevelBadge level={result.levelAchieved} />
              <p className="text-sm text-stone-500 mt-4 leading-relaxed max-w-md">
                {LEVEL_DESCRIPTORS[result.levelAchieved]}
              </p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* AO Breakdown - Always Visible */}
      <AnimatedCard delay={0.1} className="mb-8">
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-5">Assessment Objectives Breakdown</h4>
          <div className="space-y-1">
            {markScheme.ao1 > 0 && (
              <AOScoreBar label="AO1" aoKey="ao1" score={result.aoScores.ao1} maxScore={markScheme.ao1} delay={0.1} />
            )}
            {markScheme.ao2 > 0 && (
              <AOScoreBar label="AO2" aoKey="ao2" score={result.aoScores.ao2} maxScore={markScheme.ao2} delay={0.15} />
            )}
            {markScheme.ao3 > 0 && (
              <AOScoreBar label="AO3" aoKey="ao3" score={result.aoScores.ao3} maxScore={markScheme.ao3} delay={0.2} />
            )}
            {markScheme.ao4 > 0 && (
              <AOScoreBar label="AO4" aoKey="ao4" score={result.aoScores.ao4} maxScore={markScheme.ao4} delay={0.25} />
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-sky-50">
              <div className="text-xs font-semibold text-sky-700">AO1</div>
              <div className="text-[10px] text-sky-600">Knowledge</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <div className="text-xs font-semibold text-emerald-700">AO2</div>
              <div className="text-[10px] text-emerald-600">Application</div>
            </div>
            <div className="p-3 rounded-xl bg-violet-50">
              <div className="text-xs font-semibold text-violet-700">AO3</div>
              <div className="text-[10px] text-violet-600">Analysis</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <div className="text-xs font-semibold text-amber-700">AO4</div>
              <div className="text-[10px] text-amber-600">Evaluation</div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* View Mode Toggle */}
      {hasHighlights && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setViewMode("essay")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              viewMode === "essay"
                ? "bg-stone-800 text-white shadow-lg"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            <Eye className="w-4 h-4" />
            Essay View
          </button>
          <button
            onClick={() => setViewMode("feedback")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              viewMode === "feedback"
                ? "bg-stone-800 text-white shadow-lg"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            <List className="w-4 h-4" />
            Detailed Feedback
          </button>
        </div>
      )}

      {/* Essay View with Highlights */}
      <AnimatePresence mode="wait">
        {viewMode === "essay" && hasHighlights ? (
          <motion.div
            key="essay-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatedCard delay={0.05}>
              <CardContent className="p-6">
                <h4 className="text-sm font-medium text-stone-700 mb-5">Your Essay with Feedback Highlights</h4>
                <EssayViewer
                  essay={essayText}
                  marksEarned={result.marksEarned || []}
                  marksLost={result.marksLost || []}
                />
              </CardContent>
            </AnimatedCard>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Feedback List View */}
      <AnimatePresence mode="wait">
        {(viewMode === "feedback" || !hasHighlights) && (
          <motion.div
            key="feedback-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Examiner Comment */}
            <AnimatedCard delay={0.15}>
              <CardContent className="p-6">
                <h4 className="text-sm font-medium text-stone-700 mb-4">Examiner&apos;s Comment</h4>
                <div className="relative p-5 rounded-xl bg-stone-50 border-l-2 border-stone-300">
                  <p className="text-sm text-stone-700 leading-relaxed italic">
                    &ldquo;{result.examinerComment}&rdquo;
                  </p>
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Where You Lost Marks */}
            {result.marksLost && result.marksLost.length > 0 && (
              <AnimatedCard delay={0.2}>
                <CardContent className="p-6">
                  <h4 className="text-sm font-medium text-rose-600 mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Where You Lost Marks
                  </h4>
                  <div className="space-y-4">
                    {result.marksLost.map((item, index) => (
                      <MarkLostItem key={index} item={item} delay={index * 0.08} />
                    ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Where You Earned Marks */}
            {result.marksEarned && result.marksEarned.length > 0 && (
              <AnimatedCard delay={0.25}>
                <CardContent className="p-6">
                  <h4 className="text-sm font-medium text-emerald-600 mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Where You Earned Marks
                  </h4>
                  <div className="space-y-4">
                    {result.marksEarned.map((item, index) => (
                      <MarkEarnedItem key={index} item={item} delay={index * 0.08} />
                    ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Strengths */}
            <AnimatedCard delay={0.3}>
              <CardContent className="p-6">
                <h4 className="text-sm font-medium text-emerald-700 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  Strengths
                </h4>
                <div className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <FeedbackItem
                      key={index}
                      text={strength}
                      type="strength"
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Areas for Improvement */}
            <AnimatedCard delay={0.35}>
              <CardContent className="p-6">
                <h4 className="text-sm font-medium text-amber-700 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </span>
                  Areas for Improvement
                </h4>
                <div className="space-y-3">
                  {result.improvements.map((improvement, index) => (
                    <FeedbackItem
                      key={index}
                      text={improvement}
                      type="improvement"
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// CHAIN OF REASONING COMPONENT
// ============================================================================

function ChainOfReasoning({ steps }: { steps: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
      <p className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 mb-3">
        Chain of Reasoning
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md text-stone-700">
              {step}
            </span>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION NUMBER COMPONENT
// ============================================================================

function SectionNumber({ number }: { number: number }) {
  const circledNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
  return (
    <span className="text-2xl text-stone-300 font-light">
      {circledNumbers[number - 1] || number}
    </span>
  );
}

// ============================================================================
// TIP CHIP COMPONENT
// ============================================================================

function TipChip({ text, variant = "default" }: { text: string; variant?: "default" | "warning" | "success" }) {
  const colors = {
    default: "bg-stone-100 text-stone-600 border-stone-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 text-[11px] rounded-full border", colors[variant])}>
      {text}
    </span>
  );
}

// ============================================================================
// COMPACT CHAIN COMPONENT (for skeleton mode)
// ============================================================================

function CompactChain({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
      {steps.slice(0, 5).map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600">{step}</span>
          {i < Math.min(steps.length - 1, 4) && <span className="text-stone-300">→</span>}
        </span>
      ))}
      {steps.length > 5 && <span className="text-stone-400">...</span>}
    </div>
  );
}

// ============================================================================
// PLAN RESULT DISPLAY - FULL PAGE VERSION
// ============================================================================

function PlanResultDisplay({ result, onBack }: { result: PlanResult; onBack: () => void }) {
  const [planMode, setPlanMode] = useState<"skeleton" | "full">("skeleton");

  // Determine if first argument is FOR and second is AGAINST based on content
  const getArgumentLabel = (index: number, point: string) => {
    const lowerPoint = point.toLowerCase();
    if (index === 0 || lowerPoint.includes("for") || lowerPoint.includes("support") || lowerPoint.includes("benefit")) {
      return { label: "FOR", sublabel: point };
    }
    if (index === 1 || lowerPoint.includes("against") || lowerPoint.includes("counter") || lowerPoint.includes("however")) {
      return { label: "AGAINST", sublabel: point };
    }
    return { label: `Argument ${index + 1}`, sublabel: point };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto"
    >
      <BackButton onClick={onBack} label="Edit Question" />

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setPlanMode("skeleton")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            planMode === "skeleton"
              ? "bg-stone-800 text-white shadow-lg"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          )}
        >
          <List className="w-4 h-4" />
          Skeleton View
        </button>
        <button
          onClick={() => setPlanMode("full")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            planMode === "full"
              ? "bg-stone-800 text-white shadow-lg"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          )}
        >
          <FileText className="w-4 h-4" />
          Full Detail
        </button>
      </div>

      <div className="space-y-6">
        {/* Section 1: Introduction */}
        <AnimatedCard delay={0}>
          <CardContent className={cn("transition-all", planMode === "skeleton" ? "p-4" : "p-6")}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <SectionNumber number={1} />
                <h4 className={cn("font-medium text-stone-800", planMode === "skeleton" ? "text-base" : "text-lg")}>Introduction (Brief!)</h4>
              </div>
              <AOBadge ao="ao1" size={planMode === "skeleton" ? "sm" : "md"} />
            </div>

            {/* What to Write Box */}
            <div className={cn("rounded-lg bg-amber-50/50 border-l-4 border-amber-400", planMode === "skeleton" ? "p-3 mb-2" : "p-4 mb-4")}>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 mb-1">
                What to Write
              </p>
              <p className={cn("text-stone-700 leading-relaxed", planMode === "skeleton" ? "text-xs" : "text-sm")}>
                {result.introduction?.whatToWrite || result.thesis}
              </p>
            </div>

            {/* Tips - only in full mode */}
            {planMode === "full" && (
              <div className="flex flex-wrap gap-2">
                {result.introduction?.tips ? (
                  result.introduction.tips.map((tip, i) => (
                    <TipChip key={i} text={tip} />
                  ))
                ) : (
                  <>
                    <TipChip text="Maximum 2-3 sentences" />
                    <TipChip text="Don't waste marks allocation here" />
                    <TipChip text="Signal you understand it's a debate" />
                  </>
                )}
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Section 2+: Arguments with Integrated Evaluation */}
        {result.arguments.map((arg, index) => {
          const { label } = getArgumentLabel(index, arg.point);
          const isFor = label === "FOR";
          const sectionNum = index + 2;

          return (
            <AnimatedCard key={index} delay={0.1 + index * 0.1}>
              <CardContent className={cn("transition-all", planMode === "skeleton" ? "p-4" : "p-6")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <SectionNumber number={sectionNum} />
                    <div>
                      <h4 className={cn("font-medium text-stone-800", planMode === "skeleton" ? "text-base" : "text-lg")}>
                        Argument {label} {planMode === "full" && "+ Integrated Evaluation"}
                      </h4>
                      <p className={cn("text-stone-500 mt-0.5", planMode === "skeleton" ? "text-xs" : "text-sm")}>
                        {arg.point}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <AOBadge ao="ao1" size={planMode === "skeleton" ? "sm" : "md"} />
                    <AOBadge ao="ao2" size={planMode === "skeleton" ? "sm" : "md"} />
                    <AOBadge ao="ao3" size={planMode === "skeleton" ? "sm" : "md"} />
                    <AOBadge ao="ao4" size={planMode === "skeleton" ? "sm" : "md"} />
                  </div>
                </div>

                {/* Chain of Reasoning - Compact in skeleton, full in full mode */}
                {arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                  <div className={planMode === "skeleton" ? "mb-2" : "mb-4"}>
                    {planMode === "skeleton" ? (
                      <CompactChain steps={arg.chainOfReasoning} />
                    ) : (
                      <ChainOfReasoning steps={arg.chainOfReasoning} />
                    )}
                  </div>
                )}

                {/* What to Write Box - only in full mode */}
                {planMode === "full" && (
                  <div className="p-4 rounded-lg bg-amber-50/50 border-l-4 border-amber-400 mb-4">
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 mb-2">
                      What to Write
                    </p>
                    <p className="text-sm text-stone-700 leading-relaxed mb-3">
                      &ldquo;The main argument {isFor ? "supporting" : "against"} [proposition] is that {arg.point.toLowerCase()}. This leads to {arg.explanation}. Evidence from {arg.example} supports this view. As illustrated in the diagram, [explain diagram]. HOWEVER, the extent to which this holds depends on [condition]. This is significant because [explain why the condition matters].&rdquo;
                    </p>
                  </div>
                )}

                {/* Detail boxes - compact in skeleton */}
                <div className={cn("grid gap-3", planMode === "skeleton" ? "grid-cols-1" : "md:grid-cols-2", planMode === "full" && "mb-4")}>
                  <div className={cn("rounded-lg bg-sky-50 border border-sky-100", planMode === "skeleton" ? "p-2" : "p-3")}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-sky-600 mb-1">Theory</p>
                    <p className={cn("text-stone-600", planMode === "skeleton" ? "text-xs line-clamp-2" : "text-sm")}>{arg.explanation}</p>
                  </div>
                  <div className={cn("rounded-lg bg-emerald-50 border border-emerald-100", planMode === "skeleton" ? "p-2" : "p-3")}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-600 mb-1">Example</p>
                    <p className={cn("text-stone-600", planMode === "skeleton" ? "text-xs line-clamp-2" : "text-sm")}>{arg.example}</p>
                  </div>
                </div>

                {/* Tips - only in full mode */}
                {planMode === "full" && (
                  <div className="flex flex-wrap gap-2">
                    <TipChip text="Full analytical chain (4+ links)" />
                    <TipChip text="Diagram analysis" />
                    <TipChip text="IMMEDIATELY evaluate - don't wait until later" variant="warning" />
                    <TipChip text='The "however" is crucial for AO4' variant="warning" />
                  </div>
                )}
              </CardContent>
            </AnimatedCard>
          );
        })}

        {/* Section: Deeper Evaluation */}
        <AnimatedCard delay={0.3}>
          <CardContent className={cn("transition-all", planMode === "skeleton" ? "p-4" : "p-6")}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <SectionNumber number={result.arguments.length + 2} />
                <h4 className={cn("font-medium text-stone-800", planMode === "skeleton" ? "text-base" : "text-lg")}>Deeper Evaluation</h4>
              </div>
              <div className="flex gap-1">
                <AOBadge ao="ao3" size={planMode === "skeleton" ? "sm" : "md"} />
                <AOBadge ao="ao4" size={planMode === "skeleton" ? "sm" : "md"} />
              </div>
            </div>

            {planMode === "full" && (
              <p className="text-sm text-stone-600 mb-4 font-medium">Multiple evaluation techniques:</p>
            )}

            {/* What to Write Box - only full mode */}
            {planMode === "full" && (
              <div className="p-4 rounded-lg bg-amber-50/50 border-l-4 border-amber-400 mb-4">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 mb-2">
                  What to Write
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {result.deeperEvaluation?.whatToWrite ||
                    `"The outcome is likely to differ significantly depending on [time horizon / elasticity / context]. Transaction costs may prevent Coasian bargaining in practice. Furthermore, Magnitude: small externalities may not justify intervention costs. The magnitude of the effect is also crucial: [consideration]. Information: government may know less than market participants. Compared to alternative approaches such as [X], this [policy/outcome] is [more/less] effective because [reason]."`
                  }
                </p>
              </div>
            )}

            {/* Evaluation Techniques - compact in skeleton */}
            <div className={cn("rounded-lg bg-violet-50/50 border border-violet-100", planMode === "skeleton" ? "p-3 mb-2" : "p-4 mb-4")}>
              <p className={cn("font-semibold tracking-wider uppercase text-violet-600", planMode === "skeleton" ? "text-[9px] mb-2" : "text-[10px] mb-3")}>
                Evaluation Techniques
              </p>
              <ul className={cn("space-y-1", planMode === "skeleton" && "space-y-0.5")}>
                {(result.deeperEvaluation?.techniques || [
                  "Transaction costs",
                  "Local vs global scope",
                  "Magnitude/significance",
                  "Information asymmetry",
                ]).slice(0, planMode === "skeleton" ? 4 : undefined).map((technique, i) => (
                  <li key={i} className={cn("flex items-start gap-2 text-stone-600", planMode === "skeleton" ? "text-xs" : "text-sm")}>
                    <span className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                    {planMode === "skeleton" ? technique.split(" ").slice(0, 4).join(" ") + (technique.split(" ").length > 4 ? "..." : "") : technique}
                  </li>
                ))}
              </ul>
            </div>

            {/* Evaluation Points from API - compact in skeleton */}
            {result.evaluations.slice(0, planMode === "skeleton" ? 2 : undefined).map((evaluation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn("rounded-lg bg-amber-50 border border-amber-100", planMode === "skeleton" ? "p-2 mb-2" : "p-4 mb-3")}
              >
                <h5 className={cn("font-medium text-amber-800", planMode === "skeleton" ? "text-xs mb-0.5" : "text-sm mb-1")}>{evaluation.point}</h5>
                {planMode === "full" && (
                  <p className="text-sm text-amber-700/80 leading-relaxed">{evaluation.development}</p>
                )}
                {planMode === "full" && evaluation.chainOfReasoning && evaluation.chainOfReasoning.length > 0 && (
                  <div className="mt-3">
                    <ChainOfReasoning steps={evaluation.chainOfReasoning} />
                  </div>
                )}
                {planMode === "skeleton" && evaluation.chainOfReasoning && evaluation.chainOfReasoning.length > 0 && (
                  <CompactChain steps={evaluation.chainOfReasoning} />
                )}
              </motion.div>
            ))}

            {/* Tips - only full mode */}
            {planMode === "full" && (
              <div className="flex flex-wrap gap-2">
                <TipChip text="This is where you show Level 5 thinking" variant="success" />
                <TipChip text="Use at least 3 different evaluation techniques" variant="warning" />
                <TipChip text="Short run vs long run" />
                <TipChip text="Elasticity conditions" />
                <TipChip text="Magnitude/significance" />
                <TipChip text="Challenging assumptions" />
                <TipChip text="Comparing alternatives" />
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Required Diagram Section */}
        {result.diagram && result.diagram !== "none" && (
          <AnimatedCard delay={0.35}>
            <CardContent className={cn("transition-all", planMode === "skeleton" ? "p-4" : "p-6")}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("rounded bg-violet-500 flex items-center justify-center", planMode === "skeleton" ? "w-5 h-5" : "w-6 h-6")}>
                  <FileText className={cn("text-white", planMode === "skeleton" ? "w-3 h-3" : "w-3.5 h-3.5")} />
                </div>
                <h4 className={cn("font-semibold tracking-wider uppercase text-stone-600", planMode === "skeleton" ? "text-xs" : "text-sm")}>
                  Diagram: {result.diagramSection?.name || result.diagram.replace("-", " ")}
                </h4>
              </div>

              {planMode === "full" && (
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 mb-4">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {result.diagramSection?.explanation || result.diagramExplanation}
                  </p>
                </div>
              )}

              {result.diagramSection?.keyLabels && (
                <div className={planMode === "full" ? "mb-4" : "mb-2"}>
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 mb-2">
                    Key Labels
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.diagramSection.keyLabels.slice(0, planMode === "skeleton" ? 5 : undefined).map((label, i) => (
                      <span key={i} className={cn("bg-violet-100 text-violet-700 rounded-md border border-violet-200", planMode === "skeleton" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs")}>
                        {label}
                      </span>
                    ))}
                    {planMode === "skeleton" && result.diagramSection.keyLabels.length > 5 && (
                      <span className="text-xs text-stone-400">+{result.diagramSection.keyLabels.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}

              {planMode === "full" && (
                <p className="text-xs text-stone-500 italic">
                  {result.diagramExplanation}
                </p>
              )}
            </CardContent>
          </AnimatedCard>
        )}

        {/* Section: Conclusion */}
        <AnimatedCard delay={0.4}>
          <CardContent className={cn("transition-all", planMode === "skeleton" ? "p-4" : "p-6")}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <SectionNumber number={result.arguments.length + 3} />
                <h4 className={cn("font-medium text-stone-800", planMode === "skeleton" ? "text-base" : "text-lg")}>Conclusion</h4>
              </div>
              <AOBadge ao="ao4" size={planMode === "skeleton" ? "sm" : "md"} />
            </div>

            {planMode === "full" && (
              <p className="text-sm text-stone-600 mb-4">Definitive answer to the question</p>
            )}

            {/* What to Write Box - only full mode */}
            {planMode === "full" && (
              <div className="p-4 rounded-lg bg-amber-50/50 border-l-4 border-amber-400 mb-4">
                <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 mb-2">
                  What to Write
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {result.conclusionSection?.whatToWrite ||
                    `"On balance, [proposition] is [more likely / less likely / only partially true] because [main reason]. The most significant factor determining the outcome is [key condition]. In most realistic scenarios, [your judgement], although this conclusion would change if [alternative condition]. Therefore, [direct answer to the question]."`
                  }
                </p>
              </div>
            )}

            {/* Actual conclusion */}
            <div className={cn("rounded-lg bg-emerald-50 border border-emerald-100", planMode === "skeleton" ? "p-3" : "p-4 mb-4")}>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-600 mb-1">
                Your Conclusion
              </p>
              <p className={cn("text-stone-700 leading-relaxed", planMode === "skeleton" ? "text-xs" : "text-sm")}>{result.conclusion}</p>
            </div>

            {/* Tips - only full mode */}
            {planMode === "full" && (
              <div className="flex flex-wrap gap-2">
                <TipChip text="DO NOT FENCE-SIT" variant="warning" />
                <TipChip text="State which argument is stronger" variant="warning" />
                <TipChip text="Justify with clear criteria" />
                <TipChip text="Identify the KEY condition" variant="success" />
                <TipChip text="Answer the actual question asked" variant="success" />
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </motion.div>
  );
}

// ============================================================================
// DIAGRAM UPLOAD COMPONENT
// ============================================================================

function DiagramUpload({
  image,
  onUpload,
  onRemove,
}: {
  image: string | null;
  onUpload: (base64: string) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (image) {
    return (
      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-stone-700">Diagram Uploaded</span>
            <button
              onClick={onRemove}
              className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-stone-200">
            <img
              src={image}
              alt="Uploaded diagram"
              className="w-full max-h-48 object-contain bg-white"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-stone-700">Diagram Upload</span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400 px-2 py-1 rounded-full bg-stone-100">
            Optional
          </span>
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-colors",
            "border-2 border-dashed",
            isDragging
              ? "border-stone-400 bg-stone-50"
              : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <Upload className="w-8 h-8 text-stone-300 mb-3" />
          <span className="text-sm font-medium text-stone-600 mb-1">Click or drag to upload</span>
          <span className="text-xs text-stone-400">PNG, JPG up to 10MB</span>
        </motion.div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRADER INPUT FORM
// ============================================================================

function GraderInputForm({
  question,
  setQuestion,
  answer,
  setAnswer,
  questionType,
  setQuestionType,
  diagram,
  setDiagram,
  onSubmit,
  loading,
  error,
  onClear,
}: {
  question: string;
  setQuestion: (v: string) => void;
  answer: string;
  setAnswer: (v: string) => void;
  questionType: QuestionType;
  setQuestionType: (v: QuestionType) => void;
  diagram: string | null;
  setDiagram: (v: string | null) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 className="w-8 h-8 text-stone-500" />
        </motion.div>
        <h2 className="text-2xl font-light text-stone-800 mb-2">Grade Your Answer</h2>
        <p className="text-sm text-stone-500">Get AI-powered feedback on your economics essay</p>
      </div>

      <div className="space-y-6">
        <Select
          label="Question Type"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
        >
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Exam Question"
          placeholder="Paste the exam question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[100px]"
        />

        <Textarea
          label="Student Answer"
          placeholder="Paste the student's answer here for grading..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <DiagramUpload
          image={diagram}
          onUpload={setDiagram}
          onRemove={() => setDiagram(null)}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <AnimatedButton
            className="flex-1"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size={16} className="mr-2" />
                Grading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Grade Answer
              </>
            )}
          </AnimatedButton>
          <AnimatedButton variant="secondary" onClick={onClear}>
            Clear
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PLANNER INPUT FORM
// ============================================================================

function PlannerInputForm({
  question,
  setQuestion,
  questionType,
  setQuestionType,
  onSubmit,
  loading,
  error,
  onClear,
}: {
  question: string;
  setQuestion: (v: string) => void;
  questionType: QuestionType;
  setQuestionType: (v: QuestionType) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center mx-auto mb-5"
        >
          <FileText className="w-8 h-8 text-stone-500" />
        </motion.div>
        <h2 className="text-2xl font-light text-stone-800 mb-2">Plan Your Essay</h2>
        <p className="text-sm text-stone-500">Generate a comprehensive A*-grade essay structure</p>
      </div>

      <div className="space-y-6">
        <Select
          label="Question Type"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
        >
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Essay Question"
          placeholder="Type or paste the essay question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600"
          >
            {error}
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <AnimatedButton
            className="flex-1"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size={16} className="mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </>
            )}
          </AnimatedButton>
          <AnimatedButton variant="secondary" onClick={onClear}>
            Clear
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LOADING VIEW COMPONENT
// ============================================================================

function LoadingView({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <GradingLoader isLoading={true} message={message} />
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"grader" | "planner">("grader");

  // Grader state
  const [graderQuestion, setGraderQuestion] = useState("");
  const [graderAnswer, setGraderAnswer] = useState("");
  const [graderQuestionType, setGraderQuestionType] = useState<QuestionType>("evaluate-20");
  const [graderDiagram, setGraderDiagram] = useState<string | null>(null);
  const [graderResult, setGraderResult] = useState<GradingResult | null>(null);
  const [graderLoading, setGraderLoading] = useState(false);
  const [graderError, setGraderError] = useState("");
  const [graderView, setGraderView] = useState<ViewState>("input");

  // Planner state
  const [plannerQuestion, setPlannerQuestion] = useState("");
  const [plannerQuestionType, setPlannerQuestionType] = useState<QuestionType>("evaluate-20");
  const [plannerResult, setPlannerResult] = useState<PlanResult | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [plannerView, setPlannerView] = useState<ViewState>("input");

  // Handle grading
  const handleGrade = async () => {
    if (!graderQuestion.trim() || !graderAnswer.trim()) {
      setGraderError("Please enter both a question and your answer.");
      return;
    }

    setGraderLoading(true);
    setGraderError("");
    setGraderView("loading");

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: graderAnswer,
          question: graderQuestion,
          questionType: graderQuestionType,
          diagramImage: graderDiagram || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to grade answer");
      }

      const result = await response.json();
      setGraderResult(result);
      setGraderView("results");
    } catch (error) {
      setGraderError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setGraderView("input");
    } finally {
      setGraderLoading(false);
    }
  };

  // Handle planning
  const handlePlan = async () => {
    if (!plannerQuestion.trim()) {
      setPlannerError("Please enter a question.");
      return;
    }

    setPlannerLoading(true);
    setPlannerError("");
    setPlannerView("loading");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: plannerQuestion,
          questionType: plannerQuestionType,
          includeDiagram: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }

      const result = await response.json();
      setPlannerResult(result);
      setPlannerView("results");
    } catch (error) {
      setPlannerError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setPlannerView("input");
    } finally {
      setPlannerLoading(false);
    }
  };

  // Clear functions
  const clearGrader = () => {
    setGraderQuestion("");
    setGraderAnswer("");
    setGraderDiagram(null);
    setGraderResult(null);
    setGraderError("");
    setGraderView("input");
  };

  const clearPlanner = () => {
    setPlannerQuestion("");
    setPlannerResult(null);
    setPlannerError("");
    setPlannerView("input");
  };

  // Back to input handlers
  const handleGraderBack = () => {
    setGraderView("input");
  };

  const handlePlannerBack = () => {
    setPlannerView("input");
  };

  const tabItems = [
    {
      value: "grader",
      label: "Exam Grader",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      value: "planner",
      label: "Essay Planner",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  // Determine if we should show mode tabs (only in input view)
  const showTabs = (activeMode === "grader" && graderView === "input") ||
                   (activeMode === "planner" && plannerView === "input");

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="text-center py-10 px-6 border-b border-stone-100">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-stone-400 mb-2"
        >
          Pearson Edexcel IAL
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl font-light text-stone-800 mb-2"
        >
          Economics
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-stone-400"
        >
          AS & A Level · Units 1–4
        </motion.div>
      </header>

      {/* Mode Navigation - Only show when in input view */}
      <AnimatePresence>
        {showTabs && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center py-6 px-4 border-b border-stone-100"
          >
            <AnimatedPillTabs
              items={tabItems}
              value={activeMode}
              onValueChange={(v) => setActiveMode(v as "grader" | "planner")}
            />
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="py-10 px-6">
        <AnimatePresence mode="wait">
          {activeMode === "grader" ? (
            <div key="grader">
              <AnimatePresence mode="wait">
                {graderView === "input" && (
                  <GraderInputForm
                    key="grader-input"
                    question={graderQuestion}
                    setQuestion={setGraderQuestion}
                    answer={graderAnswer}
                    setAnswer={setGraderAnswer}
                    questionType={graderQuestionType}
                    setQuestionType={setGraderQuestionType}
                    diagram={graderDiagram}
                    setDiagram={setGraderDiagram}
                    onSubmit={handleGrade}
                    loading={graderLoading}
                    error={graderError}
                    onClear={clearGrader}
                  />
                )}
                {graderView === "loading" && (
                  <LoadingView key="grader-loading" message="Analyzing your essay..." />
                )}
                {graderView === "results" && graderResult && (
                  <GradingResultDisplay
                    key="grader-results"
                    result={graderResult}
                    questionType={graderQuestionType}
                    essayText={graderAnswer}
                    onBack={handleGraderBack}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div key="planner">
              <AnimatePresence mode="wait">
                {plannerView === "input" && (
                  <PlannerInputForm
                    key="planner-input"
                    question={plannerQuestion}
                    setQuestion={setPlannerQuestion}
                    questionType={plannerQuestionType}
                    setQuestionType={setPlannerQuestionType}
                    onSubmit={handlePlan}
                    loading={plannerLoading}
                    error={plannerError}
                    onClear={clearPlanner}
                  />
                )}
                {plannerView === "loading" && (
                  <LoadingView key="planner-loading" message="Generating essay plan..." />
                )}
                {plannerView === "results" && plannerResult && (
                  <PlanResultDisplay
                    key="planner-results"
                    result={plannerResult}
                    onBack={handlePlannerBack}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-xs border-t border-stone-100 mt-10">
        <p className="text-stone-400">
          AI-powered grading aligned with Edexcel IAL Economics mark schemes
        </p>
        <p className="text-stone-300 mt-1">
          Always verify with your teacher or official mark schemes
        </p>
      </footer>
    </div>
  );
}
