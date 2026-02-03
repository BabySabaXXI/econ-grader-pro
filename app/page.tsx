"use client";

import { useState, useRef, useCallback } from "react";
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

// ============================================================================
// ICONS - Refined, minimal line icons with Zen aesthetic
// ============================================================================

const GraderIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlannerIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-zen-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EmptyStateIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

// ============================================================================
// LOADING OVERLAY COMPONENT - Minimal, meditative
// ============================================================================

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="loading-overlay">
      <div className="flex flex-col items-center">
        <div className="loading-spinner" />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// CIRCULAR SCORE COMPONENT - Elegant, refined
// ============================================================================

function CircularScore({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Muted color palette for scores - keeping color coding functional
  const getColor = () => {
    if (percentage >= 80) return "hsl(95 20% 42%)";   // Moss green
    if (percentage >= 60) return "hsl(200 25% 50%)";  // Calm water
    if (percentage >= 45) return "hsl(30 40% 55%)";   // Clay/amber
    return "hsl(10 45% 50%)";                          // Muted terracotta
  };

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="score-circle-bg"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="score-circle-fill"
          stroke={getColor()}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-percentage">{percentage}%</span>
        <span className="score-label">Overall</span>
      </div>
    </div>
  );
}

// ============================================================================
// AO SCORE BAR COMPONENT - Clean, minimal
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
    <div className="ao-score-item" style={{ animationDelay: `${delay}ms` }}>
      <span className="ao-label">{label}</span>
      <div className="ao-bar-container">
        <div
          className={`ao-bar-fill ${aoKey} animate-progress`}
          style={{ width: `${percentage}%`, animationDelay: `${delay}ms` }}
        />
      </div>
      <span className="ao-score-text">
        {score}/{maxScore}
      </span>
    </div>
  );
}

