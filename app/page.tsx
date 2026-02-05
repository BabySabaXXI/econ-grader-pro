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
} from "lucide-react";
import {
  QUESTION_TYPE_OPTIONS,
  MARK_SCHEMES,
  LEVEL_DESCRIPTORS,
} from "@/lib/constants";
import { GradingResult, PlanResult, QuestionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
// ANIMATION
// ============================================================================

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.35, ease: springEase },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: springEase },
  },
};

type ViewState = "input" | "loading" | "results";

// ============================================================================
// SCORE HELPERS
// ============================================================================

function getScoreColor(pct: number): string {
  if (pct >= 80) return "var(--success-text)";
  if (pct >= 60) return "var(--info-text)";
  if (pct >= 45) return "var(--warning-text)";
  return "var(--error-text)";
}

function getScoreStroke(pct: number): string {
  if (pct >= 80) return "#22C55E";
  if (pct >= 60) return "#3B82F6";
  if (pct >= 45) return "#F59E0B";
  return "#EF4444";
}

function getScoreTrail(pct: number): string {
  if (pct >= 80) return "rgba(34,197,94,0.12)";
  if (pct >= 60) return "rgba(59,130,246,0.12)";
  if (pct >= 45) return "rgba(245,158,11,0.12)";
  return "rgba(239,68,68,0.12)";
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
        "inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 border",
        className
      )}
      style={{ borderRadius: "0.25rem" }}
    >
      Level {level} · {label}
    </span>
  );
}

// ============================================================================
// AO CONFIG
// ============================================================================

const AO_CONFIG = {
  ao1: { label: "Knowledge", color: "#3B82F6", bg: "var(--info-muted)", border: "var(--info-border)" },
  ao2: { label: "Application", color: "#22C55E", bg: "var(--success-muted)", border: "var(--success-border)" },
  ao3: { label: "Analysis", color: "#8B5CF6", bg: "var(--purple-muted)", border: "var(--purple-border)" },
  ao4: { label: "Evaluation", color: "#F59E0B", bg: "var(--warning-muted)", border: "var(--warning-border)" },
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
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const c = AO_CONFIG[aoKey];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: c.color }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: c.color }}
          >
            {aoKey.toUpperCase()}
          </span>
          <span className="text-[10px] text-n-4">{c.label}</span>
        </div>
        <span className="text-[13px] font-semibold tabular-nums text-n-7">
          {score}
          <span className="text-n-4 font-normal">/{maxScore}</span>
        </span>
      </div>
      <div
        className="h-1 overflow-hidden"
        style={{ borderRadius: "0.5rem", background: "var(--n-2)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: springEase, delay: 0.3 }}
          className="h-full"
          style={{ borderRadius: "0.5rem", background: c.color }}
        />
      </div>
    </div>
  );
}

function AOBadge({ ao }: { ao: string }) {
  const c = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!c) return null;
  return (
    <span
      className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border"
      style={{
        borderRadius: "0.25rem",
        color: c.color,
        background: c.bg,
        borderColor: c.border,
      }}
    >
      {ao.toUpperCase()}
    </span>
  );
}

