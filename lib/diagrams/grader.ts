// Edexcel IAL Economics - Diagram Grading Utilities
// Helper functions for AI-powered diagram grading

import { DiagramTemplate, DiagramGradingResult } from './types';
import { getDiagramById, QUESTION_DIAGRAM_MARKS } from './engine';

/**
 * Build grading criteria description for a diagram
 */
export function buildGradingCriteriaText(diagram: DiagramTemplate): string {
  const criteria = diagram.gradingCriteria;

  let text = `GRADING CRITERIA FOR ${diagram.name.toUpperCase()}:\n\n`;

  if (criteria.axes?.length) {
    text += `AXES (1 mark):\n`;
    criteria.axes.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  if (criteria.curves?.length) {
    text += `CURVES (2 marks):\n`;
    criteria.curves.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  if (criteria.labels?.length) {
    text += `LABELS (1 mark):\n`;
    criteria.labels.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  if (criteria.equilibrium?.length) {
    text += `EQUILIBRIUM (1 mark):\n`;
    criteria.equilibrium.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  if (criteria.shifts?.length) {
    text += `SHIFTS (1 mark):\n`;
    criteria.shifts.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  if (criteria.areas?.length) {
    text += `AREAS/SHADING (1 mark):\n`;
    criteria.areas.forEach(c => text += `  • ${c}\n`);
    text += '\n';
  }

  return text;
}

/**
 * Get marks available for diagram based on question type
 */
export function getDiagramMarks(questionType: string): {
  marks: number;
  recommended: boolean;
  description: string;
} {
  const info = QUESTION_DIAGRAM_MARKS[questionType] || { marks: 0, recommended: false };

  let description = '';
  switch (questionType) {
    case 'define-4':
      description = 'Diagram not required for definition questions.';
      break;
    case 'explain-6':
      description = 'Diagram optional - can support explanation for +1-2 marks.';
      break;
    case 'explain-8':
      description = 'Diagram recommended - can earn up to 3 marks.';
      break;
    case 'assess-12':
      description = 'Diagram strongly recommended - can earn up to 4 marks for accurate, labelled diagram.';
      break;
    case 'evaluate-15':
      description = 'Diagram strongly recommended - essential for full marks.';
      break;
    case 'evaluate-20':
      description = 'Diagram essential - up to 5 marks for well-drawn, fully labelled diagram with shifts.';
      break;
    case 'evaluate-25':
      description = 'Diagram essential - up to 6 marks for comprehensive diagram showing analysis.';
      break;
    default:
      description = 'Include relevant diagram to support your answer.';
  }

  return {
    marks: info.marks,
    recommended: info.recommended,
    description
  };
}

/**
 * Generate feedback for diagram score
 */
export function generateDiagramFeedback(
  score: number,
  maxScore: number,
  diagramId?: string
): string {
  const percentage = (score / maxScore) * 100;
  const diagram = diagramId ? getDiagramById(diagramId) : null;

  let feedback = '';

  if (percentage >= 80) {
    feedback = 'Excellent diagram! ';
    if (diagram) {
      feedback += `Your ${diagram.name} diagram clearly shows all key features. `;
    }
    feedback += 'Well labelled with correct curves and equilibrium points.';
  } else if (percentage >= 60) {
    feedback = 'Good diagram with most key elements present. ';
    if (diagram) {
      feedback += `Consider adding: ${diagram.examTips?.[0] || 'more detail'}.`;
    }
  } else if (percentage >= 40) {
    feedback = 'Basic diagram present but missing some key elements. ';
    if (diagram) {
      const tips = diagram.examTips?.slice(0, 2) || [];
      feedback += `Remember to: ${tips.join('; ')}.`;
    }
  } else if (percentage > 0) {
    feedback = 'Diagram attempted but needs significant improvement. ';
    if (diagram) {
      const mistakes = diagram.commonMistakes?.slice(0, 2) || [];
      feedback += `Common mistakes to avoid: ${mistakes.join('; ')}.`;
    }
  } else {
    feedback = 'No diagram provided. ';
    if (diagram) {
      feedback += `A ${diagram.name} diagram would strengthen your answer.`;
    }
  }

  return feedback;
}

/**
 * Check if essay mentions diagram correctly
 */
export function analyzeDiagramMention(
  essayText: string,
  expectedDiagramId: string
): {
  mentioned: boolean;
  correctType: boolean;
  quality: 'none' | 'basic' | 'good' | 'excellent';
  feedback: string;
} {
  const diagram = getDiagramById(expectedDiagramId);
  if (!diagram) {
    return {
      mentioned: false,
      correctType: false,
      quality: 'none',
      feedback: 'Expected diagram not found in database.'
    };
  }

  const lowerText = essayText.toLowerCase();

  // Check for diagram mention
  const diagramKeywords = [
    'diagram', 'figure', 'graph', 'curve', 'shown above',
    'illustrated', 'as shown', 'see diagram'
  ];
  const mentioned = diagramKeywords.some(kw => lowerText.includes(kw));

  // Check for correct diagram type keywords
  const correctTypeKeywords = diagram.keywords || [];
  const correctType = correctTypeKeywords.some(kw =>
    lowerText.includes(kw.toLowerCase())
  );

  // Assess quality based on specificity
  let quality: 'none' | 'basic' | 'good' | 'excellent' = 'none';
  let feedback = '';

  if (!mentioned) {
    quality = 'none';
    feedback = `No diagram reference detected. A ${diagram.name} diagram would support your analysis.`;
  } else if (!correctType) {
    quality = 'basic';
    feedback = `Diagram mentioned but may not be the most appropriate type. Consider using a ${diagram.name} diagram.`;
  } else {
    // Check for detailed labels/features mentioned
    const labelsMentioned = diagram.gradingCriteria.labels?.filter(
      label => lowerText.includes(label.toLowerCase())
    ).length || 0;

    if (labelsMentioned >= 3) {
      quality = 'excellent';
      feedback = 'Diagram well integrated with clear reference to key features and labels.';
    } else if (labelsMentioned >= 1) {
      quality = 'good';
      feedback = 'Diagram correctly identified. Consider referencing more specific labels (e.g., equilibrium points, curve shifts).';
    } else {
      quality = 'basic';
      feedback = 'Diagram type correct but needs more specific references to features shown.';
    }
  }

  return { mentioned, correctType, quality, feedback };
}

/**
 * Create empty grading result
 */
export function createEmptyGradingResult(
  diagramId: string,
  maxMarks: number
): DiagramGradingResult {
  return {
    diagramId,
    identifiedDiagram: 'None',
    confidence: 0,
    scores: {
      axes: { score: 0, max: 1, feedback: 'No diagram provided' },
      curves: { score: 0, max: 2, feedback: 'No diagram provided' },
      labels: { score: 0, max: 1, feedback: 'No diagram provided' },
      equilibrium: { score: 0, max: 1, feedback: 'No diagram provided' },
      shifts: { score: 0, max: 1, feedback: 'No diagram provided' },
      areas: { score: 0, max: 1, feedback: 'No diagram provided' },
      overall: { score: 0, max: maxMarks, percentage: 0 }
    },
    strengths: [],
    improvements: ['Include a relevant diagram to support your answer'],
    correctionsNeeded: [],
    examinerComment: 'No diagram was submitted for grading.'
  };
}
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  buildGradingCriteriaText,
  getDiagramMarks,
  generateDiagramFeedback,
  analyzeDiagramMention,
  createEmptyGradingResult
};
