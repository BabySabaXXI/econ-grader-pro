/**
 * Mark schemes for Edexcel IAL Economics
 * Ported from main web app.
 */
export const MARK_SCHEMES = {
  "define-4":     { ao1: 4, ao2: 0, ao3: 0, ao4: 0, total: 4 },
  "explain-6":    { ao1: 2, ao2: 2, ao3: 2, ao4: 0, total: 6 },
  "explain-8":    { ao1: 2, ao2: 2, ao3: 4, ao4: 0, total: 8 },
  "assess-12":    { ao1: 2, ao2: 2, ao3: 4, ao4: 4, total: 12 },
  "evaluate-14":  { ao1: 2, ao2: 3, ao3: 4, ao4: 5, total: 14 },
  "evaluate-15":  { ao1: 3, ao2: 3, ao3: 4, ao4: 5, total: 15 },
  "evaluate-20":  { ao1: 4, ao2: 4, ao3: 6, ao4: 6, total: 20 },
  "evaluate-25":  { ao1: 5, ao2: 5, ao3: 7, ao4: 8, total: 25 },
};

export const VALID_QUESTION_TYPES = Object.keys(MARK_SCHEMES);
