import { MarkScheme, QuestionType, DiagramType } from "./types";

export const MARK_SCHEMES: Record<QuestionType, MarkScheme> = {
  "define-4": { ao1: 4, ao2: 0, ao3: 0, ao4: 0, total: 4 },
  "explain-6": { ao1: 2, ao2: 2, ao3: 2, ao4: 0, total: 6 },
  "explain-8": { ao1: 2, ao2: 2, ao3: 4, ao4: 0, total: 8 },
  "assess-12": { ao1: 2, ao2: 2, ao3: 4, ao4: 4, total: 12 },
  "evaluate-14": { ao1: 2, ao2: 3, ao3: 4, ao4: 5, total: 14 },
  "evaluate-15": { ao1: 3, ao2: 3, ao3: 4, ao4: 5, total: 15 },
  "evaluate-20": { ao1: 4, ao2: 4, ao3: 6, ao4: 6, total: 20 },
  "evaluate-25": { ao1: 5, ao2: 5, ao3: 7, ao4: 8, total: 25 },
};

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "define-4", label: "Define (4 marks)" },
  { value: "explain-6", label: "Explain (6 marks)" },
  { value: "explain-8", label: "Explain (8 marks)" },
  { value: "assess-12", label: "Assess (12 marks)" },
  { value: "evaluate-14", label: "Evaluate (14 marks) — IAL" },
  { value: "evaluate-15", label: "Evaluate (15 marks)" },
  { value: "evaluate-20", label: "Evaluate (20 marks)" },
  { value: "evaluate-25", label: "Evaluate (25 marks)" },
];

export const TOPIC_OPTIONS = [
  { value: "microeconomics", label: "Microeconomics" },
  { value: "macroeconomics", label: "Macroeconomics" },
  { value: "international", label: "International Economics" },
  { value: "development", label: "Development Economics" },
  { value: "labour", label: "Labour Markets" },
  { value: "market-failure", label: "Market Failure" },
  { value: "government-intervention", label: "Government Intervention" },
  { value: "monetary-policy", label: "Monetary Policy" },
  { value: "fiscal-policy", label: "Fiscal Policy" },
  { value: "supply-side", label: "Supply-Side Policies" },
];

export const DIAGRAM_OPTIONS: { value: DiagramType; label: string }[] = [
  { value: "none", label: "No Diagram" },
  { value: "ad-as", label: "AD/AS Curve" },
  { value: "supply-demand", label: "Supply & Demand" },
  { value: "monopoly", label: "Monopoly" },
  { value: "externality", label: "Externality" },
  { value: "labour-market", label: "Labour Market" },
];

export const LEVEL_DESCRIPTORS: Record<number, string> = {
  1: "Limited",
  2: "Basic",
  3: "Sound",
  4: "Good",
  5: "Excellent",
};
