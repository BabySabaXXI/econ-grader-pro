// Unit 2: Macroeconomic Performance and Policy (AS Level)
// Edexcel IAL Economics - Comprehensive Diagram Database

import { DiagramTemplate } from './types';

// ============================================================================
// AD/AS MODEL DIAGRAMS
// ============================================================================

export const adAsBasic: DiagramTemplate = {
  id: 'ad-as-basic',
  name: 'Basic AD/AS Model',
  slug: 'ad-as-basic',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows macroeconomic equilibrium where Aggregate Demand meets Aggregate Supply, determining price level and real GDP.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad', name: 'AD', type: 'line', points: [{ x: 250, y: 50 }, { x: 50, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sras', name: 'SRAS', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 175, y: 50 }, { x: 175, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [{ id: 'e', x: 150, y: 150, label: 'E', description: 'Macroeconomic equilibrium' }],
  labels: [
    { text: 'AD', x: 55, y: 255, anchor: 'start' },
    { text: 'SRAS', x: 255, y: 105, anchor: 'start' },
    { text: 'LRAS', x: 180, y: 55, anchor: 'start' },
    { text: 'PL₁', x: 25, y: 155, anchor: 'end' },
    { text: 'Y₁', x: 150, y: 285, anchor: 'middle' },
    { text: 'Yf', x: 175, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'AD downward sloping (wealth, interest rate, trade effects)',
    'SRAS upward sloping (sticky wages/prices in short run)',
    'LRAS vertical at full employment output (Yf)',
    'Equilibrium where AD = SRAS'
  ],
  commonMistakes: [
    'Not distinguishing SRAS from LRAS',
    'Drawing AD upward sloping',
    'Forgetting to label Yf on LRAS'
  ],
  examTips: [
    'Always include LRAS for context',
    'Show output gap if Y₁ ≠ Yf',
    'Use arrows to show curve shifts'
  ],
  relatedTopics: ['Macroeconomic equilibrium', 'Price level', 'Real GDP', 'Full employment'],
  keywords: ['AD', 'AS', 'aggregate demand', 'aggregate supply', 'macroeconomic equilibrium', 'price level', 'real GDP'],
  gradingCriteria: {
    axes: ['Price Level (PL) on Y-axis', 'Real GDP/Output (Y) on X-axis'],
    curves: ['Downward sloping AD', 'Upward sloping SRAS', 'Vertical LRAS'],
    labels: ['All curves labelled', 'Equilibrium price and output marked'],
    equilibrium: ['Intersection point E marked', 'PL₁ and Y₁ shown']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const adShiftRight: DiagramTemplate = {
  id: 'ad-shift-right',
  name: 'Increase in AD (Demand-Pull)',
  slug: 'ad-increase',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows rightward shift of AD causing demand-pull inflation and higher real GDP in short run.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad1', name: 'AD1', type: 'line', points: [{ x: 200, y: 50 }, { x: 50, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ad2', name: 'AD2', type: 'line', points: [{ x: 250, y: 50 }, { x: 100, y: 250 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'sras', name: 'SRAS', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 200, y: 50 }, { x: 200, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 125, y: 160, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 165, y: 130, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'AD1', x: 55, y: 255, anchor: 'start' },
    { text: 'AD2', x: 105, y: 255, anchor: 'start' },
    { text: 'SRAS', x: 255, y: 105, anchor: 'start' },
    { text: 'LRAS', x: 205, y: 55, anchor: 'start' },
    { text: 'PL1', x: 25, y: 165, anchor: 'end' },
    { text: 'PL2', x: 25, y: 135, anchor: 'end' }
  ],
  keyFeatures: [
    'AD shifts RIGHT from AD1 to AD2',
    'Price level RISES (PL1 to PL2) - inflation',
    'Real GDP RISES (Y1 to Y2)',
    'This is DEMAND-PULL inflation',
    'Causes: fiscal expansion, monetary expansion, consumer confidence, exports'
  ],
  commonMistakes: [
    'Forgetting to show price increase',
    'Not distinguishing from cost-push',
    'Shifting SRAS instead of AD'
  ],
  examTips: [
    'Show clear arrow indicating shift direction',
    'Mark both equilibria E1 and E2',
    'Explain the cause of AD shift in answer'
  ],
  relatedTopics: ['Demand-pull inflation', 'Fiscal policy', 'Monetary policy', 'Consumer spending'],
  keywords: ['AD increase', 'demand-pull', 'inflation', 'fiscal expansion', 'monetary expansion', 'consumer confidence'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AD1 and AD2 shown', 'SRAS unchanged', 'LRAS for reference'],
    labels: ['Both AD curves labelled', 'Shift arrow shown'],
    equilibrium: ['E1 and E2 marked', 'PL increase shown', 'Y increase shown'],
    shifts: ['Rightward parallel shift of AD']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const adShiftLeft: DiagramTemplate = {
  id: 'ad-shift-left',
  name: 'Decrease in AD (Contractionary)',
  slug: 'ad-decrease',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows leftward shift of AD causing deflation and lower real GDP - typical of recession.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad1', name: 'AD1', type: 'line', points: [{ x: 250, y: 50 }, { x: 100, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ad2', name: 'AD2', type: 'line', points: [{ x: 200, y: 50 }, { x: 50, y: 250 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'sras', name: 'SRAS', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 200, y: 50 }, { x: 200, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 165, y: 130, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 125, y: 160, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'AD1', x: 105, y: 255, anchor: 'start' },
    { text: 'AD2', x: 55, y: 255, anchor: 'start' },
    { text: 'SRAS', x: 255, y: 105, anchor: 'start' }
  ],
  keyFeatures: [
    'AD shifts LEFT from AD1 to AD2',
    'Price level FALLS (deflation)',
    'Real GDP FALLS (recession)',
    'Causes: austerity, higher interest rates, falling confidence'
  ],
  commonMistakes: [
    'Confusing with supply shock'
  ],
  examTips: [
    'Associated with recession and unemployment'
  ],
  relatedTopics: ['Recession', 'Deflation', 'Unemployment', 'Austerity'],
  keywords: ['AD decrease', 'contractionary', 'recession', 'deflation', 'austerity'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AD shifts left'],
    labels: ['Both curves labelled'],
    equilibrium: ['Both equilibria shown'],
    shifts: ['Leftward shift']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const srasShiftLeft: DiagramTemplate = {
  id: 'sras-shift-left',
  name: 'Decrease in SRAS (Cost-Push)',
  slug: 'sras-decrease',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows leftward shift of SRAS causing cost-push inflation and stagflation (higher prices, lower output).',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad', name: 'AD', type: 'line', points: [{ x: 250, y: 50 }, { x: 50, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sras1', name: 'SRAS1', type: 'line', points: [{ x: 50, y: 175 }, { x: 250, y: 75 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'sras2', name: 'SRAS2', type: 'line', points: [{ x: 50, y: 225 }, { x: 250, y: 125 }], color: '#ef4444', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 200, y: 50 }, { x: 200, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 165, y: 115, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 135, y: 155, label: 'E2', description: 'New equilibrium (stagflation)' }
  ],
  labels: [
    { text: 'AD', x: 55, y: 255, anchor: 'start' },
    { text: 'SRAS1', x: 255, y: 80, anchor: 'start' },
    { text: 'SRAS2', x: 255, y: 130, anchor: 'start' },
    { text: 'LRAS', x: 205, y: 55, anchor: 'start' },
    { text: 'PL1', x: 25, y: 120, anchor: 'end' },
    { text: 'PL2', x: 25, y: 160, anchor: 'end' },
    { text: 'Y1', x: 165, y: 285, anchor: 'middle' },
    { text: 'Y2', x: 135, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'SRAS shifts LEFT/UP from SRAS1 to SRAS2',
    'Price level RISES (inflation)',
    'Real GDP FALLS (recession)',
    'This is STAGFLATION - worst of both worlds',
    'Causes: oil shock, wage push, raw material costs'
  ],
  commonMistakes: [
    'Confusing with demand-pull (AD shift)',
    'Showing Y increasing (should decrease)',
    'Forgetting this causes stagflation'
  ],
  examTips: [
    'SRAS shift UP = cost-push inflation',
    'Results in stagflation (inflation + unemployment)',
    'Hard for policymakers to solve'
  ],
  relatedTopics: ['Cost-push inflation', 'Stagflation', 'Oil shock', 'Supply-side shock'],
  keywords: ['cost-push', 'SRAS shift', 'stagflation', 'oil shock', 'supply shock', 'wage-push'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['SRAS shifts up/left', 'AD unchanged'],
    labels: ['SRAS1, SRAS2 labelled', 'Shift direction shown'],
    equilibrium: ['E1 and E2 marked', 'PL rises', 'Y falls (stagflation)'],
    shifts: ['Leftward/upward SRAS shift']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const lrasShift: DiagramTemplate = {
  id: 'lras-shift',
  name: 'Increase in LRAS (Economic Growth)',
  slug: 'lras-increase',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows rightward shift of LRAS representing long-run economic growth and increased productive capacity.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad', name: 'AD', type: 'line', points: [{ x: 250, y: 50 }, { x: 50, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sras1', name: 'SRAS1', type: 'line', points: [{ x: 50, y: 200 }, { x: 200, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'sras2', name: 'SRAS2', type: 'line', points: [{ x: 100, y: 200 }, { x: 250, y: 100 }], color: '#ef4444', strokeWidth: 2 },
    { id: 'lras1', name: 'LRAS1', type: 'line', points: [{ x: 150, y: 50 }, { x: 150, y: 250 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'lras2', name: 'LRAS2', type: 'line', points: [{ x: 200, y: 50 }, { x: 200, y: 250 }], color: '#22c55e', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 130, y: 150, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 165, y: 130, label: 'E2', description: 'New equilibrium' }
  ],
  labels: [
    { text: 'AD', x: 55, y: 255, anchor: 'start' },
    { text: 'LRAS1', x: 155, y: 55, anchor: 'start' },
    { text: 'LRAS2', x: 205, y: 55, anchor: 'start' },
    { text: 'Yf1', x: 150, y: 285, anchor: 'middle' },
    { text: 'Yf2', x: 200, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'LRAS shifts RIGHT from LRAS1 to LRAS2',
    'Full employment output increases (Yf1 to Yf2)',
    'Long-run economic growth',
    'SRAS also shifts right',
    'Causes: supply-side policies, investment, technology, education'
  ],
  commonMistakes: [
    'Not shifting SRAS with LRAS',
    'Confusing with short-run AD shifts'
  ],
  examTips: [
    'LRAS shift = increase in productive potential',
    'This is sustainable, non-inflationary growth',
    'Result of supply-side improvements'
  ],
  relatedTopics: ['Economic growth', 'Supply-side policies', 'Productive capacity', 'PPF shift'],
  keywords: ['LRAS shift', 'economic growth', 'supply-side', 'productive capacity', 'potential output'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['LRAS shifts right', 'SRAS shifts right too'],
    labels: ['Both LRAS positions labelled', 'Yf1 and Yf2 shown'],
    equilibrium: ['Growth shown as Yf increase'],
    shifts: ['Rightward LRAS shift']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const adAsKeynesian: DiagramTemplate = {
  id: 'ad-as-keynesian',
  name: 'Keynesian AS Curve',
  slug: 'keynesian-as',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows Keynesian view with three sections: horizontal (spare capacity), upward sloping, and vertical (full capacity).',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad1', name: 'AD1', type: 'line', points: [{ x: 150, y: 50 }, { x: 50, y: 150 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ad2', name: 'AD2', type: 'line', points: [{ x: 200, y: 80 }, { x: 100, y: 180 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'as', name: 'AS (Keynesian)', type: 'curve', points: [{ x: 50, y: 200 }, { x: 100, y: 200 }, { x: 150, y: 180 }, { x: 200, y: 120 }, { x: 220, y: 50 }, { x: 220, y: 250 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 100, y: 200, label: 'E1', description: 'Spare capacity - no inflation' },
    { id: 'e2', x: 180, y: 140, label: 'E2', description: 'Near capacity - some inflation' }
  ],
  labels: [
    { text: 'AD1', x: 55, y: 155, anchor: 'start' },
    { text: 'AD2', x: 105, y: 185, anchor: 'start' },
    { text: 'AS', x: 225, y: 180, anchor: 'start' },
    { text: 'Horizontal\n(spare capacity)', x: 75, y: 220, anchor: 'middle', fontSize: 8 },
    { text: 'Vertical\n(full capacity)', x: 225, y: 100, anchor: 'start', fontSize: 8 }
  ],
  keyFeatures: [
    'THREE sections of Keynesian AS:',
    '1. Horizontal: spare capacity, no inflation from AD increase',
    '2. Upward sloping: approaching full capacity',
    '3. Vertical: full capacity, any AD increase is purely inflationary',
    'Justifies fiscal policy in recession'
  ],
  commonMistakes: [
    'Drawing as simple upward line',
    'Not showing the three distinct sections'
  ],
  examTips: [
    'Use to argue for fiscal policy in recession',
    'Show that AD boost in recession doesnt cause inflation'
  ],
  relatedTopics: ['Keynesian economics', 'Fiscal policy', 'Spare capacity', 'Depression economics'],
  keywords: ['keynesian', 'spare capacity', 'horizontal AS', 'fiscal policy', 'recession'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AS curve with three sections', 'Correct shape'],
    labels: ['Sections identified'],
    equilibrium: ['Different effects at different points'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const adAsClassical: DiagramTemplate = {
  id: 'ad-as-classical',
  name: 'Classical/Monetarist AS (Vertical LRAS)',
  slug: 'classical-as',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows classical view where LRAS is vertical at full employment - AD changes only affect price level in long run.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad1', name: 'AD1', type: 'line', points: [{ x: 200, y: 50 }, { x: 50, y: 200 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ad2', name: 'AD2', type: 'line', points: [{ x: 250, y: 50 }, { x: 100, y: 200 }], color: '#1d4ed8', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 150, y: 50 }, { x: 150, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e1', x: 150, y: 100, label: 'E1', description: 'Original equilibrium' },
    { id: 'e2', x: 150, y: 150, label: 'E2', description: 'New equilibrium - same Y, higher P' }
  ],
  labels: [
    { text: 'AD1', x: 55, y: 205, anchor: 'start' },
    { text: 'AD2', x: 105, y: 205, anchor: 'start' },
    { text: 'LRAS', x: 155, y: 55, anchor: 'start' },
    { text: 'PL1', x: 25, y: 105, anchor: 'end' },
    { text: 'PL2', x: 25, y: 155, anchor: 'end' },
    { text: 'Yf', x: 150, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'LRAS is VERTICAL at full employment (Yf)',
    'In long run, economy always at Yf',
    'AD increase only raises price level',
    'Output unchanged in long run',
    'Classical/Monetarist view'
  ],
  commonMistakes: [
    'Showing output change from AD shift'
  ],
  examTips: [
    'Use to argue against fiscal stimulus in long run',
    'Shows "crowding out" logic'
  ],
  relatedTopics: ['Classical economics', 'Monetarism', 'Crowding out', 'Natural rate'],
  keywords: ['classical', 'monetarist', 'vertical LRAS', 'full employment', 'crowding out'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Vertical LRAS', 'AD shifts'],
    labels: ['Yf unchanged', 'Only PL changes'],
    equilibrium: ['Both equilibria on LRAS'],
    shifts: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// OUTPUT GAPS
// ============================================================================

export const outputGapPositive: DiagramTemplate = {
  id: 'output-gap-positive',
  name: 'Positive Output Gap (Inflationary)',
  slug: 'positive-output-gap',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows actual output above potential (Y > Yf), creating inflationary pressure.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad', name: 'AD', type: 'line', points: [{ x: 275, y: 50 }, { x: 75, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sras', name: 'SRAS', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 150, y: 50 }, { x: 150, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e', x: 175, y: 137, label: 'E', description: 'Actual equilibrium beyond Yf' }
  ],
  areas: [
    { id: 'gap', name: 'Positive Output Gap', points: [{ x: 150, y: 137 }, { x: 175, y: 137 }, { x: 175, y: 280 }, { x: 150, y: 280 }], fill: '#fbbf24', opacity: 0.3 }
  ],
  labels: [
    { text: 'AD', x: 80, y: 255, anchor: 'start' },
    { text: 'SRAS', x: 255, y: 105, anchor: 'start' },
    { text: 'LRAS', x: 155, y: 55, anchor: 'start' },
    { text: 'Yf', x: 150, y: 290, anchor: 'middle' },
    { text: 'Y', x: 175, y: 290, anchor: 'middle' },
    { text: 'Positive Gap', x: 162, y: 200, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Actual output Y > Potential output Yf',
    'Economy "overheating"',
    'Upward pressure on wages and prices',
    'Unsustainable in long run',
    'SRAS will shift left as costs rise'
  ],
  commonMistakes: [
    'Confusing positive gap with growth',
    'Not showing gap distance'
  ],
  examTips: [
    'Positive gap = inflationary gap',
    'Economy above trend - unsustainable'
  ],
  relatedTopics: ['Inflation', 'Overheating', 'Business cycle peak'],
  keywords: ['positive output gap', 'inflationary gap', 'overheating', 'above potential'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AD intersects SRAS beyond LRAS'],
    labels: ['Y and Yf both marked', 'Gap identified'],
    equilibrium: ['E to right of LRAS'],
    areas: ['Gap shaded/highlighted']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const outputGapNegative: DiagramTemplate = {
  id: 'output-gap-negative',
  name: 'Negative Output Gap (Recessionary)',
  slug: 'negative-output-gap',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows actual output below potential (Y < Yf), indicating recession and spare capacity.',
  axis: { xLabel: 'Real GDP (Y)', yLabel: 'Price Level (PL)' },
  curves: [
    { id: 'ad', name: 'AD', type: 'line', points: [{ x: 200, y: 50 }, { x: 50, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sras', name: 'SRAS', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'lras', name: 'LRAS', type: 'line', points: [{ x: 175, y: 50 }, { x: 175, y: 250 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'e', x: 125, y: 163, label: 'E', description: 'Actual equilibrium below Yf' }
  ],
  areas: [
    { id: 'gap', name: 'Negative Output Gap', points: [{ x: 125, y: 163 }, { x: 175, y: 163 }, { x: 175, y: 280 }, { x: 125, y: 280 }], fill: '#ef4444', opacity: 0.3 }
  ],
  labels: [
    { text: 'AD', x: 55, y: 255, anchor: 'start' },
    { text: 'SRAS', x: 255, y: 105, anchor: 'start' },
    { text: 'LRAS', x: 180, y: 55, anchor: 'start' },
    { text: 'Y', x: 125, y: 290, anchor: 'middle' },
    { text: 'Yf', x: 175, y: 290, anchor: 'middle' },
    { text: 'Negative Gap', x: 150, y: 220, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Actual output Y < Potential output Yf',
    'Spare capacity in economy',
    'High unemployment',
    'Downward pressure on prices',
    'Room for AD expansion without inflation'
  ],
  commonMistakes: [
    'Confusing with positive gap'
  ],
  examTips: [
    'Negative gap = recessionary/deflationary gap',
    'Justifies expansionary policy'
  ],
  relatedTopics: ['Recession', 'Unemployment', 'Spare capacity', 'Fiscal stimulus'],
  keywords: ['negative output gap', 'recessionary gap', 'spare capacity', 'unemployment', 'below potential'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AD intersects SRAS left of LRAS'],
    labels: ['Y and Yf both marked'],
    equilibrium: ['E to left of LRAS'],
    areas: ['Gap shown']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// PHILLIPS CURVE
// ============================================================================

export const phillipsCurveSR: DiagramTemplate = {
  id: 'phillips-curve-sr',
  name: 'Short-Run Phillips Curve',
  slug: 'phillips-curve-sr',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows inverse relationship between inflation and unemployment in the short run.',
  axis: { xLabel: 'Unemployment Rate (%)', yLabel: 'Inflation Rate (%)' },
  curves: [
    { id: 'srpc', name: 'SRPC', type: 'curve', points: [{ x: 50, y: 50 }, { x: 100, y: 100 }, { x: 150, y: 150 }, { x: 200, y: 180 }, { x: 250, y: 200 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'a', x: 100, y: 100, label: 'A', description: 'Low unemployment, high inflation' },
    { id: 'b', x: 200, y: 180, label: 'B', description: 'High unemployment, low inflation' }
  ],
  labels: [
    { text: 'SRPC', x: 255, y: 205, anchor: 'start' },
    { text: 'Trade-off', x: 150, y: 250, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Inverse relationship: lower U ↔ higher inflation',
    'Policy trade-off in short run',
    'Moving ALONG curve = demand management',
    'Based on original Phillips (1958) finding'
  ],
  commonMistakes: [
    'Drawing upward sloping',
    'Confusing with LRPC'
  ],
  examTips: [
    'Shows short-run trade-off only',
    'Policymakers can choose point on curve'
  ],
  relatedTopics: ['Inflation-unemployment trade-off', 'Demand management', 'Stagflation'],
  keywords: ['phillips curve', 'inflation unemployment', 'trade-off', 'SRPC'],
  gradingCriteria: {
    axes: ['Inflation on Y', 'Unemployment on X'],
    curves: ['Downward sloping/convex curve'],
    labels: ['SRPC labelled'],
    equilibrium: ['Points showing trade-off'],
    shifts: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const phillipsCurveLR: DiagramTemplate = {
  id: 'phillips-curve-lr',
  name: 'Long-Run Phillips Curve (NAIRU)',
  slug: 'phillips-curve-lr',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows vertical LRPC at the natural rate of unemployment (NAIRU) - no long-run trade-off.',
  axis: { xLabel: 'Unemployment Rate (%)', yLabel: 'Inflation Rate (%)' },
  curves: [
    { id: 'lrpc', name: 'LRPC', type: 'line', points: [{ x: 150, y: 50 }, { x: 150, y: 250 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'srpc1', name: 'SRPC1', type: 'curve', points: [{ x: 50, y: 100 }, { x: 100, y: 130 }, { x: 150, y: 160 }, { x: 200, y: 180 }, { x: 250, y: 195 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'srpc2', name: 'SRPC2', type: 'curve', points: [{ x: 50, y: 50 }, { x: 100, y: 80 }, { x: 150, y: 110 }, { x: 200, y: 130 }, { x: 250, y: 145 }], color: '#93c5fd', strokeWidth: 2 }
  ],
  points: [
    { id: 'nairu', x: 150, y: 160, label: 'NAIRU', description: 'Natural rate equilibrium' }
  ],
  labels: [
    { text: 'LRPC', x: 155, y: 55, anchor: 'start' },
    { text: 'SRPC1', x: 255, y: 200, anchor: 'start' },
    { text: 'SRPC2', x: 255, y: 150, anchor: 'start' },
    { text: 'Un', x: 150, y: 290, anchor: 'middle' },
    { text: 'NAIRU', x: 160, y: 165, anchor: 'start', fontSize: 9 }
  ],
  keyFeatures: [
    'LRPC is VERTICAL at natural rate (Un)',
    'No long-run trade-off between inflation and unemployment',
    'SRPC shifts with inflation expectations',
    'Attempts to reduce U below Un cause accelerating inflation',
    'Monetarist/New Classical view'
  ],
  commonMistakes: [
    'Not showing SRPC shifts',
    'Placing NAIRU at wrong point'
  ],
  examTips: [
    'NAIRU = Non-Accelerating Inflation Rate of Unemployment',
    'Only supply-side policies can reduce Un'
  ],
  relatedTopics: ['NAIRU', 'Natural rate', 'Expectations-augmented', 'Monetarism'],
  keywords: ['LRPC', 'NAIRU', 'natural rate', 'long-run phillips', 'no trade-off'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Vertical LRPC', 'Multiple SRPCs showing shifts'],
    labels: ['Un/NAIRU marked'],
    equilibrium: ['Natural rate identified'],
    shifts: ['SRPC shift with expectations']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// CIRCULAR FLOW AND BUSINESS CYCLE
// ============================================================================

export const circularFlow: DiagramTemplate = {
  id: 'circular-flow',
  name: 'Circular Flow of Income',
  slug: 'circular-flow',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows flow of income, expenditure, and output between households, firms, government, and foreign sector.',
  axis: { xLabel: '', yLabel: '' },
  curves: [],
  points: [],
  labels: [
    { text: 'HOUSEHOLDS', x: 75, y: 75, anchor: 'middle', fontSize: 12 },
    { text: 'FIRMS', x: 225, y: 75, anchor: 'middle', fontSize: 12 },
    { text: 'INJECTIONS (J)', x: 150, y: 200, anchor: 'middle', fontSize: 10 },
    { text: 'I + G + X', x: 150, y: 220, anchor: 'middle', fontSize: 9 },
    { text: 'WITHDRAWALS (W)', x: 150, y: 250, anchor: 'middle', fontSize: 10 },
    { text: 'S + T + M', x: 150, y: 270, anchor: 'middle', fontSize: 9 },
    { text: 'Income (Y)', x: 150, y: 50, anchor: 'middle', fontSize: 9 },
    { text: 'Expenditure (E)', x: 150, y: 100, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Income = Output = Expenditure (Y = O = E)',
    'Injections: Investment (I), Government spending (G), Exports (X)',
    'Withdrawals: Savings (S), Taxes (T), Imports (M)',
    'Equilibrium when J = W',
    'If J > W, national income rises',
    'If J < W, national income falls'
  ],
  commonMistakes: [
    'Forgetting foreign sector (X and M)',
    'Confusing injections with withdrawals'
  ],
  examTips: [
    'J = I + G + X (injections)',
    'W = S + T + M (withdrawals/leakages)',
    'Multiplier works through this flow'
  ],
  relatedTopics: ['National income', 'Multiplier', 'Injections and withdrawals', 'Equilibrium'],
  keywords: ['circular flow', 'injections', 'withdrawals', 'leakages', 'national income', 'multiplier'],
  gradingCriteria: {
    axes: [],
    curves: ['Flow arrows between sectors'],
    labels: ['Households and Firms', 'J and W identified', 'Components listed'],
    equilibrium: ['J = W condition noted'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const businessCycle: DiagramTemplate = {
  id: 'business-cycle',
  name: 'Business/Economic Cycle',
  slug: 'business-cycle',
  category: 'macroeconomic',
  unit: 'unit2',
  difficulty: 'AS',
  description: 'Shows cyclical fluctuations in real GDP around the long-run trend.',
  axis: { xLabel: 'Time', yLabel: 'Real GDP' },
  curves: [
    { id: 'trend', name: 'Trend', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#16a34a', strokeWidth: 2 },
    { id: 'cycle', name: 'Actual GDP', type: 'curve', points: [{ x: 50, y: 200 }, { x: 90, y: 150 }, { x: 130, y: 120 }, { x: 170, y: 150 }, { x: 210, y: 130 }, { x: 250, y: 100 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'peak', x: 130, y: 120, label: 'Peak', description: 'Boom - maximum output' },
    { id: 'trough', x: 170, y: 150, label: 'Trough', description: 'Recession - minimum output' }
  ],
  labels: [
    { text: 'Trend Growth', x: 255, y: 105, anchor: 'start' },
    { text: 'Actual GDP', x: 255, y: 85, anchor: 'start' },
    { text: 'Boom', x: 130, y: 105, anchor: 'middle', fontSize: 9 },
    { text: 'Recession', x: 170, y: 165, anchor: 'middle', fontSize: 9 },
    { text: 'Recovery', x: 200, y: 140, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Four phases: Boom, Slowdown, Recession, Recovery',
    'Peak = maximum output (positive output gap)',
    'Trough = minimum output (negative output gap)',
    'Trend line shows long-run growth path',
    'Actual GDP fluctuates around trend'
  ],
  commonMistakes: [
    'Not showing trend line',
    'Mislabelling phases'
  ],
  examTips: [
    'Link phases to policy responses',
    'Connect to AD/AS and output gaps'
  ],
  relatedTopics: ['Boom and bust', 'Recession', 'Output gap', 'Counter-cyclical policy'],
  keywords: ['business cycle', 'economic cycle', 'boom', 'recession', 'recovery', 'trough', 'peak'],
  gradingCriteria: {
    axes: ['Time on X', 'Real GDP on Y'],
    curves: ['Trend line', 'Cyclical actual GDP'],
    labels: ['Phases labelled', 'Peak and trough marked'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// EXPORT ALL UNIT 2 DIAGRAMS
// ============================================================================

export const UNIT2_DIAGRAMS: DiagramTemplate[] = [
  // AD/AS Model
  adAsBasic,
  adShiftRight,
  adShiftLeft,
  srasShiftLeft,
  lrasShift,
  adAsKeynesian,
  adAsClassical,

  // Output Gaps
  outputGapPositive,
  outputGapNegative,

  // Phillips Curve
  phillipsCurveSR,
  phillipsCurveLR,

  // Circular Flow and Business Cycle
  circularFlow,
  businessCycle
];

export default UNIT2_DIAGRAMS;
