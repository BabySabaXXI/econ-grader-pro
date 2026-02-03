import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MARK_SCHEMES } from "@/lib/constants";
import { buildPlannerPrompt } from "@/lib/prompts";
import { PlanRequest, PlanResult, QuestionType } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();
    const { question, questionType, topic, includeDiagram } = body;

    if (!question || !questionType) {
      return NextResponse.json(
        { error: "Missing required fields: question and questionType are required" },
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

    const prompt = buildPlannerPrompt(
      question,
      questionType,
      markScheme.total,
      topic,
      includeDiagram
    );

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
    let result: PlanResult;
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
        { error: "Failed to parse planning response" },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (
      !result.thesis ||
      !Array.isArray(result.arguments) ||
      !Array.isArray(result.evaluations)
    ) {
      return NextResponse.json(
        { error: "Invalid response structure from planner" },
        { status: 500 }
      );
    }

    // Ensure diagram field exists
    if (!result.diagram) {
      result.diagram = "none";
    }
    if (!result.diagramExplanation) {
      result.diagramExplanation = "";
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Planning error:", error);
    return NextResponse.json(
      { error: "Failed to generate essay plan. Please try again." },
      { status: 500 }
    );
  }
}
