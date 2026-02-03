// Edexcel IAL Economics - Diagram Identification Engine
// Identifies appropriate diagrams based on question/essay content

import { DiagramTemplate, DiagramSuggestion, EdexcelUnit } from './types';
import { KEYWORD_DIAGRAM_MAP, TOPIC_DIAGRAM_MAPPINGS, QUESTION_DIAGRAM_MARKS } from './mappings';
import { UNIT1_DIAGRAMS } from './unit1-diagrams';
import { UNIT2_DIAGRAMS } from './unit2-diagrams';
import { UNIT3_DIAGRAMS } from './unit3-diagrams';
import { UNIT4_DIAGRAMS } from './unit4-diagrams';

// ============================================================================
// DIAGRAM DATABASE - All diagrams combined
// ============================================================================

export const ALL_DIAGRAMS: DiagramTemplate[] = [
  ...UNIT1_DIAGRAMS,
  ...UNIT2_DIAGRAMS,
  ...UNIT3_DIAGRAMS,
  ...UNIT4_DIAGRAMS
];

// Create lookup map for fast access
const DIAGRAM_MAP = new Map<string, DiagramTemplate>();
ALL_DIAGRAMS.forEach(d => DIAGRAM_MAP.set(d.id, d));

// ============================================================================
// CORE ENGINE FUNCTIONS
// ============================================================================

export interface DiagramMatch {
  diagramId: string;
  diagramName: string;
  confidence: number; // 0-100
  reason: string;
  keywords: string[];
  unit: EdexcelUnit;
  category: string;
}

/**
 * Main function: Identify diagrams based on text content
 * @param text - Essay question or content to analyze
 * @param maxResults - Maximum number of results (default 3)
 * @returns Array of diagram matches sorted by confidence
 */
export function identifyDiagrams(text: string, maxResults: number = 3): DiagramMatch[] {
  const normalizedText = normalizeText(text);
  const scores = new Map<string, { score: number; keywords: string[] }>();

  // Score each diagram based on keyword matches
  for (const [keyword, diagramIds] of Object.entries(KEYWORD_DIAGRAM_MAP)) {
    const normalizedKeyword = normalizeText(keyword);

    // Check if keyword appears in text
    if (normalizedText.includes(normalizedKeyword)) {
      // Calculate match quality
      const matchScore = calculateKeywordScore(normalizedKeyword, normalizedText);

      for (const diagramId of diagramIds) {
        const existing = scores.get(diagramId) || { score: 0, keywords: [] };
        existing.score += matchScore;
        existing.keywords.push(keyword);
        scores.set(diagramId, existing);
      }
    }
  }

  // Also check diagram's own keywords
  for (const diagram of ALL_DIAGRAMS) {
    for (const keyword of diagram.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        const existing = scores.get(diagram.id) || { score: 0, keywords: [] };
        existing.score += 5; // Base score for diagram's own keywords
        if (!existing.keywords.includes(keyword)) {
          existing.keywords.push(keyword);
        }
        scores.set(diagram.id, existing);
      }
    }
  }

  // Convert to DiagramMatch array
  const matches: DiagramMatch[] = [];
  for (const [diagramId, data] of scores.entries()) {
    const diagram = DIAGRAM_MAP.get(diagramId);
    if (diagram && data.score > 0) {
      // Normalize confidence to 0-100
      const confidence = Math.min(100, Math.round(data.score * 10));

      matches.push({
        diagramId: diagram.id,
        diagramName: diagram.name,
        confidence,
        reason: generateReason(diagram, data.keywords),
        keywords: data.keywords.slice(0, 5), // Top 5 keywords
        unit: diagram.unit,
        category: diagram.category
      });
    }
  }

  // Sort by confidence (descending) and return top results
  return matches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxResults);
}

/**
 * Get diagram by ID
 */
export function getDiagramById(id: string): DiagramTemplate | null {
  return DIAGRAM_MAP.get(id) || null;
}

/**
 * Get all diagrams for a specific unit
 */
export function getDiagramsByUnit(unit: EdexcelUnit): DiagramTemplate[] {
  return ALL_DIAGRAMS.filter(d => d.unit === unit);
}

/**
 * Get diagrams for a specific topic
 */
export function getDiagramsForTopic(topic: string): DiagramTemplate[] {
  const normalizedTopic = normalizeText(topic);

  // Find matching topic mapping
  const mapping = TOPIC_DIAGRAM_MAPPINGS.find(m =>
    normalizeText(m.topic).includes(normalizedTopic) ||
    normalizedTopic.includes(normalizeText(m.topic))
  );

  if (mapping) {
    const diagrams: DiagramTemplate[] = [];
    for (const id of [...mapping.primaryDiagrams, ...mapping.secondaryDiagrams]) {
      const diagram = DIAGRAM_MAP.get(id);
      if (diagram) diagrams.push(diagram);
    }
    return diagrams;
  }

  // Fallback: search by keywords in topic name
  return ALL_DIAGRAMS.filter(d =>
    d.relatedTopics.some(t =>
      normalizeText(t).includes(normalizedTopic) ||
      normalizedTopic.includes(normalizeText(t))
    )
  );
}