// ============================================================================
// GRADING RESULT
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
      className="max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: springEase }}
    >
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[13px] font-medium text-n-4 hover:text-n-7 transition-all mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Edit Answer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left — Essay */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sticky top-6">
            <div className="card-surface overflow-hidden">
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--n-3)",
                  background: "var(--n-1)",
                }}
              >
                <div>
                  <h3 className="text-[13px] font-semibold text-n-7">
                    Your Essay
                  </h3>
                  <p className="text-[11px] text-n-4 mt-0.5">
                    Click highlighted text for feedback
                  </p>
                </div>
              </div>
              <div className="p-5">
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
                    className="p-4"
                    style={{
                      borderRadius: "0.375rem",
                      background: "var(--n-1)",
                    }}
                  >
                    <p className="text-[14px] leading-[1.85] text-n-5 whitespace-pre-wrap">
                      {essayText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Score Cards */}
        <motion.div
          className="lg:col-span-5 xl:col-span-4 space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Score */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden p-5">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      stroke={getScoreTrail(result.overallPercentage)}
                      strokeWidth="6" fill="none"
                    />
                    <motion.circle
                      cx="50" cy="50" r="40"
                      stroke={getScoreStroke(result.overallPercentage)}
                      strokeWidth="6" fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 40 * (1 - result.overallPercentage / 100),
                      }}
                      transition={{ duration: 1, ease: springEase, delay: 0.2 }}
                      strokeLinecap="round"
                      className="origin-center -rotate-90"
                      style={{ transformOrigin: "center" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-lg font-semibold"
                      style={{ color: getScoreColor(result.overallPercentage) }}
                    >
                      {result.overallPercentage}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-semibold text-n-7 tracking-tight">
                    {result.totalMarks}
                    <span className="text-base text-n-4 font-normal">
                      /{markScheme.total}
                    </span>
                  </div>
                  <LevelBadge level={result.levelAchieved} />
                  <p className="text-[11px] text-n-4 mt-2 leading-relaxed">
                    {LEVEL_DESCRIPTORS[result.levelAchieved]}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AO Breakdown */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h4 className="text-[10px] font-semibold text-n-4 uppercase tracking-wider">
                  Assessment Objectives
                </h4>
              </div>
              <div className="px-5 pb-4 space-y-3.5">
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

          {/* Examiner */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h4 className="text-[10px] font-semibold text-n-4 uppercase tracking-wider">
                  Examiner Feedback
                </h4>
              </div>
              <div className="px-5 pb-4">
                <p className="text-[13px] text-n-5 leading-relaxed italic">
                  &ldquo;{result.examinerComment}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Summary counters */}
          {hasHighlights && (
            <motion.div variants={staggerItem}>
              <div className="grid grid-cols-2 gap-3">
                <div className="card-elevated p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--success-text)" }} />
                    <span className="text-[10px] font-semibold text-n-4 uppercase tracking-wider">
                      Earned
                    </span>
                  </div>
                  <div className="text-xl font-semibold" style={{ color: "var(--success-text)" }}>
                    +{result.marksEarned?.reduce((s, m) => s + m.points, 0) || 0}
                  </div>
                </div>
                <div className="card-elevated p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--error-text)" }} />
                    <span className="text-[10px] font-semibold text-n-4 uppercase tracking-wider">
                      Issues
                    </span>
                  </div>
                  <div className="text-xl font-semibold" style={{ color: "var(--error-text)" }}>
                    {result.marksLost?.length || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Strengths */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: "var(--success-text)" }}
                >
                  <Check className="w-3 h-3" />
                  Strengths
                </h4>
              </div>
              <div className="px-5 pb-4 space-y-1.5">
                {result.strengths.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 p-2.5"
                    style={{ borderRadius: "0.375rem", background: "var(--n-1)" }}
                  >
                    <span
                      className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                      style={{ background: "var(--success)" }}
                    />
                    <span className="text-[13px] text-n-5 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div variants={staggerItem}>
            <div className="card-elevated overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: "var(--warning-text)" }}
                >
                  <Target className="w-3 h-3" />
                  Areas to Improve
                </h4>
              </div>
              <div className="px-5 pb-4 space-y-1.5">
                {result.improvements.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 p-2.5"
                    style={{ borderRadius: "0.375rem", background: "var(--n-1)" }}
                  >
                    <span
                      className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                      style={{ background: "var(--warning)" }}
                    />
                    <span className="text-[13px] text-n-5 leading-relaxed">{s}</span>
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
// PLAN RESULT
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
  const [showDetailed, setShowDetailed] = useState(true);
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
          if (!res.ok) throw new Error("Failed");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.diagram) {
            setGeneratedDiagram(data.diagram);
            setDiagramAnalysis(data.analysis || null);
          }
        })
        .catch(() => setDiagramError("Could not generate diagram"))
        .finally(() => setDiagramLoading(false));
    }
  }, [result.diagram, result.thesis, result.diagramExplanation, question, questionType]);

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: springEase }}
    >
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-[13px] font-medium text-n-4 hover:text-n-7 transition-all mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Edit Question
      </button>

      {/* Detail toggle */}
      <div
        className="flex items-center justify-between mb-6 p-3.5"
        style={{
          borderRadius: "0.5rem",
          background: "var(--n-1)",
          border: "1px solid var(--n-3)",
        }}
      >
        <div className="flex items-center gap-2.5">
          {showDetailed ? (
            <Eye className="w-4 h-4 text-n-5" />
          ) : (
            <EyeOff className="w-4 h-4 text-n-4" />
          )}
          <div>
            <p className="text-[13px] font-medium text-n-7">Detailed View</p>
            <p className="text-[11px] text-n-4">Examples, chains, techniques</p>
          </div>
        </div>
        <Switch
          checked={showDetailed}
          onCheckedChange={setShowDetailed}
          className="data-[state=checked]:bg-[var(--primary-1)]"
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
          <div className="card-surface overflow-hidden">
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--n-3)", background: "var(--n-1)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 text-white text-[11px] font-semibold"
                  style={{ borderRadius: "0.375rem", background: "var(--n-7)" }}
                >
                  1
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-n-7">Introduction</h3>
                  <p className="text-[11px] text-n-4">Define key terms & thesis</p>
                </div>
              </div>
              <AOBadge ao="ao1" />
            </div>
            <div className="p-5">
              <div
                className="p-4"
                style={{
                  borderRadius: "0.375rem",
                  background: "var(--warning-muted)",
                  border: "1px solid var(--warning-border)",
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                  style={{ color: "var(--warning-text)" }}
                >
                  <Lightbulb className="w-3 h-3" />
                  What to Write
                </p>
                <p className="text-[13px] text-n-5 leading-relaxed">
                  {result.introduction?.whatToWrite || result.thesis}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Arguments */}
        {result.arguments.map((arg, index) => (
          <motion.div key={index} variants={staggerItem}>
            <div className="card-surface overflow-hidden">
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--n-3)", background: "var(--n-1)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-7 h-7 text-white text-[11px] font-semibold"
                    style={{
                      borderRadius: "0.375rem",
                      background: index === 0 ? "var(--success-text)" : "var(--error-text)",
                    }}
                  >
                    {index + 2}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-n-7">
                      Argument {index === 0 ? "FOR" : "AGAINST"}
                    </h3>
                    <p className="text-[11px] text-n-4 max-w-sm truncate">{arg.point}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <AOBadge ao="ao1" />
                  <AOBadge ao="ao2" />
                  <AOBadge ao="ao3" />
                </div>
              </div>
              <div className="p-5 space-y-3">
                {/* Chain */}
                {showDetailed && arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                  <div
                    className="flex flex-wrap items-center gap-1.5 p-3"
                    style={{
                      borderRadius: "0.375rem",
                      background: "var(--n-1)",
                      border: "1px solid var(--n-3)",
                    }}
                  >
                    <span className="text-[10px] font-semibold text-n-4 uppercase tracking-wider mr-1">
                      Chain:
                    </span>
                    {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span
                          className="px-2 py-1 text-[11px] text-n-5 bg-white border border-n-3"
                          style={{ borderRadius: "0.25rem" }}
                        >
                          {step}
                        </span>
                        {arg.chainOfReasoning && i < Math.min(arg.chainOfReasoning.length - 1, 4) && (
                          <ChevronRight className="w-2.5 h-2.5 text-n-3" />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {showDetailed ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div
                      className="p-3.5"
                      style={{
                        borderRadius: "0.375rem",
                        background: "var(--info-muted)",
                        border: "1px solid var(--info-border)",
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                        style={{ color: "var(--info-text)" }}
                      >
                        <BookOpen className="w-3 h-3" />
                        Theory
                      </p>
                      <p className="text-[13px] text-n-5 leading-relaxed">{arg.explanation}</p>
                    </div>
                    <div
                      className="p-3.5"
                      style={{
                        borderRadius: "0.375rem",
                        background: "var(--success-muted)",
                        border: "1px solid var(--success-border)",
                      }}
                    >
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1"
                        style={{ color: "var(--success-text)" }}
                      >
                        <GraduationCap className="w-3 h-3" />
                        Example
                      </p>
                      <p className="text-[13px] text-n-5 leading-relaxed">{arg.example}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3.5"
                    style={{
                      borderRadius: "0.375rem",
                      background: "var(--n-1)",
                      border: "1px solid var(--n-3)",
                    }}
                  >
                    <p className="text-[13px] font-medium text-n-7">{arg.point}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Evaluation */}
        <motion.div variants={staggerItem}>
          <div className="card-surface overflow-hidden">
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--purple-border)",
                background: "var(--purple-muted)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 text-white text-[11px] font-semibold"
                  style={{ borderRadius: "0.375rem", background: "var(--purple)" }}
                >
                  {result.arguments.length + 2}
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-n-7">Deeper Evaluation</h3>
                  <p className="text-[11px] text-n-5">Critical analysis & limitations</p>
                </div>
              </div>
              <div className="flex gap-1">
                <AOBadge ao="ao3" />
                <AOBadge ao="ao4" />
              </div>
            </div>
            <div className="p-5 space-y-3">
              {showDetailed && (
                <div
                  className="p-3.5"
                  style={{
                    borderRadius: "0.375rem",
                    background: "var(--purple-muted)",
                    border: "1px solid var(--purple-border)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1"
                    style={{ color: "var(--purple-text)" }}
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
                    ).map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-[11px] font-medium bg-white border"
                        style={{
                          borderRadius: "0.25rem",
                          borderColor: "var(--purple-border)",
                          color: "var(--purple-text)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.evaluations.slice(0, showDetailed ? 3 : 2).map((ev, i) => (
                <div
                  key={i}
                  className="p-3.5"
                  style={{
                    borderRadius: "0.375rem",
                    background: "var(--warning-muted)",
                    border: "1px solid var(--warning-border)",
                  }}
                >
                  <h5
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "var(--warning-text)" }}
                  >
                    {ev.point}
                  </h5>
                  {showDetailed && (
                    <p className="text-[13px] text-n-5 leading-relaxed">{ev.development}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Diagram */}
        {result.diagram && result.diagram !== "none" && (
          <motion.div variants={staggerItem}>
            <div className="card-surface overflow-hidden">
              <div
                className="px-5 py-3.5 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid var(--info-border)",
                  background: "var(--info-muted)",
                }}
              >
                <div
                  className="w-7 h-7 flex items-center justify-center"
                  style={{ borderRadius: "0.375rem", background: "var(--info)" }}
                >
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-n-7">
                    {diagramAnalysis?.customTitle || "Required Diagram"}
                  </h3>
                  <p className="text-[11px] text-n-4">
                    {result.diagramSection?.name || result.diagram.replace("-", " ")}
                  </p>
                </div>
              </div>
              <div className="p-5">
                {diagramLoading && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-n-4" />
                    <span className="text-[11px] text-n-4 ml-2">Generating diagram...</span>
                  </div>
                )}

                {generatedDiagram && !diagramLoading && (
                  <div className="mb-4">
                    <div
                      className="flex justify-center p-5 bg-white border"
                      style={{
                        borderRadius: "0.5rem",
                        borderColor: "var(--n-3)",
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
                          <div key={i} className="flex items-start gap-2 text-[13px] text-n-5">
                            <span
                              className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-semibold border"
                              style={{
                                borderRadius: "50%",
                                background: "var(--info-muted)",
                                borderColor: "var(--info-border)",
                                color: "var(--info-text)",
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
                        className="mt-3 p-3"
                        style={{
                          borderRadius: "0.375rem",
                          background: "var(--info-muted)",
                          border: "1px solid var(--info-border)",
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                          style={{ color: "var(--info-text)" }}
                        >
                          Exam Tip
                        </p>
                        <p className="text-[13px] text-n-5 leading-relaxed">
                          {diagramAnalysis.examRelevance}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {diagramError && !diagramLoading && (
                  <div
                    className="mb-4 p-3"
                    style={{
                      borderRadius: "0.375rem",
                      background: "var(--error-muted)",
                      border: "1px solid var(--error-border)",
                    }}
                  >
                    <p className="text-[13px]" style={{ color: "var(--error-text)" }}>
                      {diagramError}
                    </p>
                  </div>
                )}

                {showDetailed && result.diagramSection?.keyLabels && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {result.diagramSection.keyLabels.map((label, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[11px] font-medium border"
                        style={{
                          background: "var(--n-1)",
                          borderColor: "var(--n-3)",
                        }}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {result.diagramExplanation && (
                  <p className="text-[13px] text-n-5 leading-relaxed">
                    {result.diagramExplanation}
                  </p>
                )}

                {showDetailed && diagramAnalysis?.reasoning && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--n-3)" }}>
                    <p className="text-[10px] font-semibold text-n-4 mb-1">AI Analysis</p>
                    <p className="text-[13px] text-n-5 leading-relaxed">
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
          <div className="card-surface overflow-hidden">
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{
                borderBottom: "1px solid var(--success-border)",
                background: "var(--success-muted)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 text-white text-[11px] font-semibold"
                  style={{ borderRadius: "0.375rem", background: "var(--success-text)" }}
                >
                  {result.arguments.length + 3}
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-n-7">Conclusion</h3>
                  <p className="text-[11px] text-n-5">Weigh evidence & judgement</p>
                </div>
              </div>
              <AOBadge ao="ao4" />
            </div>
            <div className="p-5">
              <p className="text-[13px] text-n-5 leading-relaxed">{result.conclusion}</p>
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-n-7">Diagram Uploaded</label>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-[11px] transition-colors"
            style={{ color: "var(--error-text)" }}
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
        <div
          className="overflow-hidden"
          style={{
            borderRadius: "0.5rem",
            border: "1px solid var(--n-3)",
            background: "var(--n-1)",
          }}
        >
          <img src={image} alt="Uploaded diagram" className="w-full max-h-44 object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-n-7">Diagram</label>
        <span
          className="text-[10px] font-medium text-n-4 px-1.5 py-0.5"
          style={{ background: "var(--n-2)", borderRadius: "0.25rem" }}
        >
          Optional
        </span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-8 cursor-pointer transition-all group"
        onClick={() => fileInputRef.current?.click()}
        style={{
          borderRadius: "0.5rem",
          border: "1.5px dashed var(--n-3)",
          background: "var(--n-1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary-1)";
          e.currentTarget.style.background = "var(--primary-muted)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--n-3)";
          e.currentTarget.style.background = "var(--n-1)";
        }}
      >
        <Upload className="w-5 h-5 text-n-4 group-hover:text-primary-1 transition-colors mb-2" />
        <span className="text-[13px] text-n-5">Click to upload</span>
        <span className="text-[11px] text-n-4">PNG, JPG up to 10MB</span>
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
  question, setQuestion, answer, setAnswer,
  questionType, setQuestionType,
  diagram, setDiagram,
  onSubmit, loading, error, onClear,
}: {
  question: string; setQuestion: (v: string) => void;
  answer: string; setAnswer: (v: string) => void;
  questionType: QuestionType; setQuestionType: (v: QuestionType) => void;
  diagram: string | null; setDiagram: (v: string | null) => void;
  onSubmit: () => void; loading: boolean; error: string; onClear: () => void;
}) {
  return (
    <motion.div className="max-w-xl mx-auto" {...pageTransition}>
      <div className="text-center mb-8">
        <div
          className="flex justify-center items-center w-10 h-10 mx-auto mb-3"
          style={{
            borderRadius: "0.5rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <Pen className="w-4.5 h-4.5 text-n-5" />
        </div>
        <h2 className="text-base font-semibold text-n-7 tracking-[-0.01em] mb-1">
          Grade Your Answer
        </h2>
        <p className="text-[13px] text-n-4">AI feedback aligned with Edexcel mark schemes</p>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-n-7">Question Type</label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger className="field-bw" style={{ borderRadius: "0.5rem" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-n-7">Exam Question</label>
            <textarea
              placeholder="Paste the exam question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="field-bw-textarea min-h-[90px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-n-7">Student Answer</label>
            <textarea
              placeholder="Paste the student's answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="field-bw-textarea min-h-[180px]"
            />
          </div>

          <DiagramUpload image={diagram} onUpload={setDiagram} onRemove={() => setDiagram(null)} />

          {error && (
            <Alert
              variant="destructive"
              style={{
                borderRadius: "0.375rem",
                borderColor: "var(--error-border)",
                background: "var(--error-muted)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" style={{ color: "var(--error-text)" }} />
              <AlertDescription className="text-[13px]" style={{ color: "var(--error-text)" }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2.5 pt-1">
            <button className="btn-bw-dark flex-1" onClick={onSubmit} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Grade Answer</>
              )}
            </button>
            <button className="btn-bw-stroke" onClick={onClear}>Clear</button>
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
  question, setQuestion, questionType, setQuestionType,
  onSubmit, loading, error, onClear,
}: {
  question: string; setQuestion: (v: string) => void;
  questionType: QuestionType; setQuestionType: (v: QuestionType) => void;
  onSubmit: () => void; loading: boolean; error: string; onClear: () => void;
}) {
  return (
    <motion.div className="max-w-xl mx-auto" {...pageTransition}>
      <div className="text-center mb-8">
        <div
          className="flex justify-center items-center w-10 h-10 mx-auto mb-3"
          style={{
            borderRadius: "0.5rem",
            background: "var(--n-2)",
            border: "1px solid var(--n-3)",
          }}
        >
          <FileText className="w-4.5 h-4.5 text-n-5" />
        </div>
        <h2 className="text-base font-semibold text-n-7 tracking-[-0.01em] mb-1">
          Plan Your Essay
        </h2>
        <p className="text-[13px] text-n-4">Generate a comprehensive A*-grade structure</p>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-n-7">Question Type</label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger className="field-bw" style={{ borderRadius: "0.5rem" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-n-7">Essay Question</label>
            <textarea
              placeholder="Type or paste the essay question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="field-bw-textarea min-h-[120px]"
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              style={{
                borderRadius: "0.375rem",
                borderColor: "var(--error-border)",
                background: "var(--error-muted)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" style={{ color: "var(--error-text)" }} />
              <AlertDescription className="text-[13px]" style={{ color: "var(--error-text)" }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2.5 pt-1">
            <button className="btn-bw-dark flex-1" onClick={onSubmit} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" />Generate Plan</>
              )}
            </button>
            <button className="btn-bw-stroke" onClick={onClear}>Clear</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"grader" | "planner">("grader");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [graderQuestion, setGraderQuestion] = useState("");
  const [graderAnswer, setGraderAnswer] = useState("");
  const [graderQuestionType, setGraderQuestionType] = useState<QuestionType>("evaluate-20");
  const [graderDiagram, setGraderDiagram] = useState<string | null>(null);
  const [graderResult, setGraderResult] = useState<GradingResult | null>(null);
  const [graderLoading, setGraderLoading] = useState(false);
  const [graderError, setGraderError] = useState("");
  const [graderView, setGraderView] = useState<ViewState>("input");

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
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: graderAnswer,
          question: graderQuestion,
          questionType: graderQuestionType,
          diagramImage: graderDiagram || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to grade");
      }
      setGraderResult(await res.json());
      setGraderView("results");
    } catch (e) {
      setGraderError(e instanceof Error ? e.message : "An error occurred");
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
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: plannerQuestion,
          questionType: plannerQuestionType,
          includeDiagram: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to generate plan");
      }
      setPlannerResult(await res.json());
      setPlannerView("results");
    } catch (e) {
      setPlannerError(e instanceof Error ? e.message : "An error occurred");
      setPlannerView("input");
    } finally {
      setPlannerLoading(false);
    }
  };

  const clearGrader = () => {
    setGraderQuestion(""); setGraderAnswer(""); setGraderDiagram(null);
    setGraderResult(null); setGraderError(""); setGraderView("input");
  };

  const clearPlanner = () => {
    setPlannerQuestion(""); setPlannerResult(null);
    setPlannerError(""); setPlannerView("input");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeMode={activeMode}
        onModeChange={setActiveMode}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Main — 16.5rem sidebar width */}
      <div className="pl-[16.5rem] pt-6 pb-4 pr-4 transition-all max-lg:pl-4 max-md:pl-3 max-md:pr-3 max-md:pt-3 max-md:pb-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            className="hidden max-lg:flex items-center justify-center w-8 h-8 transition-colors"
            onClick={() => setSidebarVisible(true)}
            style={{
              borderRadius: "0.375rem",
              border: "1px solid var(--n-3)",
              background: "white",
            }}
          >
            <PanelLeft className="w-4 h-4 text-n-7" />
          </button>
          <h1 className="text-[15px] font-semibold text-n-7 tracking-[-0.01em]">
            {activeMode === "grader" ? "Exam Grader" : "Essay Planner"}
          </h1>
        </div>

        {/* Content */}
        <div className="content-wrapper min-h-[calc(100svh-6rem)] max-md:min-h-[calc(100svh-4.5rem)]">
          <div className="flex-1 overflow-auto scrollbar-none p-7 max-md:p-4">
            <AnimatePresence mode="wait">
              {activeMode === "grader" ? (
                <div key="grader">
                  {graderView === "input" && (
                    <GraderInputForm
                      question={graderQuestion} setQuestion={setGraderQuestion}
                      answer={graderAnswer} setAnswer={setGraderAnswer}
                      questionType={graderQuestionType} setQuestionType={setGraderQuestionType}
                      diagram={graderDiagram} setDiagram={setGraderDiagram}
                      onSubmit={handleGrade} loading={graderLoading}
                      error={graderError} onClear={clearGrader}
                    />
                  )}
                  {graderView === "loading" && (
                    <GradingLoader isLoading={true} message="Analyzing your essay..." />
                  )}
                  {graderView === "results" && graderResult && (
                    <GradingResultDisplay
                      result={graderResult} questionType={graderQuestionType}
                      essayText={graderAnswer} onBack={() => setGraderView("input")}
                    />
                  )}
                </div>
              ) : (
                <div key="planner">
                  {plannerView === "input" && (
                    <PlannerInputForm
                      question={plannerQuestion} setQuestion={setPlannerQuestion}
                      questionType={plannerQuestionType} setQuestionType={setPlannerQuestionType}
                      onSubmit={handlePlan} loading={plannerLoading}
                      error={plannerError} onClear={clearPlanner}
                    />
                  )}
                  {plannerView === "loading" && (
                    <GradingLoader isLoading={true} message="Generating essay plan..." />
                  )}
                  {plannerView === "results" && plannerResult && (
                    <PlanResultDisplay
                      result={plannerResult} onBack={() => setPlannerView("input")}
                      question={plannerQuestion} questionType={plannerQuestionType}
                    />
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="shrink-0 px-7 py-3 max-md:px-4" style={{ borderTop: "1px solid var(--n-3)" }}>
            <p className="text-[11px] text-n-4 text-center">
              AI-powered grading · Edexcel IAL Economics · Always verify with official mark schemes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
