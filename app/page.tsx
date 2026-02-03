"use client";

import { useState } from "react";
import {
  FileText,
  Lightbulb,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  ChevronRight,
} from "lucide-react";
import {
  QUESTION_TYPE_OPTIONS,
  TOPIC_OPTIONS,
  DIAGRAM_OPTIONS,
  MARK_SCHEMES,
  LEVEL_DESCRIPTORS,
} from "@/lib/constants";
import {
  GradingResult,
  PlanResult,
  QuestionType,
  DiagramType,
} from "@/lib/types";
import {
  cn,
  getGradeColor,
  getGradeBand,
  formatPercentage,
  getAOLabel,
} from "@/lib/utils";

// ============================================================================
// ECONOMIC DIAGRAMS (SVG Components)
// ============================================================================

function ADASCurveDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B5A4D" />
        </marker>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <line x1="50" y1="250" x2="50" y2="20" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead)" />
      {/* Axis labels */}
      <text x="200" y="285" textAnchor="middle" className="fill-brown-700 text-sm font-medium">Real GDP</text>
      <text x="25" y="140" textAnchor="middle" transform="rotate(-90, 25, 140)" className="fill-brown-700 text-sm font-medium">Price Level</text>
      {/* LRAS - Vertical line */}
      <line x1="280" y1="60" x2="280" y2="240" stroke="#A67C52" strokeWidth="2.5" />
      <text x="290" y="55" className="fill-accent text-xs font-semibold">LRAS</text>
      {/* SRAS curve */}
      <path d="M 80,200 Q 180,180 280,100 T 360,60" fill="none" stroke="#8B7355" strokeWidth="2.5" />
      <text x="350" y="50" className="fill-brown-500 text-xs font-semibold">SRAS</text>
      {/* AD curve */}
      <path d="M 80,80 Q 180,120 280,200 T 360,240" fill="none" stroke="#6B5A4D" strokeWidth="2.5" />
      <text x="350" y="235" className="fill-brown-600 text-xs font-semibold">AD</text>
      {/* Equilibrium point */}
      <circle cx="210" cy="145" r="5" fill="#A67C52" />
      <text x="225" y="140" className="fill-accent text-xs">E</text>
      {/* Equilibrium dotted lines */}
      <line x1="50" y1="145" x2="210" y2="145" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="210" y1="145" x2="210" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <text x="40" y="150" className="fill-brown-600 text-xs">P₁</text>
      <text x="205" y="265" className="fill-brown-600 text-xs">Y₁</text>
    </svg>
  );
}

function SupplyDemandDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto">
      <defs>
        <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B5A4D" />
        </marker>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead2)" />
      <line x1="50" y1="250" x2="50" y2="20" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead2)" />
      {/* Axis labels */}
      <text x="200" y="285" textAnchor="middle" className="fill-brown-700 text-sm font-medium">Quantity</text>
      <text x="25" y="140" textAnchor="middle" transform="rotate(-90, 25, 140)" className="fill-brown-700 text-sm font-medium">Price</text>
      {/* Supply curve */}
      <line x1="80" y1="220" x2="340" y2="60" stroke="#8B7355" strokeWidth="2.5" />
      <text x="345" y="55" className="fill-brown-500 text-xs font-semibold">S</text>
      {/* Demand curve */}
      <line x1="80" y1="60" x2="340" y2="220" stroke="#6B5A4D" strokeWidth="2.5" />
      <text x="345" y="225" className="fill-brown-600 text-xs font-semibold">D</text>
      {/* Equilibrium point */}
      <circle cx="210" cy="140" r="5" fill="#A67C52" />
      <text x="220" y="130" className="fill-accent text-xs font-medium">E</text>
      {/* Equilibrium dotted lines */}
      <line x1="50" y1="140" x2="210" y2="140" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="210" y1="140" x2="210" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <text x="35" y="145" className="fill-brown-600 text-xs">P*</text>
      <text x="205" y="265" className="fill-brown-600 text-xs">Q*</text>
    </svg>
  );
}

function MonopolyDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto">
      <defs>
        <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B5A4D" />
        </marker>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead3)" />
      <line x1="50" y1="250" x2="50" y2="20" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead3)" />
      {/* Axis labels */}
      <text x="200" y="285" textAnchor="middle" className="fill-brown-700 text-sm font-medium">Quantity</text>
      <text x="25" y="140" textAnchor="middle" transform="rotate(-90, 25, 140)" className="fill-brown-700 text-sm font-medium">Cost/Revenue</text>
      {/* MC=AC (U-shaped, simplified as flat for diagram clarity) */}
      <path d="M 80,180 Q 160,160 200,150 Q 240,145 280,150 Q 320,160 360,180" fill="none" stroke="#8B7355" strokeWidth="2" />
      <text x="365" y="185" className="fill-brown-500 text-xs font-semibold">MC=AC</text>
      {/* AR/Demand curve */}
      <line x1="80" y1="60" x2="340" y2="220" stroke="#6B5A4D" strokeWidth="2" />
      <text x="345" y="225" className="fill-brown-600 text-xs font-semibold">AR=D</text>
      {/* MR curve (steeper) */}
      <line x1="80" y1="60" x2="220" y2="220" stroke="#A67C52" strokeWidth="2" />
      <text x="225" y="225" className="fill-accent text-xs font-semibold">MR</text>
      {/* Profit max point MC=MR */}
      <circle cx="160" cy="160" r="4" fill="#A67C52" />
      {/* Vertical line from MC=MR to AR */}
      <line x1="160" y1="160" x2="160" y2="105" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      {/* Price and quantity lines */}
      <line x1="50" y1="105" x2="160" y2="105" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="50" y1="160" x2="160" y2="160" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="160" y1="160" x2="160" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      {/* Supernormal profit area */}
      <rect x="50" y="105" width="110" height="55" fill="#A67C52" fillOpacity="0.2" />
      <text x="105" y="135" className="fill-accent text-xs font-medium">Profit</text>
      {/* Labels */}
      <text x="35" y="110" className="fill-brown-600 text-xs">Pm</text>
      <text x="35" y="165" className="fill-brown-600 text-xs">AC</text>
      <text x="155" y="265" className="fill-brown-600 text-xs">Qm</text>
    </svg>
  );
}

function ExternalityDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto">
      <defs>
        <marker id="arrowhead4" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B5A4D" />
        </marker>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead4)" />
      <line x1="50" y1="250" x2="50" y2="20" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead4)" />
      {/* Axis labels */}
      <text x="200" y="285" textAnchor="middle" className="fill-brown-700 text-sm font-medium">Quantity</text>
      <text x="25" y="140" textAnchor="middle" transform="rotate(-90, 25, 140)" className="fill-brown-700 text-sm font-medium">Cost/Benefit</text>
      {/* MSC (above MPC) */}
      <line x1="80" y1="180" x2="340" y2="40" stroke="#A67C52" strokeWidth="2.5" />
      <text x="345" y="35" className="fill-accent text-xs font-semibold">MSC</text>
      {/* MPC/Supply */}
      <line x1="80" y1="220" x2="340" y2="80" stroke="#8B7355" strokeWidth="2.5" />
      <text x="345" y="75" className="fill-brown-500 text-xs font-semibold">MPC</text>
      {/* MSB/Demand */}
      <line x1="80" y1="60" x2="340" y2="220" stroke="#6B5A4D" strokeWidth="2.5" />
      <text x="345" y="225" className="fill-brown-600 text-xs font-semibold">MSB=MPB</text>
      {/* Market equilibrium (MPC=MSB) */}
      <circle cx="240" cy="130" r="4" fill="#8B7355" />
      {/* Social optimum (MSC=MSB) */}
      <circle cx="190" cy="145" r="4" fill="#A67C52" />
      {/* Deadweight loss triangle */}
      <polygon points="190,145 240,130 240,95" fill="#A67C52" fillOpacity="0.3" stroke="#A67C52" strokeWidth="1" />
      <text x="220" y="120" className="fill-accent text-xs">DWL</text>
      {/* Quantity lines */}
      <line x1="190" y1="145" x2="190" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="240" y1="130" x2="240" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <text x="185" y="265" className="fill-brown-600 text-xs">Q*</text>
      <text x="235" y="265" className="fill-brown-600 text-xs">Qm</text>
    </svg>
  );
}

function LabourMarketDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-auto">
      <defs>
        <marker id="arrowhead5" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6B5A4D" />
        </marker>
      </defs>
      {/* Axes */}
      <line x1="50" y1="250" x2="380" y2="250" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead5)" />
      <line x1="50" y1="250" x2="50" y2="20" stroke="#6B5A4D" strokeWidth="2" markerEnd="url(#arrowhead5)" />
      {/* Axis labels */}
      <text x="200" y="285" textAnchor="middle" className="fill-brown-700 text-sm font-medium">Quantity of Labour</text>
      <text x="25" y="140" textAnchor="middle" transform="rotate(-90, 25, 140)" className="fill-brown-700 text-sm font-medium">Wage Rate</text>
      {/* Supply of Labour (SL) */}
      <line x1="80" y1="220" x2="340" y2="60" stroke="#8B7355" strokeWidth="2.5" />
      <text x="345" y="55" className="fill-brown-500 text-xs font-semibold">SL</text>
      {/* Demand for Labour (DL=MRPL) */}
      <line x1="80" y1="60" x2="340" y2="220" stroke="#6B5A4D" strokeWidth="2.5" />
      <text x="320" y="235" className="fill-brown-600 text-xs font-semibold">DL=MRPL</text>
      {/* Equilibrium point */}
      <circle cx="210" cy="140" r="5" fill="#A67C52" />
      <text x="220" y="130" className="fill-accent text-xs font-medium">E</text>
      {/* Equilibrium dotted lines */}
      <line x1="50" y1="140" x2="210" y2="140" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <line x1="210" y1="140" x2="210" y2="250" stroke="#6B5A4D" strokeWidth="1" strokeDasharray="4,4" />
      <text x="35" y="145" className="fill-brown-600 text-xs">W*</text>
      <text x="205" y="265" className="fill-brown-600 text-xs">L*</text>
    </svg>
  );
}

function DiagramDisplay({ type }: { type: DiagramType }) {
  switch (type) {
    case "ad-as":
      return <ADASCurveDiagram />;
    case "supply-demand":
      return <SupplyDemandDiagram />;
    case "monopoly":
      return <MonopolyDiagram />;
    case "externality":
      return <ExternalityDiagram />;
    case "labour-market":
      return <LabourMarketDiagram />;
    default:
      return null;
  }
}

// ============================================================================
// SCORE DISPLAY COMPONENTS
// ============================================================================

