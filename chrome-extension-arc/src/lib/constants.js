/**
 * EconGrader Chrome Extension — Constants
 * Ported from the web app's lib/constants.ts
 * Mark schemes, question types, and level descriptors for Edexcel IAL Economics
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

export const QUESTION_TYPE_OPTIONS = [
  { value: "define-4",     label: "Define (4 marks)" },
  { value: "explain-6",    label: "Explain (6 marks)" },
  { value: "explain-8",    label: "Explain (8 marks)" },
  { value: "assess-12",    label: "Assess (12 marks)" },
  { value: "evaluate-14",  label: "Evaluate (14 marks) — IAL" },
  { value: "evaluate-15",  label: "Evaluate (15 marks)" },
  { value: "evaluate-20",  label: "Evaluate (20 marks)" },
  { value: "evaluate-25",  label: "Evaluate (25 marks)" },
];

export const LEVEL_DESCRIPTORS = {
  1: "Limited",
  2: "Basic",
  3: "Sound",
  4: "Good",
  5: "Excellent",
};

export const AO_LABELS = {
  ao1: "Knowledge",
  ao2: "Application",
  ao3: "Analysis",
  ao4: "Evaluation",
};

export const AO_COLORS = {
  ao1: { base: "#5A7CB5", light: "#B8CADF", lighter: "#ECF1F7" },
  ao2: { base: "#3A7266", light: "#BBDAD4", lighter: "#EDF6F4" },
  ao3: { base: "#7B6BA0", light: "#C9BFD9", lighter: "#F1EEF6" },
  ao4: { base: "#B89A5C", light: "#E0D5BD", lighter: "#F8F5EF" },
};

export const LEVEL_COLORS = {
  5: { bg: "#EDF6F4", color: "#3A7266", border: "#BBDAD4" },
  4: { bg: "#ECF1F7", color: "#3D6699", border: "#B8CADF" },
  3: { bg: "#F8F5EF", color: "#8B7335", border: "#E0D5BD" },
  2: { bg: "#F8F5EF", color: "#8B7335", border: "#E0D5BD" },
  1: { bg: "#F6F0F0", color: "#8B4A4A", border: "#DFC4C4" },
};
