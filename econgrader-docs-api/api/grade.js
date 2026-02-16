import Anthropic from "@anthropic-ai/sdk";
import { MARK_SCHEMES, VALID_QUESTION_TYPES } from "../lib/constants.js";
import { buildGradingPrompt } from "../lib/prompts.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const { essay, question, questionType, diagramInfo, diagramBase64 } = req.body;

    // Validate required fields
    if (!essay || !question || !questionType) {
      return res.status(400).json({
        error: "Missing required fields: essay, question, and questionType",
      });
    }

    if (!VALID_QUESTION_TYPES.includes(questionType)) {
      return res.status(400).json({ error: "Invalid question type: " + questionType });
    }

    const markScheme = MARK_SCHEMES[questionType];
    const prompt = buildGradingPrompt(essay, question, questionType, markScheme, diagramInfo || "none");

    // Build message content — optionally include diagram image
    const content = [{ type: "text", text: prompt }];

    if (diagramBase64) {
      const match = diagramBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: match[1],
            data: match[2],
          },
        });
        content.push({
          type: "text",
          text: "The above image is the student's diagram. Please evaluate its accuracy, labelling, and integration with the essay when grading AO3.",
        });
      }
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse grading response from AI" });
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ error: "Invalid JSON in grading response" });
    }

    // Validate structure
    if (!result.aoScores || typeof result.totalMarks !== "number") {
      return res.status(500).json({ error: "Invalid response structure from grading" });
    }

    // Ensure arrays exist
    if (!Array.isArray(result.marksEarned)) result.marksEarned = [];
    if (!Array.isArray(result.marksLost)) result.marksLost = [];
    if (!Array.isArray(result.strengths)) result.strengths = [];
    if (!Array.isArray(result.improvements)) result.improvements = [];

    // Cap scores at maximums
    result.aoScores.ao1 = Math.min(result.aoScores.ao1 || 0, markScheme.ao1);
    result.aoScores.ao2 = Math.min(result.aoScores.ao2 || 0, markScheme.ao2);
    result.aoScores.ao3 = Math.min(result.aoScores.ao3 || 0, markScheme.ao3);
    result.aoScores.ao4 = Math.min(result.aoScores.ao4 || 0, markScheme.ao4);

    // Recalculate totals
    result.totalMarks =
      result.aoScores.ao1 + result.aoScores.ao2 +
      result.aoScores.ao3 + result.aoScores.ao4;
    result.overallPercentage = Math.round(
      (result.totalMarks / markScheme.total) * 100
    );

    // Attach mark scheme for the client
    result.markScheme = markScheme;

    return res.status(200).json(result);
  } catch (error) {
    console.error("Grading error:", error);

    if (error?.status === 401) {
      return res.status(500).json({ error: "API key configuration error" });
    }
    if (error?.status === 429) {
      return res.status(429).json({ error: "Rate limited — please wait a moment and try again" });
    }

    return res.status(500).json({
      error: "Failed to grade essay. Please try again.",
    });
  }
}
