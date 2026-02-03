import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MARK_SCHEMES } from "@/lib/constants";
import { buildGradingPrompt } from "@/lib/prompts";
import { GradeRequest, GradingResult, QuestionType } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: GradeRequest = await request.json();
    const { essay, question, questionType } = body;

    if (!essay || !question || !questionType) {
      return NextResponse.json(
        { error: "Missing required fields: essay, question, and questionType are required" },
        { status: 400 }
      );
    }

    const markScheme = MARK_SCHEMES[questionType as QuestionType];
    if (!markScheme) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      );
    }

    const prompt = buildGradingPrompt(essay, question, questionType, markScheme);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    let result: GradingResult;
    try {
      // Try to extract JSON from the response (handles potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse grading response" },
        { status: 500 }
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
        { status: 500 }
      );
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Failed to grade essay. Please try again." },
      { status: 500 }
    );
  }
}