// ============================================================================
// LEVEL BADGE COMPONENT - Subtle, informative
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const labels: Record<number, string> = {
    5: "Excellent",
    4: "Good",
    3: "Sound",
    2: "Basic",
    1: "Limited",
  };

  return (
    <span className={`level-badge level-${level}`}>
      Level {level} · {labels[level] || "Unknown"}
    </span>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT - Consistent styling
// ============================================================================

function SectionHeader({
  title,
  icon,
  variant = "default"
}: {
  title: string;
  icon?: React.ReactNode;
  variant?: "default" | "strength" | "improvement";
}) {
  const variantStyles = {
    default: "text-[hsl(var(--foreground))]",
    strength: "text-[hsl(95,30%,35%)]",
    improvement: "text-[hsl(30,45%,40%)]",
  };

  return (
    <h4 className={`text-sm font-medium mb-5 flex items-center gap-2.5 ${variantStyles[variant]}`}>
      {icon && <span className="opacity-80">{icon}</span>}
      {title}
    </h4>
  );
}

// ============================================================================
// GRADING RESULT DISPLAY - Refined, elegant
// ============================================================================

function GradingResultDisplay({
  result,
  questionType,
}: {
  result: GradingResult;
  questionType: QuestionType;
}) {
  const markScheme = MARK_SCHEMES[questionType];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Overall Score Card */}
      <div className="result-card">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <CircularScore percentage={result.overallPercentage} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-light text-[hsl(var(--zen-ink))] mb-3">
              {result.totalMarks} <span className="text-[hsl(var(--muted-foreground))] text-lg">/ {markScheme.total}</span>
            </h3>
            <LevelBadge level={result.levelAchieved} />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3 leading-relaxed max-w-sm">
              {LEVEL_DESCRIPTORS[result.levelAchieved]}
            </p>
          </div>
        </div>
      </div>

      {/* AO Breakdown */}
      <div className="result-card">
        <SectionHeader title="Assessment Objectives" />
        <div className="space-y-0">
          {markScheme.ao1 > 0 && (
            <AOScoreBar
              label="AO1"
              aoKey="ao1"
              score={result.aoScores.ao1}
              maxScore={markScheme.ao1}
              delay={100}
            />
          )}
          {markScheme.ao2 > 0 && (
            <AOScoreBar
              label="AO2"
              aoKey="ao2"
              score={result.aoScores.ao2}
              maxScore={markScheme.ao2}
              delay={200}
            />
          )}
          {markScheme.ao3 > 0 && (
            <AOScoreBar
              label="AO3"
              aoKey="ao3"
              score={result.aoScores.ao3}
              maxScore={markScheme.ao3}
              delay={300}
            />
          )}
          {markScheme.ao4 > 0 && (
            <AOScoreBar
              label="AO4"
              aoKey="ao4"
              score={result.aoScores.ao4}
              maxScore={markScheme.ao4}
              delay={400}
            />
          )}
        </div>
        <div className="mt-6 pt-5 border-t border-[hsl(var(--border))] grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="ao-info-card ao1">
            <div className="ao-info-label">AO1</div>
            <div className="ao-info-desc">Knowledge</div>
          </div>
          <div className="ao-info-card ao2">
            <div className="ao-info-label">AO2</div>
            <div className="ao-info-desc">Application</div>
          </div>
          <div className="ao-info-card ao3">
            <div className="ao-info-label">AO3</div>
            <div className="ao-info-desc">Analysis</div>
          </div>
          <div className="ao-info-card ao4">
            <div className="ao-info-label">AO4</div>
            <div className="ao-info-desc">Evaluation</div>
          </div>
        </div>
      </div>

      {/* Examiner Comment */}
      <div className="result-card">
        <SectionHeader title="Examiner's Comment" />
        <div className="examiner-comment">
          {result.examinerComment}
        </div>
      </div>

      {/* Strengths */}
      <div className="result-card">
        <SectionHeader
          title="Strengths"
          variant="strength"
          icon={
            <span className="w-5 h-5 rounded-full bg-[hsl(var(--zen-moss))] flex items-center justify-center">
              <CheckIcon />
            </span>
          }
        />
        <div className="feedback-list">
          {result.strengths.map((strength, index) => (
            <div
              key={index}
              className="feedback-item strength"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="feedback-icon strength">
                <CheckIcon />
              </span>
              <span className="feedback-text">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="result-card">
        <SectionHeader
          title="Areas for Improvement"
          variant="improvement"
          icon={
            <span className="w-5 h-5 rounded-full bg-[hsl(var(--zen-clay))] flex items-center justify-center text-white">
              <ArrowIcon />
            </span>
          }
        />
        <div className="feedback-list">
          {result.improvements.map((improvement, index) => (
            <div
              key={index}
              className="feedback-item improvement"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="feedback-icon improvement">
                <ArrowIcon />
              </span>
              <span className="feedback-text">{improvement}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN RESULT DISPLAY - Structured, clear
// ============================================================================

function PlanResultDisplay({ result }: { result: PlanResult }) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Thesis */}
      <div className="result-card">
        <SectionHeader title="Thesis Statement" />
        <div className="plan-thesis">
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{result.thesis}</p>
        </div>
      </div>

      {/* Main Arguments */}
      <div className="result-card">
        <SectionHeader title="Main Arguments" />
        <div className="space-y-4">
          {result.arguments.map((arg, index) => (
            <div
              key={index}
              className="plan-argument animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="plan-argument-number">
                  {index + 1}
                </span>
                <h5 className="font-medium text-sm text-[hsl(var(--foreground))] pt-1">
                  {arg.point}
                </h5>
              </div>
              <div className="space-y-3 pl-11">
                <div>
                  <span className="plan-label theory">Theory</span>
                  <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                    {arg.explanation}
                  </p>
                </div>
                <div>
                  <span className="plan-label example">Example</span>
                  <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
                    {arg.example}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluations */}
      <div className="result-card">
        <SectionHeader title="Evaluation Points" />
        <div className="space-y-3">
          {result.evaluations.map((evaluation, index) => (
            <div
              key={index}
              className="plan-evaluation animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <h5 className="font-medium text-sm text-[hsl(30,45%,35%)] mb-2">
                {evaluation.point}
              </h5>
              <p className="text-sm text-[hsl(30,30%,45%)] leading-relaxed">{evaluation.development}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diagram Recommendation */}
      {result.diagram && result.diagram !== "none" && (
        <div className="result-card">
          <SectionHeader title="Recommended Diagram" />
          <div className="plan-diagram">
            <p className="font-medium text-sm text-[hsl(270,25%,40%)] mb-2 capitalize">
              {result.diagram.replace("-", " ")} Diagram
            </p>
            <p className="text-sm text-[hsl(270,15%,50%)] leading-relaxed">{result.diagramExplanation}</p>
          </div>
        </div>
      )}

      {/* Conclusion */}
      <div className="result-card">
        <SectionHeader title="Conclusion" />
        <div className="plan-conclusion">
          <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{result.conclusion}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DIAGRAM UPLOAD COMPONENT - Elegant drop zone
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (image) {
    return (
      <div className="diagram-upload-section">
        <div className="diagram-upload-header">
          <span className="diagram-upload-title">Diagram Uploaded</span>
          <button
            onClick={onRemove}
            className="text-[hsl(var(--destructive))] hover:text-[hsl(10,65%,45%)] transition-colors duration-300 flex items-center gap-1.5 text-xs font-medium"
          >
            <TrashIcon />
            Remove
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden border border-[hsl(var(--border))]">
          <img
            src={image}
            alt="Uploaded diagram"
            className="w-full max-h-56 object-contain bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-upload-section">
      <div className="diagram-upload-header">
        <span className="diagram-upload-title">Diagram Upload</span>
        <span className="diagram-upload-optional">Optional</span>
      </div>
      <div
        className={`diagram-upload-zone ${isDragging ? "dragging" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="upload-icon">
          <UploadIcon />
        </div>
        <div className="upload-text">Click or drag to upload</div>
        <div className="upload-hint">PNG, JPG up to 10MB</div>
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

  // Planner state
  const [plannerQuestion, setPlannerQuestion] = useState("");
  const [plannerQuestionType, setPlannerQuestionType] = useState<QuestionType>("evaluate-20");
  const [plannerOutputType, setPlannerOutputType] = useState<"skeleton" | "full">("full");
  const [plannerResult, setPlannerResult] = useState<PlanResult | null>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState("");

  // Handle grading
  const handleGrade = async () => {
    if (!graderQuestion.trim() || !graderAnswer.trim()) {
      setGraderError("Please enter both a question and your answer.");
      return;
    }

    setGraderLoading(true);
    setGraderError("");
    setGraderResult(null);

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
    } catch (error) {
      setGraderError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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
    setPlannerResult(null);

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
    } catch (error) {
      setPlannerError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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
  };

  const clearPlanner = () => {
    setPlannerQuestion("");
    setPlannerResult(null);
    setPlannerError("");
  };

  return (
    <div className="min-h-screen">
      {/* Loading Overlays */}
      {graderLoading && <LoadingOverlay message="Grading your answer..." />}
      {plannerLoading && <LoadingOverlay message="Generating essay plan..." />}

      {/* Header */}
      <header className="app-header">
        <div className="header-eyebrow">Pearson Edexcel IAL</div>
        <h1 className="header-title">Economics</h1>
        <div className="header-subtitle">AS & A Level · Units 1–4</div>
      </header>

      {/* Mode Navigation */}
      <nav className="mode-nav">
        <button
          className={`mode-btn ${activeMode === "grader" ? "active" : ""}`}
          onClick={() => setActiveMode("grader")}
        >
          <span className="mode-icon"><GraderIcon /></span>
          Exam Grader
        </button>
        <button
          className={`mode-btn ${activeMode === "planner" ? "active" : ""}`}
          onClick={() => setActiveMode("planner")}
        >
          <span className="mode-icon"><PlannerIcon /></span>
          Essay Planner
        </button>
      </nav>

      {/* Grader Panel */}
      <div className={`panel ${activeMode === "grader" ? "active" : ""}`}>
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Question Config */}
            <div className="question-config">
              <div className="config-group">
                <span className="config-label">Question Type</span>
                <select
                  className="config-select"
                  value={graderQuestionType}
                  onChange={(e) => setGraderQuestionType(e.target.value as QuestionType)}
                >
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Input */}
            <div>
              <label className="config-label mb-3 block">Exam Question</label>
              <textarea
                className="input-area"
                style={{ minHeight: "100px" }}
                placeholder="Paste the exam question here..."
                value={graderQuestion}
                onChange={(e) => setGraderQuestion(e.target.value)}
              />
            </div>

            {/* Answer Input */}
            <div>
              <label className="config-label mb-3 block">Student Answer</label>
              <textarea
                className="input-area"
                placeholder="Paste the student's answer here for grading..."
                value={graderAnswer}
                onChange={(e) => setGraderAnswer(e.target.value)}
              />
            </div>

            {/* Diagram Upload */}
            <DiagramUpload
              image={graderDiagram}
              onUpload={setGraderDiagram}
              onRemove={() => setGraderDiagram(null)}
            />

            {/* Error Display */}
            {graderError && (
              <div className="p-4 rounded-lg text-sm bg-[hsl(10,50%,96%)] border border-[hsl(10,40%,88%)] text-[hsl(10,50%,40%)]">
                {graderError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-row">
              <button className="btn-primary flex-1" onClick={handleGrade} disabled={graderLoading}>
                {graderLoading ? (
                  <>
                    <SpinnerIcon />
                    <span className="ml-2">Grading...</span>
                  </>
                ) : (
                  "Grade Answer"
                )}
              </button>
              <button className="btn-secondary" onClick={clearGrader}>
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div>
            {graderResult ? (
              <GradingResultDisplay result={graderResult} questionType={graderQuestionType} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <EmptyStateIcon />
                </div>
                <h3 className="empty-state-title">Results will appear here</h3>
                <p className="empty-state-text">
                  Submit an answer to receive detailed AI-powered feedback with Assessment Objective breakdowns.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planner Panel */}
      <div className={`panel ${activeMode === "planner" ? "active" : ""}`}>
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Question Config */}
            <div className="question-config">
              <div className="config-group">
                <span className="config-label">Question Type</span>
                <select
                  className="config-select"
                  value={plannerQuestionType}
                  onChange={(e) => setPlannerQuestionType(e.target.value as QuestionType)}
                >
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="config-group">
                <span className="config-label">Output Mode</span>
                <select
                  className="config-select"
                  value={plannerOutputType}
                  onChange={(e) => setPlannerOutputType(e.target.value as "skeleton" | "full")}
                >
                  <option value="skeleton">Essay Skeleton</option>
                  <option value="full">Full Model Plan</option>
                </select>
              </div>
            </div>

            {/* Question Input */}
            <div>
              <label className="config-label mb-3 block">Essay Question</label>
              <textarea
                className="input-area"
                placeholder="Type or paste the essay question here..."
                value={plannerQuestion}
                onChange={(e) => setPlannerQuestion(e.target.value)}
              />
            </div>

            {/* Error Display */}
            {plannerError && (
              <div className="p-4 rounded-lg text-sm bg-[hsl(10,50%,96%)] border border-[hsl(10,40%,88%)] text-[hsl(10,50%,40%)]">
                {plannerError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-row">
              <button className="btn-primary flex-1" onClick={handlePlan} disabled={plannerLoading}>
                {plannerLoading ? (
                  <>
                    <SpinnerIcon />
                    <span className="ml-2">Generating...</span>
                  </>
                ) : (
                  "Generate Plan"
                )}
              </button>
              <button className="btn-secondary" onClick={clearPlanner}>
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div>
            {plannerResult ? (
              <PlanResultDisplay result={plannerResult} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <EmptyStateIcon />
                </div>
                <h3 className="empty-state-title">Plan will appear here</h3>
                <p className="empty-state-text">
                  Enter a question to generate a comprehensive A*-grade essay plan with thesis, arguments, and evaluations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-xs border-t border-[hsl(var(--border))] mt-10">
        <p className="text-[hsl(var(--muted-foreground))]">
          AI-powered grading aligned with Edexcel IAL Economics mark schemes
        </p>
        <p className="text-[hsl(var(--muted-foreground))] mt-1 opacity-70">
          Always verify with your teacher or official mark schemes
        </p>
      </footer>
    </div>
  );
}
