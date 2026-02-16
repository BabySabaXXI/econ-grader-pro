import jsPDF from "jspdf";
import { GradingResult, QuestionType, MarkEarned, MarkLost } from "./types";
import { MARK_SCHEMES, LEVEL_DESCRIPTORS } from "./constants";

const AO_LABELS: Record<string, string> = {
  ao1: "Knowledge & Understanding",
  ao2: "Application",
  ao3: "Analysis",
  ao4: "Evaluation",
};

/**
 * Generate a short filename from the essay question.
 * Extracts the first meaningful phrase (up to ~6 words), sanitises it,
 * and appends the score.
 */
export function generateFilename(
  question: string,
  result: GradingResult
): string {
  // Strip common leading words
  const cleaned = question
    .replace(/^(evaluate|assess|discuss|explain|to what extent|analyse|examine|consider)\s*/i, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  const words = cleaned.split(/\s+/).slice(0, 6).join("_").toLowerCase();
  const slug = words || "essay_feedback";
  return `${slug}_${result.totalMarks}marks.pdf`;
}

/**
 * Build and download a PDF containing the full grading feedback.
 */
export function exportGradingPdf(
  result: GradingResult,
  questionType: QuestionType,
  question: string,
  essayText: string
): void {
  const markScheme = MARK_SCHEMES[questionType];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── helpers ──────────────────────────────────────────────────────

  function ensureSpace(needed: number) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function drawHr() {
    ensureSpace(6);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  }

  function heading(text: string, size: number = 14) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(40, 40, 40);
    doc.text(text, margin, y);
    y += size * 0.5 + 3;
  }

  function subheading(text: string) {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(text, margin, y);
    y += 6;
  }

  function body(text: string, indent: number = 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentW - indent);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, margin + indent, y);
      y += 4.5;
    }
    y += 1;
  }

  function labelValue(label: string, value: string, indent: number = 0) {
    ensureSpace(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin + indent, y);
    const labelW = doc.getTextWidth(label + " ");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const remaining = contentW - indent - labelW;
    const lines = doc.splitTextToSize(value, remaining);
    doc.text(lines[0], margin + indent + labelW, y);
    y += 5;
    for (let i = 1; i < lines.length; i++) {
      ensureSpace(5);
      doc.text(lines[i], margin + indent + labelW, y);
      y += 4.5;
    }
  }

  // ── Title Block ──────────────────────────────────────────────────

  doc.setFillColor(245, 245, 243);
  doc.rect(0, 0, pageW, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("EconGrader Pro — Feedback Report", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Edexcel IAL Economics  |  ${questionType.replace("-", " ").toUpperCase()}  |  ${new Date().toLocaleDateString("en-GB")}`, margin, 24);

  // Score summary line
  const levelLabel = LEVEL_DESCRIPTORS[result.levelAchieved] || "";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Score: ${result.totalMarks}/${markScheme.total}  (${result.overallPercentage}%)  —  Level ${result.levelAchieved}: ${levelLabel}`,
    margin,
    34
  );

  y = 50;

  // ── Question ─────────────────────────────────────────────────────

  heading("Question");
  body(question);
  y += 2;

  // ── AO Breakdown ─────────────────────────────────────────────────

  drawHr();
  heading("Assessment Objective Breakdown");

  const aos: ("ao1" | "ao2" | "ao3" | "ao4")[] = ["ao1", "ao2", "ao3", "ao4"];
  for (const ao of aos) {
    if (markScheme[ao] > 0) {
      const score = result.aoScores[ao];
      const max = markScheme[ao];
      const pct = Math.round((score / max) * 100);
      labelValue(
        `${ao.toUpperCase()} — ${AO_LABELS[ao]}:`,
        `${score}/${max}  (${pct}%)`
      );
    }
  }
  y += 2;

  // ── Examiner Comment ─────────────────────────────────────────────

  drawHr();
  heading("Examiner Comment");
  body(`"${result.examinerComment}"`);
  y += 2;

  // ── Strengths ────────────────────────────────────────────────────

  drawHr();
  heading("Strengths");
  result.strengths.forEach((s, i) => {
    body(`${i + 1}. ${s}`, 2);
  });
  y += 2;

  // ── Areas to Improve ─────────────────────────────────────────────

  drawHr();
  heading("Areas to Improve");
  result.improvements.forEach((imp, i) => {
    body(`${i + 1}. ${imp}`, 2);
  });
  y += 2;

  // ── Line-by-Line: Marks Earned ───────────────────────────────────

  if (result.marksEarned && result.marksEarned.length > 0) {
    drawHr();
    heading("Marks Earned — Line-by-Line");
    result.marksEarned.forEach((item: MarkEarned, i: number) => {
      ensureSpace(20);
      subheading(
        `${i + 1}. [${item.ao.toUpperCase()}] +${item.points} mark${item.points > 1 ? "s" : ""}`
      );
      body(`"${item.quote}"`, 4);
      body(`Reason: ${item.reason}`, 4);
      y += 2;
    });
  }

  // ── Line-by-Line: Marks Lost ─────────────────────────────────────

  if (result.marksLost && result.marksLost.length > 0) {
    drawHr();
    heading("Issues Found — Line-by-Line");
    result.marksLost.forEach((item: MarkLost, i: number) => {
      ensureSpace(24);
      subheading(`${i + 1}. [${item.ao.toUpperCase()}] Issue`);
      body(`"${item.quote}"`, 4);
      body(`Issue: ${item.issue}`, 4);
      body(`How to fix: ${item.howToFix}`, 4);
      y += 2;
    });
  }

  // ── Full Essay ───────────────────────────────────────────────────

  drawHr();
  heading("Full Student Response");
  body(essayText);

  // ── Footer on every page ─────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `EconGrader Pro  |  Page ${p} of ${totalPages}  |  AI-generated feedback — verify with official mark schemes`,
      margin,
      pageH - 8
    );
  }

  // ── Download ─────────────────────────────────────────────────────

  const filename = generateFilename(question, result);
  doc.save(filename);
}
