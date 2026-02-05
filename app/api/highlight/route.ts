import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface HighlightSpan {
  start: number;
  end: number;
  type: "earned" | "lost";
  ao: "ao1" | "ao2" | "ao3" | "ao4";
  points?: number;
  reason?: string;
  issue?: string;
  howToFix?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { essay, marksEarned, marksLost } = body;

    if (!essay) {
      return NextResponse.json(
        { error: "Missing required field: essay" },
        { status: 400 }
      );
    }

    // Build a prompt that asks Claude to find exact character positions
    // for each mark earned/lost quote in the essay text
    const allMarks = [
      ...(marksEarned || []).map((m: Record<string, unknown>, i: number) => ({
        id: `earned-${i}`,
        type: "earned" as const,
        quote: m.quote as string,
        ao: m.ao as string,
        points: m.points as number,
        reason: m.reason as string,
      })),
      ...(marksLost || []).map((m: Record<string, unknown>, i: number) => ({
        id: `lost-${i}`,
        type: "lost" as const,
        quote: m.quote as string,
        ao: m.ao as string,
        issue: m.issue as string,
        howToFix: m.howToFix as string,
      })),
    ];

    if (allMarks.length === 0) {
      return NextResponse.json({ highlights: [] });
    }

    const prompt = `You are a precise text-matching assistant. Given an essay and a list of quotes, find the EXACT character position (start and end index) of each quote within the essay.

IMPORTANT RULES:
1. Character indices are 0-based
2. If a quote doesn't match exactly, find the closest matching substring in the essay (the quote may be slightly paraphrased or truncated by the grader)
3. Use fuzzy matching - look for the phrase in the essay that most closely corresponds to each quote
4. Spans must NOT overlap. If two spans would overlap, keep the first one and skip the second
5. Return valid JSON only

## Essay Text (${essay.length} characters):
${essay}

## Quotes to find:
${allMarks.map((m, i) => `${i}. [${m.id}] "${m.quote}"`).join("\n")}

Respond with ONLY valid JSON array:
[
  { "id": "earned-0", "start": 45, "end": 112 },
  { "id": "lost-0", "start": 230, "end": 285 }
]

If a quote cannot be found at all, omit it from the results. Return the matches sorted by start position.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let positions: Array<{ id: string; start: number; end: number }>;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      positions = JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback: do client-side matching
      return NextResponse.json({ highlights: [], fallback: true });
    }

    // Build highlight spans with full data
    const highlights: HighlightSpan[] = [];
    let lastEnd = 0;

    // Sort by start position
    positions.sort((a, b) => a.start - b.start);

    for (const pos of positions) {
      // Validate bounds
      if (
        pos.start < 0 ||
        pos.end > essay.length ||
        pos.start >= pos.end ||
        pos.start < lastEnd
      ) {
        continue;
      }

      const mark = allMarks.find((m) => m.id === pos.id);
      if (!mark) continue;

      if (mark.type === "earned") {
        highlights.push({
          start: pos.start,
          end: pos.end,
          type: "earned",
          ao: mark.ao as HighlightSpan["ao"],
          points: mark.points,
          reason: mark.reason,
        });
      } else {
        highlights.push({
          start: pos.start,
          end: pos.end,
          type: "lost",
          ao: mark.ao as HighlightSpan["ao"],
          issue: mark.issue,
          howToFix: mark.howToFix,
        });
      }

      lastEnd = pos.end;
    }

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Highlight analysis error:", error);
    return NextResponse.json({ highlights: [], fallback: true });
  }
}
