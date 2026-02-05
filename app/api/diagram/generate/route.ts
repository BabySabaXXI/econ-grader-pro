import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ALL_DIAGRAMS } from "@/lib/diagrams/database";
import { DiagramTemplate } from "@/lib/diagrams/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build a concise catalog of available diagrams for Claude
function buildDiagramCatalog(): string {
  return ALL_DIAGRAMS.map(
    (d) =>
      `- id: "${d.id}" | name: "${d.name}" | category: ${d.category} | unit: ${d.unit} | keywords: ${d.keywords.slice(0, 5).join(", ")}`
  ).join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, questionType, planThesis, diagramType, diagramExplanation } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Missing required field: question" },
        { status: 400 }
      );
    }

    const catalog = buildDiagramCatalog();

    const prompt = `You are an expert Edexcel IAL Economics diagram analyst. Your task is to analyze the student's essay question and plan, then select the BEST matching economics diagram from the database and specify any shifts or modifications needed.

## Essay Question
${question}

## Question Type
${questionType || "evaluate-20"}

${planThesis ? `## Plan Thesis\n${planThesis}` : ""}
${diagramType ? `## Suggested Diagram Type\n${diagramType}` : ""}
${diagramExplanation ? `## Diagram Context\n${diagramExplanation}` : ""}

## Available Diagrams Database
${catalog}

## Your Task
1. Analyze the economics topic and what diagram would best support the essay
2. Select the BEST diagram ID from the database above
3. Determine if any curve shifts are needed for the specific question context
4. Provide custom axis labels and annotations specific to this question

