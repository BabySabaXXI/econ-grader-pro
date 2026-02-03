// Edexcel IAL Economics Diagram Types and Interfaces

/**
 * Edexcel IAL Units
 * Unit 1: Markets in Action (AS)
 * Unit 2: Macroeconomic Performance and Policy (AS)
 * Unit 3: Business Behaviour and the Labour Market (A2)
 * Unit 4: A Global Perspective (A2)
 */
export type EdexcelUnit = 'unit1' | 'unit2' | 'unit3' | 'unit4';

export type DiagramCategory =
  | 'supply_demand'
  | 'elasticity'
  | 'market_failure'
  | 'government_intervention'
  | 'macroeconomic'
  | 'market_structures'
  | 'labour_market'
  | 'international'
  | 'development'
  | 'monetary_fiscal';

export type DiagramDifficulty = 'AS' | 'A2';

export interface DiagramLabel {
  text: string;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
  fontSize?: number;
}

export interface DiagramCurve {
  id: string;
  name: string;
  type: 'line' | 'curve' | 'dashed';
  points: { x: number; y: number }[];
  color: string;
  strokeWidth?: number;
}

export interface DiagramPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  description?: string;
}

export interface DiagramArea {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  fill: string;
  opacity?: number;
  description?: string;
}

export interface DiagramAxis {
  xLabel: string;
  yLabel: string;
  xDescription?: string;
  yDescription?: string;
}

export interface DiagramShift {
  curveId: string;
  direction: 'left' | 'right' | 'up' | 'down';
  newCurve: DiagramCurve;
  cause: string;
  effect: string;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  slug: string;
  category: DiagramCategory;
  unit: EdexcelUnit;
  difficulty: DiagramDifficulty;
  description: string;

  // Core diagram components
  axis: DiagramAxis;
  curves: DiagramCurve[];
  points: DiagramPoint[];
  areas?: DiagramArea[];
  labels: DiagramLabel[];

  // Educational content
  keyFeatures: string[];
  commonMistakes: string[];
  examTips: string[];
  relatedTopics: string[];
  keywords: string[];

  // Grading criteria
  gradingCriteria: {
    axes: string[];
    curves: string[];
    labels: string[];
    equilibrium: string[];
    shifts?: string[];
    areas?: string[];
  };

  // Possible shifts/variations
  shifts?: DiagramShift[];

  // SVG dimensions
  width: number;
  height: number;
  viewBox: string;
}

export interface DiagramVariation {
  baseTemplateId: string;
  variationId: string;
  name: string;
  description: string;
  changes: {
    curves?: Partial<DiagramCurve>[];
    points?: Partial<DiagramPoint>[];
    areas?: Partial<DiagramArea>[];
    labels?: Partial<DiagramLabel>[];
  };
  context: string;
}

export interface DiagramSuggestion {
  diagram: DiagramTemplate;
  relevanceScore: number;
  reasoning: string;
  usage: string;
  variations?: DiagramVariation[];
}

export interface DiagramGradingResult {
  diagramId: string;
  identifiedDiagram: string;
  confidence: number;

  scores: {
    axes: { score: number; max: number; feedback: string };
    curves: { score: number; max: number; feedback: string };
    labels: { score: number; max: number; feedback: string };
    equilibrium: { score: number; max: number; feedback: string };
    shifts: { score: number; max: number; feedback: string };
    areas: { score: number; max: number; feedback: string };
    overall: { score: number; max: number; percentage: number };
  };

  strengths: string[];
  improvements: string[];
  correctionsNeeded: string[];
  examinerComment: string;
}

export interface DiagramAnalysisRequest {
  imageData: string; // Base64 encoded image
  questionContext?: string;
  expectedDiagram?: string;
  questionType?: string;
  topic?: string;
}

export interface TopicDiagramMapping {
  topic: string;
  keywords: string[];
  primaryDiagrams: string[];
  secondaryDiagrams: string[];
  contextualRules: {
    condition: string;
    diagrams: string[];
  }[];
}
