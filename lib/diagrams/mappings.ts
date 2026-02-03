// Edexcel IAL Economics - Keyword to Diagram Mappings
// Comprehensive mapping for diagram identification engine

import { TopicDiagramMapping } from './types';

/**
 * Master keyword database for diagram identification
 * Maps keywords/phrases to relevant diagram IDs
 */
export const KEYWORD_DIAGRAM_MAP: Record<string, string[]> = {
  // ============================================================================
  // SUPPLY AND DEMAND (Unit 1)
  // ============================================================================
  'supply and demand': ['supply-demand-basic'],
  'market equilibrium': ['supply-demand-basic'],
  'price determination': ['supply-demand-basic'],
  'equilibrium price': ['supply-demand-basic'],
  'equilibrium quantity': ['supply-demand-basic'],
  'market mechanism': ['supply-demand-basic'],
  'price mechanism': ['supply-demand-basic'],
  'invisible hand': ['supply-demand-basic'],

  // Demand shifts
  'increase in demand': ['demand-shift-right'],
  'demand increase': ['demand-shift-right'],
  'rise in demand': ['demand-shift-right'],
  'higher demand': ['demand-shift-right'],
  'demand shifts right': ['demand-shift-right'],
  'decrease in demand': ['demand-shift-left'],
  'demand decrease': ['demand-shift-left'],
  'fall in demand': ['demand-shift-left'],
  'lower demand': ['demand-shift-left'],
  'demand shifts left': ['demand-shift-left'],
  'shift in demand': ['demand-shift-right', 'demand-shift-left'],
  'income increase': ['demand-shift-right'],
  'income decrease': ['demand-shift-left'],
  'population growth': ['demand-shift-right'],
  'advertising': ['demand-shift-right'],
  'taste and fashion': ['demand-shift-right', 'demand-shift-left'],
  'substitute price': ['demand-shift-right', 'demand-shift-left'],
  'complement price': ['demand-shift-right', 'demand-shift-left'],

  // Supply shifts
  'increase in supply': ['supply-shift-right'],
  'supply increase': ['supply-shift-right'],
  'rise in supply': ['supply-shift-right'],
  'higher supply': ['supply-shift-right'],
  'supply shifts right': ['supply-shift-right'],
  'decrease in supply': ['supply-shift-left'],
  'supply decrease': ['supply-shift-left'],
  'fall in supply': ['supply-shift-left'],
  'lower supply': ['supply-shift-left'],
  'supply shifts left': ['supply-shift-left'],
  'shift in supply': ['supply-shift-right', 'supply-shift-left'],
  'technology improvement': ['supply-shift-right'],
  'lower costs': ['supply-shift-right'],
  'productivity increase': ['supply-shift-right'],
  'higher costs': ['supply-shift-left'],
  'raw material costs': ['supply-shift-left'],
  'wage costs': ['supply-shift-left'],
  'natural disaster': ['supply-shift-left'],
  'supply shock': ['supply-shift-left'],

  // Consumer/Producer Surplus
  'consumer surplus': ['consumer-producer-surplus'],
  'producer surplus': ['consumer-producer-surplus'],
  'economic welfare': ['consumer-producer-surplus'],
  'total surplus': ['consumer-producer-surplus'],
  'welfare economics': ['consumer-producer-surplus'],
  'allocative efficiency': ['consumer-producer-surplus', 'supply-demand-basic'],

  // ============================================================================
  // ELASTICITY (Unit 1)
  // ============================================================================
  'price elasticity of demand': ['elastic-demand', 'inelastic-demand', 'unit-elastic-demand'],
  'ped': ['elastic-demand', 'inelastic-demand'],
  'elastic demand': ['elastic-demand'],
  'inelastic demand': ['inelastic-demand'],
  'unit elastic': ['unit-elastic-demand'],
  'perfectly elastic': ['perfectly-elastic-demand'],
  'perfectly inelastic': ['perfectly-inelastic-demand'],
  'luxury goods': ['elastic-demand'],
  'necessity': ['inelastic-demand'],
  'necessities': ['inelastic-demand'],
  'addictive': ['inelastic-demand'],
  'addiction': ['inelastic-demand'],
  'few substitutes': ['inelastic-demand'],
  'many substitutes': ['elastic-demand'],
  'price taker': ['perfectly-elastic-demand'],
  'total revenue': ['elastic-demand', 'inelastic-demand'],

  // ============================================================================
  // MARKET FAILURE - EXTERNALITIES (Unit 1)
  // ============================================================================
  'negative externality': ['negative-externality-production', 'negative-externality-consumption'],
  'negative externalities': ['negative-externality-production', 'negative-externality-consumption'],
  'external cost': ['negative-externality-production'],
  'external costs': ['negative-externality-production'],
  'pollution': ['negative-externality-production'],
  'carbon emissions': ['negative-externality-production'],
  'air pollution': ['negative-externality-production'],
  'water pollution': ['negative-externality-production'],
  'noise pollution': ['negative-externality-production'],
  'congestion': ['negative-externality-production'],
  'traffic congestion': ['negative-externality-production'],
  'msc': ['negative-externality-production', 'positive-externality-production'],
  'mpc': ['negative-externality-production', 'positive-externality-production'],
  'marginal social cost': ['negative-externality-production'],
  'marginal private cost': ['negative-externality-production'],
  'overproduction': ['negative-externality-production'],
  'market failure': ['negative-externality-production', 'negative-externality-consumption', 'positive-externality-consumption', 'public-goods'],

  // Negative externality in consumption
  'demerit goods': ['negative-externality-consumption'],
  'demerit good': ['negative-externality-consumption'],
  'smoking': ['negative-externality-consumption'],
  'tobacco': ['negative-externality-consumption'],
  'alcohol': ['negative-externality-consumption'],
  'gambling': ['negative-externality-consumption'],
  'drugs': ['negative-externality-consumption'],
  'overconsumption': ['negative-externality-consumption'],
  'msb': ['negative-externality-consumption', 'positive-externality-consumption'],
  'mpb': ['negative-externality-consumption', 'positive-externality-consumption'],
  'marginal social benefit': ['positive-externality-consumption'],
  'marginal private benefit': ['negative-externality-consumption'],

  // Positive externality in consumption
  'positive externality': ['positive-externality-consumption', 'positive-externality-production'],
  'positive externalities': ['positive-externality-consumption', 'positive-externality-production'],
  'external benefit': ['positive-externality-consumption'],
  'external benefits': ['positive-externality-consumption'],
  'merit goods': ['positive-externality-consumption'],
  'merit good': ['positive-externality-consumption'],
  'education': ['positive-externality-consumption'],
  'healthcare': ['positive-externality-consumption'],
  'vaccination': ['positive-externality-consumption'],
  'underconsumption': ['positive-externality-consumption'],
  'underconsumed': ['positive-externality-consumption'],

  // Positive externality in production
  'r&d': ['positive-externality-production'],
  'research and development': ['positive-externality-production'],
  'training': ['positive-externality-production'],
  'worker training': ['positive-externality-production'],
  'spillover effects': ['positive-externality-production'],
  'knowledge spillovers': ['positive-externality-production'],
  'underproduction': ['positive-externality-production'],

  // Public goods
  'public goods': ['public-goods'],
  'public good': ['public-goods'],
  'non-excludable': ['public-goods'],
  'non-rivalrous': ['public-goods'],
  'non-rival': ['public-goods'],
  'free rider': ['public-goods'],
  'free rider problem': ['public-goods'],
  'defence': ['public-goods'],
  'street lighting': ['public-goods'],
  'flood defence': ['public-goods'],
  'lighthouse': ['public-goods'],

  // ============================================================================
  // GOVERNMENT INTERVENTION (Unit 1)
  // ============================================================================
  'indirect tax': ['indirect-tax'],
  'specific tax': ['indirect-tax'],
  'per unit tax': ['indirect-tax'],
  'excise duty': ['indirect-tax'],
  'sin tax': ['indirect-tax'],
  'pigouvian tax': ['indirect-tax'],
  'carbon tax': ['indirect-tax'],
  'tax incidence': ['indirect-tax'],
  'tax burden': ['indirect-tax'],
  'vat': ['indirect-tax'],

  'subsidy': ['subsidy'],
  'subsidies': ['subsidy'],
  'government subsidy': ['subsidy'],
  'producer subsidy': ['subsidy'],
  'agricultural subsidy': ['subsidy'],

  'maximum price': ['maximum-price'],
  'price ceiling': ['maximum-price'],
  'price cap': ['maximum-price'],
  'rent control': ['maximum-price'],
  'rent controls': ['maximum-price'],
  'price control': ['maximum-price', 'minimum-price'],

  'minimum price': ['minimum-price'],
  'price floor': ['minimum-price'],
  'guaranteed price': ['minimum-price'],
  'buffer stock': ['minimum-price'],
  'agricultural price': ['minimum-price'],

  'minimum wage': ['minimum-wage'],
  'national minimum wage': ['minimum-wage'],
  'nmw': ['minimum-wage'],
  'living wage': ['minimum-wage'],
  'wage floor': ['minimum-wage'],

  'deadweight loss': ['deadweight-loss-tax', 'negative-externality-production'],
  'welfare loss': ['deadweight-loss-tax', 'negative-externality-production', 'negative-externality-consumption'],
  'allocative inefficiency': ['deadweight-loss-tax'],

  // ============================================================================
  // MACROECONOMICS - AD/AS (Unit 2)
  // ============================================================================
  'aggregate demand': ['ad-as-basic', 'ad-shift-right', 'ad-shift-left'],
  'aggregate supply': ['ad-as-basic', 'sras-shift', 'lras-shift'],
  'ad/as': ['ad-as-basic'],
  'ad-as': ['ad-as-basic'],
  'ad as model': ['ad-as-basic'],
  'macroeconomic equilibrium': ['ad-as-basic'],
  'general price level': ['ad-as-basic'],
  'real gdp': ['ad-as-basic'],
  'national output': ['ad-as-basic'],

  // AD shifts
  'demand-pull inflation': ['ad-shift-right'],
  'demand pull': ['ad-shift-right'],
  'ad increase': ['ad-shift-right'],
  'expansionary fiscal': ['ad-shift-right'],
  'expansionary monetary': ['ad-shift-right'],
  'fiscal expansion': ['ad-shift-right'],
  'monetary expansion': ['ad-shift-right'],
  'consumer confidence': ['ad-shift-right', 'ad-shift-left'],
  'government spending increase': ['ad-shift-right'],
  'tax cut': ['ad-shift-right'],
  'interest rate cut': ['ad-shift-right'],
  'lower interest rates': ['ad-shift-right'],
  'wealth effect': ['ad-shift-right'],
  'export increase': ['ad-shift-right'],
  'ad decrease': ['ad-shift-left'],
  'contractionary': ['ad-shift-left'],
  'fiscal contraction': ['ad-shift-left'],
  'austerity': ['ad-shift-left'],

  // AS shifts
  'cost-push inflation': ['sras-shift-left'],
  'cost push': ['sras-shift-left'],
  'supply shock': ['sras-shift-left'],
  'oil price shock': ['sras-shift-left'],
  'oil shock': ['sras-shift-left'],
  'stagflation': ['sras-shift-left'],
  'sras shift': ['sras-shift-left', 'sras-shift-right'],
  'short run aggregate supply': ['sras-shift-left', 'sras-shift-right'],

  // LRAS / Long-run growth
  'long run aggregate supply': ['lras-shift'],
  'lras': ['lras-shift', 'ad-as-classical'],
  'economic growth': ['lras-shift', 'ppf-growth'],
  'potential output': ['lras-shift'],
  'productive capacity': ['lras-shift'],
  'supply-side policies': ['lras-shift'],
  'supply side': ['lras-shift'],
  'infrastructure investment': ['lras-shift'],
  'education investment': ['lras-shift'],
  'productivity growth': ['lras-shift'],

  // Keynesian vs Classical
  'keynesian': ['ad-as-keynesian'],
  'keynesian as': ['ad-as-keynesian'],
  'horizontal as': ['ad-as-keynesian'],
  'spare capacity': ['ad-as-keynesian'],
  'classical': ['ad-as-classical'],
  'classical as': ['ad-as-classical'],
  'vertical lras': ['ad-as-classical'],
  'full employment': ['ad-as-classical'],

  // Output gaps
  'output gap': ['output-gap-positive', 'output-gap-negative'],
  'positive output gap': ['output-gap-positive'],
  'negative output gap': ['output-gap-negative'],
  'recessionary gap': ['output-gap-negative'],
  'inflationary gap': ['output-gap-positive'],
  'deflationary gap': ['output-gap-negative'],

  // Phillips Curve
  'phillips curve': ['phillips-curve-sr', 'phillips-curve-lr'],
  'inflation unemployment': ['phillips-curve-sr'],
  'inflation unemployment trade-off': ['phillips-curve-sr'],
  'nairu': ['phillips-curve-lr'],
  'natural rate of unemployment': ['phillips-curve-lr'],
  'expectations augmented': ['phillips-curve-lr'],

  // Circular Flow
  'circular flow': ['circular-flow'],
  'circular flow of income': ['circular-flow'],
  'injections': ['circular-flow'],
  'withdrawals': ['circular-flow'],
  'leakages': ['circular-flow'],

  // Business Cycle
  'business cycle': ['business-cycle'],
  'economic cycle': ['business-cycle'],
  'boom': ['business-cycle'],
  'recession': ['business-cycle', 'output-gap-negative'],
  'recovery': ['business-cycle'],
  'slump': ['business-cycle'],
  'trough': ['business-cycle'],
  'peak': ['business-cycle'],

  // ============================================================================
  // MARKET STRUCTURES (Unit 3)
  // ============================================================================
  'perfect competition': ['perfect-competition-sr', 'perfect-competition-lr'],
  'perfectly competitive': ['perfect-competition-sr', 'perfect-competition-lr'],
  'price taker': ['perfect-competition-sr', 'perfectly-elastic-demand'],
  'normal profit': ['perfect-competition-lr', 'monopolistic-competition-lr'],
  'homogeneous products': ['perfect-competition-sr'],
  'many buyers and sellers': ['perfect-competition-sr'],

  'monopoly': ['monopoly-equilibrium', 'monopoly-price-discrimination'],
  'monopolist': ['monopoly-equilibrium'],
  'single seller': ['monopoly-equilibrium'],
  'supernormal profit': ['monopoly-equilibrium', 'perfect-competition-sr'],
  'abnormal profit': ['monopoly-equilibrium'],
  'barriers to entry': ['monopoly-equilibrium'],
  'mc=mr': ['monopoly-equilibrium', 'perfect-competition-sr'],
  'profit maximisation': ['monopoly-equilibrium', 'perfect-competition-sr'],
  'profit maximization': ['monopoly-equilibrium', 'perfect-competition-sr'],
  'ar=d': ['monopoly-equilibrium'],
  'price maker': ['monopoly-equilibrium'],
  'deadweight loss monopoly': ['monopoly-welfare-loss'],
  'monopoly inefficiency': ['monopoly-welfare-loss'],

  'price discrimination': ['monopoly-price-discrimination'],
  'first degree': ['monopoly-price-discrimination'],
  'third degree': ['monopoly-price-discrimination'],
  'market segmentation': ['monopoly-price-discrimination'],

  'natural monopoly': ['natural-monopoly'],
  'economies of scale': ['natural-monopoly'],
  'declining average costs': ['natural-monopoly'],
  'utilities': ['natural-monopoly'],

  'monopolistic competition': ['monopolistic-competition-sr', 'monopolistic-competition-lr'],
  'product differentiation': ['monopolistic-competition-sr'],
  'brand loyalty': ['monopolistic-competition-sr'],
  'non-price competition': ['monopolistic-competition-sr'],

  'oligopoly': ['kinked-demand', 'game-theory'],
  'few firms': ['kinked-demand'],
  'interdependence': ['kinked-demand'],
  'price rigidity': ['kinked-demand'],
  'kinked demand curve': ['kinked-demand'],
  'kinked demand': ['kinked-demand'],
  'price war': ['kinked-demand'],
  'collusion': ['game-theory'],
  'cartel': ['game-theory'],
  'game theory': ['game-theory'],
  'prisoner dilemma': ['game-theory'],
  'nash equilibrium': ['game-theory'],

  'contestable markets': ['contestable-markets'],
  'contestability': ['contestable-markets'],
  'hit and run': ['contestable-markets'],
  'low barriers': ['contestable-markets'],
  'sunk costs': ['contestable-markets'],

  // ============================================================================
  // LABOUR MARKET (Unit 3)
  // ============================================================================
  'labour market': ['labour-market-basic', 'labour-demand-shift', 'labour-supply-shift'],
  'labor market': ['labour-market-basic'],
  'wage determination': ['labour-market-basic'],
  'wage rate': ['labour-market-basic'],
  'demand for labour': ['labour-market-basic', 'labour-demand-shift'],
  'supply of labour': ['labour-market-basic', 'labour-supply-shift'],
  'derived demand': ['labour-market-basic'],

  'marginal revenue product': ['labour-mrp'],
  'mrp': ['labour-mrp'],
  'mrp = mcl': ['labour-mrp'],
  'mrp theory': ['labour-mrp'],

  'monopsony': ['monopsony'],
  'monopsonist': ['monopsony'],
  'single buyer': ['monopsony'],
  'wage below mrp': ['monopsony'],
  'mcl': ['monopsony'],
  'acl': ['monopsony'],

  'trade union': ['trade-union'],
  'trade unions': ['trade-union'],
  'collective bargaining': ['trade-union'],
  'union wage': ['trade-union'],
  'bilateral monopoly': ['bilateral-monopoly'],

  'wage differentials': ['wage-differentials'],
  'compensating differentials': ['wage-differentials'],
  'human capital': ['wage-differentials'],

  'backward bending': ['backward-bending-supply'],
  'income effect labour': ['backward-bending-supply'],
  'substitution effect labour': ['backward-bending-supply'],

  // ============================================================================
  // INTERNATIONAL ECONOMICS (Unit 4)
  // ============================================================================
  'comparative advantage': ['comparative-advantage'],
  'absolute advantage': ['comparative-advantage'],
  'specialisation': ['comparative-advantage'],
  'specialization': ['comparative-advantage'],
  'opportunity cost ratio': ['comparative-advantage'],
  'gains from trade': ['comparative-advantage'],
  'ricardian': ['comparative-advantage'],

  'terms of trade': ['terms-of-trade'],
  'tot': ['terms-of-trade'],
  'export prices': ['terms-of-trade'],
  'import prices': ['terms-of-trade'],

  'tariff': ['tariff-diagram'],
  'tariffs': ['tariff-diagram'],
  'import duty': ['tariff-diagram'],
  'import tariff': ['tariff-diagram'],
  'protectionism': ['tariff-diagram', 'quota-diagram'],
  'trade protection': ['tariff-diagram', 'quota-diagram'],

  'quota': ['quota-diagram'],
  'quotas': ['quota-diagram'],
  'import quota': ['quota-diagram'],
  'quantitative restriction': ['quota-diagram'],

  'exchange rate': ['exchange-rate-floating', 'exchange-rate-fixed'],
  'foreign exchange': ['exchange-rate-floating'],
  'forex': ['exchange-rate-floating'],
  'currency': ['exchange-rate-floating'],
  'appreciation': ['exchange-rate-appreciation'],
  'depreciation': ['exchange-rate-depreciation'],
  'devaluation': ['exchange-rate-fixed'],
  'revaluation': ['exchange-rate-fixed'],
  'floating exchange rate': ['exchange-rate-floating'],
  'fixed exchange rate': ['exchange-rate-fixed'],
  'managed float': ['exchange-rate-floating'],

  'j-curve': ['j-curve'],
  'j curve': ['j-curve'],
  'marshall-lerner': ['j-curve'],
  'current account': ['j-curve', 'balance-of-payments'],
  'trade balance': ['j-curve'],

  'balance of payments': ['balance-of-payments'],
  'bop': ['balance-of-payments'],
  'current account deficit': ['balance-of-payments'],
  'capital account': ['balance-of-payments'],
  'financial account': ['balance-of-payments'],

  // ============================================================================
  // DEVELOPMENT ECONOMICS (Unit 4)
  // ============================================================================
  'lorenz curve': ['lorenz-curve'],
  'gini coefficient': ['lorenz-curve'],
  'income inequality': ['lorenz-curve'],
  'wealth inequality': ['lorenz-curve'],
  'income distribution': ['lorenz-curve'],

  'ppf': ['ppf-basic', 'ppf-growth', 'ppf-shift'],
  'production possibility frontier': ['ppf-basic', 'ppf-growth'],
  'production possibilities': ['ppf-basic'],
  'opportunity cost': ['ppf-basic', 'comparative-advantage'],
  'ppf shift': ['ppf-growth'],
  'economic growth ppf': ['ppf-growth'],

  'poverty trap': ['poverty-trap'],
  'vicious cycle': ['poverty-trap'],
  'low income trap': ['poverty-trap'],

  'harrod-domar': ['harrod-domar'],
  'savings gap': ['harrod-domar'],
  'foreign exchange gap': ['harrod-domar'],
};

