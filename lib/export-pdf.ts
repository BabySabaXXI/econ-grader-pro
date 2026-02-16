import jsPDF from "jspdf";
import { GradingResult, QuestionType, MarkEarned, MarkLost } from "./types";
import { MARK_SCHEMES, LEVEL_DESCRIPTORS } from "./constants";

// ════════════════════════════════════════════════════════════════════
// COLOR PALETTE — matches the website's Japandi design system
// ════════════════════════════════════════════════════════════════════

type RGB = [number, number, number];

function hex(h: string): RGB {
  const v = h.replace("#", "");
  return [
    parseInt(v.substring(0, 2), 16),
    parseInt(v.substring(2, 4), 16),
    parseInt(v.substring(4, 6), 16),
  ];
}

const C = {
  // Neutrals
  n1: hex("#FFFFFF"),
  n2: hex("#F8F8F6"),
  n3: hex("#EBEBEA"),
  n4: hex("#A0A0A0"),
  n5: hex("#6B6B6B"),
  n7: hex("#2D2D2D"),

  // AO colors
  ao1: hex("#5A7CB5"),
  ao2: hex("#3A7266"),
  ao3: hex("#7B6BA0"),
  ao4: hex("#B89A5C"),

  // AO light backgrounds
  ao1Bg: hex("#EFF3F9"),
  ao2Bg: hex("#F0F7F5"),
  ao3Bg: hex("#F3F0F7"),
  ao4Bg: hex("#F8F5EE"),

  // Semantic
  successDark: hex("#3A7266"),
  successLight: hex("#C8DDD8"),
  successLighter: hex("#F0F7F5"),

  errorBase: hex("#BF6B6B"),
  errorLight: hex("#E8C8C8"),
  errorLighter: hex("#FBF0F0"),

  awayBase: hex("#B89A5C"),
  awayLight: hex("#E8DFC8"),
  awayLighter: hex("#F8F5EE"),

  infoBase: hex("#5A7CB5"),

  featureBase: hex("#7B6BA0"),

  // Score ring colors
  scoreGreen: hex("#4A8B7F"),
  scoreGreenTrail: hex("#E8F2F0"),
  scoreBlue: hex("#5A7CB5"),
  scoreBlueTrail: hex("#EBF0F7"),
  scoreAmber: hex("#B89A5C"),
  scoreAmberTrail: hex("#F6F3EC"),
  scoreRed: hex("#BF6B6B"),
  scoreRedTrail: hex("#F7EEED"),

  // Level badge colors
  level5: hex("#3A7266"),
  level5Bg: hex("#F0F7F5"),
  level4: hex("#5A7CB5"),
  level4Bg: hex("#EFF3F9"),
  level3: hex("#7B6BA0"),
  level3Bg: hex("#F3F0F7"),
  level2: hex("#B89A5C"),
  level2Bg: hex("#F8F5EE"),
  level1: hex("#BF6B6B"),
  level1Bg: hex("#FBF0F0"),
};

const AO_META: Record<string, { label: string; color: RGB; bg: RGB }> = {
  ao1: { label: "Knowledge", color: C.ao1, bg: C.ao1Bg },
  ao2: { label: "Application", color: C.ao2, bg: C.ao2Bg },
  ao3: { label: "Analysis", color: C.ao3, bg: C.ao3Bg },
  ao4: { label: "Evaluation", color: C.ao4, bg: C.ao4Bg },
};

function getScoreColors(pct: number): { ring: RGB; trail: RGB; text: RGB } {
  if (pct >= 80) return { ring: C.scoreGreen, trail: C.scoreGreenTrail, text: hex("#3A7266") };
  if (pct >= 60) return { ring: C.scoreBlue, trail: C.scoreBlueTrail, text: C.scoreBlue };
  if (pct >= 45) return { ring: C.scoreAmber, trail: C.scoreAmberTrail, text: C.scoreAmber };
  return { ring: C.scoreRed, trail: C.scoreRedTrail, text: C.scoreRed };
}

