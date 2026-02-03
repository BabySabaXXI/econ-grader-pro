"use client";

import { useState, useRef, useCallback } from "react";
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

function getScoreRingColor(percentage: number): string {
  if (percentage >= 80) return "stroke-emerald-500";
  if (percentage >= 60) return "stroke-blue-500";
  if (percentage >= 45) return "stroke-amber-500";
  return "stroke-red-500";
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
    <Badge variant="outline" className={cn("text-xs font-medium px-3 py-1", className)}>
      Level {level} · {label}
    </Badge>
  );
}

// ============================================================================
// AO SCORE BAR COMPONENT
// ============================================================================

const AO_CONFIG = {
  ao1: { label: "Knowledge", color: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  ao2: { label: "Application", color: "bg-emerald-500", bgLight: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  ao3: { label: "Analysis", color: "bg-violet-500", bgLight: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  ao4: { label: "Evaluation", color: "bg-amber-500", bgLight: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
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
          <span className={cn("text-xs font-semibold uppercase tracking-wider", config.text)}>
            {aoKey.toUpperCase()}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">{config.label}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">
          {score}<span className="text-neutral-300 font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className={cn("h-1.5 rounded-full overflow-hidden bg-neutral-100")}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            config.color
          )}
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
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5",
        config.text,
        config.bgLight,
        config.border
      )}
    >
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
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Answer</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Essay View */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="sticky top-8">
            <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
              <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-neutral-900">
                      Your Essay
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Click highlighted text to see detailed feedback
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {hasHighlights ? (
                  <EssayViewer
                    essay={essayText}
                    marksEarned={result.marksEarned || []}
                    marksLost={result.marksLost || []}
                    showDetailedFeedback={showDetailedFeedback}
                    onToggleDetailedFeedback={() => setShowDetailedFeedback(!showDetailedFeedback)}
                  />
                ) : (
                  <div className="p-6 bg-neutral-50 rounded-xl">
                    <p className="text-[15px] leading-relaxed text-neutral-700 whitespace-pre-wrap">
                      {essayText}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Score Cards */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Overall Score Card */}
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
            <CardContent className="p-6">
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
                      className="text-neutral-100"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.overallPercentage / 100)}`}
                      strokeLinecap="round"
                      className={cn(
                        "transition-all duration-1000 ease-out origin-center -rotate-90",
                        getScoreRingColor(result.overallPercentage)
                      )}
                      style={{ transformOrigin: "center" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-2xl font-bold", getScoreColor(result.overallPercentage))}>
                      {result.overallPercentage}%
                    </span>
                  </div>
                </div>

                {/* Score Details */}
                <div className="flex-1">
                  <div className="text-4xl font-light text-neutral-900 mb-2 tracking-tight">
                    {result.totalMarks}
                    <span className="text-lg text-neutral-300 font-normal">/{markScheme.total}</span>
                  </div>
                  <LevelBadge level={result.levelAchieved} />
                  <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
                    {LEVEL_DESCRIPTORS[result.levelAchieved]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AO Breakdown */}
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Assessment Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
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
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Examiner Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl">
                <div className="absolute top-3 left-4 text-4xl text-neutral-200 font-serif">&ldquo;</div>
                <p className="text-sm text-neutral-600 leading-relaxed pt-4 pl-2 italic">
                  {result.examinerComment}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Summary */}
          {hasHighlights && (
            <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600 tracking-tight">
                      +{result.marksEarned?.reduce((sum, m) => sum + m.points, 0) || 0}
                    </div>
                    <div className="text-xs text-emerald-600/80 font-medium mt-1">Marks Earned</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/30 border border-red-100">
                    <div className="text-2xl font-bold text-red-600 tracking-tight">
                      {result.marksLost?.length || 0}
                    </div>
                    <div className="text-xs text-red-600/80 font-medium mt-1">Issues Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {result.strengths.slice(0, 3).map((strength, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-600 leading-relaxed">{strength}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {result.improvements.slice(0, 3).map((improvement, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
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
// PLAN RESULT DISPLAY WITH TOGGLE
// ============================================================================

function PlanResultDisplay({ result, onBack }: { result: PlanResult; onBack: () => void }) {
  const [showDetailedPlan, setShowDetailedPlan] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Edit Question</span>
      </button>

      {/* Detail Toggle */}
      <div className="flex items-center justify-between mb-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
        <div className="flex items-center gap-3">
          {showDetailedPlan ? (
            <Eye className="w-5 h-5 text-neutral-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-neutral-400" />
          )}
          <div>
            <p className="text-sm font-medium text-neutral-900">Detailed View</p>
            <p className="text-xs text-neutral-500">Show examples, chains of reasoning, and techniques</p>
          </div>
        </div>
        <Switch
          checked={showDetailedPlan}
          onCheckedChange={setShowDetailedPlan}
          className="data-[state=checked]:bg-neutral-900"
        />
      </div>

      <div className="space-y-5">
        {/* Introduction */}
        <Card className="overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-900 text-white text-sm font-semibold shadow-sm">
                  1
                </span>
                <div>
                  <CardTitle className="text-lg font-semibold">Introduction</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Define key terms and state your thesis</CardDescription>
                </div>
              </div>
              <AOBadge ao="ao1" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200/50">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" />
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
          <Card key={index} className="overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl text-white text-sm font-semibold shadow-sm",
                    index === 0 ? "bg-emerald-600" : "bg-red-500"
                  )}>
                    {index + 2}
                  </span>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Argument {index === 0 ? "FOR" : "AGAINST"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 max-w-md truncate">{arg.point}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <AOBadge ao="ao1" />
                  <AOBadge ao="ao2" />
                  <AOBadge ao="ao3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Chain of Reasoning */}
              {showDetailedPlan && arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mr-2">Chain:</span>
                  {arg.chainOfReasoning.slice(0, 5).map((step, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-white rounded-lg text-xs text-neutral-600 font-medium shadow-sm border border-neutral-100">
                        {step}
                      </span>
                      {arg.chainOfReasoning && i < Math.min(arg.chainOfReasoning.length - 1, 4) && (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Theory and Example */}
              {showDetailedPlan ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      Theory / Explanation
                    </p>
                    <p className="text-sm text-neutral-600 leading-relaxed">{arg.explanation}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3" />
                      Real-World Example
                    </p>
                    <p className="text-sm text-neutral-600 leading-relaxed">{arg.example}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-sm font-medium text-neutral-800">{arg.point}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Evaluation */}
        <Card className="overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-violet-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-sm">
                  {result.arguments.length + 2}
                </span>
                <div>
                  <CardTitle className="text-lg font-semibold">Deeper Evaluation</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Critical analysis and limitations</CardDescription>
                </div>
              </div>
              <div className="flex gap-1.5">
                <AOBadge ao="ao3" />
                <AOBadge ao="ao4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {showDetailedPlan && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/30 border border-violet-100">
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Target className="w-3 h-3" />
                  Evaluation Techniques
                </p>
                <div className="flex flex-wrap gap-2">
                  {(result.deeperEvaluation?.techniques || [
                    "Short run vs long run",
                    "Elasticity conditions",
                    "Magnitude/significance",
                    "Challenging assumptions",
                  ]).map((technique, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-xs text-violet-700 font-medium shadow-sm border border-violet-100">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.evaluations.slice(0, showDetailedPlan ? 3 : 2).map((evaluation, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100">
                <h5 className="text-sm font-semibold text-amber-800 mb-2">{evaluation.point}</h5>
                {showDetailedPlan && (
                  <p className="text-sm text-amber-700/80 leading-relaxed">{evaluation.development}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Diagram */}
        {result.diagram && result.diagram !== "none" && (
          <Card className="overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                    Required Diagram
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {result.diagramSection?.name || result.diagram.replace("-", " ")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showDetailedPlan && result.diagramSection?.keyLabels && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.diagramSection.keyLabels.map((label, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-medium">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              {result.diagramExplanation && (
                <p className="text-sm text-neutral-600 leading-relaxed">{result.diagramExplanation}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conclusion */}
        <Card className="overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm">
                  {result.arguments.length + 3}
                </span>
                <div>
                  <CardTitle className="text-lg font-semibold">Conclusion</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Weigh evidence and give your judgement</CardDescription>
                </div>
              </div>
              <AOBadge ao="ao4" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-neutral-700">Diagram Uploaded</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Remove
          </Button>
        </div>
        <div className="rounded-xl overflow-hidden border border-neutral-200 bg-white">
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
        <Label className="text-sm font-medium text-neutral-700">Diagram Upload</Label>
        <Badge variant="secondary" className="text-[10px] font-medium">Optional</Badge>
      </div>
      <div
        className="flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50 group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center mb-3 transition-colors">
          <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-500" />
        </div>
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <PenTool className="w-7 h-7 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">Grade Your Answer</h2>
        <p className="text-sm text-neutral-500">Get AI-powered feedback aligned with Edexcel mark schemes</p>
      </div>

      <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
        <CardContent className="p-8 space-y-7">
          {/* Question Type */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-neutral-700">Question Type</Label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger className="h-11 rounded-xl bg-neutral-50 border-neutral-200 hover:bg-neutral-100 transition-colors">
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
            <Label className="text-sm font-medium text-neutral-700">Exam Question</Label>
            <Textarea
              placeholder="Paste the exam question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl bg-neutral-50 border-neutral-200 hover:bg-neutral-100/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Student Answer */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-neutral-700">Student Answer</Label>
            <Textarea
              placeholder="Paste the student's answer here for grading..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[200px] resize-none rounded-xl bg-neutral-50 border-neutral-200 hover:bg-neutral-100/50 focus:bg-white transition-colors"
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
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 h-12 rounded-xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Grade Answer
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClear}
              className="h-12 px-6 rounded-xl border-neutral-200 hover:bg-neutral-50"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <FileText className="w-7 h-7 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">Plan Your Essay</h2>
        <p className="text-sm text-neutral-500">Generate a comprehensive A*-grade essay structure</p>
      </div>

      <Card className="overflow-hidden border-neutral-200/60 shadow-sm">
        <CardContent className="p-8 space-y-7">
          {/* Question Type */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-neutral-700">Question Type</Label>
            <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
              <SelectTrigger className="h-11 rounded-xl bg-neutral-50 border-neutral-200 hover:bg-neutral-100 transition-colors">
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
            <Label className="text-sm font-medium text-neutral-700">Essay Question</Label>
            <Textarea
              placeholder="Type or paste the essay question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[140px] resize-none rounded-xl bg-neutral-50 border-neutral-200 hover:bg-neutral-100/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 h-12 rounded-xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md"
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
            <Button
              variant="outline"
              onClick={onClear}
              className="h-12 px-6 rounded-xl border-neutral-200 hover:bg-neutral-50"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LOADING VIEW
// ============================================================================

function LoadingView({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-24">
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
        <div className="absolute inset-0 rounded-full border-4 border-neutral-900 border-t-transparent animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{message}</h3>
      <p className="text-sm text-neutral-500">Powered by Claude AI</p>
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
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="relative overflow-hidden border-b border-neutral-100">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/80 to-white pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-10 text-center">
          {/* Brand */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Pearson Edexcel IAL
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-2">
            Economics
          </h1>

          <p className="text-sm text-neutral-400 font-medium">
            AS & A Level · Units 1–4
          </p>
        </div>
      </header>

      {/* Mode Navigation */}
      {showTabs && (
        <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-neutral-100">
              <button
                onClick={() => setActiveMode("grader")}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeMode === "grader"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                Exam Grader
              </button>
              <button
                onClick={() => setActiveMode("planner")}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeMode === "planner"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                <FileText className="w-4 h-4" />
                Essay Planner
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
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
      <footer className="border-t border-neutral-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-400">
                AI-powered grading aligned with Edexcel IAL Economics mark schemes
              </p>
            </div>
            <p className="text-xs text-neutral-300">
              Always verify with your teacher or official mark schemes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
