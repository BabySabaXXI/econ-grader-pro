import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDiagramById, QUESTION_DIAGRAM_MARKS } from '@/lib/diagrams';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      imageData,
      expectedDiagramId,
      questionType,
      questionContext
    } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required (base64 encoded)' },
        { status: 400 }
      );
    }

    // Get expected diagram details if provided
    const expectedDiagram = expectedDiagramId ? getDiagramById(expectedDiagramId) : null;

    // Get marks available for this question type
    const marksInfo = QUESTION_DIAGRAM_MARKS[questionType] || { marks: 4, recommended: true };
    const maxMarks = marksInfo.marks;

    // Build the grading prompt
    const systemPrompt = buildGradingSystemPrompt(expectedDiagram, maxMarks);
    const userPrompt = buildGradingUserPrompt(expectedDiagram, questionContext);

    // Call Claude Vision to analyze the diagram
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageData.replace(/^data:image\/\w+;base64,/, '')
              }
            },
            {
              type: 'text',
              text: userPrompt
            }
          ]
        }
      ]
    });

    // Parse the response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Try to parse as JSON
    let gradingResult;
    try {
      // Find JSON in response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gradingResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback if parsing fails
      gradingResult = {
        identifiedDiagram: 'Unknown',
        confidence: 50,
        scores: {
          axes: { score: 0, max: 1, feedback: 'Unable to parse response' },
          curves: { score: 0, max: 2, feedback: 'Unable to parse response' },
          labels: { score: 0, max: 1, feedback: 'Unable to parse response' },
          equilibrium: { score: 0, max: 1, feedback: 'Unable to parse response' },
          overall: { score: 0, max: maxMarks, percentage: 0 }
        },
        strengths: [],
        improvements: ['Unable to analyze diagram - please try again'],
        examinerComment: responseText.substring(0, 500)
      };
    }

    return NextResponse.json({
      success: true,
      expectedDiagram: expectedDiagram ? {
        id: expectedDiagram.id,
        name: expectedDiagram.name
      } : null,
      maxMarks,
      grading: gradingResult
    });
  } catch (error) {
    console.error('Diagram grading error:', error);
    return NextResponse.json(
      { error: 'Failed to grade diagram' },
      { status: 500 }
    );
  }
}

function buildGradingSystemPrompt(expectedDiagram: any, maxMarks: number): string {
  let prompt = `You are an expert Edexcel IAL Economics examiner grading student-drawn diagrams.

Your task is to analyze the uploaded diagram image and grade it according to Edexcel mark scheme criteria.

GRADING CRITERIA (Total: ${maxMarks} marks):

1. AXES (1 mark):
   - Correctly labelled Y-axis (Price/Cost/Wage etc.)
   - Correctly labelled X-axis (Quantity/Output/Labour etc.)
   - Arrows indicating positive direction

2. CURVES (2 marks):
   - Correct slope direction (demand downward, supply upward, etc.)
   - Curves properly labelled
   - Correct positioning relative to each other

3. LABELS (1 mark):
   - Equilibrium price/quantity marked
   - Key points labelled (E, Pe, Qe, etc.)
   - Shift arrows if applicable

4. EQUILIBRIUM/KEY FEATURES (1-2 marks):
   - Correct intersection point
   - Dotted lines to axes
   - Relevant areas shaded (surplus, DWL, etc.)
   - Correct shift direction if applicable`;

  if (expectedDiagram) {
    prompt += `

EXPECTED DIAGRAM: ${expectedDiagram.name}
${expectedDiagram.description}

SPECIFIC CRITERIA FOR THIS DIAGRAM:
- Axes: ${expectedDiagram.gradingCriteria?.axes?.join(', ') || 'Standard axes'}
- Curves: ${expectedDiagram.gradingCriteria?.curves?.join(', ') || 'Standard curves'}
- Labels: ${expectedDiagram.gradingCriteria?.labels?.join(', ') || 'Standard labels'}
- Equilibrium: ${expectedDiagram.gradingCriteria?.equilibrium?.join(', ') || 'Standard equilibrium'}

KEY FEATURES TO CHECK:
${expectedDiagram.keyFeatures?.map((f: string) => `- ${f}`).join('\n') || 'Standard features'}

COMMON MISTAKES TO LOOK FOR:
${expectedDiagram.commonMistakes?.map((m: string) => `- ${m}`).join('\n') || 'Common errors'}`;
  }

  prompt += `

RESPONSE FORMAT:
Return ONLY a JSON object with this structure:
{
  "identifiedDiagram": "Name of the diagram you identified",
  "confidence": 0-100,
  "scores": {
    "axes": { "score": 0-1, "max": 1, "feedback": "Specific feedback" },
    "curves": { "score": 0-2, "max": 2, "feedback": "Specific feedback" },
    "labels": { "score": 0-1, "max": 1, "feedback": "Specific feedback" },
    "equilibrium": { "score": 0-${maxMarks - 4}, "max": ${maxMarks - 4}, "feedback": "Specific feedback" },
    "overall": { "score": total, "max": ${maxMarks}, "percentage": percentage }
  },
  "strengths": ["What the student did well"],
  "improvements": ["Specific improvements needed"],
  "correctionsNeeded": ["Critical errors to fix"],
  "examinerComment": "Overall assessment in examiner voice"
}`;

  return prompt;
}

function buildGradingUserPrompt(expectedDiagram: any, questionContext?: string): string {
  let prompt = 'Please analyze and grade this student-drawn economics diagram.';

  if (expectedDiagram) {
    prompt += `\n\nThis should be a ${expectedDiagram.name} diagram.`;
  }

  if (questionContext) {
    prompt += `\n\nQuestion context: ${questionContext}`;
  }

  prompt += '\n\nProvide your grading in the specified JSON format.';

  return prompt;
}
