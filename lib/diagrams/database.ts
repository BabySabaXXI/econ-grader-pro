// Edexcel IAL Economics - Combined Diagram Database
// Re-exports all diagrams from unit files

import { DiagramTemplate } from './types';
import { UNIT1_DIAGRAMS } from './unit1-diagrams';
import { UNIT2_DIAGRAMS } from './unit2-diagrams';
import { UNIT3_DIAGRAMS } from './unit3-diagrams';
import { UNIT4_DIAGRAMS } from './unit4-diagrams';

/**
 * Complete Edexcel IAL Economics Diagram Database
 *
 * Total: 62 diagrams across 4 units
 * - Unit 1: 22 diagrams (Markets in Action) - AS Level
 * - Unit 2: 13 diagrams (Macroeconomic Performance) - AS Level
 * - Unit 3: 15 diagrams (Business Behaviour & Labour) - A2 Level
 * - Unit 4: 12 diagrams (Global Perspective) - A2 Level
 */
export const ALL_DIAGRAMS: DiagramTemplate[] = [
  ...UNIT1_DIAGRAMS,
  ...UNIT2_DIAGRAMS,
  ...UNIT3_DIAGRAMS,
  ...UNIT4_DIAGRAMS
];

/**
 * Diagram lookup by ID
 */
export const DIAGRAM_BY_ID: Map<string, DiagramTemplate> = new Map(
  ALL_DIAGRAMS.map(d => [d.id, d])
);

/**
 * Diagrams grouped by category
 */
export const DIAGRAMS_BY_CATEGORY: Record<string, DiagramTemplate[]> = {
  supply_demand: ALL_DIAGRAMS.filter(d => d.category === 'supply_demand'),
  elasticity: ALL_DIAGRAMS.filter(d => d.category === 'elasticity'),
  market_failure: ALL_DIAGRAMS.filter(d => d.category === 'market_failure'),
  government_intervention: ALL_DIAGRAMS.filter(d => d.category === 'government_intervention'),
  macroeconomic: ALL_DIAGRAMS.filter(d => d.category === 'macroeconomic'),
  market_structures: ALL_DIAGRAMS.filter(d => d.category === 'market_structures'),
  labour_market: ALL_DIAGRAMS.filter(d => d.category === 'labour_market'),
  international: ALL_DIAGRAMS.filter(d => d.category === 'international'),
  development: ALL_DIAGRAMS.filter(d => d.category === 'development')
};

/**
 * Diagrams grouped by unit
 */
export const DIAGRAMS_BY_UNIT = {
  unit1: UNIT1_DIAGRAMS,
  unit2: UNIT2_DIAGRAMS,
  unit3: UNIT3_DIAGRAMS,
  unit4: UNIT4_DIAGRAMS
};

/**
 * Diagrams grouped by difficulty
 */
export const DIAGRAMS_BY_DIFFICULTY = {
  AS: ALL_DIAGRAMS.filter(d => d.difficulty === 'AS'),
  A2: ALL_DIAGRAMS.filter(d => d.difficulty === 'A2')
};

/**
 * Database statistics
 */
export const DATABASE_STATS = {
  totalDiagrams: ALL_DIAGRAMS.length,
  byUnit: {
    unit1: UNIT1_DIAGRAMS.length,
    unit2: UNIT2_DIAGRAMS.length,
    unit3: UNIT3_DIAGRAMS.length,
    unit4: UNIT4_DIAGRAMS.length
  },
  byDifficulty: {
    AS: DIAGRAMS_BY_DIFFICULTY.AS.length,
    A2: DIAGRAMS_BY_DIFFICULTY.A2.length
  },
  categories: Object.keys(DIAGRAMS_BY_CATEGORY).length
};

// Re-export unit arrays
export { UNIT1_DIAGRAMS, UNIT2_DIAGRAMS, UNIT3_DIAGRAMS, UNIT4_DIAGRAMS };

export default ALL_DIAGRAMS;
