"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  FileText,
  Target,
  Scale,
  CheckCircle,
  ChevronRight,
  Sparkles,
  List,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanResult } from "@/lib/types";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// AO Badge component
function AOTag({ ao, compact = false }: { ao: string; compact?: boolean }) {
  const colors: Record<string, string> = {
    ao1: "bg-sky-100 text-sky-700 border-sky-200",
    ao2: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ao3: "bg-violet-100 text-violet-700 border-violet-200",
    ao4: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold uppercase tracking-wider border rounded-md",
        colors[ao] || "bg-stone-100 text-stone-700 border-stone-200",
        compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
      )}
    >
      {ao.toUpperCase()}
    </span>
  );
}

// Chain visualization - minimal
function ChainFlow({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.slice(0, 6).map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="px-2 py-1 text-[11px] bg-stone-50 border border-stone-100 rounded text-stone-600">
            {step}
          </span>
          {i < Math.min(steps.length - 1, 5) && (
            <ChevronRight className="w-3 h-3 text-stone-300" />
          )}
        </span>
      ))}
    </div>
  );
}

// Back button
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
      <span className="text-sm font-medium text-stone-600">Edit Question</span>
    </motion.button>
  );
}

// Bento Card wrapper
function BentoCard({
  children,
  className,
  span = 1,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3;
  delay?: number;
}) {
  const spanClasses = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-3",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/60 shadow-sm",
        "hover:shadow-md transition-shadow duration-300",
        spanClasses[span],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Section label
function SectionLabel({
  icon: Icon,
  label,
  color = "stone",
}: {
  icon: React.ElementType;
  label: string;
  color?: "stone" | "sky" | "emerald" | "violet" | "amber";
}) {
  const colorClasses = {
    stone: "bg-stone-100 text-stone-500",
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center",
          colorClasses[color]
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-semibold tracking-wider uppercase text-stone-400">
        {label}
      </span>
    </div>
  );
}

// Introduction Card
function IntroductionCard({ result }: { result: PlanResult }) {
  return (
    <BentoCard span={2}>
      <div className="p-5">
        <SectionLabel icon={Lightbulb} label="Introduction" color="sky" />
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-medium text-stone-800">
            Brief Thesis Statement
          </h3>
          <AOTag ao="ao1" />
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-50/30 border border-sky-100">
          <p className="text-sm text-stone-700 leading-relaxed">
            {result.introduction?.whatToWrite || result.thesis}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-stone-50 border border-stone-100 text-stone-500">
            2-3 sentences max
          </span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-stone-50 border border-stone-100 text-stone-500">
            Signal you understand the debate
          </span>
        </div>
      </div>
    </BentoCard>
  );
}

// Argument Card - Compact bento style
function ArgumentCard({
  arg,
  index,
  isFor,
}: {
  arg: PlanResult["arguments"][0];
  index: number;
  isFor: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <BentoCard span={1}>
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-semibold",
                isFor
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                  : "bg-gradient-to-br from-rose-400 to-rose-500"
              )}
            >
              {isFor ? "+" : "-"}
            </div>
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isFor ? "text-emerald-600" : "text-rose-500"
              )}
            >
              {isFor ? "For" : "Against"}
            </span>
          </div>
          <div className="flex gap-1">
            <AOTag ao="ao2" compact />
            <AOTag ao="ao3" compact />
          </div>
        </div>

        <h4 className="text-sm font-medium text-stone-800 mb-3 line-clamp-2">
          {arg.point}
        </h4>

        {/* Chain of reasoning */}
        {arg.chainOfReasoning && arg.chainOfReasoning.length > 0 && (
          <div className="mb-3">
            <ChainFlow steps={arg.chainOfReasoning} />
          </div>
        )}

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 mb-3"
            >
              <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100">
                <p className="text-[10px] font-semibold uppercase text-sky-600 mb-1">
                  Theory
                </p>
                <p className="text-xs text-stone-600">{arg.explanation}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <p className="text-[10px] font-semibold uppercase text-emerald-600 mb-1">
                  Example
                </p>
                <p className="text-xs text-stone-600">{arg.example}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-auto pt-3 border-t border-stone-100 text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
        >
          {expanded ? "Show less" : "Show details"}
          <ChevronRight
            className={cn(
              "w-3 h-3 transition-transform",
              expanded && "rotate-90"
            )}
          />
        </button>
      </div>
    </BentoCard>
  );
}

