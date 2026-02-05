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
  Target,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  PenTool,
  Lightbulb,
  GraduationCap,
  Menu,
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
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
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
// SCORE COLOR HELPERS
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-600";
  if (percentage >= 60) return "text-[#335cff]";
  if (percentage >= 45) return "text-amber-600";
  return "text-[#fb3748]";
}

function getScoreRingColor(percentage: number): string {
  if (percentage >= 80) return "stroke-emerald-500";
  if (percentage >= 60) return "stroke-[#335cff]";
  if (percentage >= 45) return "stroke-amber-500";
  return "stroke-[#fb3748]";
}

// ============================================================================
// LEVEL BADGE COMPONENT
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const config: Record<number, { label: string; className: string }> = {
    5: {
      label: "Excellent",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    4: {
      label: "Good",
      className: "bg-[#ebf1ff] text-[#2547d0] border-[#c0d5ff]",
    },
    3: {
      label: "Sound",
      className: "bg-[#fffaeb] text-amber-700 border-[#ffecc0]",
    },
    2: {
      label: "Basic",
      className: "bg-[#fff1eb] text-orange-700 border-[#ffd5c0]",
    },
    1: {
      label: "Limited",
      className: "bg-[#ffebec] text-red-700 border-[#ffc0c5]",
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
// AO CONFIG & COMPONENTS
// ============================================================================

const AO_CONFIG = {
  ao1: {
    label: "Knowledge",
    color: "bg-[#335cff]",
    bgLight: "bg-[#ebf1ff]",
    text: "text-[#335cff]",
    border: "border-[#c0d5ff]",
  },
  ao2: {
    label: "Application",
    color: "bg-[#1fc16b]",
    bgLight: "bg-[#e0faec]",
    text: "text-[#1fc16b]",
    border: "border-[#c2f5da]",
  },
  ao3: {
    label: "Analysis",
    color: "bg-[#7d52f4]",
    bgLight: "bg-[#efebff]",
    text: "text-[#7d52f4]",
    border: "border-[#cac0ff]",
  },
  ao4: {
    label: "Evaluation",
    color: "bg-[#f6b51e]",
    bgLight: "bg-[#fffaeb]",
    text: "text-[#f6b51e]",
    border: "border-[#ffecc0]",
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
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.color)} />
          <span
            className={cn(
              "text-[0.75rem] font-medium font-inter uppercase tracking-wider",
              config.text
            )}
          >
            {aoKey.toUpperCase()}
          </span>
          <span className="text-[0.75rem] text-[#99a0ae]">
            {config.label}
          </span>
        </div>
        <span className="text-[0.875rem] font-medium font-inter tabular-nums text-[#0e121b]">
          {score}
          <span className="text-[#cacfd8] font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#e1e4ea]">
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[0.875rem] font-medium text-[#525866] hover:text-[#0e121b] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Answer</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Essay View */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sticky top-8">
            <div className="card-neura overflow-hidden">
              <div className="border-b border-[#e1e4ea] bg-[#f5f7fa] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[1rem] font-medium font-inter text-[#0e121b]">
                      Your Essay
                    </h3>
                    <p className="text-[0.75rem] text-[#99a0ae] mt-0.5">
                      Click highlighted text to see detailed feedback
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
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
                  <div className="p-6 bg-[#f5f7fa] rounded-xl">
                    <p className="text-[1rem] leading-relaxed text-[#525866] whitespace-pre-wrap">
                      {essayText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Score Cards */}
        <motion.div
          className="lg:col-span-5 xl:col-span-4 space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Overall Score Card */}
          <motion.div variants={staggerItem}>
            <div className="card-neura overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Score Ring */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-28 h-28" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-[#e1e4ea]"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
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
                    <div className="text-4xl font-light text-[#0e121b] mb-2 tracking-tight font-inter">
                      {result.totalMarks}
                      <span className="text-lg text-[#cacfd8] font-normal">
                        /{markScheme.total}
                      </span>
                    </div>
                    <LevelBadge level={result.levelAchieved} />
                    <p className="text-[0.75rem] text-[#99a0ae] mt-3 leading-relaxed">
                      {LEVEL_DESCRIPTORS[result.levelAchieved]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AO Breakdown */}
          <motion.div variants={staggerItem}>
            <div className="card-neura overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <h4 className="text-[0.75rem] font-medium font-inter text-[#99a0ae] uppercase tracking-wider">
                  Assessment Objectives
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-5">
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
            <div className="card-neura overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <h4 className="text-[0.75rem] font-medium font-inter text-[#99a0ae] uppercase tracking-wider">
                  Examiner Feedback
                </h4>
              </div>
              <div className="px-6 pb-5">
                <div className="relative p-4 bg-[#f5f7fa] rounded-xl border border-[#e1e4ea]">
                  <div className="absolute top-2 left-4 text-4xl text-[#cacfd8] font-serif leading-none">
                    &ldquo;
                  </div>
                  <p className="text-[0.875rem] text-[#525866] leading-relaxed pt-5 pl-2 italic">
                    {result.examinerComment}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feedback Summary */}
          {hasHighlights && (
            <motion.div variants={staggerItem}>
              <div className="card-neura overflow-hidden p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#e0faec] border border-[#c2f5da]">
                    <div className="text-2xl font-bold text-[#1fc16b] tracking-tight font-inter">
                      +
                      {result.marksEarned?.reduce(
                        (sum, m) => sum + m.points,
                        0
                      ) || 0}
                    </div>
                    <div className="text-[0.75rem] text-emerald-700 font-medium mt-1">
                      Marks Earned
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#ffebec] border border-[#ffc0c5]">
                    <div className="text-2xl font-bold text-[#fb3748] tracking-tight font-inter">
                      {result.marksLost?.length || 0}
                    </div>
                    <div className="text-[0.75rem] text-red-700 font-medium mt-1">
                      Issues Found
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strengths */}
          <motion.div variants={staggerItem}>
            <div className="card-neura overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <h4 className="text-[0.75rem] font-medium font-inter text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Strengths
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-2">
                {result.strengths.slice(0, 3).map((strength, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-xl bg-[#e0faec] border border-[#c2f5da]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1fc16b] mt-1.5 flex-shrink-0" />
                    <span className="text-[0.75rem] text-[#525866] leading-relaxed">
                      {strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div variants={staggerItem}>
            <div className="card-neura overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <h4 className="text-[0.75rem] font-medium font-inter text-[#f6b51e] uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" />
                  Areas to Improve
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-2">
                {result.improvements.slice(0, 3).map((improvement, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-xl bg-[#fffaeb] border border-[#ffecc0]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f6b51e] mt-1.5 flex-shrink-0" />
                    <span className="text-[0.75rem] text-[#525866] leading-relaxed">
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[0.875rem] font-medium text-[#525866] hover:text-[#0e121b] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Question</span>
      </button>

      {/* Detail Toggle */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl border border-[#e1e4ea] bg-[#f5f7fa]">
        <div className="flex items-center gap-3">
          {showDetailedPlan ? (
            <Eye className="w-5 h-5 text-[#525866]" />
          ) : (
            <EyeOff className="w-5 h-5 text-[#99a0ae]" />
          )}
          <div>
            <p className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Detailed View
            </p>
            <p className="text-[0.75rem] text-[#99a0ae]">
              Show examples, chains of reasoning, and techniques
            </p>
          </div>
        </div>
        <Switch
          checked={showDetailedPlan}
          onCheckedChange={setShowDetailedPlan}
          className="data-[state=checked]:bg-[#335cff]"
        />
      </div>

      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Introduction */}
        <motion.div variants={staggerItem}>
          <div className="card-neura-hover overflow-hidden">
            <div className="border-b border-[#e1e4ea] bg-[#f5f7fa] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0e121b] text-white text-[0.875rem] font-medium font-inter">
                    1
                  </span>
                  <div>
                    <h3 className="text-[1.125rem] font-medium font-inter text-[#0e121b]">
                      Introduction
                    </h3>
                    <p className="text-[0.75rem] text-[#99a0ae] mt-0.5">
                      Define key terms and state your thesis
                    </p>
                  </div>
                </div>
                <AOBadge ao="ao1" />
              </div>
            </div>
            <div className="p-6">
              <div className="p-5 rounded-xl bg-[#fffaeb] border border-[#ffecc0]">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter">
                  <Lightbulb className="w-3 h-3" />
                  What to Write
                </p>
                <p className="text-[0.875rem] text-[#525866] leading-relaxed">
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
              <div className="border-b border-[#e1e4ea] bg-[#f5f7fa] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl text-white text-[0.875rem] font-medium font-inter",
                        index === 0 ? "bg-[#1fc16b]" : "bg-[#fb3748]"
                      )}
                    >
                      {index + 2}
                    </span>
                    <div>
                      <h3 className="text-[1.125rem] font-medium font-inter text-[#0e121b]">
                        Argument {index === 0 ? "FOR" : "AGAINST"}
                      </h3>
                      <p className="text-[0.75rem] text-[#99a0ae] mt-0.5 max-w-md truncate">
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
              <div className="p-6 space-y-4">
                {/* Chain of Reasoning */}
                {showDetailedPlan &&
                  arg.chainOfReasoning &&
                  arg.chainOfReasoning.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 p-4 bg-[#f5f7fa] rounded-xl border border-[#e1e4ea]">
                      <span className="text-[10px] font-bold text-[#99a0ae] uppercase tracking-wider mr-2 font-inter">
                        Chain:
                      </span>
                      {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                        <span key={i} className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-white rounded-lg text-[0.75rem] text-[#525866] font-medium shadow-neura border border-[#e1e4ea]">
                            {step}
                          </span>
                          {arg.chainOfReasoning &&
                            i <
                              Math.min(
                                arg.chainOfReasoning.length - 1,
                                4
                              ) && (
                              <ChevronRight className="w-3.5 h-3.5 text-[#cacfd8]" />
                            )}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Theory and Example */}
                {showDetailedPlan ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#ebf1ff] border border-[#c0d5ff]">
                      <p className="text-[10px] font-bold text-[#335cff] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter">
                        <BookOpen className="w-3 h-3" />
                        Theory / Explanation
                      </p>
                      <p className="text-[0.875rem] text-[#525866] leading-relaxed">
                        {arg.explanation}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#e0faec] border border-[#c2f5da]">
                      <p className="text-[10px] font-bold text-[#1fc16b] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter">
                        <GraduationCap className="w-3 h-3" />
                        Real-World Example
                      </p>
                      <p className="text-[0.875rem] text-[#525866] leading-relaxed">
                        {arg.example}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#f5f7fa] border border-[#e1e4ea]">
                    <p className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
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
            <div className="border-b border-[#cac0ff] bg-[#efebff] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#7d52f4] text-white text-[0.875rem] font-medium font-inter">
                    {result.arguments.length + 2}
                  </span>
                  <div>
                    <h3 className="text-[1.125rem] font-medium font-inter text-[#0e121b]">
                      Deeper Evaluation
                    </h3>
                    <p className="text-[0.75rem] text-[#525866] mt-0.5">
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
            <div className="p-6 space-y-4">
              {showDetailedPlan && (
                <div className="p-5 rounded-xl bg-[#efebff] border border-[#cac0ff]">
                  <p className="text-[10px] font-bold text-[#7d52f4] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-inter">
                    <Target className="w-3 h-3" />
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
                        className="px-3 py-1.5 bg-white rounded-lg text-[0.75rem] text-[#7d52f4] font-medium shadow-neura border border-[#cac0ff]"
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
                    className="p-4 rounded-xl bg-[#fffaeb] border border-[#ffecc0]"
                  >
                    <h5 className="text-[0.875rem] font-medium font-inter text-amber-800 mb-2">
                      {evaluation.point}
                    </h5>
                    {showDetailedPlan && (
                      <p className="text-[0.875rem] text-amber-700/80 leading-relaxed">
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
              <div className="border-b border-[#c0eaff] bg-[#ebf8ff] px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#47c2ff] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[0.875rem] font-medium font-inter uppercase tracking-wide text-[#0e121b]">
                      Required Diagram
                    </h3>
                    <p className="text-[0.75rem] text-[#99a0ae] mt-0.5">
                      {result.diagramSection?.name ||
                        result.diagram.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {showDetailedPlan && result.diagramSection?.keyLabels && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.diagramSection.keyLabels.map((label, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[0.75rem] font-medium bg-[#f5f7fa] border border-[#e1e4ea]"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
                {result.diagramExplanation && (
                  <p className="text-[0.875rem] text-[#525866] leading-relaxed">
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
            <div className="border-b border-[#c2f5da] bg-[#e0faec] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1fc16b] text-white text-[0.875rem] font-medium font-inter">
                    {result.arguments.length + 3}
                  </span>
                  <div>
                    <h3 className="text-[1.125rem] font-medium font-inter text-[#0e121b]">
                      Conclusion
                    </h3>
                    <p className="text-[0.75rem] text-[#525866] mt-0.5">
                      Weigh evidence and give your judgement
                    </p>
                  </div>
                </div>
                <AOBadge ao="ao4" />
              </div>
            </div>
            <div className="p-6">
              <div className="p-5 rounded-xl bg-[#e0faec] border border-[#c2f5da]">
                <p className="text-[10px] font-bold text-[#1fc16b] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter">
                  <CheckCircle2 className="w-3 h-3" />
                  Your Conclusion
                </p>
                <p className="text-[0.875rem] text-[#525866] leading-relaxed">
                  {result.conclusion}
                </p>
              </div>
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
          <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
            Diagram Uploaded
          </label>
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-[0.75rem] text-[#fb3748] hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
        <div className="rounded-xl overflow-hidden border border-[#e1e4ea] bg-white">
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
        <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
          Diagram Upload
        </label>
        <span className="text-[10px] font-medium text-[#99a0ae] bg-[#f5f7fa] px-2 py-0.5 rounded-full border border-[#e1e4ea]">
          Optional
        </span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed border-[#e1e4ea] hover:border-[#cacfd8] bg-[#f5f7fa] hover:bg-[#e1e4ea] group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-neura group-hover:bg-[#f5f7fa] transition-colors">
          <Upload className="w-5 h-5 text-[#99a0ae] group-hover:text-[#525866]" />
        </div>
        <span className="text-[0.875rem] font-medium text-[#525866] mb-1">
          Click to upload
        </span>
        <span className="text-[0.75rem] text-[#99a0ae]">
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
      <div className="text-center mb-10">
        <div className="flex justify-center items-center w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-[#f5f7fa] to-[#e1e4ea] mx-auto mb-5 shadow-neura">
          <PenTool className="w-7 h-7 text-[#525866]" />
        </div>
        <h2 className="text-[1.25rem] font-medium font-inter-display text-[#0e121b] tracking-tight mb-2">
          Grade Your Answer
        </h2>
        <p className="text-[0.875rem] text-[#99a0ae]">
          Get AI-powered feedback aligned with Edexcel mark schemes
        </p>
      </div>

      <div className="card-neura overflow-hidden">
        <div className="p-7 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Question Type
            </label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-[#f5f7fa] border-[#e1e4ea] hover:bg-[#e1e4ea] transition-colors focus:!border-[#335cff]">
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
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Exam Question
            </label>
            <Textarea
              placeholder="Paste the exam question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl bg-[#f5f7fa] border-[#e1e4ea] text-[#0e121b] transition-colors outline-none focus:!border-[#335cff] focus:bg-white placeholder:text-[#99a0ae]"
            />
          </div>

          {/* Student Answer */}
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Student Answer
            </label>
            <Textarea
              placeholder="Paste the student's answer here for grading..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] resize-none rounded-xl bg-[#f5f7fa] border-[#e1e4ea] text-[#0e121b] transition-colors outline-none focus:!border-[#335cff] focus:bg-white placeholder:text-[#99a0ae]"
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
              className="rounded-xl border-[#ffc0c5] bg-[#ffebec]"
            >
              <AlertCircle className="h-4 w-4 text-[#fb3748]" />
              <AlertDescription className="text-[#fb3748]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
                  <Sparkles className="w-4 h-4" />
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
      <div className="text-center mb-10">
        <div className="flex justify-center items-center w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-[#f5f7fa] to-[#e1e4ea] mx-auto mb-5 shadow-neura">
          <FileText className="w-7 h-7 text-[#525866]" />
        </div>
        <h2 className="text-[1.25rem] font-medium font-inter-display text-[#0e121b] tracking-tight mb-2">
          Plan Your Essay
        </h2>
        <p className="text-[0.875rem] text-[#99a0ae]">
          Generate a comprehensive A*-grade essay structure
        </p>
      </div>

      <div className="card-neura overflow-hidden">
        <div className="p-7 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Question Type
            </label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-[#f5f7fa] border-[#e1e4ea] hover:bg-[#e1e4ea] transition-colors focus:!border-[#335cff]">
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
          <div className="space-y-2">
            <label className="text-[0.875rem] font-medium font-inter text-[#0e121b]">
              Essay Question
            </label>
            <Textarea
              placeholder="Type or paste the essay question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[140px] resize-none rounded-xl bg-[#f5f7fa] border-[#e1e4ea] text-[#0e121b] transition-colors outline-none focus:!border-[#335cff] focus:bg-white placeholder:text-[#99a0ae]"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl border-[#ffc0c5] bg-[#ffebec]"
            >
              <AlertCircle className="h-4 w-4 text-[#fb3748]" />
              <AlertDescription className="text-[#fb3748]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
                  <Sparkles className="w-4 h-4" />
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
      className="max-w-md mx-auto text-center py-24"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#e1e4ea]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#335cff] border-t-transparent animate-spin" />
      </div>
      <h3 className="text-[1.25rem] font-medium font-inter-display text-[#0e121b] mb-2">
        {message}
      </h3>
      <p className="text-[0.875rem] text-[#99a0ae]">Powered by Claude AI</p>
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
  const currentModeDescription =
    activeMode === "grader"
      ? "AI-powered essay grading aligned with Edexcel mark schemes"
      : "Generate comprehensive A*-grade essay structures";

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

      {/* Main Content Area — offset by sidebar */}
      <div className="pl-[19rem] pt-9.5 pb-5 pr-5 transition-all max-lg:pl-5 max-md:pl-4 max-md:pr-4 max-md:pt-3 max-md:pb-4">
        {/* Header Bar */}
        <div className="flex items-center gap-4 mb-4">
          <button
            className="hidden max-lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white transition-colors"
            onClick={() => setSidebarVisible(true)}
          >
            <Menu className="w-5 h-5 text-[#0e121b]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[1.5rem] font-medium font-inter text-[#0e121b] tracking-tight max-md:text-[1rem]">
              {currentModeTitle}
            </h1>
            <p className="text-[0.875rem] font-medium text-[#525866] max-lg:hidden mt-0.5">
              {currentModeDescription}
            </p>
          </div>
        </div>

        {/* Content Wrapper — NeuraTalk chat-wrapper pattern */}
        <div className="content-wrapper min-h-[calc(100svh-8rem)] max-md:min-h-[calc(100svh-5rem)] max-md:rounded-xl">
          <div className="flex-1 overflow-auto scrollbar-none p-7 max-md:p-4">
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

          {/* Footer inside content wrapper */}
          <div className="shrink-0 border-t border-[#e1e4ea] px-7 py-4 max-md:px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#335cff] to-[#97baff] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <p className="text-[0.75rem] text-[#99a0ae]">
                  AI-powered grading aligned with Edexcel IAL Economics mark
                  schemes
                </p>
              </div>
              <p className="text-[0.75rem] text-[#cacfd8]">
                Always verify with your teacher or official mark schemes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
