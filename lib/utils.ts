import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-green-700";
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 60) return "text-amber-600";
  if (percentage >= 45) return "text-orange-600";
  return "text-red-600";
}

export function getGradeBand(percentage: number): string {
  if (percentage >= 90) return "A*";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "U";
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getAOLabel(ao: string): string {
  const labels: Record<string, string> = {
    ao1: "AO1 - Knowledge",
    ao2: "AO2 - Application",
    ao3: "AO3 - Analysis",
    ao4: "AO4 - Evaluation",
  };
  return labels[ao] || ao.toUpperCase();
}

export function getAODescription(ao: string): string {
  const descriptions: Record<string, string> = {
    ao1: "Demonstrate knowledge of terms, concepts, theories, and key economists",
    ao2: "Apply economic concepts and theories to real-world contexts and data",
    ao3: "Analyse economic issues using chains of reasoning and diagrams",
    ao4: "Evaluate economic arguments and evidence to reach substantiated judgments",
  };
  return descriptions[ao] || "";
}
