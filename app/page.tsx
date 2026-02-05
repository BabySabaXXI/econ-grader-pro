"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  TrendingUp,
  TrendingDown,
  Sparkles,
  Target,
  Zap,
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
import { GradingLoader } from "@/components/ui/grading-loader";
import Sidebar from "@/components/Sidebar";
import { DiagramRenderer } from "@/components/diagrams/DiagramRenderer";
import type { DiagramTemplate } from "@/lib/diagrams/types";

// ============================================================================
// ANIMATION — Natural, understated motion
// ============================================================================

const naturalEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.5, ease: naturalEase },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: naturalEase },
  },
};

// ============================================================================
// VIEW STATES
// ============================================================================

type ViewState = "input" | "loading" | "results";

// ============================================================================
// SCORE HELPERS — Muted, natural tones
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-[#5F6D53]";
  if (percentage >= 60) return "text-[#6B7FA3]";
  if (percentage >= 45) return "text-[#B8926A]";
  return "text-[#B35B5B]";
}

function getScoreRingColor(percentage: number): string {
  if (percentage >= 80) return "stroke-[#7C8B6F]";
  if (percentage >= 60) return "stroke-[#6B7FA3]";
  if (percentage >= 45) return "stroke-[#B8926A]";
  return "stroke-[#B35B5B]";
}

function getScoreRingTrailColor(percentage: number): string {
  if (percentage >= 80) return "rgba(124, 139, 111, 0.12)";
  if (percentage >= 60) return "rgba(107, 127, 163, 0.12)";
  if (percentage >= 45) return "rgba(184, 146, 106, 0.12)";
  return "rgba(179, 91, 91, 0.12)";
}

// ============================================================================
// LEVEL BADGE
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const config: Record<number, { label: string; className: string }> = {
    5: { label: "Excellent", className: "badge-level-5" },
    4: { label: "Good", className: "badge-level-4" },
    3: { label: "Sound", className: "badge-level-3" },
    2: { label: "Basic", className: "badge-level-2" },
    1: { label: "Limited", className: "badge-level-1" },
  };

  const { label, className } = config[level] || config[1];

  return (
    <span
      className={cn(
        "inline-flex items-center text-caption2 font-medium font-inter px-2.5 py-1 border",
        className
      )}
      style={{ borderRadius: "1rem" }}
    >
      Level {level} · {label}
    </span>
  );
}

// ============================================================================
// AO CONFIG — Natural accent palette
// ============================================================================