Respond with ONLY valid JSON in this exact format:
{
  "selectedDiagramId": "the-diagram-id",
  "reasoning": "Why this diagram is the best choice for this question",
  "customTitle": "A title specific to this question context (e.g. 'Impact of FDI on Labour Market')",
  "shifts": [
    {
      "description": "e.g. 'Demand shifts right from D1 to D2 due to increased FDI'",
      "curveId": "the curve id to shift (from the template)",
      "direction": "right|left|up|down",
      "label": "New curve label e.g. D2"
    }
  ],
  "customLabels": [
    { "text": "Custom label text", "position": "top-left|top-right|bottom-left|bottom-right|center" }
  ],
  "annotations": [
    "Key point 1 to annotate on diagram",
    "Key point 2"
  ],
  "examRelevance": "How this diagram earns marks in the exam context"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse Claude's JSON response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      analysis = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse diagram analysis:", responseText);
      return NextResponse.json(
        { error: "Failed to parse diagram analysis" },
        { status: 500 }
      );
    }

    // Look up the selected diagram template
    const selectedTemplate = ALL_DIAGRAMS.find(
      (d) => d.id === analysis.selectedDiagramId
    );

    if (!selectedTemplate) {
      // Fallback: try to find by keyword match
      const fallback = findBestFallback(question, diagramType);
      if (fallback) {
        return NextResponse.json({
          success: true,
          diagram: fallback,
          analysis: {
            ...analysis,
            selectedDiagramId: fallback.id,
            reasoning: analysis.reasoning || "Matched by topic keywords",
          },
        });
      }
      return NextResponse.json(
        { error: "Could not find matching diagram template" },
        { status: 404 }
      );
    }

    // Apply shifts to create a customized diagram
    const customizedDiagram = applyShifts(selectedTemplate, analysis.shifts || []);

    return NextResponse.json({
      success: true,
      diagram: customizedDiagram,
      analysis: {
        selectedDiagramId: analysis.selectedDiagramId,
        reasoning: analysis.reasoning,
        customTitle: analysis.customTitle,
        shifts: analysis.shifts || [],
        annotations: analysis.annotations || [],
        examRelevance: analysis.examRelevance,
        customLabels: analysis.customLabels || [],
      },
    });
  } catch (error) {
    console.error("Diagram generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate diagram. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Apply shifts to a diagram template, creating new shifted curves
 */
function applyShifts(
  template: DiagramTemplate,
  shifts: Array<{
    curveId: string;
    direction: string;
    label: string;
    description: string;
  }>
): DiagramTemplate {
  if (!shifts || shifts.length === 0) return template;

  const newCurves = [...template.curves];
  const newPoints = [...template.points];
  const newLabels = [...template.labels];

  for (const shift of shifts) {
    const originalCurve = template.curves.find((c) => c.id === shift.curveId);
    if (!originalCurve) continue;

    // Calculate shift offset based on direction
    const offset = 40; // pixels to shift
    const dx =
      shift.direction === "right"
        ? offset
        : shift.direction === "left"
          ? -offset
          : 0;
    const dy =
      shift.direction === "down"
        ? offset
        : shift.direction === "up"
          ? -offset
          : 0;

    // Create shifted curve
    const shiftedCurve = {
      ...originalCurve,
      id: `${originalCurve.id}-shifted`,
      name: shift.label || `${originalCurve.name}'`,
      points: originalCurve.points.map((p) => ({
        x: Math.max(50, Math.min(250, p.x + dx)),
        y: Math.max(50, Math.min(250, p.y + dy)),
      })),
      color: darkenColor(originalCurve.color),
      strokeWidth: (originalCurve.strokeWidth || 2),
    };

    // Make original curve dashed to show it was the "before" state
    const dashedOriginal = {
      ...originalCurve,
      type: "dashed" as const,
      strokeWidth: 1.5,
    };

    // Replace original with dashed version and add shifted curve
    const idx = newCurves.findIndex((c) => c.id === originalCurve.id);
    if (idx !== -1) {
      newCurves[idx] = dashedOriginal;
    }
    newCurves.push(shiftedCurve);

    // Add label for new curve
    const lastPoint = shiftedCurve.points[shiftedCurve.points.length - 1];
    newLabels.push({
      text: shift.label || `${originalCurve.name}'`,
      x: Math.min(270, lastPoint.x + 5),
      y: lastPoint.y,
      anchor: "start",
      fontSize: 12,
    });

    // Find new equilibrium point if there's a shifted curve intersecting with another
    const otherCurves = newCurves.filter(
      (c) =>
        c.id !== shiftedCurve.id &&
        c.id !== dashedOriginal.id &&
        c.type !== "dashed"
    );
    for (const other of otherCurves) {
      const intersection = findIntersection(shiftedCurve, other);
      if (intersection) {
        newPoints.push({
          id: `e-new-${shift.curveId}`,
          x: intersection.x,
          y: intersection.y,
          label: `E${newPoints.length + 1}`,
          description: shift.description,
        });
        break;
      }
    }
  }

  return {
    ...template,
    curves: newCurves,
    points: newPoints,
    labels: newLabels,
  };
}

/**
 * Find intersection of two line-segment curves
 */
function findIntersection(
  curve1: { points: { x: number; y: number }[] },
  curve2: { points: { x: number; y: number }[] }
): { x: number; y: number } | null {
  if (curve1.points.length < 2 || curve2.points.length < 2) return null;

  const a1 = curve1.points[0];
  const a2 = curve1.points[curve1.points.length - 1];
  const b1 = curve2.points[0];
  const b2 = curve2.points[curve2.points.length - 1];

  const denom =
    (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
  if (Math.abs(denom) < 0.001) return null; // Parallel lines

  const t =
    ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / denom;

  const x = a1.x + t * (a2.x - a1.x);
  const y = a1.y + t * (a2.y - a1.y);

  // Check if intersection is within the diagram bounds
  if (x >= 45 && x <= 255 && y >= 45 && y <= 255) {
    return { x: Math.round(x), y: Math.round(y) };
  }
  return null;
}

/**
 * Darken a hex color for shifted curves
 */
function darkenColor(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - 30);
  const g = Math.max(0, ((num >> 8) & 0xff) - 30);
  const b = Math.max(0, (num & 0xff) - 30);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Fallback: find a diagram by keyword matching
 */
function findBestFallback(
  question: string,
  diagramType?: string
): DiagramTemplate | null {
  const text = `${question} ${diagramType || ""}`.toLowerCase();

  // Direct type matches
  const typeMap: Record<string, string> = {
    "ad-as": "ad-as-basic",
    "ad/as": "ad-as-basic",
    "aggregate demand": "ad-shift-right",
    "aggregate supply": "sras-shift-left",
    "supply-demand": "supply-demand-basic",
    "supply and demand": "supply-demand-basic",
    monopoly: "monopoly-equilibrium",
    externality: "negative-externality-production",
    "negative externality": "negative-externality-production",
    "positive externality": "positive-externality-consumption",
    "labour market": "labour-market-basic",
    "labor market": "labour-market-basic",
    tariff: "tariff-diagram",
    quota: "quota-diagram",
    "exchange rate": "exchange-rate-floating",
    "phillips curve": "phillips-curve-sr",
    ppf: "ppf-basic",
    "production possibility": "ppf-basic",
    subsidy: "subsidy",
    tax: "indirect-tax",
    "minimum wage": "minimum-wage",
    "price ceiling": "maximum-price",
    "price floor": "minimum-price",
  };

  for (const [keyword, diagramId] of Object.entries(typeMap)) {
    if (text.includes(keyword)) {
      return ALL_DIAGRAMS.find((d) => d.id === diagramId) || null;
    }
  }

  return null;
}
