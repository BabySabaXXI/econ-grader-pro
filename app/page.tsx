"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Check,
  ArrowRight,
  Sparkles
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
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/ui/button";
import { AnimatedPillTabs } from "@/components/ui/tabs";
import { AnimatedCard, Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CircularProgress, LinearProgress } from "@/components/ui/progress";
import { LoadingOverlay, Spinner } from "@/components/ui/spinner";

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
      <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", `ao-bar-${aoKey}`)}
        />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-stone-700">
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
    <div className="space-y-5">
      {/* Overall Score Card */}
      <AnimatedCard delay={0}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <CircularProgress
              value={result.overallPercentage}
              size={120}
              strokeWidth={6}
              color={getScoreColor(result.overallPercentage)}
            >
              <span className="text-2xl font-light text-stone-800">
                {result.overallPercentage}%
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-stone-400">
                Overall
              </span>
            </CircularProgress>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-light text-stone-800 mb-3">
                {result.totalMarks} <span className="text-stone-400 text-lg">/ {markScheme.total}</span>
              </h3>
              <LevelBadge level={result.levelAchieved} />
              <p className="text-xs text-stone-500 mt-3 leading-relaxed max-w-sm">
                {LEVEL_DESCRIPTORS[result.levelAchieved]}
              </p>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* AO Breakdown */}
      <AnimatedCard delay={0.1}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Assessment Objectives</h4>
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
          <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-sky-50">
              <div className="text-xs font-semibold text-sky-700">AO1</div>
              <div className="text-[10px] text-sky-600">Knowledge</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50">
              <div className="text-xs font-semibold text-emerald-700">AO2</div>
              <div className="text-[10px] text-emerald-600">Application</div>
            </div>
            <div className="p-2 rounded-lg bg-violet-50">
              <div className="text-xs font-semibold text-violet-700">AO3</div>
              <div className="text-[10px] text-violet-600">Analysis</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50">
              <div className="text-xs font-semibold text-amber-700">AO4</div>
              <div className="text-[10px] text-amber-600">Evaluation</div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Examiner Comment */}
      <AnimatedCard delay={0.2}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Examiner&apos;s Comment</h4>
          <div className="relative p-5 rounded-xl bg-stone-50 border-l-2 border-stone-300">
            <p className="text-sm text-stone-700 leading-relaxed italic">
              &ldquo;{result.examinerComment}&rdquo;
            </p>
          </div>
        </CardContent>
      </AnimatedCard>

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
      <AnimatedCard delay={0.4}>
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
    </div>
  );
}

// ============================================================================
// PLAN RESULT DISPLAY
// ============================================================================

