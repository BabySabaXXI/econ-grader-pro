"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Crosshair,
  Wand2,
  Eye,
  EyeOff,
  BookOpen,
  Pen,
  Lightbulb,
  GraduationCap,
  PanelLeft,
} from "lucide-react";
import {
  QUESTION_TYPE_OPTIONS,
  MARK_SCHEMES,
  LEVEL_DESCRIPTORS,
} from "@/lib/constants";
import { GradingResult, PlanResult, QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EssayViewer } from "@/components/ui/essay-viewer";
import Sidebar from "@/components/Sidebar";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

// ============================================================================
// VIEW STATES TYPE
// ============================================================================

type ViewState = "input" | "loading" | "results";

// ============================================================================
// SCORE COLOR HELPERS — muted professional tones
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-[#4a9e72]";
  if (percentage >= 60) return "text-[#5472b8]";
  if (percentage >= 45) return "text-[#b89050]";
  return "text-[#c75050]";
}

function getScoreRingColor(percentage: number): string {
  if (percentage >= 80) return "stroke-[#4a9e72]";
  if (percentage >= 60) return "stroke-[#5472b8]";
  if (percentage >= 45) return "stroke-[#b89050]";
  return "stroke-[#c75050]";
}

// ============================================================================
// LEVEL BADGE COMPONENT
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const config: Record<number, { label: string; className: string }> = {
    5: {
      label: "Excellent",
      className: "bg-[#eef5f1] text-[#3a7a58] border-[#c2dace]",
    },
    4: {
      label: "Good",
      className: "bg-[#f0f2f8] text-[#3d5390] border-[#ccd4ec]",
    },
    3: {
      label: "Sound",
      className: "bg-[#f7f2ea] text-[#8a6e3a] border-[#e4d6ba]",
    },
    2: {
      label: "Basic",
      className: "bg-[#faf5ee] text-[#9a6830] border-[#ebd8c0]",
    },
    1: {
      label: "Limited",
      className: "bg-[#faf2f2] text-[#963e3e] border-[#ebc8c8]",
    },
  };

  const { label, className } = config[level] || config[1];

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border",
        className
      )}
    >
      Level {level} · {label}
    </span>
  );
}

// ============================================================================
// AO CONFIG & COMPONENTS — muted professional palette
// ============================================================================

const AO_CONFIG = {
  ao1: {
    label: "Knowledge",
    color: "bg-[#5472b8]",
    bgLight: "bg-[#f0f2f8]",
    text: "text-[#5472b8]",
    border: "border-[#ccd4ec]",
  },
  ao2: {
    label: "Application",
    color: "bg-[#4a9e72]",
    bgLight: "bg-[#eef5f1]",
    text: "text-[#4a9e72]",
    border: "border-[#c2dace]",
  },
  ao3: {
    label: "Analysis",
    color: "bg-[#7b6eae]",
    bgLight: "bg-[#f0eef6]",
    text: "text-[#7b6eae]",
    border: "border-[#d2cde4]",
  },
  ao4: {
    label: "Evaluation",
    color: "bg-[#b89050]",
    bgLight: "bg-[#f7f2ea]",
    text: "text-[#b89050]",
    border: "border-[#e4d6ba]",
  },
};

function AOScoreBar({
  aoKey,
  score,
  maxScore,
}: {
  aoKey: "ao1" | "ao2" | "ao3" | "ao4";
  score: number;
  maxScore: number;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const config = AO_CONFIG[aoKey];

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full", config.color)} />
          <span
            className={cn(
              "text-[0.7rem] font-medium font-inter uppercase tracking-wider",
              config.text
            )}
          >
            {aoKey.toUpperCase()}
          </span>
          <span className="text-[0.7rem] text-[#9ca3af]">
            {config.label}
          </span>
        </div>
        <span className="text-[0.875rem] font-medium font-inter tabular-nums text-[#111318]">
          {score}
          <span className="text-[#cdd1d9] font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#e5e7eb]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            delay: 0.3,
          }}
          className={cn("h-full rounded-full", config.color)}
        />
      </div>
    </div>
  );
}

