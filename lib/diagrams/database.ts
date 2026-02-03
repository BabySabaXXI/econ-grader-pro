// Edexcel IAL Economics Comprehensive Diagram Database
// Units 1-4: AS and A Level International

import { DiagramTemplate, DiagramCategory, TopicDiagramMapping } from './types';

// ============================================================================
// UNIT 1: MARKETS IN ACTION (AS Level)
// ============================================================================

export const supplyDemandBasic: DiagramTemplate = {
  id: 'supply-demand-basic',
  name: 'Basic Supply and Demand',
  slug: 'supply-demand',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows market equilibrium where supply meets demand, determining equilibrium price and quantity.',

  axis: {
    xLabel: 'Quantity (Q)',
    yLabel: 'Price (P)',
    xDescription: 'Quantity of goods/services',
    yDescription: 'Price level'
  },

  curves: [
    { id: 'demand', name: 'Demand (D)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'Supply (S)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],

  points: [
    { id: 'equilibrium', x: 150, y: 150, label: 'E', description: 'Market equilibrium' }
  ],

  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'Pe', x: 25, y: 155, anchor: 'end' },
    { text: 'Qe', x: 150, y: 285, anchor: 'middle' }
  ],

  keyFeatures: [
    'Downward sloping demand curve (law of demand)',
    'Upward sloping supply curve (law of supply)',
    'Equilibrium at intersection (Pe, Qe)',
    'Market clearing price eliminates excess supply/demand'
  ],

  commonMistakes: [
    'Labelling axes incorrectly (P on Y, Q on X)',
    'Drawing curves with wrong slopes',
    'Forgetting to mark equilibrium point',
    'Not extending dotted lines to axes'
  ],

  examTips: [
    'Always label both axes clearly',
    'Use dotted lines from equilibrium to both axes',
    'Label the equilibrium point (usually E or E1)',
    'Show Pe and Qe on respective axes'
  ],

  relatedTopics: ['Price mechanism', 'Market equilibrium', 'Price determination'],
  keywords: ['supply', 'demand', 'equilibrium', 'price', 'quantity', 'market'],

  gradingCriteria: {
    axes: ['Price (P) on Y-axis', 'Quantity (Q) on X-axis', 'Axes clearly labelled'],
    curves: ['Downward sloping demand', 'Upward sloping supply', 'Curves labelled D and S'],
    labels: ['Equilibrium price (Pe)', 'Equilibrium quantity (Qe)', 'Equilibrium point (E)'],
    equilibrium: ['Correct intersection point', 'Dotted lines to axes']
  },

  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const demandShift: DiagramTemplate = {
  id: 'demand-shift',
  name: 'Shift in Demand',
  slug: 'demand-shift',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows the effect of non-price factors causing demand to shift, changing equilibrium.',

  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },

  curves: [
    { id: 'demand1', name: 'D1', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'demand2', name: 'D2', type: 'line', points: [{ x: 100, y: 250 }, { x: 300, y: 50 }], color: '#3b82f6', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],

  points: [
    { id: 'e1', x: 150, y: 150, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 175, y: 175, label: 'E2', description: 'New equilibrium' }
  ],

  labels: [
    { text: 'D1', x: 255, y: 55, anchor: 'start' },
    { text: 'D2', x: 305, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' }
  ],

  keyFeatures: [
    'Original demand D1 shifts to D2',
    'Rightward shift = increase in demand',
    'New equilibrium shows higher P and Q',
    'Caused by non-price factors (income, tastes, etc.)'
  ],

  commonMistakes: [
    'Confusing movement along vs shift of curve',
    'Not showing both original and new equilibrium',
    'Incorrect direction of shift',
    'Forgetting to show change in both P and Q'
  ],

  examTips: [
    'Clearly show arrow indicating direction of shift',
    'Label both equilibrium points E1 and E2',
    'Show changes: P1→P2 and Q1→Q2',
    'State the cause of the shift in your answer'
  ],

  relatedTopics: ['Determinants of demand', 'Income effect', 'Substitutes and complements'],
  keywords: ['shift', 'increase demand', 'decrease demand', 'non-price factors'],

  gradingCriteria: {
    axes: ['Correctly labelled axes'],
    curves: ['Original and shifted demand curves', 'Supply curve unchanged', 'Direction of shift correct'],
    labels: ['Both curves labelled (D1, D2)', 'Arrow showing shift direction'],
    equilibrium: ['Original equilibrium E1', 'New equilibrium E2', 'Changes in P and Q shown'],
    shifts: ['Correct shift direction', 'Parallel shift maintained']
  },

  width: 350,
  height: 300,
  viewBox: '0 0 350 300'
};

export const supplyShift: DiagramTemplate = {
  id: 'supply-shift',
  name: 'Shift in Supply',
  slug: 'supply-shift',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows the effect of non-price factors causing supply to shift, changing equilibrium.',

  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },

  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S1', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S2', type: 'line', points: [{ x: 100, y: 50 }, { x: 300, y: 250 }], color: '#ef4444', strokeWidth: 2 }
  ],

  points: [
    { id: 'e1', x: 150, y: 150, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 175, y: 125, label: 'E2', description: 'New equilibrium' }
  ],

  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S1', x: 255, y: 255, anchor: 'start' },
    { text: 'S2', x: 305, y: 255, anchor: 'start' }
  ],

  keyFeatures: [
    'Original supply S1 shifts to S2',
    'Rightward shift = increase in supply',
    'New equilibrium shows lower P and higher Q',
    'Caused by changes in costs, technology, etc.'
  ],

  commonMistakes: [
    'Confusing movement along vs shift of curve',
    'Getting the P and Q changes wrong direction',
    'Not labelling both supply curves'
  ],

  examTips: [
    'Show clear arrow for shift direction',
    'Note: supply increase → P falls, Q rises',
    'Supply decrease → P rises, Q falls'
  ],

  relatedTopics: ['Determinants of supply', 'Costs of production', 'Technology'],
  keywords: ['supply shift', 'costs', 'technology', 'productivity'],

  gradingCriteria: {
    axes: ['Correctly labelled axes'],
    curves: ['Original and shifted supply curves', 'Demand unchanged'],
    labels: ['S1, S2 labelled', 'Shift direction shown'],
    equilibrium: ['E1 and E2 marked', 'P and Q changes correct'],
    shifts: ['Correct direction', 'Parallel shift']
  },

  width: 350,
  height: 300,
  viewBox: '0 0 350 300'
};