function PlanResultDisplay({ result }: { result: PlanResult }) {
  return (
    <div className="space-y-5">
      {/* Thesis */}
      <AnimatedCard delay={0}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Thesis Statement</h4>
          <div className="p-5 rounded-xl plan-thesis">
            <p className="text-sm text-stone-700 leading-relaxed">{result.thesis}</p>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Main Arguments */}
      <AnimatedCard delay={0.1}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Main Arguments</h4>
          <div className="space-y-4">
            {result.arguments.map((arg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl plan-argument"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <h5 className="font-medium text-sm text-stone-800 pt-1">{arg.point}</h5>
                </div>
                <div className="space-y-3 pl-10">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-600 block mb-1">Theory</span>
                    <p className="text-sm text-stone-600 leading-relaxed">{arg.explanation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-600 block mb-1">Example</span>
                    <p className="text-sm text-stone-600 leading-relaxed">{arg.example}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Evaluations */}
      <AnimatedCard delay={0.2}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Evaluation Points</h4>
          <div className="space-y-3">
            {result.evaluations.map((evaluation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-xl plan-evaluation"
              >
                <h5 className="font-medium text-sm text-amber-800 mb-1">{evaluation.point}</h5>
                <p className="text-sm text-amber-700/80 leading-relaxed">{evaluation.development}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Diagram Recommendation */}
      {result.diagram && result.diagram !== "none" && (
        <AnimatedCard delay={0.3}>
          <CardContent className="p-6">
            <h4 className="text-sm font-medium text-stone-700 mb-4">Recommended Diagram</h4>
            <div className="p-4 rounded-xl plan-diagram">
              <p className="font-medium text-sm text-violet-800 mb-2 capitalize">
                {result.diagram.replace("-", " ")} Diagram
              </p>
              <p className="text-sm text-violet-700/80 leading-relaxed">{result.diagramExplanation}</p>
            </div>
          </CardContent>
        </AnimatedCard>
      )}

      {/* Conclusion */}
      <AnimatedCard delay={0.4}>
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-stone-700 mb-4">Conclusion</h4>
          <div className="p-5 rounded-xl plan-conclusion">
            <p className="text-sm text-stone-700 leading-relaxed">{result.conclusion}</p>
          </div>
        </CardContent>
      </AnimatedCard>
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
          <div className="relative rounded-xl overflow-hidden border border-stone-200 h-48 bg-white">
            <Image
              src={image}
              alt="Uploaded diagram"
              fill
              className="object-contain"
              unoptimized
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
// EMPTY STATE COMPONENT
// ============================================================================

function EmptyState({ type }: { type: "grader" | "planner" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        {type === "grader" ? (
          <CheckCircle2 className="w-8 h-8 text-stone-300" />
        ) : (
          <FileText className="w-8 h-8 text-stone-300" />
        )}
      </div>
      <h3 className="text-base font-medium text-stone-500 mb-2">
        {type === "grader" ? "Results will appear here" : "Plan will appear here"}
      </h3>
      <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
        {type === "grader"
          ? "Submit an answer to receive detailed AI-powered feedback with Assessment Objective breakdowns."
          : "Enter a question to generate a comprehensive A*-grade essay plan."}
      </p>
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

  // Planner state
  const [plannerQuestion, setPlannerQuestion] = useState("");
  const [plannerQuestionType, setPlannerQuestionType] = useState<QuestionType>("evaluate-20");
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

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Loading Overlays */}
      <AnimatePresence>
        {graderLoading && <LoadingOverlay message="Grading your answer..." />}
        {plannerLoading && <LoadingOverlay message="Generating essay plan..." />}
      </AnimatePresence>

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

      {/* Mode Navigation */}
      <nav className="flex justify-center py-6 px-4 border-b border-stone-100">
        <AnimatedPillTabs
          items={tabItems}
          value={activeMode}
          onValueChange={(v) => setActiveMode(v as "grader" | "planner")}
        />
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-10 px-6">
        <AnimatePresence mode="wait">
          {activeMode === "grader" ? (
            <motion.div
              key="grader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-10"
            >
              {/* Input Section */}
              <div className="space-y-6">
                <Select
                  label="Question Type"
                  value={graderQuestionType}
                  onChange={(e) => setGraderQuestionType(e.target.value as QuestionType)}
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
                  value={graderQuestion}
                  onChange={(e) => setGraderQuestion(e.target.value)}
                  className="min-h-[100px]"
                />

                <Textarea
                  label="Student Answer"
                  placeholder="Paste the student's answer here for grading..."
                  value={graderAnswer}
                  onChange={(e) => setGraderAnswer(e.target.value)}
                />

                <DiagramUpload
                  image={graderDiagram}
                  onUpload={setGraderDiagram}
                  onRemove={() => setGraderDiagram(null)}
                />

                {graderError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600"
                  >
                    {graderError}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <AnimatedButton
                    className="flex-1"
                    onClick={handleGrade}
                    disabled={graderLoading}
                  >
                    {graderLoading ? (
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
                  <AnimatedButton variant="secondary" onClick={clearGrader}>
                    Clear
                  </AnimatedButton>
                </div>
              </div>

              {/* Results Section */}
              <div>
                {graderResult ? (
                  <GradingResultDisplay result={graderResult} questionType={graderQuestionType} />
                ) : (
                  <EmptyState type="grader" />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-10"
            >
              {/* Input Section */}
              <div className="space-y-6">
                <Select
                  label="Question Type"
                  value={plannerQuestionType}
                  onChange={(e) => setPlannerQuestionType(e.target.value as QuestionType)}
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
                  value={plannerQuestion}
                  onChange={(e) => setPlannerQuestion(e.target.value)}
                />

                {plannerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600"
                  >
                    {plannerError}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <AnimatedButton
                    className="flex-1"
                    onClick={handlePlan}
                    disabled={plannerLoading}
                  >
                    {plannerLoading ? (
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
                  <AnimatedButton variant="secondary" onClick={clearPlanner}>
                    Clear
                  </AnimatedButton>
                </div>
              </div>

              {/* Results Section */}
              <div>
                {plannerResult ? (
                  <PlanResultDisplay result={plannerResult} />
                ) : (
                  <EmptyState type="planner" />
                )}
              </div>
            </motion.div>
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
