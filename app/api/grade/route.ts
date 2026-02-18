import { NextRequest, NextResponse } from "next/server";
import { MARK_SCHEMES } from "@/lib/constants";
import { buildGradingPrompt } from "@/lib/prompts";
import { GradeRequest, GradingResult, QuestionType } from "@/lib/types";

// CORS headers for Chrome extension access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body: GradeRequest = await request.json();
    const { essay, question, questionType, diagramInfo } = body;

    if (!essay || !question || !questionType) {
      return NextResponse.json(
        { error: "Missing required fields: essay, question, and questionType are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const markScheme = MARK_SCHEMES[questionType as QuestionType];
    if (!markScheme) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400, headers: corsHeaders }
      );
    }

    const prompt = buildGradingPrompt(essay, question, questionType, markScheme, diagramInfo || "none");

    // Call Anthropic API directly via fetch (no SDK dependency)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", anthropicResponse.status, errText);
      return NextResponse.json(
        { error: `Anthropic API error (${anthropicResponse.status}): ${errText.substring(0, 200)}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const message = await anthropicResponse.json();
    const responseText = message.content?.[0]?.type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    let result: GradingResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText.substring(0, 500));
      return NextResponse.json(
        { error: "Failed to parse grading response" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate the response structure
    if (
      !result.aoScores ||
      typeof result.totalMarks !== "number" ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.improvements)
    ) {
      return NextResponse.json(
        { error: "Invalid response structure from grading" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Ensure marksEarned and marksLost are arrays
    if (!Array.isArray(result.marksEarned)) {
      result.marksEarned = [];
    }
    if (!Array.isArray(result.marksLost)) {
      result.marksLost = [];
    }

    // Ensure scores don't exceed maximums
    result.aoScores.ao1 = Math.min(result.aoScores.ao1 || 0, markScheme.ao1);
    result.aoScores.ao2 = Math.min(result.aoScores.ao2 || 0, markScheme.ao2);
    result.aoScores.ao3 = Math.min(result.aoScores.ao3 || 0, markScheme.ao3);
    result.aoScores.ao4 = Math.min(result.aoScores.ao4 || 0, markScheme.ao4);

    // Recalculate total and percentage
    result.totalMarks =
      result.aoScores.ao1 +
      result.aoScores.ao2 +
      result.aoScores.ao3 +
      result.aoScores.ao4;
    result.overallPercentage = Math.round(
      (result.totalMarks / markScheme.total) * 100
    );

    // Attach mark scheme for the client
    result.markScheme = markScheme;

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: unknown) {
    console.error("Grading error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Grading failed: ${msg}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
