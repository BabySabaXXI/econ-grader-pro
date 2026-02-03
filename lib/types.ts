export interface AOScores {
  ao1: number;
  ao2: number;
  ao3: number;
  ao4: number;
}

export interface GradingResult {
  aoScores: AOScores;
  totalMarks: number;
  overallPercentage: number;
  levelAchieved: number;
  strengths: string[];
  improvements: string[];
  examinerComment: string;
}

export interface GradeRequest {
  essay: string;
  question: string;
  questionType: string;
  topic?: string;
}

export interface PlanArgument {
  point: string;
  explanation: string;
  example: string;
}

export interface PlanEvaluation {
  point: string;
  development: string;
}

export interface PlanResult {
  thesis: string;
  arguments: PlanArgument[];
  evaluations: PlanEvaluation[];
  diagram: string;
  diagramExplanation: string;
  conclusion: string;
}

export interface PlanRequest {
  question: string;
  questionType: string;
  topic?: string;
  includeDiagram?: boolean;
}

export interface MarkScheme {
  ao1: number;
  ao2: number;
  ao3: number;
  ao4: number;
  total: number;
}

export type QuestionType =
  | "define-4"
  | "explain-6"
  | "explain-8"
  | "assess-12"
  | "evaluate-15"
  | "evaluate-20"
  | "evaluate-25";

export type DiagramType =
  | "ad-as"
  | "supply-demand"
  | "monopoly"
  | "externality"
  | "labour-market"
  | "none";
