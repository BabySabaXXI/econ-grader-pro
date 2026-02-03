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
// ICONS (inline SVG for better performance)
// ============================================================================

const GraderIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlannerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ============================================================================
// LOADING OVERLAY COMPONENT
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
// CIRCULAR SCORE COMPONENT
// ============================================================================

function CircularScore({ percentage, size = 128 }: { percentage: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "#10b981"; // emerald
    if (percentage >= 60) return "#3b82f6"; // blue
    if (percentage >= 45) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="score-circle-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="score-circle-fill"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
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

  return (
    <span className={`level-badge level-${level}`}>
      Level {level}: {labels[level] || "Unknown"}
    </span>
  );
}

// ============================================================================
// GRADING RESULT DISPLAY
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
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score Card */}
      <div className="result-card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CircularScore percentage={result.overallPercentage} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {result.totalMarks} / {markScheme.total} marks
            </h3>
            <LevelBadge level={result.levelAchieved} />
            <p className="text-sm text-slate-500 mt-2">
              {LEVEL_DESCRIPTORS[result.levelAchieved]}
            </p>
          </div>
        </div>
      </div>

      {/* AO Breakdown */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Assessment Objectives Breakdown
        </h4>
        <div className="space-y-1">
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
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-700">AO1</div>
            <div className="text-blue-600">Knowledge</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <div className="font-semibold text-emerald-700">AO2</div>
            <div className="text-emerald-600">Application</div>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-700">AO3</div>
            <div className="text-purple-600">Analysis</div>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg">
            <div className="font-semibold text-amber-700">AO4</div>
            <div className="text-amber-600">Evaluation</div>
          </div>
        </div>
      </div>

      {/* Examiner Comment */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Examiner Comment
        </h4>
        <div className="examiner-comment">
          {result.examinerComment}
        </div>
      </div>

      {/* Strengths */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckIcon />
          </span>
          Strengths
        </h4>
        <div className="feedback-list">
          {result.strengths.map((strength, index) => (
            <div
              key={index}
              className="feedback-item strength"
              style={{ animationDelay: `${index * 100}ms` }}
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
        <h4 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
            <ArrowIcon />
          </span>
          Areas for Improvement
        </h4>
        <div className="feedback-list">
          {result.improvements.map((improvement, index) => (
            <div
              key={index}
              className="feedback-item improvement"
              style={{ animationDelay: `${index * 100}ms` }}
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
// PLAN RESULT DISPLAY
// ============================================================================

function PlanResultDisplay({ result }: { result: PlanResult }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Thesis */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Thesis Statement
        </h4>
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
          <p className="text-slate-800 leading-relaxed">{result.thesis}</p>
        </div>
      </div>

      {/* Main Arguments */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Main Arguments
        </h4>
        <div className="space-y-4">
          {result.arguments.map((arg, index) => (
            <div
              key={index}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h5 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {arg.point}
              </h5>
              <div className="space-y-2 pl-8 text-sm">
                <p className="text-slate-700">
                  <span className="font-medium text-blue-700">Theory: </span>
                  {arg.explanation}
                </p>
                <p className="text-slate-700">
                  <span className="font-medium text-emerald-700">Example: </span>
                  {arg.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluations */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Evaluation Points
        </h4>
        <div className="space-y-3">
          {result.evaluations.map((evaluation, index) => (
            <div
              key={index}
              className="p-4 bg-amber-50 rounded-xl border border-amber-200 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h5 className="font-semibold text-amber-800 mb-1">
                {evaluation.point}
              </h5>
              <p className="text-amber-700 text-sm">{evaluation.development}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diagram Recommendation */}
      {result.diagram && result.diagram !== "none" && (
        <div className="result-card">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">
            Recommended Diagram
          </h4>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="font-medium text-purple-800 mb-2 capitalize">
              {result.diagram.replace("-", " ")} Diagram
            </p>
            <p className="text-purple-700 text-sm">{result.diagramExplanation}</p>
          </div>
        </div>
      )}

      {/* Conclusion */}
      <div className="result-card">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          Conclusion
        </h4>
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl">
          <p className="text-slate-800 leading-relaxed">{result.conclusion}</p>
        </div>
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
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
          >
            <TrashIcon />
            Remove
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <img
            src={image}
            alt="Uploaded diagram"
            className="w-full max-h-64 object-contain bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-upload-section">
      <div className="diagram-upload-header">
        <span className="diagram-upload-title">Diagram Upload</span>
        <span className="diagram-upload-optional">Optional - for diagram marking</span>
      </div>
      <div
        className={`diagram-upload-zone ${isDragging ? "dragging" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <UploadIcon />
        <div className="upload-text">Click or drag to upload a diagram</div>
        <div className="upload-hint">Supports PNG, JPG, JPEG</div>
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
        <div className="header-subtitle">AS & A Level - Units 1-4</div>
      </header>

      {/* Mode Navigation */}
      <nav className="mode-nav">
        <button
          className={`mode-btn ${activeMode === "grader" ? "active" : ""}`}
          onClick={() => setActiveMode("grader")}
        >
          <GraderIcon />
          Exam Grader
        </button>
        <button
          className={`mode-btn ${activeMode === "planner" ? "active" : ""}`}
          onClick={() => setActiveMode("planner")}
        >
          <PlannerIcon />
          Essay Planner
        </button>
      </nav>

      {/* Grader Panel */}
      <div className={`panel ${activeMode === "grader" ? "active" : ""}`}>
        <div className="grid lg:grid-cols-2 gap-8">
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
              <label className="config-label mb-2 block">Exam Question</label>
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
              <label className="config-label mb-2 block">Student Answer</label>
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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
                <GraderIcon />
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
        <div className="grid lg:grid-cols-2 gap-8">
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
              <label className="config-label mb-2 block">Essay Question</label>
              <textarea
                className="input-area"
                placeholder="Type or paste the essay question here..."
                value={plannerQuestion}
                onChange={(e) => setPlannerQuestion(e.target.value)}
              />
            </div>

            {/* Error Display */}
            {plannerError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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
                <PlannerIcon />
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
      <footer className="text-center py-8 text-sm text-slate-500 border-t border-slate-200 mt-8">
        <p>AI-powered grading aligned with Edexcel IAL Economics mark schemes</p>
        <p className="mt-1">Always verify with your teacher or official mark schemes</p>
      </footer>
    </div>
  );
}
