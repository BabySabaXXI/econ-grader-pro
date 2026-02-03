// Edexcel IAL Economics Diagram Engine
// Main export file

// Types
export * from './types';

// Diagrams by Unit
export { UNIT1_DIAGRAMS } from './unit1-diagrams';
export { UNIT2_DIAGRAMS } from './unit2-diagrams';
export { UNIT3_DIAGRAMS } from './unit3-diagrams';
export { UNIT4_DIAGRAMS } from './unit4-diagrams';

// Engine functions
export {
  ALL_DIAGRAMS,
  identifyDiagrams,
  getDiagramById,
  getDiagramsByUnit,
  getDiagramsForTopic,
  getDiagramsByCategory,
  suggestDiagramsForPlan,
  getRecommendedDiagram,
  searchDiagrams,
  type DiagramMatch
} from './engine';

// Mappings
export {
  KEYWORD_DIAGRAM_MAP,
  TOPIC_DIAGRAM_MAPPINGS,
  QUESTION_DIAGRAM_MARKS
} from './mappings';

// Individual diagram exports for convenience
export {
  supplyDemandBasic,
  demandShiftRight,
  demandShiftLeft,
  supplyShiftRight,
  supplyShiftLeft,
  consumerProducerSurplus,
  elasticDemand,
  inelasticDemand,
  negativeExternalityProduction,
  negativeExternalityConsumption,
  positiveExternalityConsumption,
  positiveExternalityProduction,
  indirectTax,
  subsidy,
  maximumPrice,
  minimumPrice,
  minimumWage
} from './unit1-diagrams';

export {
  adAsBasic,
  adShiftRight,
  adShiftLeft,
  srasShiftLeft,
  lrasShift,
  adAsKeynesian,
  adAsClassical,
  outputGapPositive,
  outputGapNegative,
  phillipsCurveSR,
  phillipsCurveLR,
  circularFlow,
  businessCycle
} from './unit2-diagrams';

export {
  perfectCompetitionSR,
  perfectCompetitionLR,
  monopolyEquilibrium,
  monopolyWelfareLoss,
  naturalMonopoly,
  priceDiscrimination,
  monopolisticCompetitionSR,
  monopolisticCompetitionLR,
  kinkedDemand,
  contestableMarkets,
  labourMarketBasic,
  labourMRP,
  monopsony,
  tradeUnion,
  bilateralMonopoly
} from './unit3-diagrams';

export {
  comparativeAdvantage,
  tariffDiagram,
  quotaDiagram,
  exchangeRateFloating,
  exchangeRateAppreciation,
  exchangeRateDepreciation,
  jCurve,
  lorenzCurve,
  ppfBasic,
  ppfGrowth,
  balanceOfPayments,
  termsOfTrade
} from './unit4-diagrams';