/**
 * Get diagrams by category
 */
export function getDiagramsByCategory(category: string): DiagramTemplate[] {
  return ALL_DIAGRAMS.filter(d => d.category === category);
}

/**
 * Suggest diagrams for essay planning
 */
export function suggestDiagramsForPlan(
  question: string,
  questionType: string,
  topic?: string
): DiagramSuggestion[] {
  // Get diagram marks info
  const marksInfo = QUESTION_DIAGRAM_MARKS[questionType] || { marks: 0, recommended: false };

  // Identify diagrams from question text
  const matches = identifyDiagrams(question, 5);

  // If topic provided, boost diagrams from that topic
  if (topic) {
    const topicDiagrams = getDiagramsForTopic(topic);
    for (const match of matches) {
      if (topicDiagrams.some(d => d.id === match.diagramId)) {
        match.confidence = Math.min(100, match.confidence + 15);
      }
    }
  }

  // Sort again after topic boost
  matches.sort((a, b) => b.confidence - a.confidence);

  // Convert to DiagramSuggestion format
  return matches.slice(0, 3).map((match, index) => {
    const diagram = getDiagramById(match.diagramId)!;
    return {
      diagram,
      relevanceScore: match.confidence,
      reasoning: match.reason,
      usage: generateUsageGuidance(diagram, questionType, marksInfo.marks, index === 0)
    };
  });
}

/**
 * Get recommended diagram for a question (single best match)
 */
export function getRecommendedDiagram(question: string, topic?: string): DiagramTemplate | null {
  const matches = identifyDiagrams(question, 1);

  if (matches.length === 0 && topic) {
    // Fallback to topic-based suggestion
    const topicDiagrams = getDiagramsForTopic(topic);
    return topicDiagrams[0] || null;
  }

  return matches.length > 0 ? getDiagramById(matches[0].diagramId) : null;
}

/**
 * Search diagrams by keyword
 */
export function searchDiagrams(query: string): DiagramTemplate[] {
  const normalizedQuery = normalizeText(query);

  return ALL_DIAGRAMS.filter(diagram => {
    // Search in name
    if (normalizeText(diagram.name).includes(normalizedQuery)) return true;
    // Search in description
    if (normalizeText(diagram.description).includes(normalizedQuery)) return true;
    // Search in keywords
    if (diagram.keywords.some(k => normalizeText(k).includes(normalizedQuery))) return true;
    // Search in related topics
    if (diagram.relatedTopics.some(t => normalizeText(t).includes(normalizedQuery))) return true;

    return false;
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize text for matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(keyword: string, text: string): number {
  let score = 5; // Base score for any match

  // Bonus for exact word match (not substring)
  const wordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
  if (wordPattern.test(text)) {
    score += 3;
  }

  // Bonus for multiple occurrences
  const matches = text.split(keyword).length - 1;
  score += Math.min(matches - 1, 3); // Up to +3 for multiple occurrences

  // Bonus for longer keywords (more specific)
  if (keyword.length > 15) score += 2;
  else if (keyword.length > 10) score += 1;

  return score;
}

/**
 * Generate reason for diagram suggestion
 */
function generateReason(diagram: DiagramTemplate, keywords: string[]): string {
  if (keywords.length === 0) {
    return `${diagram.name} is relevant to this topic.`;
  }

  const keywordList = keywords.slice(0, 3).join(', ');
  return `Identified keywords: ${keywordList}. ${diagram.description}`;
}

/**
 * Generate usage guidance for planning
 */
function generateUsageGuidance(
  diagram: DiagramTemplate,
  questionType: string,
  marks: number,
  isPrimary: boolean
): string {
  const guidance: string[] = [];

  if (isPrimary) {
    guidance.push(`This is the recommended diagram for your answer (worth up to ${marks} marks).`);
  } else {
    guidance.push(`This diagram can support your analysis.`);
  }

  guidance.push(`Key labels required: ${diagram.gradingCriteria.labels.slice(0, 3).join(', ')}.`);

  if (diagram.examTips.length > 0) {
    guidance.push(`Tip: ${diagram.examTips[0]}`);
  }

  return guidance.join(' ');
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  KEYWORD_DIAGRAM_MAP,
  TOPIC_DIAGRAM_MAPPINGS,
  QUESTION_DIAGRAM_MARKS
} from './mappings';