function ScoreBar({
  label,
  score,
  maxScore,
}: {
  label: string;
  score: number;
  maxScore: number;
}) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-brown-600">{label}</span>
        <span className="font-medium text-brown-800">
          {score}/{maxScore}
        </span>
      </div>
      <div className="score-bar">
        <div
          className="score-fill bg-gradient-to-r from-brown-400 to-brown-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function GradeDisplay({ result, questionType }: { result: GradingResult; questionType: QuestionType }) {
  const markScheme = MARK_SCHEMES[questionType];
  const gradeBand = getGradeBand(result.overallPercentage);
  const gradeColor = getGradeColor(result.overallPercentage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-brown-800">
              Overall Score
            </h3>
            <p className="text-brown-500 text-sm">
              Level {result.levelAchieved}: {LEVEL_DESCRIPTORS[result.levelAchieved]}
            </p>
          </div>
          <div className="text-right">
            <div className={cn("text-4xl font-serif font-bold", gradeColor)}>
              {gradeBand}
            </div>
            <div className="text-brown-600 font-medium">
              {result.totalMarks}/{markScheme.total} ({formatPercentage(result.overallPercentage)})
            </div>
          </div>
        </div>

        {/* AO Scores */}
        <div className="space-y-4">
          <h4 className="font-medium text-brown-700 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Assessment Objectives Breakdown
          </h4>
          {markScheme.ao1 > 0 && (
            <ScoreBar label={getAOLabel("ao1")} score={result.aoScores.ao1} maxScore={markScheme.ao1} />
          )}
          {markScheme.ao2 > 0 && (
            <ScoreBar label={getAOLabel("ao2")} score={result.aoScores.ao2} maxScore={markScheme.ao2} />
          )}
          {markScheme.ao3 > 0 && (
            <ScoreBar label={getAOLabel("ao3")} score={result.aoScores.ao3} maxScore={markScheme.ao3} />
          )}
          {markScheme.ao4 > 0 && (
            <ScoreBar label={getAOLabel("ao4")} score={result.aoScores.ao4} maxScore={markScheme.ao4} />
          )}
        </div>
      </div>

      {/* Examiner Comment */}
      <div className="card">
        <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-3">
          <Award className="w-4 h-4" />
          Examiner Comment
        </h4>
        <p className="text-brown-700 italic leading-relaxed">
          &ldquo;{result.examinerComment}&rdquo;
        </p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h4 className="font-medium text-green-700 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {result.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-brown-700 text-sm">
                <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4 className="font-medium text-amber-700 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {result.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-brown-700 text-sm">
                <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PLAN DISPLAY COMPONENT
// ============================================================================

function PlanDisplay({ result }: { result: PlanResult }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Thesis */}
      <div className="card">
        <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4" />
          Thesis Statement
        </h4>
        <p className="text-brown-800 leading-relaxed bg-brown-50 p-4 rounded-lg border-l-4 border-brown-400">
          {result.thesis}
        </p>
      </div>

      {/* Arguments */}
      <div className="card">
        <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" />
          Main Arguments
        </h4>
        <div className="space-y-4">
          {result.arguments.map((arg, index) => (
            <div
              key={index}
              className="bg-brown-50 rounded-lg p-4 border border-brown-100"
            >
              <h5 className="font-semibold text-brown-800 mb-2">
                {index + 1}. {arg.point}
              </h5>
              <div className="space-y-2 text-sm">
                <p className="text-brown-700">
                  <span className="font-medium text-brown-600">Theory: </span>
                  {arg.explanation}
                </p>
                <p className="text-brown-700">
                  <span className="font-medium text-brown-600">Example: </span>
                  {arg.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagram */}
      {result.diagram && result.diagram !== "none" && (
        <div className="card">
          <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" />
            Recommended Diagram
          </h4>
          <div className="bg-white rounded-lg p-4 border border-brown-100 max-w-md mx-auto">
            <DiagramDisplay type={result.diagram as DiagramType} />
          </div>
          {result.diagramExplanation && (
            <p className="mt-4 text-sm text-brown-600 bg-brown-50 p-3 rounded-lg">
              <span className="font-medium">How to use: </span>
              {result.diagramExplanation}
            </p>
          )}
        </div>
      )}

      {/* Evaluations */}
      <div className="card">
        <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-4">
          <Target className="w-4 h-4" />
          Evaluation Points
        </h4>
        <div className="space-y-3">
          {result.evaluations.map((evaluation, index) => (
            <div
              key={index}
              className="bg-amber-50 rounded-lg p-4 border border-amber-100"
            >
              <h5 className="font-semibold text-amber-800 mb-1">
                {evaluation.point}
              </h5>
              <p className="text-amber-700 text-sm">{evaluation.development}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div className="card">
        <h4 className="font-medium text-brown-700 flex items-center gap-2 mb-3">
          <Award className="w-4 h-4" />
          Conclusion
        </h4>
        <p className="text-brown-800 leading-relaxed bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
          {result.conclusion}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"grade" | "plan">("grade");

  // Grading state
  const [gradeQuestion, setGradeQuestion] = useState("");
  const [gradeEssay, setGradeEssay] = useState("");
  const [gradeQuestionType, setGradeQuestionType] = useState<QuestionType>("evaluate-20");
  const [gradeTopic, setGradeTopic] = useState("");
  const [gradeResult, setGradeResult] = useState<GradingResult | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  // Planning state
  const [planQuestion, setPlanQuestion] = useState("");
  const [planQuestionType, setPlanQuestionType] = useState<QuestionType>("evaluate-20");
  const [planTopic, setPlanTopic] = useState("");
  const [planIncludeDiagram, setPlanIncludeDiagram] = useState(true);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  // Handle grading submission
  const handleGrade = async () => {
    if (!gradeQuestion.trim() || !gradeEssay.trim()) {
      setGradeError("Please enter both a question and your essay response.");
      return;
    }

    setGradeLoading(true);
    setGradeError("");
    setGradeResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: gradeEssay,
          question: gradeQuestion,
          questionType: gradeQuestionType,
          topic: gradeTopic || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to grade essay");
      }

      const result = await response.json();
      setGradeResult(result);
    } catch (error) {
      setGradeError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setGradeLoading(false);
    }
  };

  // Handle planning submission
  const handlePlan = async () => {
    if (!planQuestion.trim()) {
      setPlanError("Please enter a question to generate a plan for.");
      return;
    }

    setPlanLoading(true);
    setPlanError("");
    setPlanResult(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: planQuestion,
          questionType: planQuestionType,
          topic: planTopic || undefined,
          includeDiagram: planIncludeDiagram,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }

      const result = await response.json();
      setPlanResult(result);
    } catch (error) {
      setPlanError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-semibold text-brown-800 mb-2">
          Edexcel IAL Economics
        </h2>
        <p className="text-brown-600 max-w-2xl mx-auto">
          Get AI-powered feedback on your essays with detailed Assessment Objective breakdowns,
          or generate A*-grade essay plans for any question.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-brown-200 mb-8">
        <button
          onClick={() => setActiveTab("grade")}
          className={cn("tab-button", activeTab === "grade" && "active")}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Grade Essay
        </button>
        <button
          onClick={() => setActiveTab("plan")}
          className={cn("tab-button", activeTab === "plan" && "active")}
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Essay Planner
        </button>
      </div>

      {/* Grading Tab */}
      {activeTab === "grade" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-serif text-xl font-semibold text-brown-800 mb-6">
                Submit Your Essay
              </h3>

              <div className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="field-label">Question Type</label>
                  <select
                    value={gradeQuestionType}
                    onChange={(e) => setGradeQuestionType(e.target.value as QuestionType)}
                    className="field-select"
                  >
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic (optional) */}
                <div>
                  <label className="field-label">Topic (Optional)</label>
                  <select
                    value={gradeTopic}
                    onChange={(e) => setGradeTopic(e.target.value)}
                    className="field-select"
                  >
                    <option value="">Select a topic...</option>
                    {TOPIC_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question */}
                <div>
                  <label className="field-label">Question</label>
                  <textarea
                    value={gradeQuestion}
                    onChange={(e) => setGradeQuestion(e.target.value)}
                    placeholder="Enter the exam question here..."
                    className="field-textarea min-h-[100px]"
                  />
                </div>

                {/* Essay */}
                <div>
                  <label className="field-label">Your Essay Response</label>
                  <textarea
                    value={gradeEssay}
                    onChange={(e) => setGradeEssay(e.target.value)}
                    placeholder="Paste your essay response here..."
                    className="field-textarea min-h-[300px]"
                  />
                </div>

                {/* Error message */}
                {gradeError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {gradeError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleGrade}
                  disabled={gradeLoading}
                  className="btn-primary w-full"
                >
                  {gradeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Grading...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Grade Essay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {gradeResult ? (
              <GradeDisplay result={gradeResult} questionType={gradeQuestionType} />
            ) : (
              <div className="card h-full flex flex-col items-center justify-center text-center py-12">
                <FileText className="w-16 h-16 text-brown-300 mb-4" />
                <h3 className="font-serif text-xl text-brown-600 mb-2">
                  Your Results Will Appear Here
                </h3>
                <p className="text-brown-500 text-sm max-w-sm">
                  Submit your essay to receive detailed feedback with Assessment Objective
                  breakdowns and examiner comments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planning Tab */}
      {activeTab === "plan" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-serif text-xl font-semibold text-brown-800 mb-6">
                Generate Essay Plan
              </h3>

              <div className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="field-label">Question Type</label>
                  <select
                    value={planQuestionType}
                    onChange={(e) => setPlanQuestionType(e.target.value as QuestionType)}
                    className="field-select"
                  >
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic (optional) */}
                <div>
                  <label className="field-label">Topic (Optional)</label>
                  <select
                    value={planTopic}
                    onChange={(e) => setPlanTopic(e.target.value)}
                    className="field-select"
                  >
                    <option value="">Select a topic...</option>
                    {TOPIC_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question */}
                <div>
                  <label className="field-label">Question</label>
                  <textarea
                    value={planQuestion}
                    onChange={(e) => setPlanQuestion(e.target.value)}
                    placeholder="Enter the exam question you want to plan..."
                    className="field-textarea min-h-[120px]"
                  />
                </div>

                {/* Include Diagram */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeDiagram"
                    checked={planIncludeDiagram}
                    onChange={(e) => setPlanIncludeDiagram(e.target.checked)}
                    className="w-4 h-4 text-brown-600 rounded border-brown-300 focus:ring-brown-500"
                  />
                  <label htmlFor="includeDiagram" className="text-sm text-brown-700">
                    Include diagram recommendation
                  </label>
                </div>

                {/* Error message */}
                {planError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {planError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handlePlan}
                  disabled={planLoading}
                  className="btn-primary w-full"
                >
                  {planLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {planResult ? (
              <PlanDisplay result={planResult} />
            ) : (
              <div className="card h-full flex flex-col items-center justify-center text-center py-12">
                <Lightbulb className="w-16 h-16 text-brown-300 mb-4" />
                <h3 className="font-serif text-xl text-brown-600 mb-2">
                  Your Plan Will Appear Here
                </h3>
                <p className="text-brown-500 text-sm max-w-sm">
                  Enter a question to generate a comprehensive A*-grade essay plan with thesis,
                  arguments, evaluations, and diagram recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zen divider */}
      <div className="zen-divider" />

      {/* Mark Scheme Reference */}
      <div className="card max-w-4xl mx-auto">
        <h3 className="font-serif text-xl font-semibold text-brown-800 mb-4 text-center">
          Edexcel IAL Mark Scheme Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brown-200">
                <th className="text-left py-2 px-3 text-brown-700">Question Type</th>
                <th className="text-center py-2 px-3 text-brown-700">AO1</th>
                <th className="text-center py-2 px-3 text-brown-700">AO2</th>
                <th className="text-center py-2 px-3 text-brown-700">AO3</th>
                <th className="text-center py-2 px-3 text-brown-700">AO4</th>
                <th className="text-center py-2 px-3 text-brown-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {QUESTION_TYPE_OPTIONS.map((option) => {
                const scheme = MARK_SCHEMES[option.value];
                return (
                  <tr key={option.value} className="border-b border-brown-100">
                    <td className="py-2 px-3 text-brown-800">{option.label}</td>
                    <td className="text-center py-2 px-3 text-brown-600">{scheme.ao1}</td>
                    <td className="text-center py-2 px-3 text-brown-600">{scheme.ao2}</td>
                    <td className="text-center py-2 px-3 text-brown-600">{scheme.ao3}</td>
                    <td className="text-center py-2 px-3 text-brown-600">{scheme.ao4}</td>
                    <td className="text-center py-2 px-3 font-medium text-brown-800">
                      {scheme.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