// Evaluation Card
function EvaluationCard({ result }: { result: PlanResult }) {
  return (
    <BentoCard span={2}>
      <div className="p-5">
        <SectionLabel icon={Scale} label="Deeper Evaluation" color="violet" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-stone-800">
            Level 5 Thinking
          </h3>
          <div className="flex gap-1">
            <AOTag ao="ao3" />
            <AOTag ao="ao4" />
          </div>
        </div>

        {/* Techniques grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(
            result.deeperEvaluation?.techniques || [
              "Transaction costs",
              "Short run vs long run",
              "Magnitude/significance",
              "Information asymmetry",
            ]
          )
            .slice(0, 4)
            .map((technique, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-50/50 border border-violet-100"
              >
                <Zap className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                <span className="text-xs text-stone-600 line-clamp-1">
                  {technique}
                </span>
              </div>
            ))}
        </div>

        {/* What to write */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-50/30 border border-violet-100">
          <p className="text-[10px] font-semibold uppercase text-violet-600 mb-2">
            Framework
          </p>
          <p className="text-xs text-stone-600 leading-relaxed">
            {result.deeperEvaluation?.whatToWrite ||
              '"The outcome depends on [condition]. Transaction costs may prevent [X]. The magnitude is crucial because [reason]. Compared to [alternative], this is [more/less] effective."'}
          </p>
        </div>
      </div>
    </BentoCard>
  );
}

// Diagram Card
function DiagramCard({ result }: { result: PlanResult }) {
  if (!result.diagram || result.diagram === "none") return null;

  return (
    <BentoCard span={1}>
      <div className="p-5 h-full flex flex-col">
        <SectionLabel icon={FileText} label="Required Diagram" color="amber" />

        <h4 className="text-sm font-medium text-stone-800 mb-3">
          {result.diagramSection?.name ||
            result.diagram.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </h4>

        {/* Key labels */}
        {result.diagramSection?.keyLabels && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {result.diagramSection.keyLabels.slice(0, 6).map((label, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 rounded border border-amber-100"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-stone-500 leading-relaxed mt-auto">
          {result.diagramExplanation?.slice(0, 100)}
          {(result.diagramExplanation?.length || 0) > 100 && "..."}
        </p>
      </div>
    </BentoCard>
  );
}

// Conclusion Card
function ConclusionCard({ result }: { result: PlanResult }) {
  return (
    <BentoCard span={3}>
      <div className="p-5">
        <SectionLabel icon={Target} label="Conclusion" color="emerald" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium text-stone-800">
            Definitive Answer
          </h3>
          <AOTag ao="ao4" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Your conclusion */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/30 border border-emerald-100">
            <p className="text-[10px] font-semibold uppercase text-emerald-600 mb-2">
              Your Stance
            </p>
            <p className="text-sm text-stone-700 leading-relaxed">
              {result.conclusion}
            </p>
          </div>

          {/* Framework */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
            <p className="text-[10px] font-semibold uppercase text-stone-400 mb-2">
              Framework
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              {result.conclusionSection?.whatToWrite ||
                '"On balance, [X] is [more/less likely] because [reason]. The key factor is [condition]. Therefore, [direct answer]."'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
            Do NOT fence-sit
          </span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            State which argument wins
          </span>
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-stone-50 border border-stone-200 text-stone-600">
            Identify the KEY condition
          </span>
        </div>
      </div>
    </BentoCard>
  );
}

// View mode toggle
function ViewToggle({
  mode,
  setMode,
}: {
  mode: "bento" | "list";
  setMode: (mode: "bento" | "list") => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <button
        onClick={() => setMode("bento")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
          mode === "bento"
            ? "bg-stone-800 text-white shadow-lg"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
      >
        <Sparkles className="w-4 h-4" />
        Bento View
      </button>
      <button
        onClick={() => setMode("list")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
          mode === "list"
            ? "bg-stone-800 text-white shadow-lg"
            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
        )}
      >
        <List className="w-4 h-4" />
        List View
      </button>
    </div>
  );
}

// List View - Compact alternative
function ListView({ result }: { result: PlanResult }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* Intro */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-white/80 border border-stone-200/60"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center">
            <span className="text-xs font-bold text-sky-600">1</span>
          </div>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Introduction
          </span>
          <AOTag ao="ao1" compact />
        </div>
        <p className="text-sm text-stone-700">
          {result.introduction?.whatToWrite || result.thesis}
        </p>
      </motion.div>

      {/* Arguments */}
      {result.arguments.map((arg, i) => {
        const isFor = i === 0;
        return (
          <motion.div
            key={i}
            variants={itemVariants}
            className="p-4 rounded-xl bg-white/80 border border-stone-200/60"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center",
                  isFor ? "bg-emerald-100" : "bg-rose-100"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-bold",
                    isFor ? "text-emerald-600" : "text-rose-500"
                  )}
                >
                  {i + 2}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isFor ? "text-emerald-600" : "text-rose-500"
                )}
              >
                Argument {isFor ? "FOR" : "AGAINST"}
              </span>
              <div className="flex gap-1 ml-auto">
                <AOTag ao="ao2" compact />
                <AOTag ao="ao3" compact />
                <AOTag ao="ao4" compact />
              </div>
            </div>
            <p className="text-sm font-medium text-stone-800 mb-2">
              {arg.point}
            </p>
            {arg.chainOfReasoning && (
              <ChainFlow steps={arg.chainOfReasoning} />
            )}
          </motion.div>
        );
      })}

      {/* Evaluation */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-white/80 border border-stone-200/60"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
            <span className="text-xs font-bold text-violet-600">
              {result.arguments.length + 2}
            </span>
          </div>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Deeper Evaluation
          </span>
          <div className="flex gap-1 ml-auto">
            <AOTag ao="ao3" compact />
            <AOTag ao="ao4" compact />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            result.deeperEvaluation?.techniques || [
              "Transaction costs",
              "Short run vs long run",
              "Magnitude",
              "Information asymmetry",
            ]
          ).map((t, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[11px] bg-violet-50 text-violet-600 rounded border border-violet-100"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Diagram */}
      {result.diagram && result.diagram !== "none" && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-white/80 border border-stone-200/60"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText className="w-3 h-3 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Diagram
            </span>
          </div>
          <p className="text-sm font-medium text-stone-800">
            {result.diagramSection?.name || result.diagram.replace(/-/g, " ")}
          </p>
        </motion.div>
      )}

      {/* Conclusion */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-white/80 border border-stone-200/60"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Conclusion
          </span>
          <AOTag ao="ao4" compact />
        </div>
        <p className="text-sm text-stone-700">{result.conclusion}</p>
      </motion.div>
    </motion.div>
  );
}

// Main Bento Plan Display
export function PlanBentoDisplay({
  result,
  onBack,
}: {
  result: PlanResult;
  onBack: () => void;
}) {
  const [viewMode, setViewMode] = useState<"bento" | "list">("bento");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      <BackButton onClick={onBack} />
      <ViewToggle mode={viewMode} setMode={setViewMode} />

      <AnimatePresence mode="wait">
        {viewMode === "bento" ? (
          <motion.div
            key="bento"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Row 1: Introduction (2 cols) + Diagram (1 col) */}
            <IntroductionCard result={result} />
            <DiagramCard result={result} />

            {/* Row 2: Arguments */}
            {result.arguments.slice(0, 2).map((arg, index) => (
              <ArgumentCard
                key={index}
                arg={arg}
                index={index}
                isFor={index === 0}
              />
            ))}

            {/* Row 3: Evaluation (2 cols) + extra argument if exists */}
            <EvaluationCard result={result} />
            {result.arguments[2] && (
              <ArgumentCard arg={result.arguments[2]} index={2} isFor={false} />
            )}

            {/* Row 4: Conclusion (full width) */}
            <ConclusionCard result={result} />
          </motion.div>
        ) : (
          <ListView key="list" result={result} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
