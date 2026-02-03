"use client";

import { useState, useRef, useCallback } from "react";
import {
  CheckCircle2,
  FileText,
  Upload,
  Trash2,
  Check,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Target,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EssayViewer } from "@/components/ui/essay-viewer";

// ============================================================================
// VIEW STATES TYPE
// ============================================================================

type ViewState = "input" | "loading" | "results";

// ============================================================================
// SCORE COLOR HELPER
// ============================================================================

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 45) return "text-amber-600";
  return "text-red-600";
}

function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return "bg-emerald-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 45) return "bg-amber-500";
  return "bg-red-500";
}

// ============================================================================
// LEVEL BADGE COMPONENT
// ============================================================================

function LevelBadge({ level }: { level: number }) {
  const config: Record<number, { label: string; className: string }> = {
    5: { label: "Excellent", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    4: { label: "Good", className: "bg-blue-50 text-blue-700 border-blue-200" },
    3: { label: "Sound", className: "bg-amber-50 text-amber-700 border-amber-200" },
    2: { label: "Basic", className: "bg-orange-50 text-orange-700 border-orange-200" },
    1: { label: "Limited", className: "bg-red-50 text-red-700 border-red-200" },
  };

  const { label, className } = config[level] || config[1];

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", className)}>
      Level {level} · {label}
    </Badge>
  );
}

// ============================================================================
// AO SCORE BAR COMPONENT
// ============================================================================