function AOBadge({ ao }: { ao: string }) {
  const config = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
        config.text,
        config.bgLight,
        config.border
      )}
    >
      {ao.toUpperCase()}
    </span>
  );
}

// ============================================================================
// GRADING RESULT DISPLAY
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
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const markScheme = MARK_SCHEMES[questionType];
  const hasHighlights =
    (result.marksEarned?.length || 0) > 0 ||
    (result.marksLost?.length || 0) > 0;

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[0.875rem] font-medium text-[#9ca3af] hover:text-[#111318] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Answer</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Essay View */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sticky top-8">
            <div className="card-neura overflow-hidden">
              <div className="border-b border-[#e5e7eb] bg-[#f7f8fa] px-7 py-5">
                <h3 className="text-[1rem] font-medium font-inter text-[#111318]">
                  Your Essay
                </h3>
                <p className="text-[0.75rem] text-[#9ca3af] mt-1">
                  Click highlighted text for detailed feedback
                </p>
              </div>
              <div className="p-7">
                {hasHighlights ? (
                  <EssayViewer
                    essay={essayText}
                    marksEarned={result.marksEarned || []}
                    marksLost={result.marksLost || []}
                    showDetailedFeedback={showDetailedFeedback}
                    onToggleDetailedFeedback={() =>
                      setShowDetailedFeedback(!showDetailedFeedback)
                    }
                  />
                ) : (
                  <div className="p-7 bg-[#f7f8fa] rounded-xl">
                    <p className="text-[1rem] leading-relaxed text-[#4b5563] whitespace-pre-wrap">
                      {essayText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Score Cards (Bento) */}
        <motion.div
          className="lg:col-span-5 xl:col-span-4 space-y-5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Overall Score Card */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="p-7">
                <div className="flex items-center gap-7">
                  {/* Score Ring */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-28 h-28" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="7"
                        fill="none"
                        className="text-[#e5e7eb]"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="7"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{
                          strokeDashoffset:
                            2 *
                            Math.PI *
                            40 *
                            (1 - result.overallPercentage / 100),
                        }}
                        transition={{
                          duration: 1.2,
                          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                          delay: 0.2,
                        }}
                        strokeLinecap="round"
                        className={cn(
                          "origin-center -rotate-90",
                          getScoreRingColor(result.overallPercentage)
                        )}
                        style={{ transformOrigin: "center" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={cn(
                          "text-2xl font-bold font-inter",
                          getScoreColor(result.overallPercentage)
                        )}
                      >
                        {result.overallPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Score Details */}
                  <div className="flex-1">
                    <div className="text-4xl font-light text-[#111318] mb-3 tracking-tight font-inter">
                      {result.totalMarks}
                      <span className="text-lg text-[#cdd1d9] font-normal">
                        /{markScheme.total}
                      </span>
                    </div>
                    <LevelBadge level={result.levelAchieved} />
                    <p className="text-[0.75rem] text-[#9ca3af] mt-3 leading-relaxed">
                      {LEVEL_DESCRIPTORS[result.levelAchieved]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AO Breakdown */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-7 pt-6 pb-3">
                <h4 className="text-[0.7rem] font-medium font-inter text-[#9ca3af] uppercase tracking-wider">
                  Assessment Objectives
                </h4>
              </div>
              <div className="px-7 pb-6 space-y-6">
                {markScheme.ao1 > 0 && (
                  <AOScoreBar
                    aoKey="ao1"
                    score={result.aoScores.ao1}
                    maxScore={markScheme.ao1}
                  />
                )}
                {markScheme.ao2 > 0 && (
                  <AOScoreBar
                    aoKey="ao2"
                    score={result.aoScores.ao2}
                    maxScore={markScheme.ao2}
                  />
                )}
                {markScheme.ao3 > 0 && (
                  <AOScoreBar
                    aoKey="ao3"
                    score={result.aoScores.ao3}
                    maxScore={markScheme.ao3}
                  />
                )}
                {markScheme.ao4 > 0 && (
                  <AOScoreBar
                    aoKey="ao4"
                    score={result.aoScores.ao4}
                    maxScore={markScheme.ao4}
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Examiner Comment */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-7 pt-6 pb-3">
                <h4 className="text-[0.7rem] font-medium font-inter text-[#9ca3af] uppercase tracking-wider">
                  Examiner Feedback
                </h4>
              </div>
              <div className="px-7 pb-6">
                <p className="text-[0.875rem] text-[#4b5563] leading-relaxed italic">
                  &ldquo;{result.examinerComment}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feedback Summary */}
          {hasHighlights && (
            <motion.div variants={staggerItem}>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-elevated p-5">
                  <div className="text-2xl font-bold text-[#4a9e72] tracking-tight font-inter">
                    +
                    {result.marksEarned?.reduce(
                      (sum, m) => sum + m.points,
                      0
                    ) || 0}
                  </div>
                  <div className="text-[0.75rem] text-[#4b5563] font-medium mt-1.5">
                    Marks Earned
                  </div>
                </div>
                <div className="card-elevated p-5">
                  <div className="text-2xl font-bold text-[#c75050] tracking-tight font-inter">
                    {result.marksLost?.length || 0}
                  </div>
                  <div className="text-[0.75rem] text-[#4b5563] font-medium mt-1.5">
                    Issues Found
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strengths */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-7 pt-6 pb-3">
                <h4 className="text-[0.7rem] font-medium font-inter text-[#4a9e72] uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Strengths
                </h4>
              </div>
              <div className="px-7 pb-6 space-y-2.5">
                {result.strengths.slice(0, 3).map((strength, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3.5 rounded-xl bg-[#f7f8fa]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a9e72] mt-1.5 flex-shrink-0" />
                    <span className="text-[0.8rem] text-[#4b5563] leading-relaxed">
                      {strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-7 pt-6 pb-3">
                <h4 className="text-[0.7rem] font-medium font-inter text-[#b89050] uppercase tracking-wider flex items-center gap-2">
                  <Crosshair className="w-3 h-3" />
                  Areas to Improve
                </h4>
              </div>
              <div className="px-7 pb-6 space-y-2.5">
                {result.improvements.slice(0, 3).map((improvement, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3.5 rounded-xl bg-[#f7f8fa]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b89050] mt-1.5 flex-shrink-0" />
                    <span className="text-[0.8rem] text-[#4b5563] leading-relaxed">
                      {improvement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// PLAN RESULT DISPLAY
// ============================================================================

function PlanResultDisplay({
  result,
  onBack,
}: {
  result: PlanResult;
  onBack: () => void;
}) {
  const [showDetailedPlan, setShowDetailedPlan] = useState(true);

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[0.875rem] font-medium text-[#9ca3af] hover:text-[#111318] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Question</span>
      </button>

      {/* Detail Toggle */}
      <div className="flex items-center justify-between mb-8 p-5 rounded-2xl bg-[#f7f8fa] border border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          {showDetailedPlan ? (
            <Eye className="w-5 h-5 text-[#4b5563]" />
          ) : (
            <EyeOff className="w-5 h-5 text-[#9ca3af]" />
          )}
          <div>
            <p className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Detailed View
            </p>
            <p className="text-[0.75rem] text-[#9ca3af]">
              Show examples, chains of reasoning, and techniques
            </p>
          </div>
        </div>
        <Switch
          checked={showDetailedPlan}
          onCheckedChange={setShowDetailedPlan}
          className="data-[state=checked]:bg-[#5472b8]"
        />
      </div>

      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Introduction */}
        <motion.div variants={staggerItem}>
          <div className="card-neura-hover overflow-hidden">
            <div className="border-b border-[#e5e7eb] bg-[#f7f8fa] px-7 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#111318] text-white text-[0.875rem] font-medium font-inter">
                    1
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-medium font-inter text-[#111318]">
                      Introduction
                    </h3>
                    <p className="text-[0.75rem] text-[#9ca3af] mt-0.5">
                      Define key terms and state your thesis
                    </p>
                  </div>
                </div>
                <AOBadge ao="ao1" />
              </div>
            </div>
            <div className="p-7">
              <div className="p-5 rounded-xl bg-[#f7f2ea] border border-[#e4d6ba]">
                <p className="text-[10px] font-bold text-[#8a6e3a] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-inter">
                  <Lightbulb className="w-3 h-3" />
                  What to Write
                </p>
                <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                  {result.introduction?.whatToWrite || result.thesis}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Arguments */}
        {result.arguments.map((arg, index) => (
          <motion.div key={index} variants={staggerItem}>
            <div className="card-neura-hover overflow-hidden">
              <div className="border-b border-[#e5e7eb] bg-[#f7f8fa] px-7 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl text-white text-[0.875rem] font-medium font-inter",
                        index === 0 ? "bg-[#4a9e72]" : "bg-[#c75050]"
                      )}
                    >
                      {index + 2}
                    </span>
                    <div>
                      <h3 className="text-[1rem] font-medium font-inter text-[#111318]">
                        Argument {index === 0 ? "FOR" : "AGAINST"}
                      </h3>
                      <p className="text-[0.75rem] text-[#9ca3af] mt-0.5 max-w-md truncate">
                        {arg.point}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <AOBadge ao="ao1" />
                    <AOBadge ao="ao2" />
                    <AOBadge ao="ao3" />
                  </div>
                </div>
              </div>
              <div className="p-7 space-y-5">
                {/* Chain of Reasoning */}
                {showDetailedPlan &&
                  arg.chainOfReasoning &&
                  arg.chainOfReasoning.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 p-5 bg-[#f7f8fa] rounded-xl border border-[#e5e7eb]">
                      <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mr-2 font-inter">
                        Chain:
                      </span>
                      {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                        <span key={i} className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-white rounded-lg text-[0.75rem] text-[#4b5563] font-medium border border-[#e5e7eb]">
                            {step}
                          </span>
                          {arg.chainOfReasoning &&
                            i <
                              Math.min(
                                arg.chainOfReasoning.length - 1,
                                4
                              ) && (
                              <ChevronRight className="w-3 h-3 text-[#cdd1d9]" />
                            )}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Theory and Example */}
                {showDetailedPlan ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-[#f0f2f8] border border-[#ccd4ec]">
                      <p className="text-[10px] font-bold text-[#5472b8] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-inter">
                        <BookOpen className="w-3 h-3" />
                        Theory / Explanation
                      </p>
                      <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                        {arg.explanation}
                      </p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#eef5f1] border border-[#c2dace]">
                      <p className="text-[10px] font-bold text-[#4a9e72] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-inter">
                        <GraduationCap className="w-3 h-3" />
                        Real-World Example
                      </p>
                      <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                        {arg.example}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb]">
                    <p className="text-[0.875rem] font-medium font-inter text-[#111318]">
                      {arg.point}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Evaluation */}
        <motion.div variants={staggerItem}>
          <div className="card-neura-hover overflow-hidden">
            <div className="border-b border-[#d2cde4] bg-[#f0eef6] px-7 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7b6eae] text-white text-[0.875rem] font-medium font-inter">
                    {result.arguments.length + 2}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-medium font-inter text-[#111318]">
                      Deeper Evaluation
                    </h3>
                    <p className="text-[0.75rem] text-[#4b5563] mt-0.5">
                      Critical analysis and limitations
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <AOBadge ao="ao3" />
                  <AOBadge ao="ao4" />
                </div>
              </div>
            </div>
            <div className="p-7 space-y-5">
              {showDetailedPlan && (
                <div className="p-5 rounded-xl bg-[#f0eef6] border border-[#d2cde4]">
                  <p className="text-[10px] font-bold text-[#7b6eae] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-inter">
                    <Crosshair className="w-3 h-3" />
                    Evaluation Techniques
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      result.deeperEvaluation?.techniques || [
                        "Short run vs long run",
                        "Elasticity conditions",
                        "Magnitude/significance",
                        "Challenging assumptions",
                      ]
                    ).map((technique, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white rounded-lg text-[0.75rem] text-[#7b6eae] font-medium border border-[#d2cde4]"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.evaluations
                .slice(0, showDetailedPlan ? 3 : 2)
                .map((evaluation, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl bg-[#f7f2ea] border border-[#e4d6ba]"
                  >
                    <h5 className="text-[0.875rem] font-medium font-inter text-[#8a6e3a] mb-2">
                      {evaluation.point}
                    </h5>
                    {showDetailedPlan && (
                      <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                        {evaluation.development}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Diagram */}
        {result.diagram && result.diagram !== "none" && (
          <motion.div variants={staggerItem}>
            <div className="card-neura-hover overflow-hidden">
              <div className="border-b border-[#c4dce6] bg-[#edf4f7] px-7 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5aa0be] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[0.875rem] font-medium font-inter uppercase tracking-wide text-[#111318]">
                      Required Diagram
                    </h3>
                    <p className="text-[0.75rem] text-[#9ca3af] mt-0.5">
                      {result.diagramSection?.name ||
                        result.diagram.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-7">
                {showDetailedPlan && result.diagramSection?.keyLabels && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {result.diagramSection.keyLabels.map((label, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[0.75rem] font-medium bg-[#f7f8fa] border border-[#e5e7eb]"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
                {result.diagramExplanation && (
                  <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                    {result.diagramExplanation}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Conclusion */}
        <motion.div variants={staggerItem}>
          <div className="card-neura-hover overflow-hidden">
            <div className="border-b border-[#c2dace] bg-[#eef5f1] px-7 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4a9e72] text-white text-[0.875rem] font-medium font-inter">
                    {result.arguments.length + 3}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-medium font-inter text-[#111318]">
                      Conclusion
                    </h3>
                    <p className="text-[0.75rem] text-[#4b5563] mt-0.5">
                      Weigh evidence and give your judgement
                    </p>
                  </div>
                </div>
                <AOBadge ao="ao4" />
              </div>
            </div>
            <div className="p-7">
              <p className="text-[0.875rem] text-[#4b5563] leading-relaxed">
                {result.conclusion}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
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

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  if (image) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
            Diagram Uploaded
          </label>
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-[0.75rem] text-[#c75050] hover:text-[#963e3e] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
        <div className="rounded-xl overflow-hidden border border-[#e5e7eb] bg-white">
          <img
            src={image}
            alt="Uploaded diagram"
            className="w-full max-h-48 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
          Diagram Upload
        </label>
        <span className="text-[10px] font-medium text-[#9ca3af] bg-[#f7f8fa] px-2 py-0.5 rounded-full border border-[#e5e7eb]">
          Optional
        </span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-10 rounded-xl cursor-pointer transition-all border-2 border-dashed border-[#e5e7eb] hover:border-[#cdd1d9] bg-[#f7f8fa] hover:bg-[#f0f1f4] group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#f7f8fa] transition-colors" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <Upload className="w-5 h-5 text-[#9ca3af] group-hover:text-[#4b5563]" />
        </div>
        <span className="text-[0.875rem] font-medium text-[#4b5563] mb-1">
          Click to upload
        </span>
        <span className="text-[0.75rem] text-[#9ca3af]">
          PNG, JPG up to 10MB
        </span>
      </div>
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
    </div>
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
    <motion.div className="max-w-2xl mx-auto" {...pageTransition}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center w-16 h-16 rounded-2xl bg-[#f7f8fa] mx-auto mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <Pen className="w-6 h-6 text-[#4b5563]" />
        </div>
        <h2 className="text-[1.25rem] font-medium font-inter-display text-[#111318] tracking-tight mb-2">
          Grade Your Answer
        </h2>
        <p className="text-[0.875rem] text-[#9ca3af]">
          AI-powered feedback aligned with Edexcel mark schemes
        </p>
      </div>

      <div className="card-neura overflow-hidden">
        <div className="p-8 space-y-7">
          {/* Question Type */}
          <div className="space-y-2.5">
            <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Question Type
            </label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-[#f7f8fa] border-[#e5e7eb] hover:bg-[#f0f1f4] transition-colors focus:!border-[#5472b8]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Question */}
          <div className="space-y-2.5">
            <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Exam Question
            </label>
            <Textarea
              placeholder="Paste the exam question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl bg-[#f7f8fa] border-[#e5e7eb] text-[#111318] transition-colors outline-none focus:!border-[#5472b8] focus:bg-white placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Student Answer */}
          <div className="space-y-2.5">
            <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Student Answer
            </label>
            <Textarea
              placeholder="Paste the student's answer here for grading..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] resize-none rounded-xl bg-[#f7f8fa] border-[#e5e7eb] text-[#111318] transition-colors outline-none focus:!border-[#5472b8] focus:bg-white placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Diagram Upload */}
          <DiagramUpload
            image={diagram}
            onUpload={setDiagram}
            onRemove={() => setDiagram(null)}
          />

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl border-[#ebc8c8] bg-[#faf2f2]"
            >
              <AlertCircle className="h-4 w-4 text-[#c75050]" />
              <AlertDescription className="text-[#c75050]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              className="btn-neura-blue flex-1 h-12"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Grade Answer
                </>
              )}
            </button>
            <button className="btn-neura-stroke h-12 px-6" onClick={onClear}>
              Clear
            </button>
          </div>
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
    <motion.div className="max-w-2xl mx-auto" {...pageTransition}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center w-16 h-16 rounded-2xl bg-[#f7f8fa] mx-auto mb-5" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <FileText className="w-6 h-6 text-[#4b5563]" />
        </div>
        <h2 className="text-[1.25rem] font-medium font-inter-display text-[#111318] tracking-tight mb-2">
          Plan Your Essay
        </h2>
        <p className="text-[0.875rem] text-[#9ca3af]">
          Generate a comprehensive A*-grade essay structure
        </p>
      </div>

      <div className="card-neura overflow-hidden">
        <div className="p-8 space-y-7">
          {/* Question Type */}
          <div className="space-y-2.5">
            <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Question Type
            </label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-[#f7f8fa] border-[#e5e7eb] hover:bg-[#f0f1f4] transition-colors focus:!border-[#5472b8]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Essay Question */}
          <div className="space-y-2.5">
            <label className="text-[0.875rem] font-medium font-inter text-[#111318]">
              Essay Question
            </label>
            <Textarea
              placeholder="Type or paste the essay question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[140px] resize-none rounded-xl bg-[#f7f8fa] border-[#e5e7eb] text-[#111318] transition-colors outline-none focus:!border-[#5472b8] focus:bg-white placeholder:text-[#9ca3af]"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl border-[#ebc8c8] bg-[#faf2f2]"
            >
              <AlertCircle className="h-4 w-4 text-[#c75050]" />
              <AlertDescription className="text-[#c75050]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              className="btn-neura-blue flex-1 h-12"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Plan
                </>
              )}
            </button>
            <button className="btn-neura-stroke h-12 px-6" onClick={onClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// LOADING VIEW
// ============================================================================

function LoadingView({ message }: { message: string }) {
  return (
    <motion.div
      className="max-w-md mx-auto text-center py-28"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <div className="relative w-20 h-20 mx-auto mb-10">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#e5e7eb]" />
        <div className="absolute inset-0 rounded-full border-[3px] border-[#5472b8] border-t-transparent animate-spin" />
      </div>
      <h3 className="text-[1.125rem] font-medium font-inter-display text-[#111318] mb-2">
        {message}
      </h3>
      <p className="text-[0.875rem] text-[#9ca3af]">Powered by Claude AI</p>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"grader" | "planner">(
    "grader"
  );
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Grader state
  const [graderQuestion, setGraderQuestion] = useState("");
  const [graderAnswer, setGraderAnswer] = useState("");
  const [graderQuestionType, setGraderQuestionType] =
    useState<QuestionType>("evaluate-20");
  const [graderDiagram, setGraderDiagram] = useState<string | null>(null);
  const [graderResult, setGraderResult] = useState<GradingResult | null>(
    null
  );
  const [graderLoading, setGraderLoading] = useState(false);
  const [graderError, setGraderError] = useState("");
  const [graderView, setGraderView] = useState<ViewState>("input");

  // Planner state
  const [plannerQuestion, setPlannerQuestion] = useState("");
  const [plannerQuestionType, setPlannerQuestionType] =
    useState<QuestionType>("evaluate-20");
  const [plannerResult, setPlannerResult] = useState<PlanResult | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");
  const [plannerView, setPlannerView] = useState<ViewState>("input");

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
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
      setGraderView("input");
    } finally {
      setGraderLoading(false);
    }
  };

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
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
      setPlannerView("input");
    } finally {
      setPlannerLoading(false);
    }
  };

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

  const currentModeTitle =
    activeMode === "grader" ? "Exam Grader" : "Essay Planner";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
        }}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Main Content Area */}
      <div className="pl-[19rem] pt-8 pb-5 pr-5 transition-all max-lg:pl-5 max-md:pl-4 max-md:pr-4 max-md:pt-3 max-md:pb-4">
        {/* Header Bar — minimal */}
        <div className="flex items-center gap-4 mb-5">
          <button
            className="hidden max-lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white transition-colors"
            onClick={() => setSidebarVisible(true)}
          >
            <PanelLeft className="w-5 h-5 text-[#111318]" />
          </button>
          <h1 className="text-[1.25rem] font-medium font-inter text-[#111318] tracking-tight max-md:text-[1rem]">
            {currentModeTitle}
          </h1>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper min-h-[calc(100svh-7rem)] max-md:min-h-[calc(100svh-5rem)] max-md:rounded-xl">
          <div className="flex-1 overflow-auto scrollbar-none p-9 max-md:p-5">
            <AnimatePresence mode="wait">
              {activeMode === "grader" ? (
                <div key="grader">
                  {graderView === "input" && (
                    <GraderInputForm
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
                    <LoadingView message="Analyzing your essay..." />
                  )}
                  {graderView === "results" && graderResult && (
                    <GradingResultDisplay
                      result={graderResult}
                      questionType={graderQuestionType}
                      essayText={graderAnswer}
                      onBack={() => setGraderView("input")}
                    />
                  )}
                </div>
              ) : (
                <div key="planner">
                  {plannerView === "input" && (
                    <PlannerInputForm
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
                    <LoadingView message="Generating essay plan..." />
                  )}
                  {plannerView === "results" && plannerResult && (
                    <PlanResultDisplay
                      result={plannerResult}
                      onBack={() => setPlannerView("input")}
                    />
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer — minimal */}
          <div className="shrink-0 border-t border-[#e5e7eb] px-9 py-4 max-md:px-5">
            <p className="text-[0.75rem] text-[#9ca3af] text-center">
              AI-powered grading · Edexcel IAL Economics · Always verify with official mark schemes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