function getLevelColors(level: number): { color: RGB; bg: RGB } {
  const map: Record<number, { color: RGB; bg: RGB }> = {
    5: { color: C.level5, bg: C.level5Bg },
    4: { color: C.level4, bg: C.level4Bg },
    3: { color: C.level3, bg: C.level3Bg },
    2: { color: C.level2, bg: C.level2Bg },
    1: { color: C.level1, bg: C.level1Bg },
  };
  return map[level] || map[1];
}

// ════════════════════════════════════════════════════════════════════
// DRAWING HELPERS
// ════════════════════════════════════════════════════════════════════

function drawArc(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: RGB,
  lineWidth: number
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(lineWidth);
  const segments = 80;
  const step = (endAngle - startAngle) / segments;
  for (let i = 0; i < segments; i++) {
    const a1 = startAngle + step * i;
    const a2 = startAngle + step * (i + 1);
    doc.line(
      cx + r * Math.cos(a1),
      cy + r * Math.sin(a1),
      cx + r * Math.cos(a2),
      cy + r * Math.sin(a2)
    );
  }
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: RGB; border?: RGB; radius?: number }
) {
  const rad = opts.radius ?? 2.5;
  if (opts.fill) {
    doc.setFillColor(...opts.fill);
  }
  if (opts.border) {
    doc.setDrawColor(...opts.border);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, w, h, rad, rad, opts.fill ? "FD" : "S");
  } else if (opts.fill) {
    doc.roundedRect(x, y, w, h, rad, rad, "F");
  }
}

function drawBadge(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  color: RGB,
  bg: RGB
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const tw = doc.getTextWidth(text);
  const padX = 3;
  const padY = 1.5;
  const bw = tw + padX * 2;
  const bh = 5;
  drawCard(doc, x, y - bh + padY, bw, bh, { fill: bg, border: color, radius: 2.5 });
  doc.setTextColor(...color);
  doc.text(text, x + padX, y - 0.5);
  return bw;
}

// ════════════════════════════════════════════════════════════════════
// FILENAME GENERATOR
// ════════════════════════════════════════════════════════════════════

export function generateFilename(
  question: string,
  result: GradingResult
): string {
  const cleaned = question
    .replace(
      /^(evaluate|assess|discuss|explain|to what extent|analyse|examine|consider)\s*/i,
      ""
    )
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 6).join("_").toLowerCase();
  const slug = words || "essay_feedback";
  return `${slug}_${result.totalMarks}marks.pdf`;
}