const AO_CONFIG = {
  ao1: {
    label: "Knowledge",
    color: "#6B7FA3",
    bgLight: "var(--information-lighter)",
    borderLight: "var(--information-light)",
  },
  ao2: {
    label: "Application",
    color: "#5F6D53",
    bgLight: "var(--success-lighter)",
    borderLight: "var(--success-light)",
  },
  ao3: {
    label: "Analysis",
    color: "#8B7BA8",
    bgLight: "var(--feature-lighter)",
    borderLight: "var(--feature-light)",
  },
  ao4: {
    label: "Evaluation",
    color: "#B8926A",
    bgLight: "var(--away-lighter)",
    borderLight: "var(--away-light)",
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: config.color }}
          />
          <span
            className="text-caption2 font-medium font-inter uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {aoKey.toUpperCase()}
          </span>
          <span className="text-caption2 text-n-4">{config.label}</span>
        </div>
        <span className="text-base2 font-medium font-inter tabular-nums text-n-7">
          {score}
          <span className="text-n-4 font-normal">/{maxScore}</span>
        </span>
      </div>
      <div
        className="h-1 overflow-hidden"
        style={{
          borderRadius: "0.5rem",
          background: "var(--n-3)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: naturalEase, delay: 0.3 }}
          className="h-full"
          style={{
            borderRadius: "0.5rem",
            background: config.color,
          }}
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
      className="inline-flex items-center text-2xs font-medium uppercase tracking-wider px-2 py-0.5 border"
      style={{
        borderRadius: "1rem",
        color: config.color,
        background: config.bgLight,
        borderColor: config.borderLight,
      }}
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: naturalEase }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-base2 font-inter font-medium text-n-4 hover:text-n-7 transition-all duration-300 mb-6"
      >
        <div
          className="flex items-center justify-center w-7 h-7 transition-all duration-300 group-hover:shadow-jp-sm"
          style={{
            borderRadius: "0.375rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </div>
        <span>Edit Answer</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column — Essay View */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sticky top-6">
            <div className="card-jp overflow-hidden">
              {/* Header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--n-3)",
                  background: "var(--n-2)",
                }}
              >
                <div>
                  <h3 className="text-base1 font-inter text-n-7">
                    Your Essay
                  </h3>
                  <p className="text-caption2 text-n-4 mt-0.5">
                    Click highlighted text for feedback
                  </p>
                </div>
                {hasHighlights && (
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-1"
                        style={{
                          borderRadius: "1px",
                          background: "rgba(124, 139, 111, 0.4)",
                        }}
                      />
                      <span className="text-caption2 text-n-4">Earned</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-1"
                        style={{
                          borderRadius: "1px",
                          background: "rgba(179, 91, 91, 0.4)",
                        }}
                      />
                      <span className="text-caption2 text-n-4">Lost</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Essay content */}
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
                  <div
                    className="p-5"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                    }}
                  >
                    <p className="text-base2 leading-relaxed text-n-5 whitespace-pre-wrap">
                      {essayText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Score Cards */}
        <motion.div
          className="lg:col-span-5 xl:col-span-4 space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Overall Score */}
          <motion.div variants={staggerItem}>
            <div className="card-jp-elevated overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-5">
                  {/* Score Ring */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-24 h-24" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={getScoreRingTrailColor(result.overallPercentage)}
                        strokeWidth="6"
                        fill="none"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 40 * (1 - result.overallPercentage / 100),
                        }}
                        transition={{
                          duration: 1,
                          ease: naturalEase,
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
                          "text-h5 font-inter",
                          getScoreColor(result.overallPercentage)
                        )}
                      >
                        {result.overallPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-h4 font-inter text-n-7 mb-1.5 tracking-tight">
                      {result.totalMarks}
                      <span className="text-h6 text-n-4 font-normal">
                        /{markScheme.total}
                      </span>
                    </div>
                    <LevelBadge level={result.levelAchieved} />
                    <p className="text-caption2 text-n-4 mt-2.5 leading-relaxed">
                      {LEVEL_DESCRIPTORS[result.levelAchieved]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AO Breakdown */}
          <motion.div variants={staggerItem}>
            <div className="card-jp-elevated overflow-hidden">
              <div className="px-6 pt-5 pb-2.5">
                <h4 className="text-caption2 font-medium font-inter text-n-4 uppercase tracking-wider">
                  Assessment Objectives
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-4">
                {markScheme.ao1 > 0 && (
                  <AOScoreBar aoKey="ao1" score={result.aoScores.ao1} maxScore={markScheme.ao1} />
                )}
                {markScheme.ao2 > 0 && (
                  <AOScoreBar aoKey="ao2" score={result.aoScores.ao2} maxScore={markScheme.ao2} />
                )}
                {markScheme.ao3 > 0 && (
                  <AOScoreBar aoKey="ao3" score={result.aoScores.ao3} maxScore={markScheme.ao3} />
                )}
                {markScheme.ao4 > 0 && (
                  <AOScoreBar aoKey="ao4" score={result.aoScores.ao4} maxScore={markScheme.ao4} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Examiner Comment */}
          <motion.div variants={staggerItem}>
            <div className="card-jp-elevated overflow-hidden">
              <div className="px-6 pt-5 pb-2.5">
                <h4 className="text-caption2 font-medium font-inter text-n-4 uppercase tracking-wider">
                  Examiner Feedback
                </h4>
              </div>
              <div className="px-6 pb-5">
                <p className="text-base2 text-n-5 leading-relaxed italic">
                  &ldquo;{result.examinerComment}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Earned / Issues Summary */}
          {hasHighlights && (
            <motion.div variants={staggerItem}>
              <div className="grid grid-cols-2 gap-3">
                <div className="card-jp-elevated p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--success-dark)" }} />
                    <span className="text-caption2 font-medium text-n-4 uppercase tracking-wider font-inter">
                      Earned
                    </span>
                  </div>
                  <div className="text-h5 font-inter tracking-tight" style={{ color: "var(--success-dark)" }}>
                    +{result.marksEarned?.reduce((sum, m) => sum + m.points, 0) || 0}
                  </div>
                  <div className="text-caption2 text-n-4 mt-0.5">Marks Earned</div>
                </div>
                <div className="card-jp-elevated p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--error-base)" }} />
                    <span className="text-caption2 font-medium text-n-4 uppercase tracking-wider font-inter">
                      Issues
                    </span>
                  </div>
                  <div className="text-h5 font-inter tracking-tight" style={{ color: "var(--error-base)" }}>
                    {result.marksLost?.length || 0}
                  </div>
                  <div className="text-caption2 text-n-4 mt-0.5">Issues Found</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strengths */}
          <motion.div variants={staggerItem}>
            <div className="card-jp-elevated overflow-hidden">
              <div className="px-6 pt-5 pb-2.5">
                <h4
                  className="text-caption2 font-medium font-inter uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: "var(--success-dark)" }}
                >
                  <Check className="w-3 h-3" />
                  Strengths
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-2">
                {result.strengths.slice(0, 3).map((strength, index) => (
                  <div
                    key={index}
                    className="flex gap-2.5 p-3"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                      style={{ background: "var(--success-dark)" }}
                    />
                    <span className="text-base2 text-n-5 leading-relaxed">
                      {strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div variants={staggerItem}>
            <div className="card-jp-elevated overflow-hidden">
              <div className="px-6 pt-5 pb-2.5">
                <h4
                  className="text-caption2 font-medium font-inter uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: "var(--away-base)" }}
                >
                  <Target className="w-3 h-3" />
                  Areas to Improve
                </h4>
              </div>
              <div className="px-6 pb-5 space-y-2">
                {result.improvements.slice(0, 3).map((improvement, index) => (
                  <div
                    key={index}
                    className="flex gap-2.5 p-3"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                      style={{ background: "var(--away-base)" }}
                    />
                    <span className="text-base2 text-n-5 leading-relaxed">
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
  question,
  questionType,
}: {
  result: PlanResult;
  onBack: () => void;
  question?: string;
  questionType?: string;
}) {
  const [showDetailedPlan, setShowDetailedPlan] = useState(true);
  const [generatedDiagram, setGeneratedDiagram] = useState<DiagramTemplate | null>(null);
  const [diagramAnalysis, setDiagramAnalysis] = useState<{
    customTitle?: string;
    reasoning?: string;
    annotations?: string[];
    examRelevance?: string;
  } | null>(null);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramError, setDiagramError] = useState("");

  useEffect(() => {
    if (result.diagram && result.diagram !== "none" && question) {
      setDiagramLoading(true);
      setDiagramError("");
      fetch("/api/diagram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          questionType: questionType || "evaluate-20",
          planThesis: result.thesis,
          diagramType: result.diagram,
          diagramExplanation: result.diagramExplanation,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to generate diagram");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.diagram) {
            setGeneratedDiagram(data.diagram);
            setDiagramAnalysis(data.analysis || null);
          }
        })
        .catch((err) => {
          console.error("Diagram generation failed:", err);
          setDiagramError("Could not generate diagram");
        })
        .finally(() => setDiagramLoading(false));
    }
  }, [result.diagram, result.thesis, result.diagramExplanation, question, questionType]);

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: naturalEase }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-base2 font-inter font-medium text-n-4 hover:text-n-7 transition-all duration-300 mb-6"
      >
        <div
          className="flex items-center justify-center w-7 h-7 transition-all duration-300 group-hover:shadow-jp-sm"
          style={{
            borderRadius: "0.375rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </div>
        <span>Edit Question</span>
      </button>

      {/* Detail Toggle */}
      <div
        className="flex items-center justify-between mb-6 p-4"
        style={{
          borderRadius: "0.5rem",
          background: "var(--n-2)",
          border: "1px solid var(--n-3)",
        }}
      >
        <div className="flex items-center gap-2.5">
          {showDetailedPlan ? (
            <Eye className="w-4 h-4 text-n-5" />
          ) : (
            <EyeOff className="w-4 h-4 text-n-4" />
          )}
          <div>
            <p className="text-base2 font-inter text-n-7">Detailed View</p>
            <p className="text-caption2 text-n-4">
              Examples, reasoning chains, techniques
            </p>
          </div>
        </div>
        <Switch
          checked={showDetailedPlan}
          onCheckedChange={setShowDetailedPlan}
          className="data-[state=checked]:bg-primary-1"
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
          <div className="card-jp-hover overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--n-3)",
                background: "var(--n-2)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 text-white text-caption1 font-inter"
                  style={{ borderRadius: "0.375rem", background: "var(--n-7)" }}
                >
                  1
                </span>
                <div>
                  <h3 className="text-base1 font-inter text-n-7">Introduction</h3>
                  <p className="text-caption2 text-n-4 mt-0.5">
                    Define key terms and state your thesis
                  </p>
                </div>
              </div>
              <AOBadge ao="ao1" />
            </div>
            <div className="p-6">
              <div
                className="p-4 border"
                style={{
                  borderRadius: "0.5rem",
                  background: "var(--away-lighter)",
                  borderColor: "var(--away-light)",
                }}
              >
                <p
                  className="text-caption2 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter"
                  style={{ color: "#8B6E45" }}
                >
                  <Lightbulb className="w-3 h-3" />
                  What to Write
                </p>
                <p className="text-base2 text-n-5 leading-relaxed">
                  {result.introduction?.whatToWrite || result.thesis}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Arguments */}
        {result.arguments.map((arg, index) => (
          <motion.div key={index} variants={staggerItem}>
            <div className="card-jp-hover overflow-hidden">
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--n-3)",
                  background: "var(--n-2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-8 h-8 text-white text-caption1 font-inter"
                    style={{
                      borderRadius: "0.375rem",
                      background: index === 0 ? "var(--success-dark)" : "var(--error-base)",
                    }}
                  >
                    {index + 2}
                  </span>
                  <div>
                    <h3 className="text-base1 font-inter text-n-7">
                      Argument {index === 0 ? "FOR" : "AGAINST"}
                    </h3>
                    <p className="text-caption2 text-n-4 mt-0.5 max-w-md truncate">
                      {arg.point}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <AOBadge ao="ao1" />
                  <AOBadge ao="ao2" />
                  <AOBadge ao="ao3" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Chain of Reasoning */}
                {showDetailedPlan && arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                  <div
                    className="flex flex-wrap items-center gap-2 p-4 border"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                      borderColor: "var(--n-3)",
                    }}
                  >
                    <span className="text-caption2 font-medium text-n-4 uppercase tracking-wider mr-1 font-inter">
                      Chain:
                    </span>
                    {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span
                          className="px-2.5 py-1 text-caption2 text-n-5 font-medium border"
                          style={{
                            background: "var(--n-1)",
                            borderColor: "var(--n-3)",
                            borderRadius: "0.375rem",
                          }}
                        >
                          {step}
                        </span>
                        {arg.chainOfReasoning && i < Math.min(arg.chainOfReasoning.length - 1, 4) && (
                          <ChevronRight className="w-2.5 h-2.5 text-n-4" />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Theory and Example */}
                {showDetailedPlan ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div
                      className="p-4 border"
                      style={{
                        borderRadius: "0.5rem",
                        background: "var(--information-lighter)",
                        borderColor: "var(--information-light)",
                      }}
                    >
                      <p
                        className="text-caption2 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter"
                        style={{ color: "var(--information-base)" }}
                      >
                        <BookOpen className="w-3 h-3" />
                        Theory / Explanation
                      </p>
                      <p className="text-base2 text-n-5 leading-relaxed">
                        {arg.explanation}
                      </p>
                    </div>
                    <div
                      className="p-4 border"
                      style={{
                        borderRadius: "0.5rem",
                        background: "var(--success-lighter)",
                        borderColor: "var(--success-light)",
                      }}
                    >
                      <p
                        className="text-caption2 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 font-inter"
                        style={{ color: "var(--success-dark)" }}
                      >
                        <GraduationCap className="w-3 h-3" />
                        Real-World Example
                      </p>
                      <p className="text-base2 text-n-5 leading-relaxed">
                        {arg.example}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-4 border"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--n-2)",
                      borderColor: "var(--n-3)",
                    }}
                  >
                    <p className="text-base2 font-inter text-n-7">{arg.point}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Evaluation */}
        <motion.div variants={staggerItem}>
          <div className="card-jp-hover overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--feature-light)",
                background: "var(--feature-lighter)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 text-white text-caption1 font-inter"
                  style={{ borderRadius: "0.375rem", background: "var(--feature-base)" }}
                >
                  {result.arguments.length + 2}
                </span>
                <div>
                  <h3 className="text-base1 font-inter text-n-7">Deeper Evaluation</h3>
                  <p className="text-caption2 text-n-5 mt-0.5">
                    Critical analysis and limitations
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <AOBadge ao="ao3" />
                <AOBadge ao="ao4" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {showDetailedPlan && (
                <div
                  className="p-4 border"
                  style={{
                    borderRadius: "0.5rem",
                    background: "var(--feature-lighter)",
                    borderColor: "var(--feature-light)",
                  }}
                >
                  <p
                    className="text-caption2 font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-inter"
                    style={{ color: "var(--feature-base)" }}
                  >
                    <Crosshair className="w-3 h-3" />
                    Evaluation Techniques
                  </p>
                  <div className="flex flex-wrap gap-1.5">
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
                        className="px-2.5 py-1 text-caption2 font-medium border"
                        style={{
                          borderRadius: "0.375rem",
                          background: "var(--n-1)",
                          borderColor: "var(--feature-light)",
                          color: "var(--feature-base)",
                        }}
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
                    className="p-4 border"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--away-lighter)",
                      borderColor: "var(--away-light)",
                    }}
                  >
                    <h5 className="text-base2 font-inter mb-1.5" style={{ color: "#8B6E45" }}>
                      {evaluation.point}
                    </h5>
                    {showDetailedPlan && (
                      <p className="text-base2 text-n-5 leading-relaxed">
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
            <div className="card-jp-hover overflow-hidden">
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid var(--verified-light)",
                  background: "var(--verified-lighter)",
                }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ borderRadius: "0.375rem", background: "var(--verified-base)" }}
                >
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base2 font-inter uppercase tracking-wide text-n-7">
                    {diagramAnalysis?.customTitle || "Required Diagram"}
                  </h3>
                  <p className="text-caption2 text-n-4 mt-0.5">
                    {result.diagramSection?.name || result.diagram.replace("-", " ")}
                  </p>
                </div>
              </div>
              <div className="p-6">
                {diagramLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="flex flex-col items-center gap-2.5">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--verified-base)" }} />
                      <span className="text-caption2 text-n-4">Generating diagram...</span>
                    </div>
                  </div>
                )}

                {generatedDiagram && !diagramLoading && (
                  <div className="mb-5">
                    <div
                      className="flex justify-center p-5 border"
                      style={{
                        borderRadius: "0.5rem",
                        borderColor: "var(--n-3)",
                        background: "white",
                      }}
                    >
                      <DiagramRenderer
                        diagram={generatedDiagram}
                        showLabels={true}
                        showAreas={true}
                        showPoints={true}
                        width={400}
                        height={400}
                        className="max-w-full"
                      />
                    </div>

                    {diagramAnalysis?.annotations && diagramAnalysis.annotations.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {diagramAnalysis.annotations.map((note, i) => (
                          <div key={i} className="flex items-start gap-2 text-base2 text-n-5">
                            <span
                              className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-2xs font-medium border"
                              style={{
                                borderRadius: "50%",
                                background: "var(--verified-lighter)",
                                borderColor: "var(--verified-light)",
                                color: "var(--verified-base)",
                              }}
                            >
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{note}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {diagramAnalysis?.examRelevance && (
                      <div
                        className="mt-3 p-3.5 border"
                        style={{
                          borderRadius: "0.5rem",
                          background: "var(--information-lighter)",
                          borderColor: "var(--information-light)",
                        }}
                      >
                        <p className="text-caption2 font-medium uppercase tracking-wider mb-1" style={{ color: "var(--information-base)" }}>
                          Exam Tip
                        </p>
                        <p className="text-base2 text-n-5 leading-relaxed">
                          {diagramAnalysis.examRelevance}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {diagramError && !diagramLoading && (
                  <div
                    className="mb-4 p-3.5 border"
                    style={{
                      borderRadius: "0.5rem",
                      background: "var(--error-lighter)",
                      borderColor: "var(--error-light)",
                    }}
                  >
                    <p className="text-base2" style={{ color: "var(--error-base)" }}>
                      {diagramError}
                    </p>
                  </div>
                )}

                {showDetailedPlan && result.diagramSection?.keyLabels && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {result.diagramSection.keyLabels.map((label, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-caption2 font-medium border"
                        style={{
                          background: "var(--n-2)",
                          borderColor: "var(--n-3)",
                        }}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {result.diagramExplanation && (
                  <p className="text-base2 text-n-5 leading-relaxed">
                    {result.diagramExplanation}
                  </p>
                )}

                {showDetailedPlan && diagramAnalysis?.reasoning && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--n-3)" }}>
                    <p className="text-caption2 font-medium text-n-4 mb-1">AI Analysis</p>
                    <p className="text-base2 text-n-5 leading-relaxed">
                      {diagramAnalysis.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Conclusion */}
        <motion.div variants={staggerItem}>
          <div className="card-jp-hover overflow-hidden">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--success-light)",
                background: "var(--success-lighter)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-8 h-8 text-white text-caption1 font-inter"
                  style={{ borderRadius: "0.375rem", background: "var(--success-dark)" }}
                >
                  {result.arguments.length + 3}
                </span>
                <div>
                  <h3 className="text-base1 font-inter text-n-7">Conclusion</h3>
                  <p className="text-caption2 text-n-5 mt-0.5">
                    Weigh evidence and give your judgement
                  </p>
                </div>
              </div>
              <AOBadge ao="ao4" />
            </div>
            <div className="p-6">
              <p className="text-base2 text-n-5 leading-relaxed">
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
// DIAGRAM UPLOAD
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
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-base2 font-inter text-n-7">Diagram Uploaded</label>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-caption2 transition-colors"
            style={{ color: "var(--error-base)" }}
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
        <div
          className="overflow-hidden border"
          style={{
            borderRadius: "0.5rem",
            borderColor: "var(--n-3)",
            background: "var(--n-1)",
          }}
        >
          <img
            src={image}
            alt="Uploaded diagram"
            className="w-full max-h-44 object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-base2 font-inter text-n-7">Diagram Upload</label>
        <span
          className="text-2xs font-medium text-n-4 px-1.5 py-0.5"
          style={{
            background: "var(--n-2)",
            borderRadius: "0.25rem",
            border: "1px solid var(--n-3)",
          }}
        >
          Optional
        </span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 group"
        onClick={() => fileInputRef.current?.click()}
        style={{
          borderRadius: "0.5rem",
          border: "1px dashed var(--n-3)",
          background: "var(--n-2)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary-1)";
          e.currentTarget.style.background = "rgba(74, 85, 104, 0.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--n-3)";
          e.currentTarget.style.background = "var(--n-2)";
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center mb-2.5 transition-all duration-300"
          style={{
            borderRadius: "0.5rem",
            background: "var(--n-1)",
            border: "1px solid var(--n-3)",
          }}
        >
          <Upload className="w-4 h-4 text-n-4 group-hover:text-primary-1 transition-colors duration-300" />
        </div>
        <span className="text-base2 text-n-5 mb-0.5">Click to upload</span>
        <span className="text-caption2 text-n-4">PNG, JPG up to 10MB</span>
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
    <motion.div className="max-w-xl mx-auto" {...pageTransition}>
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="flex justify-center items-center w-12 h-12 mx-auto mb-4"
          style={{
            borderRadius: "0.5rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <Pen className="w-5 h-5 text-n-5" />
        </div>
        <h2 className="text-h5 font-inter text-n-7 tracking-tight mb-1.5">
          Grade Your Answer
        </h2>
        <p className="text-base2 text-n-4">
          AI-powered feedback aligned with Edexcel mark schemes
        </p>
      </div>

      <div className="card-jp overflow-hidden">
        <div className="p-7 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-base2 font-inter text-n-7">Question Type</label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger
                className="h-11 border-n-3 hover:border-n-4 transition-all duration-300 focus:border-primary-1 text-n-7"
                style={{ borderRadius: "0.5rem", background: "var(--n-1)" }}
              >
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
            <label className="text-base2 font-inter text-n-7">Exam Question</label>
            <textarea
              placeholder="Paste the exam question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="field-jp-textarea min-h-[90px]"
            />
          </div>

          {/* Student Answer */}
          <div className="space-y-2">
            <label className="text-base2 font-inter text-n-7">Student Answer</label>
            <textarea
              placeholder="Paste the student's answer here for grading..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="field-jp-textarea min-h-[180px]"
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
              className="border"
              style={{
                borderRadius: "0.5rem",
                borderColor: "var(--error-light)",
                background: "var(--error-lighter)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" style={{ color: "var(--error-base)" }} />
              <AlertDescription style={{ color: "var(--error-base)" }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button className="btn-jp-dark flex-1" onClick={onSubmit} disabled={loading}>
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
            <button className="btn-jp-outline" onClick={onClear}>
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
    <motion.div className="max-w-xl mx-auto" {...pageTransition}>
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="flex justify-center items-center w-12 h-12 mx-auto mb-4"
          style={{
            borderRadius: "0.5rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <FileText className="w-5 h-5 text-n-5" />
        </div>
        <h2 className="text-h5 font-inter text-n-7 tracking-tight mb-1.5">
          Plan Your Essay
        </h2>
        <p className="text-base2 text-n-4">
          Generate a comprehensive A*-grade essay structure
        </p>
      </div>

      <div className="card-jp overflow-hidden">
        <div className="p-7 space-y-6">
          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-base2 font-inter text-n-7">Question Type</label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger
                className="h-11 border-n-3 hover:border-n-4 transition-all duration-300 focus:border-primary-1 text-n-7"
                style={{ borderRadius: "0.5rem", background: "var(--n-1)" }}
              >
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
            <label className="text-base2 font-inter text-n-7">Essay Question</label>
            <textarea
              placeholder="Type or paste the essay question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="field-jp-textarea min-h-[120px]"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert
              variant="destructive"
              className="border"
              style={{
                borderRadius: "0.5rem",
                borderColor: "var(--error-light)",
                background: "var(--error-lighter)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" style={{ color: "var(--error-base)" }} />
              <AlertDescription style={{ color: "var(--error-base)" }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button className="btn-jp-dark flex-1" onClick={onSubmit} disabled={loading}>
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
            <button className="btn-jp-outline" onClick={onClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"grader" | "planner">("grader");
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  const currentModeTitle = activeMode === "grader" ? "Exam Grader" : "Essay Planner";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeMode={activeMode}
        onModeChange={(mode) => setActiveMode(mode)}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Main Content */}
      <div
        className="pt-6 pb-4 pr-4 transition-all duration-500 max-lg:pl-4 max-md:pl-3 max-md:pr-3 max-md:pt-3 max-md:pb-3"
        style={{ paddingLeft: "18rem" }}
      >
        {/* Header Bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="hidden max-lg:flex items-center justify-center w-9 h-9 transition-colors duration-200"
            onClick={() => setSidebarVisible(true)}
            style={{
              borderRadius: "0.5rem",
              border: "1px solid var(--n-3)",
              background: "var(--n-1)",
            }}
          >
            <PanelLeft className="w-4.5 h-4.5 text-n-7" />
          </button>
          <h1 className="text-h6 font-inter text-n-7 tracking-tight max-md:text-base1">
            {currentModeTitle}
          </h1>
        </div>

        {/* Content Container */}
        <div className="content-wrapper min-h-[calc(100svh-5.5rem)] max-md:min-h-[calc(100svh-4rem)]">
          <div className="flex-1 overflow-auto scrollbar-none p-8 max-md:p-4">
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
                    <GradingLoader isLoading={true} message="Analyzing your essay..." />
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
                    <GradingLoader isLoading={true} message="Generating essay plan..." />
                  )}
                  {plannerView === "results" && plannerResult && (
                    <PlanResultDisplay
                      result={plannerResult}
                      onBack={() => setPlannerView("input")}
                      question={plannerQuestion}
                      questionType={plannerQuestionType}
                    />
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-8 py-3 max-md:px-4"
            style={{ borderTop: "1px solid var(--n-3)" }}
          >
            <p className="text-caption2 text-n-4 text-center">
              AI-powered grading · Edexcel IAL Economics · Always verify with official mark schemes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
