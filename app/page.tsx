"use client";

import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowChevronRight,
  CircleCheck,
  CircleCheckFill,
  CircleExclamation,
  CircleExclamationFill,
  Eye,
  EyeSlash,
  FileText,
  PencilToSquare,
  Sparkles,
  SparklesFill,
  TrashBin,
  ArrowUpFromLine,
  BookOpen,
  ListCheck,
  ChartColumn,
  TargetDart,
  ArrowUpRightFromSquare,
  Bulb,
  GraduationCap,
} from "@gravity-ui/icons";
import {
  QUESTION_TYPE_OPTIONS,
  MARK_SCHEMES,
  LEVEL_DESCRIPTORS,
} from "@/lib/constants";
import {
  GradingResult,
  PlanResult,
  QuestionType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { EssayViewer } from "@/components/ui/essay-viewer";

// ============================================================================
// TYPES
// ============================================================================

type ViewState = "input" | "loading" | "results";
type ActiveMode = "grader" | "planner";

// ============================================================================
// SCORE HELPERS
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "hsl(var(--success))";
  if (percentage >= 60) return "hsl(var(--ao1))";
  if (percentage >= 45) return "hsl(var(--warning))";
  return "hsl(var(--error))";
}

function getLevelClass(level: number): string {
  const classes: Record<number, string> = {
    5: "badge-level-5",
    4: "badge-level-4",
    3: "badge-level-3",
    2: "badge-level-2",
    1: "badge-level-1",
  };
  return classes[level] || classes[1];
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div
        className="border-b border-border/40"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">
                Econ Grader
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">
                Edexcel IAL
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// NAVIGATION COMPONENT
// ============================================================================

function Navigation({
  activeMode,
  setActiveMode,
}: {
  activeMode: ActiveMode;
  setActiveMode: (mode: ActiveMode) => void;
}) {
  return (
    <nav className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="inline-flex p-1.5 rounded-2xl bg-muted/50 border border-border/50"
          style={{ boxShadow: "var(--shadow-inner)" }}
        >
          <button
            onClick={() => setActiveMode("grader")}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
              activeMode === "grader"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeMode === "grader" ? { boxShadow: "var(--shadow-md)" } : {}}
          >
            <CircleCheckFill className="w-4 h-4" />
            Grade Essay
          </button>
          <button
            onClick={() => setActiveMode("planner")}
            className={cn(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
              activeMode === "planner"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activeMode === "planner" ? { boxShadow: "var(--shadow-md)" } : {}}
          >
            <ListCheck className="w-4 h-4" />
            Plan Essay
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// SELECT COMPONENT
// ============================================================================

function PremiumSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-caption">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-premium w-full appearance-none cursor-pointer pr-10"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ArrowChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
      </div>
    </div>
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
          <span className="text-caption">Diagram</span>
          <button
            onClick={onRemove}
            className="btn-ghost text-xs text-destructive hover:text-destructive flex items-center gap-1.5"
          >
            <TrashBin className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
        <div
          className="rounded-xl overflow-hidden border border-border/50"
          style={{ boxShadow: "var(--shadow-inner)" }}
        >
          <img src={image} alt="Diagram" className="w-full max-h-48 object-contain bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-caption">Diagram (Optional)</span>
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-6 rounded-xl border-2 border-dashed border-border/50 hover:border-border
                   bg-muted/20 hover:bg-muted/30 transition-all duration-300
                   flex flex-col items-center gap-2 group"
      >
        <div
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center
                     group-hover:bg-accent transition-colors duration-300"
        >
          <ArrowUpFromLine className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">Click to upload</span>
      </button>
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
// AO BADGE COMPONENT
// ============================================================================

function AOBadge({ ao }: { ao: string }) {
  const badges: Record<string, string> = {
    ao1: "badge-ao1",
    ao2: "badge-ao2",
    ao3: "badge-ao3",
    ao4: "badge-ao4",
  };
  return <span className={badges[ao] || "badge-info"}>{ao.toUpperCase()}</span>;
}

// ============================================================================
// AO PROGRESS BAR COMPONENT
// ============================================================================

function AOProgressBar({
  aoKey,
  score,
  maxScore,
}: {
  aoKey: string;
  score: number;
  maxScore: number;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const labels: Record<string, string> = {
    ao1: "Knowledge",
    ao2: "Application",
    ao3: "Analysis",
    ao4: "Evaluation",
  };
  const colors: Record<string, string> = {
    ao1: "hsl(var(--ao1))",
    ao2: "hsl(var(--ao2))",
    ao3: "hsl(var(--ao3))",
    ao4: "hsl(var(--ao4))",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AOBadge ao={aoKey} />
          <span className="text-xs text-muted-foreground">{labels[aoKey]}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {score}
          <span className="text-muted-foreground font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-bar"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors[aoKey],
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// SCORE RING COMPONENT
// ============================================================================

function ScoreRing({
  percentage,
  size = 120,
  strokeWidth = 10,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={getScoreColor(percentage)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-progress"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ color: getScoreColor(percentage) }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// GRADING INPUT FORM
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
}) {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card mb-6"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <PencilToSquare className="w-7 h-7 text-foreground" />
        </div>
        <h2 className="text-headline mb-3">Grade Your Essay</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Get AI-powered feedback aligned with Edexcel IAL mark schemes and assessment objectives.
        </p>
      </div>

      {/* Form Card */}
      <div className="card-elevated rounded-3xl p-8 space-y-6">
        <PremiumSelect
          value={questionType}
          onChange={(v) => setQuestionType(v as QuestionType)}
          options={QUESTION_TYPE_OPTIONS}
          label="Question Type"
        />

        <div className="space-y-2">
          <label className="text-caption">Exam Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the exam question..."
            className="textarea-premium min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-caption">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your essay answer..."
            className="textarea-premium min-h-[240px]"
          />
        </div>

        <DiagramUpload
          image={diagram}
          onUpload={setDiagram}
          onRemove={() => setDiagram(null)}
        />

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <CircleExclamationFill className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn-primary w-full text-sm"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <SparklesFill className="w-4 h-4 mr-2" />
              Grade Essay
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// GRADING RESULTS DISPLAY
// ============================================================================

function GradingResultsDisplay({
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
  const hasHighlights = (result.marksEarned?.length || 0) > 0 || (result.marksLost?.length || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto animate-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn-ghost mb-8 -ml-2 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Edit Answer
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Essay Viewer Card */}
          <div className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="text-title">Your Essay</h3>
                {hasHighlights && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Details</span>
                    <Switch
                      checked={showDetailedFeedback}
                      onCheckedChange={setShowDetailedFeedback}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {hasHighlights ? (
                <EssayViewer
                  essay={essayText}
                  marksEarned={result.marksEarned || []}
                  marksLost={result.marksLost || []}
                  showDetailedFeedback={showDetailedFeedback}
                  onToggleDetailedFeedback={() => setShowDetailedFeedback(!showDetailedFeedback)}
                />
              ) : (
                <div className="card-inset p-6 rounded-xl">
                  <p className="text-body whitespace-pre-wrap">{essayText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Score Card */}
          <div className="card-elevated rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-6">
              <ScoreRing percentage={result.overallPercentage} />
              <div>
                <div className="text-4xl font-bold tracking-tight mb-2">
                  {result.totalMarks}
                  <span className="text-lg text-muted-foreground font-normal">
                    /{markScheme.total}
                  </span>
                </div>
                <div className={getLevelClass(result.levelAchieved)}>
                  Level {result.levelAchieved}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {LEVEL_DESCRIPTORS[result.levelAchieved]}
            </p>
          </div>

          {/* AO Breakdown */}
          <div className="card-elevated rounded-3xl p-6 space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="text-caption">Assessment Objectives</h4>
            {markScheme.ao1 > 0 && (
              <AOProgressBar aoKey="ao1" score={result.aoScores.ao1} maxScore={markScheme.ao1} />
            )}
            {markScheme.ao2 > 0 && (
              <AOProgressBar aoKey="ao2" score={result.aoScores.ao2} maxScore={markScheme.ao2} />
            )}
            {markScheme.ao3 > 0 && (
              <AOProgressBar aoKey="ao3" score={result.aoScores.ao3} maxScore={markScheme.ao3} />
            )}
            {markScheme.ao4 > 0 && (
              <AOProgressBar aoKey="ao4" score={result.aoScores.ao4} maxScore={markScheme.ao4} />
            )}
          </div>

          {/* Examiner Comment */}
          <div className="card-elevated rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <h4 className="text-caption mb-4">Examiner Feedback</h4>
            <div className="card-inset p-4 rounded-xl">
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                &ldquo;{result.examinerComment}&rdquo;
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div className="card-elevated rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRightFromSquare className="w-4 h-4" style={{ color: "hsl(var(--success))" }} />
              <h4 className="text-caption" style={{ color: "hsl(var(--success))" }}>Strengths</h4>
            </div>
            <div className="space-y-2">
              {result.strengths.slice(0, 3).map((strength, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "hsl(var(--success))" }}
                  />
                  <p className="text-sm text-foreground/80">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          <div className="card-elevated rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <div className="flex items-center gap-2 mb-4">
              <TargetDart className="w-4 h-4" style={{ color: "hsl(var(--warning))" }} />
              <h4 className="text-caption" style={{ color: "hsl(var(--warning))" }}>To Improve</h4>
            </div>
            <div className="space-y-2">
              {result.improvements.slice(0, 3).map((improvement, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "hsl(var(--warning))" }}
                  />
                  <p className="text-sm text-foreground/80">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
}: {
  question: string;
  setQuestion: (v: string) => void;
  questionType: QuestionType;
  setQuestionType: (v: QuestionType) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <div className="max-w-3xl mx-auto animate-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card mb-6"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <ListCheck className="w-7 h-7 text-foreground" />
        </div>
        <h2 className="text-headline mb-3">Plan Your Essay</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate a comprehensive essay structure with arguments, evaluation points, and diagram suggestions.
        </p>
      </div>

      {/* Form Card */}
      <div className="card-elevated rounded-3xl p-8 space-y-6">
        <PremiumSelect
          value={questionType}
          onChange={(v) => setQuestionType(v as QuestionType)}
          options={QUESTION_TYPE_OPTIONS}
          label="Question Type"
        />

        <div className="space-y-2">
          <label className="text-caption">Essay Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the essay question..."
            className="textarea-premium min-h-[140px]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <CircleExclamationFill className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn-primary w-full text-sm"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparklesFill className="w-4 h-4 mr-2" />
              Generate Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN RESULTS DISPLAY
// ============================================================================

function PlanResultsDisplay({
  result,
  onBack,
}: {
  result: PlanResult;
  onBack: () => void;
}) {
  const [showDetailed, setShowDetailed] = useState(true);

  return (
    <div className="max-w-4xl mx-auto animate-in">
      {/* Back Button */}
      <button onClick={onBack} className="btn-ghost mb-8 -ml-2 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Edit Question
      </button>

      {/* Detail Toggle */}
      <div className="card-elevated rounded-2xl p-4 mb-8 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          {showDetailed ? (
            <Eye className="w-5 h-5 text-foreground" />
          ) : (
            <EyeSlash className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Detailed View</p>
            <p className="text-xs text-muted-foreground">
              Show examples, chains, and techniques
            </p>
          </div>
        </div>
        <Switch checked={showDetailed} onCheckedChange={setShowDetailed} />
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <div className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <div className="p-5 border-b border-border/50 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              1
            </div>
            <div className="flex-1">
              <h3 className="text-title">Introduction</h3>
              <p className="text-xs text-muted-foreground">Define terms & thesis</p>
            </div>
            <AOBadge ao="ao1" />
          </div>
          <div className="p-6">
            <div className="card-inset p-4 rounded-xl">
              <p className="text-sm leading-relaxed">
                {result.introduction?.whatToWrite || result.thesis}
              </p>
            </div>
          </div>
        </div>

        {/* Arguments */}
        {result.arguments.map((arg, index) => (
          <div key={index} className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
            <div className="p-5 border-b border-border/50 flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white",
                  index === 0 ? "bg-[hsl(var(--ao2))]" : "bg-[hsl(var(--error))]"
                )}
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {index + 2}
              </div>
              <div className="flex-1">
                <h3 className="text-title">
                  Argument {index === 0 ? "FOR" : "AGAINST"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{arg.point}</p>
              </div>
              <div className="flex gap-1.5">
                <AOBadge ao="ao1" />
                <AOBadge ao="ao2" />
                <AOBadge ao="ao3" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {showDetailed && arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                <div className="card-inset p-4 rounded-xl">
                  <p className="text-caption mb-3">Chain of Reasoning</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-card rounded-lg text-xs font-medium border border-border/50">
                          {step}
                        </span>
                        {arg.chainOfReasoning && i < Math.min(arg.chainOfReasoning.length - 1, 4) && (
                          <ArrowChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showDetailed ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-inset p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-3.5 h-3.5" style={{ color: "hsl(var(--ao1))" }} />
                      <p className="text-caption" style={{ color: "hsl(var(--ao1))" }}>Theory</p>
                    </div>
                    <p className="text-sm leading-relaxed">{arg.explanation}</p>
                  </div>
                  <div className="card-inset p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-3.5 h-3.5" style={{ color: "hsl(var(--ao2))" }} />
                      <p className="text-caption" style={{ color: "hsl(var(--ao2))" }}>Example</p>
                    </div>
                    <p className="text-sm leading-relaxed">{arg.example}</p>
                  </div>
                </div>
              ) : (
                <div className="card-inset p-4 rounded-xl">
                  <p className="text-sm font-medium">{arg.point}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Evaluation */}
        <div className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: `${0.2 + result.arguments.length * 0.05}s` }}>
          <div className="p-5 border-b border-border/50 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl bg-[hsl(var(--ao3))] flex items-center justify-center text-sm font-semibold text-white"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              {result.arguments.length + 2}
            </div>
            <div className="flex-1">
              <h3 className="text-title">Deeper Evaluation</h3>
              <p className="text-xs text-muted-foreground">Critical analysis</p>
            </div>
            <div className="flex gap-1.5">
              <AOBadge ao="ao3" />
              <AOBadge ao="ao4" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {showDetailed && (
              <div className="card-inset p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TargetDart className="w-3.5 h-3.5" style={{ color: "hsl(var(--ao3))" }} />
                  <p className="text-caption" style={{ color: "hsl(var(--ao3))" }}>Techniques</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.deeperEvaluation?.techniques || [
                    "Short vs Long Run",
                    "Elasticity",
                    "Magnitude",
                    "Assumptions",
                  ]).map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-card rounded-lg text-xs font-medium border border-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.evaluations.slice(0, showDetailed ? 3 : 2).map((ev, i) => (
              <div key={i} className="card-inset p-4 rounded-xl">
                <p className="text-sm font-medium mb-1">{ev.point}</p>
                {showDetailed && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{ev.development}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Diagram */}
        {result.diagram && result.diagram !== "none" && (
          <div className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: `${0.25 + result.arguments.length * 0.05}s` }}>
            <div className="p-5 border-b border-border/50 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl bg-[hsl(var(--info))] flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <ChartColumn className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-title">Required Diagram</h3>
                <p className="text-xs text-muted-foreground">
                  {result.diagramSection?.name || result.diagram}
                </p>
              </div>
            </div>
            <div className="p-6">
              {showDetailed && result.diagramSection?.keyLabels && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.diagramSection.keyLabels.map((label, i) => (
                    <span key={i} className="badge-info">{label}</span>
                  ))}
                </div>
              )}
              {result.diagramExplanation && (
                <p className="text-sm leading-relaxed">{result.diagramExplanation}</p>
              )}
            </div>
          </div>
        )}

        {/* Conclusion */}
        <div className="card-elevated rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: `${0.3 + result.arguments.length * 0.05}s` }}>
          <div className="p-5 border-b border-border/50 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl bg-[hsl(var(--success))] flex items-center justify-center text-sm font-semibold text-white"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              {result.arguments.length + 3}
            </div>
            <div className="flex-1">
              <h3 className="text-title">Conclusion</h3>
              <p className="text-xs text-muted-foreground">Weigh evidence & judgement</p>
            </div>
            <AOBadge ao="ao4" />
          </div>
          <div className="p-6">
            <div className="card-inset p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Bulb className="w-3.5 h-3.5" style={{ color: "hsl(var(--success))" }} />
                <p className="text-caption" style={{ color: "hsl(var(--success))" }}>Final Judgement</p>
              </div>
              <p className="text-sm leading-relaxed">{result.conclusion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING VIEW
// ============================================================================

function LoadingView({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-24 animate-fade">
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
            style={{ animation: "pulse-soft 2s ease-in-out infinite" }}
          >
            <SparklesFill className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
      <h3 className="text-title mb-2">{message}</h3>
      <p className="text-sm text-muted-foreground">Powered by Claude AI</p>

      {/* Animated dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            style={{
              animation: "pulse-soft 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<ActiveMode>("grader");

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
      setGraderError(error instanceof Error ? error.message : "An error occurred");
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
      setPlannerError(error instanceof Error ? error.message : "An error occurred");
      setPlannerView("input");
    } finally {
      setPlannerLoading(false);
    }
  };

  const showNavigation =
    (activeMode === "grader" && graderView === "input") ||
    (activeMode === "planner" && plannerView === "input");

  return (
    <div className="min-h-screen bg-background theme-transition">
      <Header />

      {showNavigation && (
        <Navigation activeMode={activeMode} setActiveMode={setActiveMode} />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {activeMode === "grader" ? (
          <>
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
              />
            )}
            {graderView === "loading" && <LoadingView message="Analyzing your essay..." />}
            {graderView === "results" && graderResult && (
              <GradingResultsDisplay
                result={graderResult}
                questionType={graderQuestionType}
                essayText={graderAnswer}
                onBack={() => setGraderView("input")}
              />
            )}
          </>
        ) : (
          <>
            {plannerView === "input" && (
              <PlannerInputForm
                question={plannerQuestion}
                setQuestion={setPlannerQuestion}
                questionType={plannerQuestionType}
                setQuestionType={setPlannerQuestionType}
                onSubmit={handlePlan}
                loading={plannerLoading}
                error={plannerError}
              />
            )}
            {plannerView === "loading" && <LoadingView message="Generating essay plan..." />}
            {plannerView === "results" && plannerResult && (
              <PlanResultsDisplay result={plannerResult} onBack={() => setPlannerView("input")} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