// ════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════

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
  const M = 15; // margin
  const W = pageW - M * 2; // content width
  let y = 0;

  // ── page helpers ───────────────────────────────────────────────

  function ensureSpace(needed: number) {
    if (y + needed > pageH - 14) {
      doc.addPage();
      y = M;
    }
  }

  /** Wraps text and renders it, returning the number of lines drawn. */
  function renderText(
    text: string,
    x: number,
    startY: number,
    maxW: number,
    opts?: { font?: string; size?: number; color?: RGB; lineH?: number }
  ): number {
    const font = opts?.font ?? "normal";
    const size = opts?.size ?? 9;
    const color = opts?.color ?? C.n5;
    const lineH = opts?.lineH ?? 4.2;
    doc.setFont("helvetica", font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    let cy = startY;
    for (const line of lines) {
      ensureSpace(lineH + 2);
      doc.text(line, x, cy);
      cy += lineH;
    }
    return lines.length;
  }

  /** Measure wrapped text height without drawing it. */
  function measureText(
    text: string,
    maxW: number,
    opts?: { size?: number; lineH?: number }
  ): number {
    const size = opts?.size ?? 9;
    const lineH = opts?.lineH ?? 4.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines: string[] = doc.splitTextToSize(text, maxW);
    return lines.length * lineH;
  }

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 — HEADER BAR
  // ════════════════════════════════════════════════════════════════

  const headerH = 18;
  doc.setFillColor(...C.n7);
  doc.rect(0, 0, pageW, headerH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("EconGrader Pro", M, 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Feedback Report", M, 12.5);

  // Right side: date + question type
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const typeLabel = questionType.replace("-", " ").toUpperCase();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  const rightText = `Edexcel IAL Economics  ·  ${typeLabel}  ·  ${dateStr}`;
  const rtW = doc.getTextWidth(rightText);
  doc.text(rightText, pageW - M - rtW, 11);

  y = headerH + 8;

  // ════════════════════════════════════════════════════════════════
  // SCORE RING + SCORE DETAILS CARD
  // ════════════════════════════════════════════════════════════════

  const cardTop = y;
  const scoreCardH = 52;
  drawCard(doc, M, cardTop, W, scoreCardH, { fill: C.n1, border: C.n3, radius: 3 });

  // ── Score Ring ──
  const ringCx = M + 28;
  const ringCy = cardTop + scoreCardH / 2;
  const ringR = 17;
  const ringW = 2.8;

  const sc = getScoreColors(result.overallPercentage);

  // Trail circle (full)
  drawArc(doc, ringCx, ringCy, ringR, 0, Math.PI * 2, sc.trail, ringW);

  // Score arc (from top, clockwise)
  const startAngle = -Math.PI / 2;
  const sweepAngle = (result.overallPercentage / 100) * Math.PI * 2;
  if (sweepAngle > 0.01) {
    drawArc(doc, ringCx, ringCy, ringR, startAngle, startAngle + sweepAngle, sc.ring, ringW);
  }

  // Percentage text inside ring
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...sc.text);
  const pctText = `${result.overallPercentage}%`;
  const pctW = doc.getTextWidth(pctText);
  doc.text(pctText, ringCx - pctW / 2, ringCy + 2.5);

  // ── Score text (right of ring) ──
  const detailX = M + 58;

  // Big score number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...C.n7);
  doc.text(`${result.totalMarks}`, detailX, cardTop + 18);

  // /total
  const bigW = doc.getTextWidth(`${result.totalMarks}`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...C.n4);
  doc.text(`/${markScheme.total}`, detailX + bigW + 1, cardTop + 18);

  // Level badge
  const levelLabel = LEVEL_DESCRIPTORS[result.levelAchieved] || "";
  const lc = getLevelColors(result.levelAchieved);
  const badgeText = `Level ${result.levelAchieved} · ${levelLabel}`;
  drawBadge(doc, detailX, cardTop + 26, badgeText, lc.color, lc.bg);

  // Examiner comment (compact, inside card)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...C.n5);
  const examinerLines: string[] = doc.splitTextToSize(
    `"${result.examinerComment}"`,
    W - 60
  );
  let ey = cardTop + 33;
  for (const line of examinerLines.slice(0, 4)) {
    doc.text(line, detailX, ey);
    ey += 3.8;
  }

  y = cardTop + scoreCardH + 6;

  // ════════════════════════════════════════════════════════════════
  // AO BREAKDOWN CARD
  // ════════════════════════════════════════════════════════════════

  const aos: ("ao1" | "ao2" | "ao3" | "ao4")[] = ["ao1", "ao2", "ao3", "ao4"];
  const activeAOs = aos.filter((ao) => markScheme[ao] > 0);
  const aoCardH = 10 + activeAOs.length * 13;

  ensureSpace(aoCardH + 8);
  drawCard(doc, M, y, W, aoCardH, { fill: C.n1, border: C.n3, radius: 3 });

  // Card header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.n4);
  doc.text("ASSESSMENT OBJECTIVES", M + 5, y + 6);

  let aoY = y + 12;
  const barX = M + 5;
  const barMaxW = W - 50;
  const barH = 3;

  for (const ao of activeAOs) {
    const meta = AO_META[ao];
    const score = result.aoScores[ao];
    const max = markScheme[ao];
    const pct = max > 0 ? score / max : 0;

    // Colored dot
    doc.setFillColor(...meta.color);
    doc.circle(barX + 1.5, aoY - 0.5, 1, "F");

    // AO label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...meta.color);
    doc.text(ao.toUpperCase(), barX + 5, aoY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.n4);
    doc.text(meta.label, barX + 14, aoY);

    // Score text (right-aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.n7);
    const scoreText = `${score}/${max}`;
    const stW = doc.getTextWidth(scoreText);
    doc.text(scoreText, M + W - 5 - stW, aoY);

    // Track bar
    const trackY = aoY + 2.5;
    doc.setFillColor(...C.n3);
    doc.roundedRect(barX, trackY, barMaxW, barH, 1.5, 1.5, "F");

    // Filled bar
    if (pct > 0) {
      const fillW = Math.max(barMaxW * pct, 3);
      doc.setFillColor(...meta.color);
      doc.roundedRect(barX, trackY, fillW, barH, 1.5, 1.5, "F");
    }

    aoY += 13;
  }

  y += aoCardH + 6;

  // ════════════════════════════════════════════════════════════════
  // EARNED / ISSUES SUMMARY ROW
  // ════════════════════════════════════════════════════════════════

  const hasHighlights =
    (result.marksEarned?.length || 0) > 0 ||
    (result.marksLost?.length || 0) > 0;

  if (hasHighlights) {
    ensureSpace(24);
    const halfW = (W - 4) / 2;
    const sumH = 18;

    // Earned card
    drawCard(doc, M, y, halfW, sumH, { fill: C.successLighter, border: C.successLight, radius: 2.5 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.successDark);
    doc.text("EARNED", M + 5, y + 6);
    doc.setFontSize(16);
    const earnedPts = result.marksEarned?.reduce((s, m) => s + m.points, 0) || 0;
    doc.text(`+${earnedPts}`, M + 5, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.n4);
    doc.text("Marks Earned", M + 5 + doc.getTextWidth(`+${earnedPts}  `), y + 14);

    // Issues card
    const issueX = M + halfW + 4;
    drawCard(doc, issueX, y, halfW, sumH, { fill: C.errorLighter, border: C.errorLight, radius: 2.5 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.errorBase);
    doc.text("ISSUES", issueX + 5, y + 6);
    doc.setFontSize(16);
    const issueCount = result.marksLost?.length || 0;
    doc.text(`${issueCount}`, issueX + 5, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.n4);
    doc.text("Issues Found", issueX + 5 + doc.getTextWidth(`${issueCount}  `), y + 14);

    y += sumH + 6;
  }

  // ════════════════════════════════════════════════════════════════
  // QUESTION BOX
  // ════════════════════════════════════════════════════════════════

  {
    ensureSpace(20);
    const qH = measureText(question, W - 14, { size: 9, lineH: 4.2 }) + 14;
    ensureSpace(qH + 2);

    drawCard(doc, M, y, W, qH, { fill: C.n2, border: C.n3, radius: 2.5 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.n4);
    doc.text("EXAM QUESTION", M + 5, y + 6);

    renderText(question, M + 5, y + 12, W - 14, {
      font: "normal",
      size: 9,
      color: C.n7,
      lineH: 4.2,
    });

    y += qH + 6;
  }

  // ════════════════════════════════════════════════════════════════
  // STRENGTHS
  // ════════════════════════════════════════════════════════════════

  if (result.strengths.length > 0) {
    ensureSpace(14);

    // Section header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.successDark);
    doc.text("STRENGTHS", M, y + 4);
    y += 8;

    for (const strength of result.strengths.slice(0, 4)) {
      const textH = measureText(strength, W - 16) + 8;
      ensureSpace(textH + 2);

      drawCard(doc, M, y, W, textH, { fill: C.successLighter, border: C.successLight, radius: 2 });

      // Green dot
      doc.setFillColor(...C.successDark);
      doc.circle(M + 4.5, y + 5, 0.8, "F");

      renderText(strength, M + 8, y + 5.5, W - 16, { size: 8.5, color: C.n5, lineH: 4 });
      y += textH + 2.5;
    }
    y += 3;
  }

  // ════════════════════════════════════════════════════════════════
  // AREAS TO IMPROVE
  // ════════════════════════════════════════════════════════════════

  if (result.improvements.length > 0) {
    ensureSpace(14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.awayBase);
    doc.text("AREAS TO IMPROVE", M, y + 4);
    y += 8;

    for (const improvement of result.improvements.slice(0, 4)) {
      const textH = measureText(improvement, W - 16) + 8;
      ensureSpace(textH + 2);

      drawCard(doc, M, y, W, textH, { fill: C.awayLighter, border: C.awayLight, radius: 2 });

      doc.setFillColor(...C.awayBase);
      doc.circle(M + 4.5, y + 5, 0.8, "F");

      renderText(improvement, M + 8, y + 5.5, W - 16, { size: 8.5, color: C.n5, lineH: 4 });
      y += textH + 2.5;
    }
    y += 3;
  }

  // ════════════════════════════════════════════════════════════════
  // LINE-BY-LINE: MARKS EARNED
  // ════════════════════════════════════════════════════════════════

  if (result.marksEarned && result.marksEarned.length > 0) {
    ensureSpace(14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.successDark);
    const earnedTotal = result.marksEarned.reduce((s, m) => s + m.points, 0);
    doc.text(
      `MARKS EARNED  (+${earnedTotal} from ${result.marksEarned.length} items)`,
      M,
      y + 4
    );
    y += 8;

    result.marksEarned.forEach((item: MarkEarned) => {
      const quoteH = measureText(`"${item.quote}"`, W - 20, { size: 8.5 });
      const reasonH = measureText(item.reason, W - 20, { size: 8.5 });
      const cardH = quoteH + reasonH + 20;
      ensureSpace(cardH + 4);

      drawCard(doc, M, y, W, cardH, { fill: C.n1, border: C.successLight, radius: 2.5 });

      // AO badge + points
      let bx = M + 5;
      const meta = AO_META[item.ao];
      if (meta) {
        const bw = drawBadge(doc, bx, y + 6.5, item.ao.toUpperCase(), meta.color, meta.bg);
        bx += bw + 3;
      }
      drawBadge(doc, bx, y + 6.5, `+${item.points}`, C.successDark, C.successLighter);

      // Quote
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.n5);
      const qLines: string[] = doc.splitTextToSize(`"${item.quote}"`, W - 20);
      let qy = y + 13;
      for (const line of qLines) {
        doc.text(line, M + 5, qy);
        qy += 3.8;
      }

      // Reason box
      const reasonBoxTop = qy + 1;
      const reasonBoxH = reasonH + 6;
      drawCard(doc, M + 4, reasonBoxTop, W - 8, reasonBoxH, {
        fill: C.successLighter,
        border: C.successLight,
        radius: 2,
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...C.successDark);
      doc.text("WHY THIS EARNED MARKS", M + 7, reasonBoxTop + 4);

      renderText(item.reason, M + 7, reasonBoxTop + 7.5, W - 18, {
        size: 8,
        color: C.n5,
        lineH: 3.8,
      });

      y += cardH + 3;
    });

    y += 3;
  }

  // ════════════════════════════════════════════════════════════════
  // LINE-BY-LINE: MARKS LOST / ISSUES
  // ════════════════════════════════════════════════════════════════

  if (result.marksLost && result.marksLost.length > 0) {
    ensureSpace(14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.errorBase);
    doc.text(`ISSUES FOUND  (${result.marksLost.length})`, M, y + 4);
    y += 8;

    result.marksLost.forEach((item: MarkLost) => {
      const quoteH = measureText(`"${item.quote}"`, W - 20, { size: 8.5 });
      const issueH = measureText(item.issue, W - 20, { size: 8.5 });
      const fixH = measureText(item.howToFix, W - 20, { size: 8.5 });
      const cardH = quoteH + issueH + fixH + 32;
      ensureSpace(cardH + 4);

      drawCard(doc, M, y, W, cardH, { fill: C.n1, border: C.errorLight, radius: 2.5 });

      // AO badge + Issue badge
      let bx = M + 5;
      const meta = AO_META[item.ao];
      if (meta) {
        const bw = drawBadge(doc, bx, y + 6.5, item.ao.toUpperCase(), meta.color, meta.bg);
        bx += bw + 3;
      }
      drawBadge(doc, bx, y + 6.5, "ISSUE", C.errorBase, C.errorLighter);

      // Quote
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.n5);
      const qLines: string[] = doc.splitTextToSize(`"${item.quote}"`, W - 20);
      let qy = y + 13;
      for (const line of qLines) {
        doc.text(line, M + 5, qy);
        qy += 3.8;
      }

      // Issue box
      const issueBoxTop = qy + 1;
      const issueBoxH = issueH + 6;
      drawCard(doc, M + 4, issueBoxTop, W - 8, issueBoxH, {
        fill: C.errorLighter,
        border: C.errorLight,
        radius: 2,
      });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...C.errorBase);
      doc.text("ISSUE", M + 7, issueBoxTop + 4);
      renderText(item.issue, M + 7, issueBoxTop + 7.5, W - 18, {
        size: 8,
        color: C.n5,
        lineH: 3.8,
      });

      // How to fix box
      const fixBoxTop = issueBoxTop + issueBoxH + 2;
      const fixBoxH = fixH + 6;
      drawCard(doc, M + 4, fixBoxTop, W - 8, fixBoxH, {
        fill: C.awayLighter,
        border: C.awayLight,
        radius: 2,
      });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...C.awayBase);
      doc.text("HOW TO FIX", M + 7, fixBoxTop + 4);
      renderText(item.howToFix, M + 7, fixBoxTop + 7.5, W - 18, {
        size: 8,
        color: C.n5,
        lineH: 3.8,
      });

      y += cardH + 3;
    });

    y += 3;
  }

  // ════════════════════════════════════════════════════════════════
  // FULL ESSAY
  // ════════════════════════════════════════════════════════════════

  {
    ensureSpace(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.n4);
    doc.text("FULL STUDENT RESPONSE", M, y + 4);
    y += 10;

    // Just render the essay as flowing text inside a light card
    const essayH = measureText(essayText, W - 12, { size: 9, lineH: 4.5 }) + 10;
    // We can't draw one giant card if it spans multiple pages, so render
    // with a subtle left border instead.
    doc.setDrawColor(...C.n3);
    doc.setLineWidth(0.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.n5);
    const essayLines: string[] = doc.splitTextToSize(essayText, W - 12);
    for (const line of essayLines) {
      ensureSpace(5);
      // Left accent line
      doc.setDrawColor(...C.n3);
      doc.setLineWidth(0.5);
      doc.line(M, y - 2.5, M, y + 2);
      doc.text(line, M + 4, y);
      y += 4.5;
    }

    y += 4;
  }

  // ════════════════════════════════════════════════════════════════
  // FOOTER ON EVERY PAGE
  // ════════════════════════════════════════════════════════════════

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer line
    doc.setDrawColor(...C.n3);
    doc.setLineWidth(0.3);
    doc.line(M, pageH - 12, pageW - M, pageH - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.n4);
    doc.text(
      "EconGrader Pro  ·  AI-generated feedback — always verify with official mark schemes",
      M,
      pageH - 8
    );

    const pageNum = `${p} / ${totalPages}`;
    const pnW = doc.getTextWidth(pageNum);
    doc.text(pageNum, pageW - M - pnW, pageH - 8);
  }

  // ── Download ─────────────────────────────────────────────────

  const filename = generateFilename(question, result);
  doc.save(filename);
}