/**
 * Topic to diagram mappings for specific Edexcel topics
 */
export const TOPIC_DIAGRAM_MAPPINGS: TopicDiagramMapping[] = [
  {
    topic: 'Microeconomics',
    keywords: ['supply', 'demand', 'market', 'price', 'elasticity'],
    primaryDiagrams: ['supply-demand-basic', 'consumer-producer-surplus'],
    secondaryDiagrams: ['demand-shift-right', 'supply-shift-right', 'elastic-demand', 'inelastic-demand'],
    contextualRules: [
      { condition: 'price change', diagrams: ['supply-demand-basic'] },
      { condition: 'income change', diagrams: ['demand-shift-right', 'demand-shift-left'] },
      { condition: 'cost change', diagrams: ['supply-shift-right', 'supply-shift-left'] }
    ]
  },
  {
    topic: 'Market Failure',
    keywords: ['externality', 'pollution', 'merit', 'demerit', 'public good'],
    primaryDiagrams: ['negative-externality-production', 'positive-externality-consumption'],
    secondaryDiagrams: ['negative-externality-consumption', 'positive-externality-production', 'public-goods'],
    contextualRules: [
      { condition: 'pollution', diagrams: ['negative-externality-production'] },
      { condition: 'education OR healthcare', diagrams: ['positive-externality-consumption'] },
      { condition: 'smoking OR alcohol', diagrams: ['negative-externality-consumption'] }
    ]
  },
  {
    topic: 'Government Intervention',
    keywords: ['tax', 'subsidy', 'price control', 'regulation', 'minimum wage'],
    primaryDiagrams: ['indirect-tax', 'subsidy', 'minimum-wage'],
    secondaryDiagrams: ['maximum-price', 'minimum-price', 'deadweight-loss-tax'],
    contextualRules: [
      { condition: 'correct externality', diagrams: ['indirect-tax', 'subsidy'] },
      { condition: 'labour market', diagrams: ['minimum-wage'] },
      { condition: 'housing OR rent', diagrams: ['maximum-price'] }
    ]
  },
  {
    topic: 'Macroeconomics',
    keywords: ['AD', 'AS', 'inflation', 'unemployment', 'growth', 'GDP'],
    primaryDiagrams: ['ad-as-basic', 'ad-shift-right', 'lras-shift'],
    secondaryDiagrams: ['phillips-curve-sr', 'circular-flow', 'business-cycle'],
    contextualRules: [
      { condition: 'demand-pull inflation', diagrams: ['ad-shift-right'] },
      { condition: 'cost-push inflation', diagrams: ['sras-shift-left'] },
      { condition: 'economic growth', diagrams: ['lras-shift', 'ppf-growth'] }
    ]
  },
  {
    topic: 'Fiscal Policy',
    keywords: ['government spending', 'taxation', 'budget', 'deficit', 'austerity'],
    primaryDiagrams: ['ad-shift-right', 'ad-shift-left'],
    secondaryDiagrams: ['circular-flow'],
    contextualRules: [
      { condition: 'expansionary', diagrams: ['ad-shift-right'] },
      { condition: 'contractionary', diagrams: ['ad-shift-left'] }
    ]
  },
  {
    topic: 'Monetary Policy',
    keywords: ['interest rate', 'money supply', 'central bank', 'quantitative easing'],
    primaryDiagrams: ['ad-shift-right', 'ad-shift-left'],
    secondaryDiagrams: ['money-market'],
    contextualRules: [
      { condition: 'lower interest rates', diagrams: ['ad-shift-right'] },
      { condition: 'higher interest rates', diagrams: ['ad-shift-left'] }
    ]
  },
  {
    topic: 'Supply-Side Policies',
    keywords: ['productivity', 'efficiency', 'deregulation', 'privatisation', 'education investment'],
    primaryDiagrams: ['lras-shift'],
    secondaryDiagrams: ['ppf-growth', 'labour-market-basic'],
    contextualRules: [
      { condition: 'long-term growth', diagrams: ['lras-shift', 'ppf-growth'] }
    ]
  },
  {
    topic: 'Labour Markets',
    keywords: ['wage', 'employment', 'unemployment', 'labour', 'worker'],
    primaryDiagrams: ['labour-market-basic', 'minimum-wage'],
    secondaryDiagrams: ['monopsony', 'trade-union', 'labour-mrp'],
    contextualRules: [
      { condition: 'minimum wage', diagrams: ['minimum-wage'] },
      { condition: 'monopsony power', diagrams: ['monopsony'] },
      { condition: 'union', diagrams: ['trade-union'] }
    ]
  },
  {
    topic: 'Market Structures',
    keywords: ['monopoly', 'competition', 'oligopoly', 'firm', 'profit'],
    primaryDiagrams: ['monopoly-equilibrium', 'perfect-competition-lr'],
    secondaryDiagrams: ['kinked-demand', 'monopolistic-competition-lr', 'natural-monopoly'],
    contextualRules: [
      { condition: 'monopoly', diagrams: ['monopoly-equilibrium'] },
      { condition: 'perfect competition', diagrams: ['perfect-competition-sr', 'perfect-competition-lr'] },
      { condition: 'oligopoly', diagrams: ['kinked-demand'] }
    ]
  },
  {
    topic: 'International Trade',
    keywords: ['trade', 'export', 'import', 'tariff', 'comparative advantage'],
    primaryDiagrams: ['comparative-advantage', 'tariff-diagram'],
    secondaryDiagrams: ['quota-diagram', 'terms-of-trade'],
    contextualRules: [
      { condition: 'free trade benefits', diagrams: ['comparative-advantage'] },
      { condition: 'protectionism', diagrams: ['tariff-diagram', 'quota-diagram'] }
    ]
  },
  {
    topic: 'Exchange Rates',
    keywords: ['exchange rate', 'currency', 'forex', 'appreciation', 'depreciation'],
    primaryDiagrams: ['exchange-rate-floating'],
    secondaryDiagrams: ['exchange-rate-fixed', 'j-curve'],
    contextualRules: [
      { condition: 'trade balance', diagrams: ['j-curve'] },
      { condition: 'currency movement', diagrams: ['exchange-rate-floating'] }
    ]
  },
  {
    topic: 'Development Economics',
    keywords: ['development', 'poverty', 'inequality', 'developing country', 'LDC'],
    primaryDiagrams: ['lorenz-curve', 'ppf-basic'],
    secondaryDiagrams: ['poverty-trap', 'harrod-domar'],
    contextualRules: [
      { condition: 'inequality', diagrams: ['lorenz-curve'] },
      { condition: 'economic development', diagrams: ['ppf-growth'] }
    ]
  }
];

/**
 * Question type to recommended diagram count
 */
export const QUESTION_DIAGRAM_MARKS: Record<string, { marks: number; recommended: boolean }> = {
  'define-4': { marks: 0, recommended: false },
  'explain-6': { marks: 2, recommended: false },
  'explain-8': { marks: 3, recommended: true },
  'assess-12': { marks: 4, recommended: true },
  'evaluate-15': { marks: 4, recommended: true },
  'evaluate-20': { marks: 5, recommended: true },
  'evaluate-25': { marks: 6, recommended: true }
};

export default KEYWORD_DIAGRAM_MAP;