export const consumerProducerSurplus: DiagramTemplate = {
  id: 'consumer-producer-surplus',
  name: 'Consumer and Producer Surplus',
  slug: 'surplus',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows welfare gains to consumers and producers from market transactions.',

  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },

  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],

  points: [
    { id: 'equilibrium', x: 150, y: 150, label: 'E', description: 'Equilibrium' }
  ],

  areas: [
    { id: 'cs', name: 'Consumer Surplus', points: [{ x: 50, y: 50 }, { x: 150, y: 150 }, { x: 50, y: 150 }], fill: '#3b82f6', opacity: 0.3, description: 'Area above Pe, below demand curve' },
    { id: 'ps', name: 'Producer Surplus', points: [{ x: 50, y: 150 }, { x: 150, y: 150 }, { x: 50, y: 250 }], fill: '#ef4444', opacity: 0.3, description: 'Area below Pe, above supply curve' }
  ],

  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'Consumer Surplus', x: 80, y: 100, anchor: 'start', fontSize: 10 },
    { text: 'Producer Surplus', x: 80, y: 200, anchor: 'start', fontSize: 10 }
  ],

  keyFeatures: [
    'Consumer surplus: difference between willingness to pay and actual price',
    'Producer surplus: difference between actual price and minimum acceptable price',
    'Total welfare = CS + PS',
    'Market equilibrium maximises total welfare'
  ],

  commonMistakes: [
    'Confusing which triangle is CS vs PS',
    'Not shading areas correctly',
    'Forgetting CS is ABOVE price, PS is BELOW'
  ],

  examTips: [
    'CS = triangle above Pe, below D curve',
    'PS = triangle below Pe, above S curve',
    'Use different colours/shading for each',
    'Can calculate area: ½ × base × height'
  ],

  relatedTopics: ['Market efficiency', 'Welfare economics', 'Deadweight loss'],
  keywords: ['consumer surplus', 'producer surplus', 'welfare', 'efficiency'],

  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D and S curves correct'],
    labels: ['Surpluses clearly identified'],
    equilibrium: ['Pe and Qe shown'],
    areas: ['CS triangle correct', 'PS triangle correct', 'Clear shading/labelling']
  },

  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// Continue in next part...
export const UNIT1_DIAGRAMS: DiagramTemplate[] = [
  supplyDemandBasic,
  demandShift,
  supplyShift,
  consumerProducerSurplus
];
