// Unit 3: Business Behaviour and the Labour Market (A2 Level)
// Edexcel IAL Economics - Comprehensive Diagram Database

import { DiagramTemplate } from './types';

// ============================================================================
// PERFECT COMPETITION
// ============================================================================

export const perfectCompetitionSR: DiagramTemplate = {
  id: 'perfect-competition-sr',
  name: 'Perfect Competition - Short Run',
  slug: 'perfect-competition-sr',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows profit maximisation (MC=MR) in perfect competition short run, firm can make supernormal profit.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 75, y: 150 }, { x: 100, y: 100 }, { x: 150, y: 100 }, { x: 200, y: 150 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 150 }, { x: 150, y: 130 }, { x: 200, y: 150 }, { x: 250, y: 200 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar-mr', name: 'AR = MR = D', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 100 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'profit-max', x: 150, y: 100, label: 'Q*', description: 'Profit maximising output where MC=MR' }
  ],
  areas: [
    { id: 'supernormal', name: 'Supernormal Profit', points: [{ x: 150, y: 100 }, { x: 150, y: 130 }, { x: 50, y: 130 }, { x: 50, y: 100 }], fill: '#22c55e', opacity: 0.3, description: 'Area of supernormal profit' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 255, anchor: 'start' },
    { text: 'ATC', x: 255, y: 205, anchor: 'start' },
    { text: 'AR = MR = D = P', x: 255, y: 105, anchor: 'start' },
    { text: 'P*', x: 25, y: 105, anchor: 'end' },
    { text: 'ATC', x: 25, y: 135, anchor: 'end' },
    { text: 'Q*', x: 150, y: 285, anchor: 'middle' },
    { text: 'Supernormal Profit', x: 100, y: 115, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Firm is PRICE TAKER (horizontal D = AR = MR)',
    'Profit max where MC = MR',
    'P > ATC = supernormal profit possible in SR',
    'Many firms, homogeneous products, perfect information',
    'No barriers to entry/exit'
  ],
  commonMistakes: [
    'Drawing downward sloping demand',
    'Forgetting MC cuts ATC at minimum',
    'Not showing profit area correctly'
  ],
  examTips: [
    'AR = MR because firm is price taker',
    'Supernormal profit attracts entry in LR',
    'MC must cut ATC at its minimum point'
  ],
  relatedTopics: ['Profit maximisation', 'Price taker', 'Allocative efficiency', 'Productive efficiency'],
  keywords: ['perfect competition', 'price taker', 'MC=MR', 'supernormal profit', 'homogeneous'],
  gradingCriteria: {
    axes: ['Cost/Revenue on Y', 'Quantity on X'],
    curves: ['U-shaped MC and ATC', 'Horizontal AR=MR=D', 'MC cuts ATC at minimum'],
    labels: ['All curves labelled', 'P* and Q* marked'],
    equilibrium: ['MC=MR intersection'],
    areas: ['Profit area if P > ATC']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const perfectCompetitionLR: DiagramTemplate = {
  id: 'perfect-competition-lr',
  name: 'Perfect Competition - Long Run',
  slug: 'perfect-competition-lr',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows long-run equilibrium where firm earns only normal profit (P = ATC at minimum).',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 150 }, { x: 150, y: 125 }, { x: 200, y: 150 }, { x: 250, y: 250 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 160 }, { x: 150, y: 125 }, { x: 200, y: 160 }, { x: 250, y: 220 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar-mr', name: 'AR = MR = D', type: 'line', points: [{ x: 50, y: 125 }, { x: 250, y: 125 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'equilibrium', x: 150, y: 125, label: 'E', description: 'LR equilibrium: MC=MR=ATC' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 255, anchor: 'start' },
    { text: 'ATC', x: 255, y: 225, anchor: 'start' },
    { text: 'AR = MR = D', x: 255, y: 130, anchor: 'start' },
    { text: 'P = ATC', x: 25, y: 130, anchor: 'end' },
    { text: 'Q*', x: 150, y: 285, anchor: 'middle' },
    { text: 'Normal Profit Only', x: 150, y: 100, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Long-run: P = ATC (normal profit only)',
    'Firm produces at minimum ATC (productive efficiency)',
    'P = MC (allocative efficiency)',
    'Entry/exit has eliminated supernormal profit',
    'Both allocative AND productive efficiency achieved'
  ],
  commonMistakes: [
    'Showing supernormal profit in LR',
    'AR not tangent to ATC at minimum'
  ],
  examTips: [
    'LR equilibrium: MC = MR = AR = ATC (all at same point)',
    'This is the benchmark for efficiency',
    'Only market structure achieving both efficiencies'
  ],
  relatedTopics: ['Normal profit', 'Allocative efficiency', 'Productive efficiency', 'Free entry/exit'],
  keywords: ['perfect competition long run', 'normal profit', 'allocative efficiency', 'productive efficiency'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MC, ATC, AR=MR all intersect at one point'],
    labels: ['P = ATC at minimum'],
    equilibrium: ['Triple intersection at minimum ATC'],
    areas: ['No supernormal profit area']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// MONOPOLY
// ============================================================================

export const monopolyEquilibrium: DiagramTemplate = {
  id: 'monopoly-equilibrium',
  name: 'Monopoly - Profit Maximisation',
  slug: 'monopoly',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows monopoly profit maximisation at MC=MR, with price set on AR curve above MR.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 150 }, { x: 150, y: 125 }, { x: 200, y: 150 }, { x: 250, y: 220 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 230 }, { x: 100, y: 160 }, { x: 150, y: 140 }, { x: 200, y: 150 }, { x: 250, y: 180 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr', name: 'MR', type: 'line', points: [{ x: 50, y: 50 }, { x: 175, y: 250 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'mc-mr', x: 120, y: 150, label: 'MC=MR', description: 'Profit maximising output' },
    { id: 'price', x: 120, y: 90, label: 'Pm', description: 'Monopoly price on AR curve' }
  ],
  areas: [
    { id: 'supernormal', name: 'Supernormal Profit', points: [{ x: 50, y: 90 }, { x: 120, y: 90 }, { x: 120, y: 145 }, { x: 50, y: 145 }], fill: '#22c55e', opacity: 0.3, description: 'Area of supernormal profit' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 225, anchor: 'start' },
    { text: 'ATC', x: 255, y: 185, anchor: 'start' },
    { text: 'AR (D)', x: 255, y: 255, anchor: 'start' },
    { text: 'MR', x: 180, y: 255, anchor: 'start' },
    { text: 'Pm', x: 25, y: 95, anchor: 'end' },
    { text: 'ATC', x: 25, y: 150, anchor: 'end' },
    { text: 'Qm', x: 120, y: 285, anchor: 'middle' },
    { text: 'Supernormal Profit', x: 85, y: 118, anchor: 'middle', fontSize: 8 }
  ],
  keyFeatures: [
    'Monopolist is PRICE MAKER',
    'AR (demand) curve is downward sloping',
    'MR curve below AR (twice as steep)',
    'Profit max at MC = MR',
    'Price set on AR curve ABOVE MR',
    'Supernormal profit sustainable in LR (barriers to entry)'
  ],
  commonMistakes: [
    'Setting price at MC=MR intersection (should be on AR)',
    'Drawing MR above AR',
    'Forgetting MR is twice as steep as AR'
  ],
  examTips: [
    'Find Q where MC=MR, then go UP to AR for price',
    'Supernormal profit = (P - ATC) × Q',
    'Monopoly is allocatively inefficient (P > MC)'
  ],
  relatedTopics: ['Market power', 'Price maker', 'Barriers to entry', 'Deadweight loss'],
  keywords: ['monopoly', 'price maker', 'supernormal profit', 'MC=MR', 'barriers to entry'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Downward AR', 'MR below AR and steeper', 'U-shaped MC and ATC'],
    labels: ['All curves labelled', 'Pm and Qm marked'],
    equilibrium: ['MC=MR for quantity', 'Price read from AR curve'],
    areas: ['Supernormal profit rectangle']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const monopolyWelfareLoss: DiagramTemplate = {
  id: 'monopoly-welfare-loss',
  name: 'Monopoly - Deadweight Loss',
  slug: 'monopoly-dwl',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows welfare loss from monopoly compared to competitive equilibrium.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Cost' },
  curves: [
    { id: 'mc', name: 'MC = S', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr', name: 'MR', type: 'line', points: [{ x: 50, y: 50 }, { x: 175, y: 250 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'monopoly', x: 100, y: 100, label: 'M', description: 'Monopoly equilibrium' },
    { id: 'competitive', x: 160, y: 130, label: 'C', description: 'Competitive equilibrium' }
  ],
  areas: [
    { id: 'dwl', name: 'Deadweight Loss', points: [{ x: 100, y: 100 }, { x: 160, y: 130 }, { x: 100, y: 165 }], fill: '#fbbf24', opacity: 0.5, description: 'Triangle of welfare loss' }
  ],
  labels: [
    { text: 'MC = S', x: 255, y: 105, anchor: 'start' },
    { text: 'AR (D)', x: 255, y: 255, anchor: 'start' },
    { text: 'MR', x: 180, y: 255, anchor: 'start' },
    { text: 'Pm', x: 25, y: 105, anchor: 'end' },
    { text: 'Pc', x: 25, y: 135, anchor: 'end' },
    { text: 'Qm', x: 100, y: 285, anchor: 'middle' },
    { text: 'Qc', x: 160, y: 285, anchor: 'middle' },
    { text: 'DWL', x: 120, y: 130, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Monopoly produces LESS (Qm < Qc)',
    'Monopoly charges MORE (Pm > Pc)',
    'Deadweight loss triangle = lost consumer + producer surplus',
    'Allocative inefficiency: P > MC',
    'Welfare loss to society'
  ],
  commonMistakes: [
    'Wrong triangle shape',
    'Not showing competitive outcome'
  ],
  examTips: [
    'Compare Qm/Pm with Qc/Pc',
    'DWL = area of lost trades'
  ],
  relatedTopics: ['Allocative inefficiency', 'Consumer welfare', 'Competition policy'],
  keywords: ['monopoly deadweight loss', 'welfare loss', 'allocative inefficiency', 'P > MC'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MC as supply', 'AR demand', 'MR'],
    labels: ['Both equilibria shown'],
    equilibrium: ['Monopoly and competitive'],
    areas: ['DWL triangle correct']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const naturalMonopoly: DiagramTemplate = {
  id: 'natural-monopoly',
  name: 'Natural Monopoly',
  slug: 'natural-monopoly',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows declining LRAC where one firm can supply whole market more efficiently than multiple firms.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'lrac', name: 'LRAC', type: 'curve', points: [{ x: 50, y: 50 }, { x: 100, y: 100 }, { x: 150, y: 140 }, { x: 200, y: 170 }, { x: 250, y: 190 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr', name: 'MR', type: 'line', points: [{ x: 50, y: 100 }, { x: 175, y: 250 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [],
  labels: [
    { text: 'LRAC', x: 255, y: 195, anchor: 'start' },
    { text: 'AR (D)', x: 255, y: 255, anchor: 'start' },
    { text: 'MR', x: 180, y: 255, anchor: 'start' },
    { text: 'Economies of scale', x: 150, y: 120, anchor: 'middle', fontSize: 9 },
    { text: 'throughout range', x: 150, y: 135, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'LRAC continuously falling (economies of scale)',
    'One firm more efficient than many',
    'High fixed costs, low marginal costs',
    'Examples: utilities (water, electricity, gas), railways',
    'Often regulated or nationalised'
  ],
  commonMistakes: [
    'Drawing U-shaped LRAC',
    'Not showing economies of scale throughout'
  ],
  examTips: [
    'LRAC never reaches minimum in relevant range',
    'Justifies monopoly on efficiency grounds',
    'But still need regulation to prevent abuse'
  ],
  relatedTopics: ['Economies of scale', 'Regulation', 'Privatisation', 'Utilities'],
  keywords: ['natural monopoly', 'economies of scale', 'declining LRAC', 'utilities', 'regulation'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Continuously declining LRAC', 'Demand curve'],
    labels: ['LRAC shown falling'],
    equilibrium: [],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const priceDiscrimination: DiagramTemplate = {
  id: 'monopoly-price-discrimination',
  name: 'Third Degree Price Discrimination',
  slug: 'price-discrimination',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows monopolist charging different prices in different markets based on elasticity.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Cost' },
  curves: [
    { id: 'mc', name: 'MC', type: 'line', points: [{ x: 50, y: 150 }, { x: 250, y: 150 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'd1', name: 'D1 (inelastic)', type: 'line', points: [{ x: 50, y: 50 }, { x: 120, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'd2', name: 'D2 (elastic)', type: 'line', points: [{ x: 140, y: 100 }, { x: 250, y: 200 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'p1', x: 85, y: 100, label: 'P1', description: 'Higher price in inelastic market' },
    { id: 'p2', x: 195, y: 150, label: 'P2', description: 'Lower price in elastic market' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 155, anchor: 'start' },
    { text: 'Market 1 (inelastic)', x: 85, y: 30, anchor: 'middle', fontSize: 9 },
    { text: 'Market 2 (elastic)', x: 195, y: 80, anchor: 'middle', fontSize: 9 },
    { text: 'P1 > P2', x: 150, y: 220, anchor: 'middle', fontSize: 10 }
  ],
  keyFeatures: [
    'Different prices in different markets',
    'Higher price where demand MORE inelastic',
    'Lower price where demand MORE elastic',
    'Conditions: market power, separable markets, different elasticities',
    'Examples: peak/off-peak, student discounts, airlines'
  ],
  commonMistakes: [
    'Higher price in elastic market (should be inelastic)',
    'Not showing MR in each market'
  ],
  examTips: [
    'Charge more where PED is lower (inelastic)',
    'Consumer surplus transferred to producer',
    'Can increase total output (efficiency argument)'
  ],
  relatedTopics: ['Price elasticity', 'Consumer surplus', 'Market segmentation'],
  keywords: ['price discrimination', 'third degree', 'market segmentation', 'elasticity'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Two demand curves with different elasticities', 'MC'],
    labels: ['Markets identified', 'P1 > P2 shown'],
    equilibrium: ['Different prices in each market'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// MONOPOLISTIC COMPETITION
// ============================================================================

export const monopolisticCompetitionSR: DiagramTemplate = {
  id: 'monopolistic-competition-sr',
  name: 'Monopolistic Competition - Short Run',
  slug: 'monopolistic-sr',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows short-run equilibrium with supernormal profit possible due to product differentiation.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 150 }, { x: 150, y: 130 }, { x: 200, y: 160 }, { x: 250, y: 230 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 230 }, { x: 100, y: 160 }, { x: 150, y: 145 }, { x: 200, y: 160 }, { x: 250, y: 195 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 80 }, { x: 250, y: 220 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr', name: 'MR', type: 'line', points: [{ x: 50, y: 80 }, { x: 175, y: 250 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'profit-max', x: 120, y: 140, label: 'MC=MR', description: 'Profit maximising output' }
  ],
  areas: [
    { id: 'profit', name: 'Supernormal Profit', points: [{ x: 50, y: 110 }, { x: 120, y: 110 }, { x: 120, y: 150 }, { x: 50, y: 150 }], fill: '#22c55e', opacity: 0.3 }
  ],
  labels: [
    { text: 'MC', x: 255, y: 235, anchor: 'start' },
    { text: 'ATC', x: 255, y: 200, anchor: 'start' },
    { text: 'AR (D)', x: 255, y: 225, anchor: 'start' },
    { text: 'MR', x: 180, y: 255, anchor: 'start' }
  ],
  keyFeatures: [
    'Like monopoly diagram but flatter demand',
    'Product differentiation gives some market power',
    'Can earn supernormal profit in SR',
    'Low barriers to entry',
    'Many firms, differentiated products'
  ],
  commonMistakes: [
    'Drawing demand too steep (like monopoly)',
    'Forgetting this is temporary'
  ],
  examTips: [
    'Demand more elastic than monopoly',
    'Supernormal profit attracts entry in LR'
  ],
  relatedTopics: ['Product differentiation', 'Branding', 'Non-price competition'],
  keywords: ['monopolistic competition', 'product differentiation', 'short run', 'supernormal profit'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Relatively elastic demand', 'MR below AR', 'MC and ATC'],
    labels: ['All curves labelled'],
    equilibrium: ['MC=MR'],
    areas: ['Supernormal profit if applicable']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const monopolisticCompetitionLR: DiagramTemplate = {
  id: 'monopolistic-competition-lr',
  name: 'Monopolistic Competition - Long Run',
  slug: 'monopolistic-lr',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows long-run equilibrium where entry has competed away supernormal profit - AR tangent to ATC.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 250 }, { x: 100, y: 160 }, { x: 150, y: 140 }, { x: 200, y: 160 }, { x: 250, y: 220 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 230 }, { x: 100, y: 170 }, { x: 150, y: 150 }, { x: 200, y: 160 }, { x: 250, y: 190 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 100 }, { x: 250, y: 200 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr', name: 'MR', type: 'line', points: [{ x: 50, y: 100 }, { x: 175, y: 250 }], color: '#3b82f6', strokeWidth: 2 }
  ],
  points: [
    { id: 'equilibrium', x: 130, y: 155, label: 'E', description: 'LR equilibrium: AR tangent to ATC' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 225, anchor: 'start' },
    { text: 'ATC', x: 255, y: 195, anchor: 'start' },
    { text: 'AR (D)', x: 255, y: 205, anchor: 'start' },
    { text: 'MR', x: 180, y: 255, anchor: 'start' },
    { text: 'Normal profit only', x: 150, y: 120, anchor: 'middle', fontSize: 9 },
    { text: 'Excess capacity', x: 150, y: 250, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'AR tangent to ATC (normal profit only)',
    'Entry has competed away supernormal profit',
    'Excess capacity: Q < minimum efficient scale',
    'NOT productively efficient (not at min ATC)',
    'NOT allocatively efficient (P > MC)'
  ],
  commonMistakes: [
    'AR cutting through ATC (should be tangent)',
    'Showing productive efficiency'
  ],
  examTips: [
    'Tangency condition is key',
    'Excess capacity = price of variety/choice',
    'Neither efficiency achieved'
  ],
  relatedTopics: ['Normal profit', 'Excess capacity', 'Inefficiency', 'Product variety'],
  keywords: ['monopolistic competition long run', 'normal profit', 'excess capacity', 'tangency'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['AR tangent to ATC', 'Not at minimum ATC'],
    labels: ['Tangency point', 'Excess capacity'],
    equilibrium: ['AR just touches ATC'],
    areas: ['No supernormal profit']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// OLIGOPOLY
// ============================================================================

export const kinkedDemand: DiagramTemplate = {
  id: 'kinked-demand',
  name: 'Kinked Demand Curve (Oligopoly)',
  slug: 'kinked-demand',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows price rigidity in oligopoly - rivals match price cuts but not price rises.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Price/Cost' },
  curves: [
    { id: 'ar-upper', name: 'AR (elastic)', type: 'line', points: [{ x: 50, y: 50 }, { x: 150, y: 130 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'ar-lower', name: 'AR (inelastic)', type: 'line', points: [{ x: 150, y: 130 }, { x: 250, y: 180 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'mr-upper', name: 'MR1', type: 'line', points: [{ x: 50, y: 50 }, { x: 150, y: 200 }], color: '#3b82f6', strokeWidth: 2 },
    { id: 'mr-lower', name: 'MR2', type: 'line', points: [{ x: 150, y: 240 }, { x: 200, y: 260 }], color: '#3b82f6', strokeWidth: 2 },
    { id: 'mc1', name: 'MC1', type: 'line', points: [{ x: 100, y: 250 }, { x: 175, y: 180 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mc2', name: 'MC2', type: 'line', points: [{ x: 100, y: 280 }, { x: 175, y: 210 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'kink', x: 150, y: 130, label: 'Kink', description: 'Current price point - kinked demand' }
  ],
  labels: [
    { text: 'AR (D)', x: 255, y: 185, anchor: 'start' },
    { text: 'MR', x: 155, y: 175, anchor: 'start' },
    { text: 'MC range', x: 180, y: 200, anchor: 'start', fontSize: 9 },
    { text: 'P*', x: 25, y: 135, anchor: 'end' },
    { text: 'Q*', x: 150, y: 285, anchor: 'middle' },
    { text: 'Discontinuous MR', x: 155, y: 230, anchor: 'start', fontSize: 8 }
  ],
  keyFeatures: [
    'KINK at current price',
    'Demand elastic ABOVE kink (rivals dont match price rise)',
    'Demand inelastic BELOW kink (rivals match price cut)',
    'Discontinuous MR creates price rigidity',
    'MC can shift within gap without price change'
  ],
  commonMistakes: [
    'Not showing discontinuity in MR',
    'Wrong elasticity sections'
  ],
  examTips: [
    'Explains price rigidity but not how price was set',
    'MC changes in discontinuity dont affect price',
    'Interdependence is key'
  ],
  relatedTopics: ['Oligopoly', 'Price rigidity', 'Interdependence', 'Game theory'],
  keywords: ['kinked demand', 'oligopoly', 'price rigidity', 'interdependence', 'discontinuous MR'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Kinked AR curve', 'Discontinuous MR', 'MC within gap'],
    labels: ['Kink point', 'Elastic/inelastic sections'],
    equilibrium: ['Price at kink'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const contestableMarkets: DiagramTemplate = {
  id: 'contestable-markets',
  name: 'Contestable Markets',
  slug: 'contestable',
  category: 'market_structures',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows how threat of entry disciplines incumbent to normal profit even with few firms.',
  axis: { xLabel: 'Quantity (Q)', yLabel: 'Cost/Revenue' },
  curves: [
    { id: 'mc', name: 'MC', type: 'curve', points: [{ x: 50, y: 200 }, { x: 100, y: 140 }, { x: 150, y: 120 }, { x: 200, y: 140 }, { x: 250, y: 200 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'atc', name: 'ATC', type: 'curve', points: [{ x: 50, y: 220 }, { x: 100, y: 150 }, { x: 150, y: 120 }, { x: 200, y: 140 }, { x: 250, y: 180 }], color: '#f97316', strokeWidth: 2 },
    { id: 'ar', name: 'AR (D)', type: 'line', points: [{ x: 50, y: 120 }, { x: 250, y: 120 }], color: '#2563eb', strokeWidth: 2 }
  ],
  points: [
    { id: 'eq', x: 150, y: 120, label: 'E', description: 'Competitive outcome despite few firms' }
  ],
  labels: [
    { text: 'MC', x: 255, y: 205, anchor: 'start' },
    { text: 'ATC', x: 255, y: 185, anchor: 'start' },
    { text: 'AR = MR', x: 255, y: 125, anchor: 'start' },
    { text: 'Normal profit', x: 150, y: 100, anchor: 'middle', fontSize: 9 },
    { text: 'Threat of entry', x: 150, y: 250, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Low/no barriers to entry and exit',
    'Low sunk costs',
    '"Hit and run" entry possible',
    'Threat of entry disciplines pricing',
    'Can achieve competitive outcome with few firms'
  ],
  commonMistakes: [
    'Showing supernormal profit (threat removes it)',
    'Not explaining the threat mechanism'
  ],
  examTips: [
    'Number of firms less important than contestability',
    'Sunk costs are key barrier',
    'Airlines often cited as example'
  ],
  relatedTopics: ['Barriers to entry', 'Sunk costs', 'Market structure', 'Efficiency'],
  keywords: ['contestable', 'hit and run', 'low barriers', 'sunk costs', 'threat of entry'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['Similar to perfect competition'],
    labels: ['Normal profit outcome'],
    equilibrium: ['Competitive result'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// LABOUR MARKET
// ============================================================================

export const labourMarketBasic: DiagramTemplate = {
  id: 'labour-market-basic',
  name: 'Labour Market - Wage Determination',
  slug: 'labour-market',
  category: 'labour_market',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows equilibrium wage and employment determined by supply and demand for labour.',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage Rate (W)' },
  curves: [
    { id: 'dl', name: 'DL (MRP)', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sl', name: 'SL', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'equilibrium', x: 150, y: 150, label: 'E', description: 'Labour market equilibrium' }
  ],
  labels: [
    { text: 'DL = MRP', x: 255, y: 255, anchor: 'start' },
    { text: 'SL', x: 255, y: 55, anchor: 'start' },
    { text: 'We', x: 25, y: 155, anchor: 'end' },
    { text: 'Le', x: 150, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Demand for labour is DERIVED demand',
    'DL = MRP (Marginal Revenue Product)',
    'SL upward sloping (higher wage attracts more workers)',
    'Equilibrium wage We and employment Le',
    'Wage = MRP in competitive market'
  ],
  commonMistakes: [
    'Drawing DL upward sloping',
    'Forgetting DL = MRP'
  ],
  examTips: [
    'Labour demand derived from product demand',
    'MRP = MPP × MR',
    'Wage differentials explained by MRP differences'
  ],
  relatedTopics: ['Derived demand', 'MRP theory', 'Wage determination', 'Employment'],
  keywords: ['labour market', 'wage', 'employment', 'MRP', 'derived demand'],
  gradingCriteria: {
    axes: ['Wage (W) on Y', 'Labour (L) on X'],
    curves: ['Downward DL', 'Upward SL'],
    labels: ['DL = MRP noted', 'We and Le marked'],
    equilibrium: ['Intersection point E'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const labourMRP: DiagramTemplate = {
  id: 'labour-mrp',
  name: 'MRP Theory of Wages',
  slug: 'mrp-theory',
  category: 'labour_market',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows firm hiring labour up to point where MRP = MCL (wage).',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage/MRP' },
  curves: [
    { id: 'mrp', name: 'MRP = DL', type: 'curve', points: [{ x: 50, y: 50 }, { x: 100, y: 100 }, { x: 150, y: 150 }, { x: 200, y: 200 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'wage', name: 'W = MCL = ACL', type: 'line', points: [{ x: 50, y: 150 }, { x: 250, y: 150 }], color: '#dc2626', strokeWidth: 2 }
  ],
  points: [
    { id: 'hire', x: 150, y: 150, label: 'L*', description: 'Profit maximising employment' }
  ],
  labels: [
    { text: 'MRP = DL', x: 255, y: 255, anchor: 'start' },
    { text: 'W = MCL = ACL', x: 255, y: 155, anchor: 'start' },
    { text: 'W*', x: 25, y: 155, anchor: 'end' },
    { text: 'L*', x: 150, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'MRP curve is demand for labour',
    'Firm hires where MRP = MCL (wage)',
    'In competitive labour market, W = MCL = ACL',
    'Hiring beyond L* would mean MRP < W (loss)',
    'MRP = MPP × MR'
  ],
  commonMistakes: [
    'Drawing MRP upward sloping',
    'Not showing horizontal wage line'
  ],
  examTips: [
    'Similar logic to MC = MR for output',
    'Profit max: hire until MRP = wage',
    'Diminishing returns causes MRP to fall'
  ],
  relatedTopics: ['Marginal productivity', 'Profit maximisation', 'Wage determination'],
  keywords: ['MRP', 'marginal revenue product', 'MCL', 'wage determination', 'hiring decision'],
  gradingCriteria: {
    axes: ['Wage/MRP on Y', 'Labour on X'],
    curves: ['Downward MRP', 'Horizontal wage line'],
    labels: ['MRP = DL', 'W = MCL'],
    equilibrium: ['Intersection at L*'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const monopsony: DiagramTemplate = {
  id: 'monopsony',
  name: 'Monopsony in Labour Market',
  slug: 'monopsony',
  category: 'labour_market',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows single buyer of labour paying wage below MRP, creating deadweight loss.',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage/Cost' },
  curves: [
    { id: 'mrp', name: 'MRP = DL', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sl', name: 'SL = ACL', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mcl', name: 'MCL', type: 'line', points: [{ x: 50, y: 150 }, { x: 200, y: 50 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'monopsony-eq', x: 120, y: 120, label: 'A', description: 'MRP = MCL intersection' },
    { id: 'wage-point', x: 120, y: 160, label: 'B', description: 'Wage on SL curve' },
    { id: 'competitive', x: 160, y: 140, label: 'C', description: 'Competitive equilibrium' }
  ],
  labels: [
    { text: 'MRP = DL', x: 255, y: 255, anchor: 'start' },
    { text: 'SL = ACL', x: 255, y: 105, anchor: 'start' },
    { text: 'MCL', x: 205, y: 55, anchor: 'start' },
    { text: 'Wm', x: 25, y: 165, anchor: 'end' },
    { text: 'Wc', x: 25, y: 145, anchor: 'end' },
    { text: 'Lm', x: 120, y: 285, anchor: 'middle' },
    { text: 'Lc', x: 160, y: 285, anchor: 'middle' }
  ],
  keyFeatures: [
    'Single buyer of labour (monopsonist)',
    'MCL above SL (must raise wage for all workers)',
    'Hires where MRP = MCL (point A)',
    'Pays wage on SL curve (point B) - BELOW MRP',
    'Employment lower than competitive (Lm < Lc)',
    'Wage lower than competitive (Wm < Wc)'
  ],
  commonMistakes: [
    'Drawing MCL below SL',
    'Setting wage at MRP=MCL (should be on SL)'
  ],
  examTips: [
    'MCL is steeper than SL (ACL)',
    'Wage set on supply curve, not at intersection',
    'Examples: NHS, Amazon in warehouse towns'
  ],
  relatedTopics: ['Market power', 'Exploitation', 'Minimum wage effects'],
  keywords: ['monopsony', 'single buyer', 'MCL', 'ACL', 'wage below MRP', 'exploitation'],
  gradingCriteria: {
    axes: ['Wage/Cost on Y', 'Labour on X'],
    curves: ['MRP', 'SL = ACL', 'MCL above SL'],
    labels: ['All curves labelled', 'Wm < Wc shown', 'Lm < Lc shown'],
    equilibrium: ['MRP = MCL for quantity', 'Wage from SL curve'],
    areas: ['Exploitation gap optional']
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const tradeUnion: DiagramTemplate = {
  id: 'trade-union',
  name: 'Trade Union Effect on Wages',
  slug: 'trade-union',
  category: 'labour_market',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows union setting wage above market equilibrium, creating unemployment.',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage Rate (W)' },
  curves: [
    { id: 'dl', name: 'DL', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sl', name: 'SL', type: 'line', points: [{ x: 50, y: 250 }, { x: 250, y: 50 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'union-wage', name: 'Wu', type: 'dashed', points: [{ x: 50, y: 120 }, { x: 250, y: 120 }], color: '#16a34a', strokeWidth: 2 }
  ],
  points: [
    { id: 'market-eq', x: 150, y: 150, label: 'E', description: 'Free market equilibrium' },
    { id: 'ld', x: 110, y: 120, label: 'Ld', description: 'Labour demanded at Wu' },
    { id: 'ls', x: 190, y: 120, label: 'Ls', description: 'Labour supplied at Wu' }
  ],
  labels: [
    { text: 'DL', x: 255, y: 255, anchor: 'start' },
    { text: 'SL', x: 255, y: 55, anchor: 'start' },
    { text: 'Wu', x: 25, y: 125, anchor: 'end' },
    { text: 'We', x: 25, y: 155, anchor: 'end' },
    { text: 'Unemployment', x: 150, y: 100, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Union sets wage ABOVE equilibrium (Wu > We)',
    'Creates unemployment (Ls > Ld)',
    'Higher wage for employed members',
    'Trade-off: wage vs employment',
    'Collective bargaining power'
  ],
  commonMistakes: [
    'Setting Wu below We',
    'Not showing unemployment gap'
  ],
  examTips: [
    'Similar to minimum wage diagram',
    'Union wage floor creates excess supply',
    'Insiders (employed) benefit, outsiders (unemployed) lose'
  ],
  relatedTopics: ['Collective bargaining', 'Unemployment', 'Minimum wage', 'Wage rigidity'],
  keywords: ['trade union', 'collective bargaining', 'wage', 'unemployment', 'union power'],
  gradingCriteria: {
    axes: ['Wage on Y', 'Labour on X'],
    curves: ['DL', 'SL', 'Horizontal Wu line'],
    labels: ['Wu > We', 'Ld and Ls marked'],
    equilibrium: ['Market E', 'Unemployment gap'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

export const bilateralMonopoly: DiagramTemplate = {
  id: 'bilateral-monopoly',
  name: 'Bilateral Monopoly',
  slug: 'bilateral-monopoly',
  category: 'labour_market',
  unit: 'unit3',
  difficulty: 'A2',
  description: 'Shows monopsony employer facing monopoly union - wage outcome indeterminate.',
  axis: { xLabel: 'Quantity of Labour (L)', yLabel: 'Wage/Cost' },
  curves: [
    { id: 'mrp', name: 'MRP', type: 'line', points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], color: '#2563eb', strokeWidth: 2 },
    { id: 'sl', name: 'SL = ACL', type: 'line', points: [{ x: 50, y: 200 }, { x: 250, y: 100 }], color: '#dc2626', strokeWidth: 2 },
    { id: 'mcl', name: 'MCL', type: 'line', points: [{ x: 50, y: 150 }, { x: 200, y: 50 }], color: '#ef4444', strokeWidth: 2 }
  ],
  points: [
    { id: 'monopsony', x: 120, y: 160, label: 'Wm', description: 'Monopsony wage' },
    { id: 'union', x: 120, y: 120, label: 'Wu', description: 'Union target wage' }
  ],
  labels: [
    { text: 'MRP', x: 255, y: 255, anchor: 'start' },
    { text: 'SL = ACL', x: 255, y: 105, anchor: 'start' },
    { text: 'MCL', x: 205, y: 55, anchor: 'start' },
    { text: 'Wm', x: 25, y: 165, anchor: 'end' },
    { text: 'Wu', x: 25, y: 125, anchor: 'end' },
    { text: 'Bargaining range', x: 150, y: 145, anchor: 'middle', fontSize: 9 }
  ],
  keyFeatures: [
    'Monopsony (single buyer) vs Monopoly union (single seller)',
    'Monopsonist wants low wage (Wm)',
    'Union wants high wage (Wu)',
    'Outcome in bargaining range - indeterminate',
    'Depends on bargaining power'
  ],
  commonMistakes: [
    'Showing definite outcome',
    'Not identifying both sides power'
  ],
  examTips: [
    'Outcome depends on relative bargaining strength',
    'Union can counter monopsony exploitation',
    'Could result in higher employment than pure monopsony'
  ],
  relatedTopics: ['Monopsony', 'Trade union', 'Bargaining', 'Countervailing power'],
  keywords: ['bilateral monopoly', 'monopsony', 'union', 'bargaining', 'countervailing power'],
  gradingCriteria: {
    axes: ['Correctly labelled'],
    curves: ['MRP', 'SL', 'MCL'],
    labels: ['Wm and Wu identified', 'Bargaining range shown'],
    equilibrium: ['Range rather than point'],
    areas: []
  },
  width: 300,
  height: 300,
  viewBox: '0 0 300 300'
};

// ============================================================================
// EXPORT ALL UNIT 3 DIAGRAMS
// ============================================================================

export const UNIT3_DIAGRAMS: DiagramTemplate[] = [
  // Perfect Competition
  perfectCompetitionSR,
  perfectCompetitionLR,

  // Monopoly
  monopolyEquilibrium,
  monopolyWelfareLoss,
  naturalMonopoly,
  priceDiscrimination,

  // Monopolistic Competition
  monopolisticCompetitionSR,
  monopolisticCompetitionLR,

  // Oligopoly
  kinkedDemand,
  contestableMarkets,

  // Labour Market
  labourMarketBasic,
  labourMRP,
  monopsony,
  tradeUnion,
  bilateralMonopoly
];

export default UNIT3_DIAGRAMS;
