// Unit 4: A Global Perspective (A2 Level)
// Edexcel IAL Economics - Comprehensive Diagram Database

import { DiagramTemplate } from './types';

// ============================================================================
// INTERNATIONAL TRADE
// ============================================================================

export const comparativeAdvantage: DiagramTemplate = {
  id: 'comparative-advantage',
  name: 'Comparative Advantage',
  slug: 'comparative-advantage',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows how countries can gain from trade by specialising in goods with lower opportunity cost.',
  axis: { xLabel: 'Good X', yLabel: 'Good Y' },
  curves: [
    { id: 'ppf-a', name: 'Country A PPF', type: 'line', points: [{ x: 50, y: 200 }, { x: 200, y: 50 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ppf-b', name: 'Country B PPF', type: 'line', points: [{ x: 100, y: 250 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'spec-a', x: 200, y: 50, label: 'A specialises', description: 'Country A produces Good X' },
    { id: 'spec-b', x: 100, y: 250, label: 'B specialises', description: 'Country B produces Good Y' }
  ],
  labels: [
    { text: 'Country A', x: 125, y: 100, anchor: 'middle', fontSize: 10 },
    { text: 'Country B', x: 175, y: 175, anchor: 'middle', fontSize: 10 },
    { text: 'A: lower OC for X', x: 150, y: 270, anchor: 'middle', fontSize: 9 },
    { text: 'B: lower OC for Y', x: 150, y: 285, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Compare OPPORTUNITY COSTS, not absolute costs',
    'Country specialises where OC is LOWER',
    'Both can gain from trade even if one is better at both',
    'Trade at terms between their OC ratios',
    'World output increases with specialisation'
  ],
  commonMistakes: [
    'Confusing comparative with absolute advantage',
    'Calculating OC incorrectly',
    'Forgetting both countries gain'
  ],
  examTips: [
    'OC = what you give up / what you gain',
    'Specialise where OC is lowest',
    'Terms of trade between the two OC ratios'
  ],
  relatedTopics: ['Specialisation', 'Free trade', 'Opportunity cost', 'Gains from trade'],
  keywords: ['comparative advantage', 'opportunity cost', 'specialisation', 'gains from trade', 'ricardian'],
  gradingCriteria: {
    axes: ['Two goods on axes'],
    curves: ['PPFs for both countries', 'Different slopes showing different OCs'],
    labels: ['Countries identified', 'Specialisation shown'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const tariffDiagram: DiagramTemplate = {
  id: 'tariff-diagram',
  name: 'Tariff on Imports',
  slug: 'tariff',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows effect of import tariff: higher price, lower imports, government revenue, welfare loss.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S (domestic)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'world-price', name: 'Pw', type: 'line', points: [{ x: 50, y: 175 }, { x: 250, y: 175 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'tariff-price', name: 'Pw + tariff', type: 'line', points: [{ x: 50, y: 140 }, { x: 250, y: 140 }], color: '#22c55e', strokeWidth: 2 }
  ],
  points: [
    { id: 'q1', x: 95, y: 175, label: 'Q1', description: 'Domestic supply at Pw' },
    { id: 'q2', x: 205, y: 175, label: 'Q2', description: 'Domestic demand at Pw' },
    { id: 'q3', x: 125, y: 140, label: 'Q3', description: 'Domestic supply at Pw+t' },
    { id: 'q4', x: 175, y: 140, label: 'Q4', description: 'Domestic demand at Pw+t' }
  ],
  areas: [
    { id: 'tariff-revenue', name: 'Tariff Revenue', points: [{ x: 125, y: 140 }, { x: 175, y: 140 }, { x: 175, y: 175 }, { x: 125, y: 175 }], fill: '#22c55e', opacity: 0.3, description: 'Government tariff revenue' },
    { id: 'dwl1', name: 'DWL (production)', points: [{ x: 95, y: 175 }, { x: 125, y: 140 }, { x: 125, y: 175 }], fill: '#fbbf24', opacity: 0.5, description: 'Production inefficiency' },
    { id: 'dwl2', name: 'DWL (consumption)', points: [{ x: 175, y: 140 }, { x: 205, y: 175 }, { x: 175, y: 175 }], fill: '#fbbf24', opacity: 0.5, description: 'Consumption inefficiency' }
  ],
  labels: [
    { text: 'D', x: 255, y: 255, anchor: 'start' },
    { text: 'S', x: 255, y: 55, anchor: 'start' },
    { text: 'Pw', x: 25, y: 180, anchor: 'end' },
    { text: 'Pw + t', x: 25, y: 145, anchor: 'end' },
    { text: 'Imports before', x: 150, y: 195, anchor: 'middle', fontSize: 8 },
    { text: 'Imports after', x: 150, y: 125, anchor: 'middle', fontSize: 8 },
    { text: 'Tariff Revenue', x: 150, y: 160, anchor: 'middle', fontSize: 8 },
    { text: 'DWL', x: 110, y: 160, anchor: 'middle', fontSize: 8 },
    { text: 'DWL', x: 190, y: 160, anchor: 'middle', fontSize: 8 }
  ],
  keyFeatures: [
    'World price Pw (perfectly elastic supply)',
    'Tariff raises price to Pw + t',
    'Domestic supply INCREASES (Q1 to Q3)',
    'Domestic demand DECREASES (Q2 to Q4)',
    'Imports FALL (Q2-Q1 to Q4-Q3)',
    'Government revenue = tariff × imports',
    'TWO deadweight loss triangles'
  ],
  commonMistakes: [
    'Forgetting world supply is horizontal',
    'Only showing one DWL triangle',
    'Not showing domestic supply expansion'
  ],
  examTips: [
    'Imports = demand - domestic supply at each price',
    'Tariff protects domestic producers but harms consumers',
    'DWL = production inefficiency + consumption loss'
  ],
  relatedTopics: ['Protectionism', 'Free trade', 'Consumer surplus', 'Government revenue'],
  keywords: ['tariff', 'import duty', 'protectionism', 'deadweight loss', 'trade protection'],
  gradingCriteria: {
    axes: ['Price on Y', 'Quantity on X'],
    curves: ['D curve', 'S domestic curve', 'Pw horizontal', 'Pw+t horizontal'],
    labels: ['All quantities labelled (Q1-Q4)', 'Both prices labelled'],
    equilibrium: ['Before and after tariff positions'],
    areas: ['Tariff revenue rectangle', 'Two DWL triangles']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const quotaDiagram: DiagramTemplate = {
  id: 'quota-diagram',
  name: 'Import Quota',
  slug: 'quota',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows effect of quantitative restriction on imports - similar to tariff but quota rent goes to foreign producers.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price (P)' },
  curves: [
    { id: 'demand', name: 'D', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S (domestic)', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'world-price', name: 'Pw', type: 'line', points: [{ x: 50, y: 175 }, { x: 250, y: 175 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'supply-quota', name: 'S + quota', type: 'line', points: [{ x: 50, y: 250 }, { x: 125, y: 175 }, { x: 175, y: 175 }, { x: 250, y: 100 }], color: '#f97316', strokeWidth: 2 }
  ],
  points: [],
  areas: [
    { id: 'quota-rent', name: 'Quota Rent', points: [{ x: 125, y: 140 }, { x: 175, y: 140 }, { x: 175, y: 175 }, { x: 125, y: 175 }], fill: '#a855f7', opacity: 0.3, description: 'Quota rent to foreign producers' }
  ],
  labels: [
    { text: 'D', x: 255, y: 255, anchor: 'start' },
    { text: 'S', x: 255, y: 55, anchor: 'start' },
    { text: 'Pw', x: 25, y: 180, anchor: 'end' },
    { text: 'Pq', x: 25, y: 145, anchor: 'end' },
    { text: 'Quota amount', x: 150, y: 190, anchor: 'middle', fontSize: 9 },
    { text: 'Quota Rent', x: 150, y: 160, anchor: 'middle', fontSize: 8 }
  ],
  keyFeatures: [
    'Quota limits import QUANTITY directly',
    'Price rises to Pq (where S+quota meets D)',
    'Quota rent goes to licence holders (often foreign)',
    'Unlike tariff, no government revenue',
    'Same welfare effects as equivalent tariff'
  ],
  commonMistakes: [
    'Thinking quota rent goes to government',
    'Not showing kinked supply curve'
  ],
  examTips: [
    'Quota rent = (Pq - Pw) × quota amount',
    'Usually worse than tariff (no revenue)',
    'Often used with licence allocation'
  ],
  relatedTopics: ['Protectionism', 'Non-tariff barriers', 'Import controls'],
  keywords: ['quota', 'import quota', 'quantitative restriction', 'quota rent', 'protectionism'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D', 'S domestic', 'Pw', 'S+quota kinked'],
    labels: ['Quota amount shown', 'Pq and Pw'],
    equilibrium: ['New price at quota level'],
    areas: ['Quota rent identified']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// EXCHANGE RATES
// ============================================================================

export const exchangeRateFloating: DiagramTemplate = {
  id: 'exchange-rate-floating',
  name: 'Floating Exchange Rate',
  slug: 'exchange-rate',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows exchange rate determination by supply and demand for currency in forex market.',
  axis: { xLabel: 'Quantity of £', yLabel: 'Exchange Rate ($/£)' },
  curves: [
    { id: 'demand', name: 'D£', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply', name: 'S£', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'equilibrium', x: 150, y: 150, label: 'E', description: 'Equilibrium exchange rate' }
  ],
  labels: [
    { text: 'D£', x: 255, y: 255, anchor: 'start' },
    { text: 'S£', x: 255, y: 55, anchor: 'start' },
    { text: 'e*', x: 25, y: 155, anchor: 'end' },
    { text: 'Q*', x: 150, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Exchange rate = price of one currency in terms of another',
    'D£ from foreigners wanting UK goods/assets',
    'S£ from UK residents wanting foreign goods/assets',
    'Rate determined by market forces',
    'Floats freely (no intervention)'
  ],
  commonMistakes: [
    'Mixing up which currency on which axis',
    'Confusing appreciation with depreciation'
  ],
  examTips: [
    'Higher exchange rate = stronger £ = more $ per £',
    'D£ shifts right → appreciation',
    'S£ shifts right → depreciation'
  ],
  relatedTopics: ['Forex market', 'Currency', 'Balance of payments', 'Interest rates'],
  keywords: ['exchange rate', 'floating', 'forex', 'currency', 'appreciation', 'depreciation'],
  gradingCriteria: {
    axes: ['Quantity of currency on X', 'Exchange rate on Y'],
    curves: ['Downward D', 'Upward S'],
    labels: ['Equilibrium rate marked'],
    equilibrium: ['Intersection E'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const exchangeRateAppreciation: DiagramTemplate = {
  id: 'exchange-rate-appreciation',
  name: 'Currency Appreciation',
  slug: 'appreciation',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows appreciation of currency due to increased demand or decreased supply.',
  axis: { xLabel: 'Quantity of £', yLabel: 'Exchange Rate ($/£)' },
  curves: [
    { id: 'demand1', name: 'D1', type: 'line', points: [{ x: 50, y: 75 }, { x: 200, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'demand2', name: 'D2', type: 'line', points: [{ x: 100, y: 75 }, { x: 250, y: 250 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'supply', name: 'S£', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 125, y: 163, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 165, y: 125, label: 'E2', description: 'New equilibrium (appreciation)' }
  ],
  labels: [
    { text: 'D1', x: 205, y: 255, anchor: 'start' },
    { text: 'D2', x: 255, y: 255, anchor: 'start' },
    { text: 'S£', x: 255, y: 55, anchor: 'start' },
    { text: 'e1', x: 25, y: 168, anchor: 'end' },
    { text: 'e2', x: 25, y: 130, anchor: 'end' },
    { text: 'Appreciation', x: 145, y: 100, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Demand for £ INCREASES (D1 to D2)',
    'Exchange rate RISES (e1 to e2)',
    '£ APPRECIATES (becomes stronger)',
    'Causes: higher interest rates, strong exports, speculation',
    'Effect: exports more expensive, imports cheaper'
  ],
  commonMistakes: [
    'Saying appreciation when rate falls',
    'Not linking to trade effects'
  ],
  examTips: [
    'Appreciation = exchange rate rises = currency stronger',
    'Bad for exporters, good for importers',
    'SPICED: Strong Pound Imports Cheap Exports Dear'
  ],
  relatedTopics: ['Currency strength', 'Trade competitiveness', 'Hot money flows'],
  keywords: ['appreciation', 'stronger currency', 'exchange rate rise', 'exports expensive'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['D shifts right', 'S unchanged'],
    labels: ['e1 and e2 shown', 'Appreciation noted'],
    equilibrium: ['E1 and E2'],
    shifts: ['Demand shift right']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const exchangeRateDepreciation: DiagramTemplate = {
  id: 'exchange-rate-depreciation',
  name: 'Currency Depreciation',
  slug: 'depreciation',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows depreciation of currency due to decreased demand or increased supply.',
  axis: { xLabel: 'Quantity of £', yLabel: 'Exchange Rate ($/£)' },
  curves: [
    { id: 'demand', name: 'D£', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'supply1', name: 'S1', type: 'line', points: [{ x: 50, y: 225 }, { x: 200, y: 50 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'supply2', name: 'S2', type: 'line', points: [{ x: 100, y: 225 }, { x: 250, y: 50 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 125, y: 125, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 165, y: 165, label: 'E2', description: 'New equilibrium (depreciation)' }
  ],
  labels: [
    { text: 'D£', x: 255, y: 255, anchor: 'start' },
    { text: 'S1', x: 205, y: 55, anchor: 'start' },
    { text: 'S2', x: 255, y: 55, anchor: 'start' },
    { text: 'e1', x: 25, y: 130, anchor: 'end' },
    { text: 'e2', x: 25, y: 170, anchor: 'end' },
    { text: 'Depreciation', x: 145, y: 200, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Supply of £ INCREASES (S1 to S2)',
    'Exchange rate FALLS (e1 to e2)',
    '£ DEPRECIATES (becomes weaker)',
    'Causes: lower interest rates, current account deficit, speculation',
    'Effect: exports cheaper, imports more expensive'
  ],
  commonMistakes: [
    'Confusing depreciation with appreciation'
  ],
  examTips: [
    'Depreciation = exchange rate falls = currency weaker',
    'Good for exporters, bad for importers',
    'May improve trade balance (if Marshall-Lerner holds)'
  ],
  relatedTopics: ['Competitiveness', 'Current account', 'Inflation'],
  keywords: ['depreciation', 'weaker currency', 'exchange rate fall', 'exports cheaper'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['S shifts right', 'D unchanged'],
    labels: ['e1 and e2', 'Depreciation noted'],
    equilibrium: ['E1 and E2'],
    shifts: ['Supply shift right']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const jCurve: DiagramTemplate = {
  id: 'j-curve',
  name: 'J-Curve Effect',
  slug: 'j-curve',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows how current account initially worsens after depreciation before improving.',
  axis: { xLabel: 'Time', yLabel: 'Current Account Balance' },
  curves: [
    { id: 'j-curve', name: 'J-Curve', type: 'curve', points: [{ x: 50, y: 150 }, { x: 100, y: 200 }, { x: 150, y: 180 }, { x: 200, y: 120 }, { x: 250, y: 80 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'zero', name: 'Balance', type: 'dashed', points: [{ x: 50, y: 150 }, { x: 250, y: 150 }], color: '#9ca3af', strokeWidth: 1 }
  ],
  points: [
    { id: 'depreciation', x: 50, y: 150, label: 'Depreciation', description: 'Point of depreciation' },
    { id: 'worst', x: 100, y: 200, label: 'Worst', description: 'Maximum deterioration' },
    { id: 'recovery', x: 150, y: 150, label: 'Recovery', description: 'Back to original' }
  ],
  labels: [
    { text: 'Current Account', x: 25, y: 80, anchor: 'end', fontSize: 9 },
    { text: 'Surplus', x: 270, y: 100, anchor: 'start', fontSize: 9 },
    { text: 'Deficit', x: 270, y: 200, anchor: 'start', fontSize: 9 },
    { text: 'Short-run: worsens', x: 100, y: 220, anchor: 'middle', fontSize: 8 },
    { text: 'Long-run: improves', x: 200, y: 100, anchor: 'middle', fontSize: 8 }
  ],
  keyFeatures: [
    'SHORT RUN: Current account worsens after depreciation',
    'Imports cost more but volume unchanged (contracts fixed)',
    'Exports revenue unchanged (volume sticky)',
    'LONG RUN: Volumes adjust, CA improves',
    'Requires Marshall-Lerner condition (PED_X + PED_M > 1)'
  ],
  commonMistakes: [
    'Drawing improvement immediately',
    'Not explaining time lag'
  ],
  examTips: [
    'J-curve due to time lags in quantity adjustment',
    'Short-run: price effect dominates',
    'Long-run: volume effect dominates',
    'Shape looks like letter J'
  ],
  relatedTopics: ['Marshall-Lerner', 'Current account', 'Depreciation effects', 'Time lags'],
  keywords: ['j-curve', 'current account', 'depreciation', 'marshall-lerner', 'time lag'],
  gradingCriteria: {
    axes: ['Time on X', 'Current Account on Y'],
    curves: ['J-shaped curve', 'Zero/balance line'],
    labels: ['Initial worsening', 'Eventual improvement'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// DEVELOPMENT ECONOMICS
// ============================================================================

export const lorenzCurve: DiagramTemplate = {
  id: 'lorenz-curve',
  name: 'Lorenz Curve',
  slug: 'lorenz-curve',
  category: 'development',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows income/wealth distribution - deviation from line of equality indicates inequality.',
  axis: { xLabel: 'Cumulative % of Population', yLabel: 'Cumulative % of Income' },
  curves: [
    { id: 'equality', name: 'Line of Equality', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'lorenz', name: 'Lorenz Curve', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 240 }, { x: 150, y: 200 }, { x: 200, y: 130 }, { x: 250, y: 50 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [],
  areas: [
    { id: 'inequality', name: 'Area A (Inequality)', points: [{ x: 50, y: 250 }, { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 100, y: 240 }], fill: '#fbbf24', opacity: 0.3, description: 'Area between curves = inequality measure' }
  ],
  labels: [
    { text: 'Line of Equality', x: 200, y: 100, anchor: 'start', fontSize: 9 },
    { text: 'Lorenz Curve', x: 150, y: 220, anchor: 'start', fontSize: 9 },
    { text: 'Area A', x: 130, y: 180, anchor: 'middle', fontSize: 9 },
    { text: 'Gini = A/(A+B)', x: 150, y: 270, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Line of equality = perfect income equality',
    'Lorenz curve shows actual distribution',
    'Further from equality = more inequality',
    'Gini coefficient = Area A / (A + B)',
    'Gini ranges 0 (perfect equality) to 1 (perfect inequality)'
  ],
  commonMistakes: [
    'Drawing Lorenz above line of equality',
    'Not labelling axes correctly (cumulative %)'
  ],
  examTips: [
    'Both axes go 0-100%',
    'Lorenz always below equality line',
    'Can compare countries or time periods'
  ],
  relatedTopics: ['Income inequality', 'Gini coefficient', 'Distribution', 'Poverty'],
  keywords: ['lorenz curve', 'gini coefficient', 'inequality', 'income distribution', 'wealth'],
  gradingCriteria: {
    axes: ['Cumulative % population on X', 'Cumulative % income on Y'],
    curves: ['Line of equality (45°)', 'Lorenz curve below it'],
    labels: ['Area A identified'],
    equilibrium: [],
    areas: ['Inequality area shaded']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const ppfBasic: DiagramTemplate = {
  id: 'ppf-basic',
  name: 'Production Possibility Frontier',
  slug: 'ppf',
  category: 'development',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows maximum combinations of two goods an economy can produce with given resources.',
  axis: { xLabel: 'Good X', yLabel: 'Good Y' },
  curves: [
    { id: 'ppf', name: 'PPF', type: 'curve', points: [{ x: 50, y: 50 }, { x: 100, y: 80 }, { x: 150, y: 120 }, { x: 200, y: 180 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'efficient', x: 150, y: 120, label: 'A', description: 'Efficient (on PPF)' },
    { id: 'inefficient', x: 120, y: 160, label: 'B', description: 'Inefficient (inside PPF)' },
    { id: 'unattainable', x: 180, y: 100, label: 'C', description: 'Unattainable (outside PPF)' }
  ],
  labels: [
    { text: 'PPF', x: 255, y: 255, anchor: 'start' },
    { text: 'Efficient', x: 160, y: 115, anchor: 'start', fontSize: 9 },
    { text: 'Inefficient', x: 85, y: 160, anchor: 'end', fontSize: 9 },
    { text: 'Unattainable', x: 190, y: 95, anchor: 'start', fontSize: 9 }
  ],
  keyFeatures: [
    'Points ON PPF = productively efficient',
    'Points INSIDE = inefficient (unemployed resources)',
    'Points OUTSIDE = unattainable (with current resources)',
    'Slope = opportunity cost (increases along curve)',
    'Concave shape due to law of increasing opportunity cost'
  ],
  commonMistakes: [
    'Drawing straight line (should be curved)',
    'Forgetting opportunity cost increases'
  ],
  examTips: [
    'Movement along = reallocation',
    'Shift outward = economic growth',
    'OC = slope of PPF at that point'
  ],
  relatedTopics: ['Opportunity cost', 'Efficiency', 'Scarcity', 'Choice'],
  keywords: ['ppf', 'production possibility', 'opportunity cost', 'efficiency', 'scarcity'],
  gradingCriteria: {
    axes: ['Two goods on axes'],
    curves: ['Concave PPF curve'],
    labels: ['Points A, B, C identified'],
    equilibrium: ['Efficiency distinction'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const ppfGrowth: DiagramTemplate = {
  id: 'ppf-growth',
  name: 'PPF Shift (Economic Growth)',
  slug: 'ppf-growth',
  category: 'development',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows outward shift of PPF representing economic growth and increased productive capacity.',
  axis: { xLabel: 'Consumer Goods', yLabel: 'Capital Goods' },
  curves: [
    { id: 'ppf1', name: 'PPF1', type: 'curve', points: [{ x: 50, y: 75 }, { x: 100, y: 100 }, { x: 150, y: 140 }, { x: 200, y: 200 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ppf2', name: 'PPF2', type: 'curve', points: [{ x: 75, y: 50 }, { x: 125, y: 75 }, { x: 175, y: 115 }, { x: 250, y: 200 }], color: '#22c55e', strokeWidth: 2 }
  ],
  points: [
    { id: 'current', x: 125, y: 115, label: 'A', description: 'Current production point' }
  ],
  labels: [
    { text: 'PPF1', x: 205, y: 205, anchor: 'start' },
    { text: 'PPF2', x: 255, y: 205, anchor: 'start' },
    { text: 'Growth', x: 175, y: 150, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'PPF shifts OUTWARD = economic growth',
    'More of both goods now attainable',
    'Causes: more resources, better technology, education',
    'Capital goods investment → future PPF shift',
    'Actual growth vs potential growth'
  ],
  commonMistakes: [
    'Showing inward shift for growth',
    'Not linking to LRAS shift'
  ],
  examTips: [
    'Equivalent to LRAS shifting right',
    'Investment in capital goods shifts future PPF more',
    'Trade-off between present and future consumption'
  ],
  relatedTopics: ['Economic growth', 'Investment', 'LRAS shift', 'Development'],
  keywords: ['ppf shift', 'economic growth', 'productive capacity', 'investment', 'development'],
  gradingCriteria: {
    axes: ['Two goods labelled'],
    curves: ['Original PPF', 'Shifted PPF to right'],
    labels: ['Both PPFs labelled', 'Growth direction'],
    equilibrium: [],
    shifts: ['Outward shift shown']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const balanceOfPayments: DiagramTemplate = {
  id: 'balance-of-payments',
  name: 'Balance of Payments',
  slug: 'bop',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows structure of balance of payments accounts and their relationship.',
  axis: { xLabel: '', yLabel: '' },
  curves: [],
  points: [],
  labels: [
    { text: 'BALANCE OF PAYMENTS', x: 150, y: 30, anchor: 'middle', fontSize: 14 },
    { text: 'Current Account', x: 75, y: 80, anchor: 'middle', fontSize: 11 },
    { text: '• Trade in goods', x: 75, y: 100, anchor: 'middle', fontSize: 9 },
    { text: '• Trade in services', x: 75, y: 115, anchor: 'middle', fontSize: 9 },
    { text: '• Primary income', x: 75, y: 130, anchor: 'middle', fontSize: 9 },
    { text: '• Secondary income', x: 75, y: 145, anchor: 'middle', fontSize: 9 },
    { text: 'Capital Account', x: 150, y: 80, anchor: 'middle', fontSize: 11 },
    { text: '• Capital transfers', x: 150, y: 100, anchor: 'middle', fontSize: 9 },
    { text: 'Financial Account', x: 225, y: 80, anchor: 'middle', fontSize: 11 },
    { text: '• FDI', x: 225, y: 100, anchor: 'middle', fontSize: 9 },
    { text: '• Portfolio investment', x: 225, y: 115, anchor: 'middle', fontSize: 9 },
    { text: '• Other investment', x: 225, y: 130, anchor: 'middle', fontSize: 9 },
    { text: '• Reserve assets', x: 225, y: 145, anchor: 'middle', fontSize: 9 },
    { text: 'CA + Capital A + Financial A = 0', x: 150, y: 200, anchor: 'middle', fontSize: 10 },
    { text: '(plus errors & omissions)', x: 150, y: 220, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Current Account: trade in goods/services, income flows',
    'Capital Account: capital transfers (small)',
    'Financial Account: investment flows, reserves',
    'Double-entry: must balance to zero',
    'Current Account deficit = Financial Account surplus'
  ],
  commonMistakes: [
    'Confusing financial with capital account',
    'Not understanding double-entry'
  ],
  examTips: [
    'CA deficit financed by FA surplus (borrowing/selling assets)',
    'Trade balance is largest part of CA',
    'Hot money flows affect FA'
  ],
  relatedTopics: ['Trade balance', 'Current account', 'FDI', 'Exchange rates'],
  keywords: ['balance of payments', 'current account', 'financial account', 'trade balance', 'FDI'],
  gradingCriteria: {
    axes: [],
    curves: [],
    labels: ['Three accounts identified', 'Components listed', 'Balance equation'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const termsOfTrade: DiagramTemplate = {
  id: 'terms-of-trade',
  name: 'Terms of Trade',
  slug: 'terms-of-trade',
  category: 'international',
  unit: 'unit4',
  difficulty: 'A2',
  description: 'Shows ratio of export prices to import prices and its implications for trade balance.',
  axis: { xLabel: 'Time', yLabel: 'Index (100 = base)' },
  curves: [
    { id: 'export-prices', name: 'Export Prices', type: 'line', points: [{ x: 50, y: 150 }, { x: 150, y: 130 }, { x: 250, y: 100 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'import-prices', name: 'Import Prices', type: 'line', points: [{ x: 50, y: 150 }, { x: 150, y: 160 }, { x: 250, y: 180 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'tot', name: 'Terms of Trade', type: 'line', points: [{ x: 50, y: 150 }, { x: 150, y: 120 }, { x: 250, y: 70 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'Export Prices', x: 255, y: 105, anchor: 'start', fontSize: 9 },
    { text: 'Import Prices', x: 255, y: 185, anchor: 'start', fontSize: 9 },
    { text: 'ToT', x: 255, y: 75, anchor: 'start', fontSize: 9 },
    { text: 'ToT = (Px/Pm) × 100', x: 150, y: 250, anchor: 'middle', fontSize: 10 },
    { text: 'Deteriorating ToT', x: 150, y: 270, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'ToT = (Export Price Index / Import Price Index) × 100',
    'ToT rises = improvement (more imports per export)',
    'ToT falls = deterioration (fewer imports per export)',
    'Developing countries often face declining ToT',
    'Prebisch-Singer hypothesis'
  ],
  commonMistakes: [
    'Confusing improvement with higher exports',
    'Not using price indices'
  ],
  examTips: [
    'Improvement: can buy more imports with same exports',
    'Deterioration: need more exports for same imports',
    'Commodity exporters vulnerable to ToT shocks'
  ],
  relatedTopics: ['Trade', 'Development', 'Commodities', 'Current account'],
  keywords: ['terms of trade', 'export prices', 'import prices', 'ToT', 'deterioration'],
  gradingCriteria: {
    axes: ['Time on X', 'Price index on Y'],
    curves: ['Export prices', 'Import prices', 'ToT line'],
    labels: ['Formula shown', 'Direction interpreted'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// EXPORT ALL UNIT 4 DIAGRAMS
// ============================================================================

export const UNIT4_DIAGRAMS: DiagramTemplate[] = [
  // International Trade
  comparativeAdvantage,
  tariffDiagram,
  quotaDiagram,

  // Exchange Rates
  exchangeRateFloating,
  exchangeRateAppreciation,
  exchangeRateDepreciation,
  jCurve,

  // Development Economics
  lorenzCurve,
  ppfBasic,
  ppfGrowth,
  balanceOfPayments,
  termsOfTrade
];

export default UNIT4_DIAGRAMS;
