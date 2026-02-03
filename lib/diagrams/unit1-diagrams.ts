// Unit 1: Markets in Action (AS Level)
// Edexcel IAL Economics - Comprehensive Diagram Database

import { DiagramTemplate } from './types';

// ============================================================================
// SUPPLY AND DEMAND DIAGRAMS
// ============================================================================

export const supplyDemandBasic: DiagramTemplate = {
  id: 'supply-demand-basic',
  name: 'Basic Supply and Demand',
  slug: 'supply-demand',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows market equilibrium where supply meets demand, determining equilibrium price and quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'Demand', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'Supply', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [{ id: 'e1', x: 150, y: 150, label: 'E', description: 'Market equilibrium' }],
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
    'Market clearing price eliminates surplus/shortage'
  ],
  commonMistakes: [
    'Labelling axes incorrectly (P on Y-axis, Q on X-axis)',
    'Drawing demand curve upward sloping',
    'Forgetting to mark equilibrium point E',
    'Not drawing dotted lines to axes from equilibrium'
  ],
  examTips: [
    'Always label both axes clearly',
    'Use dotted lines from equilibrium to both axes',
    'Label equilibrium point as E or E1',
    'Show Pe and Qe on respective axes'
  ],
  relatedTopics: ['Price mechanism', 'Market equilibrium', 'Price determination', 'Allocative efficiency'],
  keywords: ['supply', 'demand', 'equilibrium', 'price', 'quantity', 'market', 'intersection'],
  gradingCriteria: {
    axes: ['Price (P) on Y-axis', 'Quantity (Q) on X-axis', 'Axes clearly labelled with arrows'],
    curves: ['Downward sloping demand curve', 'Upward sloping supply curve', 'Curves labelled D and S'],
    labels: ['Equilibrium price Pe marked', 'Equilibrium quantity Qe marked'],
    equilibrium: ['Intersection point marked as E', 'Dotted lines to both axes']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const demandShiftRight: DiagramTemplate = {
  id: 'demand-shift-right',
  name: 'Increase in Demand',
  slug: 'demand-increase',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows rightward shift of demand curve causing higher equilibrium price and quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand1', name: 'D1', type: 'line', points: [{ x: 50, y: 250 }, { x: 200, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'demand2', name: 'D2', type: 'line', points: [{ x: 100, y: 250 }, { x: 250, y: 50 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 125, y: 125, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 175, y: 175, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'D1', x: 205, y: 55, anchor: 'start' },
    { text: 'D2', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'P1', x: 25, y: 130, anchor: 'end' },
    { text: 'P2', x: 25, y: 180, anchor: 'end' },
    { text: 'Q1', x: 125, y: 285, anchor: 'middle' },
    { text: 'Q2', x: 175, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Demand shifts RIGHT from D1 to D2',
    'Equilibrium price INCREASES (P1 to P2)',
    'Equilibrium quantity INCREASES (Q1 to Q2)',
    'Supply curve remains unchanged'
  ],
  commonMistakes: [
    'Shifting supply instead of demand',
    'Moving along demand curve instead of shifting it',
    'Not showing both equilibrium points',
    'Incorrect direction of price/quantity change'
  ],
  examTips: [
    'Draw arrow showing direction of shift',
    'Clearly label both D1 and D2',
    'Show changes in BOTH price and quantity',
    'State cause of shift in your answer'
  ],
  relatedTopics: ['Determinants of demand', 'Income changes', 'Taste and fashion', 'Population changes', 'Price of substitutes/complements'],
  keywords: ['demand increase', 'shift right', 'higher income', 'more consumers', 'substitute price rise', 'complement price fall', 'advertising'],
  gradingCriteria: {
    axes: ['Correctly labelled axes'],
    curves: ['Original demand D1', 'New demand D2 to the right', 'Supply unchanged'],
    labels: ['D1 and D2 clearly labelled', 'Arrow showing shift direction'],
    equilibrium: ['E1 marked', 'E2 marked', 'P1→P2 increase shown', 'Q1→Q2 increase shown'],
    shifts: ['Parallel rightward shift', 'Correct new intersection']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const demandShiftLeft: DiagramTemplate = {
  id: 'demand-shift-left',
  name: 'Decrease in Demand',
  slug: 'demand-decrease',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows leftward shift of demand curve causing lower equilibrium price and quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand1', name: 'D1', type: 'line', points: [{ x: 100, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'demand2', name: 'D2', type: 'line', points: [{ x: 50, y: 250 }, { x: 200, y: 50 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 175, y: 175, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 125, y: 125, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'D1', x: 255, y: 55, anchor: 'start' },
    { text: 'D2', x: 205, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' }
  ],
  keyFeatures: [
    'Demand shifts LEFT from D1 to D2',
    'Equilibrium price DECREASES',
    'Equilibrium quantity DECREASES',
    'Caused by fall in income, tastes change, etc.'
  ],
  commonMistakes: [
    'Confusing with movement along curve',
    'Not showing original equilibrium'
  ],
  examTips: [
    'Always show arrow for shift direction',
    'Label both curves distinctly'
  ],
  relatedTopics: ['Inferior goods', 'Recession', 'Negative publicity'],
  keywords: ['demand decrease', 'shift left', 'lower income', 'fewer consumers', 'substitute price fall'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D1 original', 'D2 shifted left', 'S unchanged'],
    labels: ['Both demand curves labelled'],
    equilibrium: ['Both equilibria shown', 'Price and quantity decrease shown'],
    shifts: ['Leftward parallel shift']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const supplyShiftRight: DiagramTemplate = {
  id: 'supply-shift-right',
  name: 'Increase in Supply',
  slug: 'supply-increase',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows rightward shift of supply curve causing lower equilibrium price and higher quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S1', type: 'line', points: [{ x: 50, y: 50 }, { x: 200, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S2', type: 'line', points: [{ x: 100, y: 50 }, { x: 250, y: 250 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 125, y: 175, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 175, y: 125, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S1', x: 205, y: 255, anchor: 'start' },
    { text: 'S2', x: 255, y: 255, anchor: 'start' }
  ],
  keyFeatures: [
    'Supply shifts RIGHT from S1 to S2',
    'Equilibrium price DECREASES',
    'Equilibrium quantity INCREASES',
    'Caused by lower costs, better technology, etc.'
  ],
  commonMistakes: [
    'Getting P and Q changes wrong',
    'Not showing supply curve shift direction'
  ],
  examTips: [
    'Remember: supply increase → P falls, Q rises',
    'Show clear arrow for shift'
  ],
  relatedTopics: ['Costs of production', 'Technology improvement', 'Subsidies', 'New firms entering'],
  keywords: ['supply increase', 'shift right', 'lower costs', 'technology', 'productivity', 'subsidy'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D unchanged', 'S1 original', 'S2 shifted right'],
    labels: ['All curves labelled'],
    equilibrium: ['E1 and E2 shown', 'P decrease shown', 'Q increase shown'],
    shifts: ['Rightward parallel shift of supply']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const supplyShiftLeft: DiagramTemplate = {
  id: 'supply-shift-left',
  name: 'Decrease in Supply',
  slug: 'supply-decrease',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows leftward shift of supply curve causing higher equilibrium price and lower quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S1', type: 'line', points: [{ x: 100, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S2', type: 'line', points: [{ x: 50, y: 50 }, { x: 200, y: 250 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 175, y: 125, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 125, y: 175, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S1', x: 255, y: 255, anchor: 'start' },
    { text: 'S2', x: 205, y: 255, anchor: 'start' }
  ],
  keyFeatures: [
    'Supply shifts LEFT from S1 to S2',
    'Equilibrium price INCREASES',
    'Equilibrium quantity DECREASES',
    'Caused by higher costs, supply shock, etc.'
  ],
  commonMistakes: [
    'Confusing direction of P and Q changes'
  ],
  examTips: [
    'Supply decrease → P rises, Q falls'
  ],
  relatedTopics: ['Cost-push factors', 'Natural disasters', 'Taxes on producers'],
  keywords: ['supply decrease', 'shift left', 'higher costs', 'supply shock', 'tax'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D unchanged', 'S1 and S2 shown'],
    labels: ['All labelled'],
    equilibrium: ['Both equilibria', 'P increase', 'Q decrease'],
    shifts: ['Leftward shift']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// CONSUMER AND PRODUCER SURPLUS
// ============================================================================

export const consumerProducerSurplus: DiagramTemplate = {
  id: 'consumer-producer-surplus',
  name: 'Consumer and Producer Surplus',
  slug: 'surplus',
  category: 'supply_demand',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows welfare gains to consumers (CS) and producers (PS) from market transactions.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [{ id: 'e', x: 150, y: 150, label: 'E', description: 'Equilibrium' }],
  areas: [
    { id: 'cs', name: 'Consumer Surplus', points: [{ x: 50, y: 50 }, { x: 150, y: 150 }, { x: 50, y: 150 }], fill: '#3b82f6', opacity: 0.3, description: 'Triangle above Pe, below D curve' },
    { id: 'ps', name: 'Producer Surplus', points: [{ x: 50, y: 150 }, { x: 150, y: 150 }, { x: 50, y: 250 }], fill: '#ef4444', opacity: 0.3, description: 'Triangle below Pe, above S curve' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'CS', x: 80, y: 110, anchor: 'middle', fontSize: 12 },
    { text: 'PS', x: 80, y: 190, anchor: 'middle', fontSize: 12 },
    { text: 'Pe', x: 25, y: 155, anchor: 'end' }
  ],
  keyFeatures: [
    'Consumer surplus: area ABOVE price, BELOW demand curve',
    'Producer surplus: area BELOW price, ABOVE supply curve',
    'Total welfare = CS + PS',
    'Free market maximises total welfare (allocative efficiency)'
  ],
  commonMistakes: [
    'Confusing CS and PS positions',
    'Not shading triangles correctly',
    'Forgetting CS is above Pe, PS is below Pe'
  ],
  examTips: [
    'CS = willingness to pay − actual price paid',
    'PS = actual price received − minimum acceptable price',
    'Use different colours/shading for each',
    'Can calculate area: ½ × base × height'
  ],
  relatedTopics: ['Welfare economics', 'Market efficiency', 'Deadweight loss', 'Government intervention'],
  keywords: ['consumer surplus', 'producer surplus', 'welfare', 'efficiency', 'total surplus'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D and S correct'],
    labels: ['CS and PS areas labelled', 'Pe shown'],
    equilibrium: ['E marked'],
    areas: ['CS triangle correct (above Pe)', 'PS triangle correct (below Pe)', 'Clear shading']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// ELASTICITY DIAGRAMS
// ============================================================================

export const elasticDemand: DiagramTemplate = {
  id: 'elastic-demand',
  name: 'Price Elastic Demand',
  slug: 'ped-elastic',
  category: 'elasticity',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows demand curve with PED > 1 - quantity changes proportionally more than price.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D (elastic)', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'D (PED > 1)', x: 255, y: 105, anchor: 'start' },
    { text: 'Relatively flat curve', x: 150, y: 250, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Relatively FLAT demand curve',
    'PED > 1 (elastic)',
    '%ΔQd > %ΔP',
    'Examples: luxury goods, goods with many substitutes'
  ],
  commonMistakes: [
    'Drawing curve too steep',
    'Confusing elastic with inelastic'
  ],
  examTips: [
    'Flatter = more elastic',
    'Price rise → revenue falls',
    'Price cut → revenue rises'
  ],
  relatedTopics: ['Revenue', 'Pricing strategy', 'Substitutes'],
  keywords: ['elastic', 'PED > 1', 'luxury', 'substitutes', 'responsive'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Relatively flat demand curve'],
    labels: ['Curve labelled as elastic or PED > 1'],
    equilibrium: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const inelasticDemand: DiagramTemplate = {
  id: 'inelastic-demand',
  name: 'Price Inelastic Demand',
  slug: 'ped-inelastic',
  category: 'elasticity',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows demand curve with PED < 1 - quantity changes proportionally less than price.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D (inelastic)', type: 'line', points: [{ x: 100, y: 250 }, { x: 150, y: 50 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'D (PED < 1)', x: 155, y: 55, anchor: 'start' },
    { text: 'Relatively steep curve', x: 150, y: 280, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Relatively STEEP demand curve',
    'PED < 1 (inelastic)',
    '%ΔQd < %ΔP',
    'Examples: necessities, addictive goods, few substitutes'
  ],
  commonMistakes: [
    'Drawing curve too flat',
    'Confusing with elastic'
  ],
  examTips: [
    'Steeper = more inelastic',
    'Price rise → revenue rises',
    'Price cut → revenue falls'
  ],
  relatedTopics: ['Necessities', 'Addiction', 'Monopoly power'],
  keywords: ['inelastic', 'PED < 1', 'necessity', 'addictive', 'unresponsive'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Relatively steep demand curve'],
    labels: ['Labelled as inelastic or PED < 1'],
    equilibrium: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const unitElasticDemand: DiagramTemplate = {
  id: 'unit-elastic-demand',
  name: 'Unit Elastic Demand',
  slug: 'ped-unit',
  category: 'elasticity',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows demand curve with PED = 1 - rectangular hyperbola where revenue is constant.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D (unit elastic)', type: 'curve', points: [{ x: 50, y: 50 }, { x: 75, y: 100 }, { x: 150, y: 150 }, { x: 200, y: 175 }, { x: 250, y: 200 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'D (PED = 1)', x: 255, y: 205, anchor: 'start' },
    { text: 'Rectangular hyperbola', x: 150, y: 280, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Rectangular hyperbola shape',
    'PED = 1 at all points',
    '%ΔQd = %ΔP',
    'Total revenue constant at all prices'
  ],
  commonMistakes: [
    'Drawing as straight line',
    'Not understanding constant TR'
  ],
  examTips: [
    'Revenue unchanged when price changes',
    'P × Q = constant'
  ],
  relatedTopics: ['Total revenue', 'Elasticity calculation'],
  keywords: ['unit elastic', 'PED = 1', 'constant revenue', 'hyperbola'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Curved rectangular hyperbola shape'],
    labels: ['Labelled as unit elastic'],
    equilibrium: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const perfectlyElasticDemand: DiagramTemplate = {
  id: 'perfectly-elastic-demand',
  name: 'Perfectly Elastic Demand',
  slug: 'ped-perfect-elastic',
  category: 'elasticity',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows horizontal demand curve with PED = infinity - any price rise causes demand to fall to zero.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 150 }, { x: 250, y: 150 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'D (PED = ∞)', x: 255, y: 155, anchor: 'start' },
    { text: 'Horizontal line', x: 150, y: 280, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'HORIZONTAL demand curve',
    'PED = infinity',
    'Firm is price taker',
    'Perfect competition, perfectly substitutable goods'
  ],
  commonMistakes: [
    'Drawing with slight slope'
  ],
  examTips: [
    'Must be perfectly horizontal',
    'Firm faces market price'
  ],
  relatedTopics: ['Perfect competition', 'Price taker', 'Commodities'],
  keywords: ['perfectly elastic', 'infinite elasticity', 'horizontal', 'price taker', 'perfect competition'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Perfectly horizontal line'],
    labels: ['Labelled PED = ∞'],
    equilibrium: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const perfectlyInelasticDemand: DiagramTemplate = {
  id: 'perfectly-inelastic-demand',
  name: 'Perfectly Inelastic Demand',
  slug: 'ped-perfect-inelastic',
  category: 'elasticity',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows vertical demand curve with PED = 0 - quantity demanded unchanged regardless of price.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 150, y: 50 }, { x: 150, y: 250 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'D (PED = 0)', x: 155, y: 55, anchor: 'start' },
    { text: 'Vertical line', x: 150, y: 280, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'VERTICAL demand curve',
    'PED = 0',
    'Quantity fixed regardless of price',
    'Absolute necessities with no substitutes'
  ],
  commonMistakes: [
    'Drawing with slight slope'
  ],
  examTips: [
    'Must be perfectly vertical',
    'Rare in real world'
  ],
  relatedTopics: ['Life-saving drugs', 'Essential goods'],
  keywords: ['perfectly inelastic', 'zero elasticity', 'vertical', 'necessity', 'fixed quantity'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Perfectly vertical line'],
    labels: ['Labelled PED = 0'],
    equilibrium: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// MARKET FAILURE - EXTERNALITIES
// ============================================================================

export const negativeExternalityProduction: DiagramTemplate = {
  id: 'negative-externality-production',
  name: 'Negative Externality in Production',
  slug: 'neg-ext-production',
  category: 'market_failure',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows MSC > MPC with welfare loss from overproduction. External costs not reflected in market price.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Cost (P)' },
  curves: [
    { id: 'msc', name: 'MSC', type: 'line', points: [{ x: 50, y: 25 }, { x: 250, y: 275 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mpc', name: 'MPC (S)', type: 'line', points: [{ x: 50, y: 75 }, { x: 250, y: 225 }], color: '#f97316', strokeWidth: 2 },
    { id: 'mpb', name: 'MPB (D)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'market', x: 175, y: 162, label: 'Em', description: 'Market equilibrium (overproduction)' },
    { id: 'social', x: 140, y: 150, label: 'Es', description: 'Social optimum' }
  ],
  areas: [
    { id: 'dwl', name: 'Welfare Loss', points: [{ x: 140, y: 150 }, { x: 175, y: 112 }, { x: 175, y: 162 }], fill: '#fbbf24', opacity: 0.5, description: 'Deadweight welfare loss triangle' }
  ],
  labels: [
    { text: 'MSC', x: 255, y: 280, anchor: 'start' },
    { text: 'MPC', x: 255, y: 230, anchor: 'start' },
    { text: 'MPB = MSB', x: 255, y: 55, anchor: 'start' },
    { text: 'External Cost', x: 270, y: 160, anchor: 'start', fontSize: 9 },
    { text: 'Welfare Loss', x: 155, y: 140, anchor: 'start', fontSize: 9 },
    { text: 'Qm', x: 175, y: 290, anchor: 'middle' },
    { text: 'Qs', x: 140, y: 290, anchor: 'middle' }
  ],
  keyFeatures: [
    'MSC lies ABOVE MPC (external cost)',
    'Market produces at Qm (too much)',
    'Socially optimal quantity is Qs',
    'Welfare loss triangle between Qs and Qm',
    'Examples: pollution, congestion, noise'
  ],
  commonMistakes: [
    'Drawing MSC below MPC',
    'Not showing welfare loss triangle',
    'Labelling curves incorrectly',
    'Forgetting to show Qs < Qm'
  ],
  examTips: [
    'MSC = MPC + External Cost',
    'Vertical gap = external cost per unit',
    'Market overproduces at Qm',
    'Need intervention to reach Qs'
  ],
  relatedTopics: ['Pollution', 'Carbon emissions', 'Pigouvian tax', 'Market failure', 'Government intervention'],
  keywords: ['negative externality', 'MSC', 'MPC', 'external cost', 'pollution', 'welfare loss', 'overproduction', 'market failure'],
  gradingCriteria: {
    axes: ['Price/Cost on Y', 'Quantity on X'],
    curves: ['MSC above MPC', 'MPB downward sloping', 'External cost gap shown'],
    labels: ['All curves labelled', 'Qm and Qs marked'],
    equilibrium: ['Market equilibrium Em at MPC=MPB', 'Social optimum Es at MSC=MSB'],
    areas: ['Welfare loss triangle shaded', 'External cost labelled']
  },
  width: 320,
  height: 300,
  viewBox: '0 0 320 300'
};

export const negativeExternalityConsumption: DiagramTemplate = {
  id: 'negative-externality-consumption',
  name: 'Negative Externality in Consumption',
  slug: 'neg-ext-consumption',
  category: 'market_failure',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows MSB < MPB with welfare loss from overconsumption. Demerit goods like alcohol, tobacco.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Benefit (P)' },
  curves: [
    { id: 'mpc', name: 'MPC (S)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mpb', name: 'MPB', type: 'line', points: [{ x: 50, y: 275 }, { x: 250, y: 75 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'msb', name: 'MSB', type: 'line', points: [{ x: 50, y: 225 }, { x: 250, y: 25 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'market', x: 162, y: 162, label: 'Em', description: 'Market equilibrium' },
    { id: 'social', x: 137, y: 137, label: 'Es', description: 'Social optimum' }
  ],
  areas: [
    { id: 'dwl', name: 'Welfare Loss', points: [{ x: 137, y: 137 }, { x: 162, y: 162 }, { x: 162, y: 112 }], fill: '#fbbf24', opacity: 0.5 }
  ],
  labels: [
    { text: 'MPC = MSC', x: 255, y: 255, anchor: 'start' },
    { text: 'MPB', x: 255, y: 80, anchor: 'start' },
    { text: 'MSB', x: 255, y: 30, anchor: 'start' },
    { text: 'External Cost', x: 200, y: 55, anchor: 'start', fontSize: 9 }
  ],
  keyFeatures: [
    'MSB lies BELOW MPB',
    'Market overconsumes at Qm',
    'Social optimum is Qs < Qm',
    'Examples: alcohol, tobacco, gambling'
  ],
  commonMistakes: [
    'Confusing with production externality',
    'Drawing MSB above MPB'
  ],
  examTips: [
    'MSB = MPB - External Cost',
    'Demerit goods = negative consumption externality'
  ],
  relatedTopics: ['Demerit goods', 'Sin tax', 'Addiction', 'Healthcare costs'],
  keywords: ['negative externality consumption', 'MSB', 'MPB', 'demerit goods', 'alcohol', 'tobacco', 'overconsumption'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MSB below MPB', 'MPC = MSC', 'Gap shown'],
    labels: ['All curves labelled'],
    equilibrium: ['Em and Es shown'],
    areas: ['Welfare loss shown']
  },
  width: 320,
  height: 300,
  viewBox: '0 0 320 300'
};

export const positiveExternalityConsumption: DiagramTemplate = {
  id: 'positive-externality-consumption',
  name: 'Positive Externality in Consumption',
  slug: 'pos-ext-consumption',
  category: 'market_failure',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows MSB > MPB with welfare loss from underconsumption. Merit goods like education, healthcare.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Benefit (P)' },
  curves: [
    { id: 'mpc', name: 'MPC (S)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mpb', name: 'MPB', type: 'line', points: [{ x: 50, y: 225 }, { x: 250, y: 25 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'msb', name: 'MSB', type: 'line', points: [{ x: 50, y: 275 }, { x: 250, y: 75 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'market', x: 137, y: 137, label: 'Em', description: 'Market equilibrium (underconsumption)' },
    { id: 'social', x: 162, y: 162, label: 'Es', description: 'Social optimum' }
  ],
  areas: [
    { id: 'dwl', name: 'Welfare Loss', points: [{ x: 137, y: 137 }, { x: 162, y: 112 }, { x: 162, y: 162 }], fill: '#fbbf24', opacity: 0.5 }
  ],
  labels: [
    { text: 'MPC = MSC', x: 255, y: 255, anchor: 'start' },
    { text: 'MSB', x: 255, y: 80, anchor: 'start' },
    { text: 'MPB', x: 255, y: 30, anchor: 'start' },
    { text: 'External Benefit', x: 200, y: 55, anchor: 'start', fontSize: 9 },
    { text: 'Qm', x: 137, y: 290, anchor: 'middle' },
    { text: 'Qs', x: 162, y: 290, anchor: 'middle' }
  ],
  keyFeatures: [
    'MSB lies ABOVE MPB (external benefit)',
    'Market underconsumes at Qm',
    'Socially optimal quantity Qs > Qm',
    'Examples: education, healthcare, vaccination'
  ],
  commonMistakes: [
    'Drawing MSB below MPB',
    'Not showing underconsumption',
    'Confusing with production externality'
  ],
  examTips: [
    'MSB = MPB + External Benefit',
    'Merit goods are underprovided by market',
    'Subsidy can correct to Qs'
  ],
  relatedTopics: ['Merit goods', 'Education', 'Healthcare', 'Subsidies', 'Information failure'],
  keywords: ['positive externality', 'MSB', 'MPB', 'merit goods', 'education', 'healthcare', 'underconsumption', 'external benefit'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MSB above MPB', 'MPC = MSC'],
    labels: ['All curves labelled', 'External benefit shown'],
    equilibrium: ['Em underconsumption', 'Es social optimum'],
    areas: ['Welfare loss triangle']
  },
  width: 320,
  height: 300,
  viewBox: '0 0 320 300'
};

export const positiveExternalityProduction: DiagramTemplate = {
  id: 'positive-externality-production',
  name: 'Positive Externality in Production',
  slug: 'pos-ext-production',
  category: 'market_failure',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows MSC < MPC with welfare loss from underproduction. Examples: R&D, training, beekeeping.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Cost (P)' },
  curves: [
    { id: 'mpc', name: 'MPC', type: 'line', points: [{ x: 50, y: 75 }, { x: 250, y: 275 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'msc', name: 'MSC', type: 'line', points: [{ x: 50, y: 25 }, { x: 250, y: 225 }], color: '#f97316', strokeWidth: 2 },
    { id: 'mpb', name: 'MPB = MSB', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'market', x: 137, y: 162, label: 'Em', description: 'Market equilibrium' },
    { id: 'social', x: 162, y: 137, label: 'Es', description: 'Social optimum' }
  ],
  labels: [
    { text: 'MPC', x: 255, y: 280, anchor: 'start' },
    { text: 'MSC', x: 255, y: 230, anchor: 'start' },
    { text: 'MPB = MSB', x: 255, y: 55, anchor: 'start' },
    { text: 'External Benefit', x: 265, y: 160, anchor: 'start', fontSize: 9 }
  ],
  keyFeatures: [
    'MSC lies BELOW MPC (external benefit)',
    'Market underproduces at Qm',
    'Social optimum Qs > Qm',
    'Examples: R&D spillovers, worker training'
  ],
  commonMistakes: [
    'Confusing with consumption externality'
  ],
  examTips: [
    'MSC = MPC - External Benefit',
    'Subsidy can encourage more production'
  ],
  relatedTopics: ['R&D', 'Innovation', 'Training', 'Spillover effects'],
  keywords: ['positive externality production', 'MSC', 'MPC', 'R&D', 'training', 'spillover', 'underproduction'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MSC below MPC', 'Gap = external benefit'],
    labels: ['All curves labelled'],
    equilibrium: ['Em and Es shown', 'Underproduction shown'],
    areas: ['Welfare loss optional']
  },
  width: 320,
  height: 300,
  viewBox: '0 0 320 300'
};

// ============================================================================
// GOVERNMENT INTERVENTION
// ============================================================================

export const indirectTax: DiagramTemplate = {
  id: 'indirect-tax',
  name: 'Indirect Tax (Specific/Per Unit)',
  slug: 'indirect-tax',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows effect of specific (per unit) tax shifting supply left, raising price and reducing quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 200 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S + tax', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 250 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 150, y: 125, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 125, y: 150, label: 'E2', description: 'New equilibrium with tax' }
  ],
  areas: [
    { id: 'govrev', name: 'Government Revenue', points: [{ x: 50, y: 100 }, { x: 125, y: 100 }, { x: 125, y: 150 }, { x: 50, y: 150 }], fill: '#22c55e', opacity: 0.3, description: 'Tax revenue = tax × Q2' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 205, anchor: 'start' },
    { text: 'S + tax', x: 255, y: 255, anchor: 'start' },
    { text: 'Tax', x: 35, y: 125, anchor: 'end', fontSize: 10 },
    { text: 'P2', x: 25, y: 155, anchor: 'end' },
    { text: 'P1', x: 25, y: 130, anchor: 'end' },
    { text: 'Ps', x: 25, y: 105, anchor: 'end' },
    { text: 'Q2', x: 125, y: 285, anchor: 'middle' },
    { text: 'Q1', x: 150, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Tax shifts supply curve UP/LEFT by tax amount',
    'Consumer pays higher price P2',
    'Producer receives lower price Ps',
    'Tax incidence depends on elasticities',
    'Government revenue = tax × Q2'
  ],
  commonMistakes: [
    'Showing parallel shift when should be vertical',
    'Forgetting producer price Ps',
    'Not showing tax incidence split'
  ],
  examTips: [
    'Specific tax = vertical parallel shift',
    'Consumer burden = P2 - P1',
    'Producer burden = P1 - Ps',
    'More inelastic side bears more burden'
  ],
  relatedTopics: ['Tax incidence', 'Sin taxes', 'Correcting externalities', 'Deadweight loss'],
  keywords: ['indirect tax', 'specific tax', 'per unit tax', 'tax incidence', 'supply shift', 'government revenue'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D unchanged', 'S shifts up by tax amount', 'Parallel shift'],
    labels: ['Original and new supply', 'P1, P2, Ps shown', 'Tax amount labelled'],
    equilibrium: ['E1 and E2 shown', 'Q decrease shown'],
    areas: ['Government revenue rectangle', 'Deadweight loss optional']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const subsidy: DiagramTemplate = {
  id: 'subsidy',
  name: 'Subsidy',
  slug: 'subsidy',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows effect of subsidy shifting supply right, lowering price and increasing quantity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S + subsidy', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 200 }], color: '#22c55e', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 133, y: 167, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 166, y: 133, label: 'E2', description: 'New equilibrium with subsidy' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'S + subsidy', x: 255, y: 205, anchor: 'start' },
    { text: 'Subsidy', x: 35, y: 125, anchor: 'end', fontSize: 10 }
  ],
  keyFeatures: [
    'Subsidy shifts supply curve DOWN/RIGHT',
    'Consumer pays lower price',
    'Producer receives higher effective price',
    'Government cost = subsidy × Q2',
    'Used to correct positive externalities'
  ],
  commonMistakes: [
    'Shifting supply wrong direction',
    'Not showing both beneficiaries'
  ],
  examTips: [
    'Subsidy = negative tax',
    'Both consumers and producers benefit',
    'Can correct underconsumption of merit goods'
  ],
  relatedTopics: ['Merit goods', 'Positive externalities', 'Agricultural policy', 'Government spending'],
  keywords: ['subsidy', 'supply shift', 'government spending', 'merit goods', 'lower price'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D unchanged', 'S shifts down/right'],
    labels: ['Both supply curves labelled', 'Subsidy amount shown'],
    equilibrium: ['E1 and E2', 'Price fall', 'Quantity increase'],
    areas: ['Government cost optional']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const maximumPrice: DiagramTemplate = {
  id: 'maximum-price',
  name: 'Maximum Price (Price Ceiling)',
  slug: 'price-ceiling',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows price ceiling below equilibrium creating shortage (excess demand).',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'pmax', name: 'Pmax', type: 'dashed', points: [{ x: 50, y: 175 }, { x: 250, y: 175 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e', x: 150, y: 150, label: 'E', description: 'Free market equilibrium' },
    { id: 'qs', x: 100, y: 175, label: 'Qs', description: 'Quantity supplied at Pmax' },
    { id: 'qd', x: 200, y: 175, label: 'Qd', description: 'Quantity demanded at Pmax' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'Pmax', x: 25, y: 180, anchor: 'end' },
    { text: 'Pe', x: 25, y: 155, anchor: 'end' },
    { text: 'Shortage', x: 150, y: 195, anchor: 'middle', fontSize: 10 },
    { text: 'Qs', x: 100, y: 285, anchor: 'middle' },
    { text: 'Qd', x: 200, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Maximum price set BELOW equilibrium (Pmax < Pe)',
    'Creates SHORTAGE (Qd > Qs)',
    'Used to protect consumers',
    'Examples: rent controls, bread prices'
  ],
  commonMistakes: [
    'Setting Pmax above equilibrium (would have no effect)',
    'Labelling as shortage when actually surplus',
    'Not showing extent of shortage'
  ],
  examTips: [
    'Must be below Pe to have effect',
    'Creates excess demand (shortage)',
    'May lead to black markets, queues, rationing'
  ],
  relatedTopics: ['Rent controls', 'Consumer protection', 'Rationing', 'Black markets'],
  keywords: ['maximum price', 'price ceiling', 'shortage', 'excess demand', 'rent control', 'consumer protection'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D and S correct', 'Horizontal Pmax line below Pe'],
    labels: ['Pmax below Pe', 'Qs and Qd marked on X-axis'],
    equilibrium: ['Free market E shown', 'Shortage distance shown'],
    areas: ['Shortage clearly indicated']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const minimumPrice: DiagramTemplate = {
  id: 'minimum-price',
  name: 'Minimum Price (Price Floor)',
  slug: 'price-floor',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows price floor above equilibrium creating surplus (excess supply).',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'pmin', name: 'Pmin', type: 'dashed', points: [{ x: 50, y: 125 }, { x: 250, y: 125 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e', x: 150, y: 150, label: 'E', description: 'Free market equilibrium' },
    { id: 'qd', x: 100, y: 125, label: 'Qd', description: 'Quantity demanded at Pmin' },
    { id: 'qs', x: 200, y: 125, label: 'Qs', description: 'Quantity supplied at Pmin' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 255, anchor: 'start' },
    { text: 'Pmin', x: 25, y: 130, anchor: 'end' },
    { text: 'Pe', x: 25, y: 155, anchor: 'end' },
    { text: 'Surplus', x: 150, y: 105, anchor: 'middle', fontSize: 10 },
    { text: 'Qd', x: 100, y: 285, anchor: 'middle' },
    { text: 'Qs', x: 200, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Minimum price set ABOVE equilibrium (Pmin > Pe)',
    'Creates SURPLUS (Qs > Qd)',
    'Used to protect producers',
    'Examples: minimum wage, agricultural prices'
  ],
  commonMistakes: [
    'Setting Pmin below equilibrium',
    'Confusing surplus with shortage'
  ],
  examTips: [
    'Must be above Pe to have effect',
    'Creates excess supply (surplus)',
    'May require government to buy surplus'
  ],
  relatedTopics: ['Minimum wage', 'Agricultural policy', 'Buffer stocks', 'Producer protection'],
  keywords: ['minimum price', 'price floor', 'surplus', 'excess supply', 'minimum wage', 'producer protection'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D and S correct', 'Horizontal Pmin line above Pe'],
    labels: ['Pmin above Pe', 'Qd and Qs marked'],
    equilibrium: ['Free market E shown', 'Surplus distance shown'],
    areas: ['Surplus clearly indicated']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const minimumWage: DiagramTemplate = {
  id: 'minimum-wage',
  name: 'National Minimum Wage',
  slug: 'minimum-wage',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows minimum wage above equilibrium wage creating unemployment (labour surplus).',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage Rate (W)' },
  curves: [
    { id: 'demand', name: 'DL (Demand for Labour)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'SL (Supply of Labour)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'nmw', name: 'NMW', type: 'dashed', points: [{ x: 50, y: 125 }, { x: 250, y: 125 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e', x: 150, y: 150, label: 'E', description: 'Free market equilibrium wage' },
    { id: 'ld', x: 100, y: 125, label: 'Ld', description: 'Labour demanded at NMW' },
    { id: 'ls', x: 200, y: 125, label: 'Ls', description: 'Labour supplied at NMW' }
  ],
  labels: [
    { text: 'DL', x: 255, y: 55, anchor: 'start' },
    { text: 'SL', x: 255, y: 255, anchor: 'start' },
    { text: 'NMW', x: 25, y: 130, anchor: 'end' },
    { text: 'We', x: 25, y: 155, anchor: 'end' },
    { text: 'Unemployment', x: 150, y: 105, anchor: 'middle', fontSize: 10 },
    { text: 'Ld', x: 100, y: 285, anchor: 'middle' },
    { text: 'Ls', x: 200, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'NMW set ABOVE equilibrium wage',
    'Creates unemployment (Ls > Ld)',
    'Higher wage for those employed',
    'Firms demand less labour at higher wage'
  ],
  commonMistakes: [
    'Setting NMW below We',
    'Using wrong axis labels'
  ],
  examTips: [
    'Unemployment = Ls - Ld',
    'Effect depends on elasticity of demand for labour',
    'Debate: may reduce poverty but increase unemployment'
  ],
  relatedTopics: ['Labour market', 'Unemployment', 'Poverty', 'Income inequality'],
  keywords: ['minimum wage', 'NMW', 'unemployment', 'labour market', 'price floor', 'wage rate'],
  gradingCriteria: {
    axes: ['Wage (W) on Y', 'Labour (L) on X'],
    curves: ['DL and SL correct', 'NMW line above We'],
    labels: ['NMW, We, Ld, Ls all marked'],
    equilibrium: ['E shown', 'Unemployment gap shown'],
    areas: ['Unemployment distance clear']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// PUBLIC GOODS AND MARKET FAILURE
// ============================================================================

export const publicGoods: DiagramTemplate = {
  id: 'public-goods',
  name: 'Public Goods - Missing Market',
  slug: 'public-goods',
  category: 'market_failure',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows why public goods lead to market failure - free rider problem means zero private provision.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand-social', name: 'D (Social)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'demand-private', name: 'D (Private)', type: 'line', points: [{ x: 50, y: 280 }, { x: 50, y: 280 }], color: '#93c5fd', strokeWidth: 2 },
    { id: 'supply', name: 'S (MC)', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 200 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'social-opt', x: 133, y: 150, label: 'Qs', description: 'Socially optimal quantity' },
    { id: 'private', x: 50, y: 280, label: 'Qp=0', description: 'Private provision = 0' }
  ],
  labels: [
    { text: 'D (Social)', x: 255, y: 55, anchor: 'start' },
    { text: 'D (Private) = 0', x: 60, y: 280, anchor: 'start', fontSize: 10 },
    { text: 'S (MC)', x: 255, y: 205, anchor: 'start' },
    { text: 'Qp = 0', x: 50, y: 295, anchor: 'middle' },
    { text: 'Qs', x: 133, y: 295, anchor: 'middle' }
  ],
  keyFeatures: [
    'Non-excludable: cannot prevent non-payers from consuming',
    'Non-rivalrous: one persons consumption doesnt reduce anothers',
    'Free rider problem: rational to not pay',
    'Private demand = 0, market fails completely',
    'Government must provide (funded by taxation)'
  ],
  commonMistakes: [
    'Not showing zero private demand',
    'Confusing with merit goods'
  ],
  examTips: [
    'Examples: defence, street lighting, flood defences',
    'Private market provides zero',
    'Government direct provision needed'
  ],
  relatedTopics: ['Market failure', 'Government provision', 'Free rider', 'Taxation'],
  keywords: ['public goods', 'non-excludable', 'non-rivalrous', 'free rider', 'market failure', 'government provision'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Social demand shown', 'Private demand at zero', 'Supply/MC curve'],
    labels: ['Qs optimal', 'Qp = 0'],
    equilibrium: ['Show complete market failure'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// DEADWEIGHT LOSS
// ============================================================================

export const deadweightLossTax: DiagramTemplate = {
  id: 'deadweight-loss-tax',
  name: 'Deadweight Loss from Tax',
  slug: 'dwl-tax',
  category: 'government_intervention',
  unit: 'unit1',
  difficulty: 'AS',
  description: 'Shows welfare loss triangle created by indirect tax reducing quantity traded.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 200 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S + tax', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 250 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 150, y: 125, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 120, y: 150, label: 'E2', description: 'After tax' }
  ],
  areas: [
    { id: 'dwl', name: 'Deadweight Loss', points: [{ x: 120, y: 110 }, { x: 150, y: 125 }, { x: 120, y: 150 }], fill: '#fbbf24', opacity: 0.5, description: 'Triangle of lost welfare' }
  ],
  labels: [
    { text: 'D', x: 255, y: 55, anchor: 'start' },
    { text: 'S', x: 255, y: 205, anchor: 'start' },
    { text: 'S + tax', x: 255, y: 255, anchor: 'start' },
    { text: 'DWL', x: 135, y: 130, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Tax reduces quantity traded (Q1 to Q2)',
    'Lost trades = lost welfare',
    'DWL = triangle between old and new Q',
    'Represents market inefficiency'
  ],
  commonMistakes: [
    'Wrong triangle shape',
    'Confusing with government revenue'
  ],
  examTips: [
    'DWL = lost consumer + producer surplus',
    'Not captured as tax revenue',
    'Larger with more elastic curves'
  ],
  relatedTopics: ['Tax incidence', 'Market efficiency', 'Welfare economics'],
  keywords: ['deadweight loss', 'welfare loss', 'tax', 'inefficiency', 'market distortion'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['S shifts up with tax'],
    labels: ['DWL triangle labelled'],
    equilibrium: ['E1 and E2 shown'],
    areas: ['DWL triangle correctly positioned']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// EXPORT ALL UNIT 1 DIAGRAMS
// ============================================================================

export const UNIT1_DIAGRAMS: DiagramTemplate[] = [
  // Supply and Demand
  supplyDemandBasic,
  demandShiftRight,
  demandShiftLeft,
  supplyShiftRight,
  supplyShiftLeft,
  consumerProducerSurplus,

  // Elasticity
  elasticDemand,
  inelasticDemand,
  unitElasticDemand,
  perfectlyElasticDemand,
  perfectlyInelasticDemand,

  // Market Failure - Externalities
  negativeExternalityProduction,
  negativeExternalityConsumption,
  positiveExternalityConsumption,
  positiveExternalityProduction,
  publicGoods,

  // Government Intervention
  indirectTax,
  subsidy,
  maximumPrice,
  minimumPrice,
  minimumWage,
  deadweightLossTax
];

export default UNIT1_DIAGRAMS;