const AO_CONFIG = {
  ao1: { label: "Knowledge", color: "bg-blue-500", bgLight: "bg-blue-100", text: "text-blue-700" },
  ao2: { label: "Application", color: "bg-emerald-500", bgLight: "bg-emerald-100", text: "text-emerald-700" },
  ao3: { label: "Analysis", color: "bg-violet-500", bgLight: "bg-violet-100", text: "text-violet-700" },
  ao4: { label: "Evaluation", color: "bg-amber-500", bgLight: "bg-amber-100", text: "text-amber-700" },
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", config.text)}>
            {aoKey.toUpperCase()}
          </span>
          <span className="text-[10px] text-neutral-400">{config.label}</span>
        </div>
        <span className="text-sm font-medium text-neutral-900">
          {score}<span className="text-neutral-400">/{maxScore}</span>
        </span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", config.bgLight)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", config.color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// AO BADGE COMPONENT
// ============================================================================

function AOBadge({ ao }: { ao: string }) {
  const config = AO_CONFIG[ao as keyof typeof AO_CONFIG];
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase", config.text, config.bgLight.replace('bg-', 'border-').replace('100', '200'))}>
      {ao.toUpperCase()}
    </Badge>
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
  const hasHighlights = (result.marksEarned?.length || 0) > 0 || (result.marksLost?.length || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Edit Answer
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Essay View */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-neutral-900">
                Your Essay
              </CardTitle>
              <CardDescription>
                Click highlighted text to see detailed feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {hasHighlights ? (
                <EssayViewer
                  essay={essayText}
                  marksEarned={result.marksEarned || []}
                  marksLost={result.marksLost || []}
                  showDetailedFeedback={showDetailedFeedback}
                  onToggleDetailedFeedback={() => setShowDetailedFeedback(!showDetailedFeedback)}
                />
              ) : (
                <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-[15px] leading-[1.9] text-neutral-700 whitespace-pre-wrap">
                    {essayText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Score Cards */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-neutral-100"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.overallPercentage / 100)}`}
                      strokeLinecap="round"
                      className={cn("transition-all duration-1000", getScoreBgColor(result.overallPercentage).replace('bg-', 'text-'))}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-2xl font-semibold", getScoreColor(result.overallPercentage))}>
                      {result.overallPercentage}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-light text-neutral-900 mb-2">
                    {result.totalMarks}
                    <span className="text-lg text-neutral-400">/{markScheme.total}</span>
                  </div>
                  <LevelBadge level={result.levelAchieved} />
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {LEVEL_DESCRIPTORS[result.levelAchieved]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AO Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Assessment Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Examiner Comment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Examiner Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-neutral-50 rounded-lg border-l-2 border-neutral-300">
                <p className="text-sm text-neutral-700 leading-relaxed italic">
                  &ldquo;{result.examinerComment}&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Summary */}
          {hasHighlights && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-2xl font-semibold text-emerald-600">
                      +{result.marksEarned?.reduce((sum, m) => sum + m.points, 0) || 0}
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">Marks Earned</div>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="text-2xl font-semibold text-red-600">
                      {result.marksLost?.length || 0}
                    </div>
                    <div className="text-xs text-red-600 font-medium">Issues Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-600 uppercase tracking-wide flex items-center gap-2">
                <Check className="w-4 h-4" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.strengths.slice(0, 3).map((strength, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-xs text-neutral-600 leading-relaxed">{strength}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600 uppercase tracking-wide flex items-center gap-2">
                <Target className="w-4 h-4" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.improvements.slice(0, 3).map((improvement, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span className="text-xs text-neutral-600 leading-relaxed">{improvement}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN RESULT DISPLAY
// ============================================================================

function PlanResultDisplay({ result, onBack }: { result: PlanResult; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Edit Question
      </Button>

      <div className="space-y-4">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
                  1
                </span>
                <CardTitle className="text-lg font-medium">Introduction</CardTitle>
              </div>
              <AOBadge ao="ao1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-amber-50/50 border-l-2 border-amber-400">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                What to Write
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {result.introduction?.whatToWrite || result.thesis}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Arguments */}
        {result.arguments.map((arg, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
                    {index + 2}
                  </span>
                  <div>
                    <CardTitle className="text-lg font-medium">
                      Argument {index === 0 ? "FOR" : "AGAINST"}
                    </CardTitle>
                    <CardDescription className="text-sm">{arg.point}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <AOBadge ao="ao1" />
                  <AOBadge ao="ao2" />
                  <AOBadge ao="ao3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-600">
                        {step}
                      </span>
                      {arg.chainOfReasoning && i < Math.min(arg.chainOfReasoning.length - 1, 4) && (
                        <ChevronRight className="w-3 h-3 text-neutral-300" />
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
                    Theory
                  </p>
                  <p className="text-sm text-neutral-600">{arg.explanation}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    Example
                  </p>
                  <p className="text-sm text-neutral-600">{arg.example}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Evaluation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
                  {result.arguments.length + 2}
                </span>
                <CardTitle className="text-lg font-medium">Deeper Evaluation</CardTitle>
              </div>
              <div className="flex gap-1">
                <AOBadge ao="ao3" />
                <AOBadge ao="ao4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-violet-50/50 border border-violet-100">
              <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-2">
                Evaluation Techniques
              </p>
              <ul className="space-y-1">
                {(result.deeperEvaluation?.techniques || [
                  "Short run vs long run",
                  "Elasticity conditions",
                  "Magnitude/significance",
                  "Challenging assumptions",
                ]).map((technique, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                    <span className="w-1 h-1 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                    {technique}
                  </li>
                ))}
              </ul>
            </div>

            {result.evaluations.slice(0, 2).map((evaluation, index) => (
              <div key={index} className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <h5 className="text-sm font-medium text-amber-800 mb-1">{evaluation.point}</h5>
                <p className="text-sm text-amber-700/80">{evaluation.development}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Diagram */}
        {result.diagram && result.diagram !== "none" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-violet-500 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                  Required Diagram: {result.diagramSection?.name || result.diagram.replace("-", " ")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {result.diagramSection?.keyLabels && (
                <div className="flex flex-wrap gap-1.5">
                  {result.diagramSection.keyLabels.map((label, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              {result.diagramExplanation && (
                <p className="text-sm text-neutral-600 mt-3">{result.diagramExplanation}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conclusion */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
                  {result.arguments.length + 3}
                </span>
                <CardTitle className="text-lg font-medium">Conclusion</CardTitle>
              </div>
              <AOBadge ao="ao4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Your Conclusion
              </p>
              <p className="text-sm text-neutral-700 leading-relaxed">{result.conclusion}</p>
            </div>
          </CardContent>
        </Card>
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
      if (!file.type.startsWith("image/")) {
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

  if (image) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Label>Diagram Uploaded</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border border-neutral-200">
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
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Label>Diagram Upload</Label>
          <Badge variant="secondary" className="text-[10px]">Optional</Badge>
        </div>
        <div
          className="flex flex-col items-center justify-center p-8 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-neutral-300 mb-3" />
          <span className="text-sm font-medium text-neutral-600 mb-1">Click to upload</span>
          <span className="text-xs text-neutral-400">PNG, JPG up to 10MB</span>
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
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Grade Your Answer</h2>
        <p className="text-sm text-neutral-500">Get AI-powered feedback on your economics essay</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label>Exam Question</Label>
          <Textarea
            placeholder="Paste the exam question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Student Answer</Label>
          <Textarea
            placeholder="Paste the student's answer here for grading..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </div>

        <DiagramUpload
          image={diagram}
          onUpload={setDiagram}
          onRemove={() => setDiagram(null)}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Grading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Grade Answer
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
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
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-5">
          <FileText className="w-7 h-7 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Plan Your Essay</h2>
        <p className="text-sm text-neutral-500">Generate a comprehensive A*-grade essay structure</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label>Essay Question</Label>
          <Textarea
            placeholder="Type or paste the essay question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
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
    <div className="max-w-md mx-auto text-center py-20 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-2">{message}</h3>
      <p className="text-sm text-neutral-500">This may take a moment...</p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
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

  const showTabs = (activeMode === "grader" && graderView === "input") ||
                   (activeMode === "planner" && plannerView === "input");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
            Pearson Edexcel IAL
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
            Economics
          </h1>
          <p className="text-sm text-neutral-400">
            AS & A Level · Units 1–4
          </p>
        </div>
      </header>

      {/* Mode Navigation */}
      {showTabs && (
        <nav className="border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center">
            <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as "grader" | "planner")}>
              <TabsList className="bg-neutral-100">
                <TabsTrigger value="grader" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Exam Grader
                </TabsTrigger>
                <TabsTrigger value="planner" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Essay Planner
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-neutral-400">
            AI-powered grading aligned with Edexcel IAL Economics mark schemes
          </p>
          <p className="text-xs text-neutral-300 mt-1">
            Always verify with your teacher or official mark schemes
          </p>
        </div>
      </footer>
    </div>
  );
}
