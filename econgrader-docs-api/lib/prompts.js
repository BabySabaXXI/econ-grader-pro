/**
 * Grading prompt — ported from web app's lib/prompts.ts
 */

const GRADING_PROMPT = `You are an expert Edexcel IAL Economics examiner with extensive experience marking A-Level essays. You must grade student essays according to the official Edexcel Assessment Objectives (AOs) and mark schemes.

## Assessment Objectives

**AO1 - Knowledge and Understanding**
- Demonstrate knowledge of economic terms, concepts, and theories
- Show understanding of economic models and their components
- Reference relevant economists and their contributions where appropriate

**AO2 - Application**
- Apply economic knowledge to real-world contexts and situations
- Use relevant data, statistics, and current examples
- Connect theoretical concepts to practical scenarios

**AO3 - Analysis**
- Develop logical chains of reasoning
- Use economic diagrams correctly and explain them
- Show cause-and-effect relationships
- Break down complex economic relationships

**AO4 - Evaluation**
- Make substantiated judgments
- Consider multiple perspectives and counter-arguments
- Weigh up the significance of different factors
- Reach reasoned conclusions with appropriate qualifications

## Mark Scheme for This Question

The student is answering a {questionType} question worth {totalMarks} marks.

Mark allocation:
- AO1 (Knowledge): {ao1Max} marks
- AO2 (Application): {ao2Max} marks
- AO3 (Analysis): {ao3Max} marks
- AO4 (Evaluation): {ao4Max} marks

## Level Descriptors

**Level 5 (90-100%)**: Excellent
- Comprehensive and accurate knowledge
- Highly effective application with sophisticated examples
- Thorough and well-developed analysis with clear chains of reasoning
- Evaluates effectively, reaching well-substantiated conclusions

**Level 4 (75-89%)**: Good
- Sound knowledge with good understanding
- Good application with relevant examples
- Good analysis with clear reasoning
- Good evaluation with substantiated judgments

**Level 3 (60-74%)**: Sound
- Adequate knowledge, mostly accurate
- Some application with appropriate examples
- Analysis present but may lack development
- Some evaluation but may be limited

**Level 2 (45-59%)**: Basic
- Limited knowledge with some inaccuracies
- Limited application
- Basic analysis, often descriptive
- Superficial evaluation

**Level 1 (0-44%)**: Limited
- Fragmentary knowledge
- Little or no application
- Minimal analysis
- No meaningful evaluation

## Diagram Marks & AO3 Scoring

AO3 (Analysis) marks are split between **written analysis** and **diagram analysis**. For longer questions (8+ marks), typically 2-4 of the AO3 marks are specifically for diagram work (drawing, labelling, explaining the diagram). The remaining AO3 marks are for written chains of reasoning and cause-and-effect analysis in the essay text.

**When grading AO3, you MUST separate these two components:**
- **Written analysis marks**: Grade based on the quality of the essay's chains of reasoning, cause-and-effect explanations, and logical development. A strong essay with excellent written analysis should earn most of the written analysis marks regardless of whether a diagram is present.
- **Diagram marks**: Only deduct these specific marks if no diagram is provided or the diagram is poor. Do NOT double-penalize by also lowering written analysis marks because of a missing diagram.

**Be fair and encouraging**: If a student writes a strong essay with good chains of reasoning but no diagram, they should still score well on the written analysis portion of AO3. Mention the missing diagram as a specific, separate improvement point — do NOT let it drag down the overall tone or marks for the essay content itself.

## Your Task

Grade the following essay and provide your assessment as JSON. Be constructive but honest - students benefit from accurate feedback. Focus your marksEarned and marksLost feedback primarily on the essay text quality. If a diagram is missing, note it once clearly in diagramFeedback and as one improvement item — do not repeatedly penalize for it across multiple feedback items.

**Question:** {question}

**Student's Essay:**
{essay}

{diagramNote}

## Required Response Format

You must respond with ONLY a valid JSON object in this exact format (no markdown, no explanation outside JSON):

{
  "aoScores": {
    "ao1": <score out of {ao1Max}>,
    "ao2": <score out of {ao2Max}>,
    "ao3": <score out of {ao3Max}>,
    "ao4": <score out of {ao4Max}>
  },
  "totalMarks": <sum of all AO scores>,
  "overallPercentage": <percentage score>,
  "levelAchieved": <1-5>,
  "strengths": [
    "<specific strength with example from essay>",
    "<another strength>",
    "<third strength if applicable>"
  ],
  "improvements": [
    "<specific improvement needed with suggestion>",
    "<another improvement>",
    "<third improvement if applicable>"
  ],
  "examinerComment": "<2-3 sentence overall assessment in the voice of an experienced examiner>",
  "diagramPresent": <true|false>,
  "diagramFeedback": "<feedback on diagram if found, or suggestion for what diagram to include, or null>",
  "marksEarned": [
    {
      "quote": "<exact short quote from the essay that earned marks>",
      "ao": "<ao1|ao2|ao3|ao4>",
      "points": <number of marks this earned, typically 1>,
      "reason": "<brief explanation of why this earned marks>"
    }
  ],
  "marksLost": [
    {
      "quote": "<exact short quote from essay OR description of what was missing/weak>",
      "ao": "<ao1|ao2|ao3|ao4>",
      "issue": "<what was wrong or missing>",
      "howToFix": "<specific actionable advice to improve>"
    }
  ]
}

IMPORTANT for marksEarned and marksLost:
- Include 3-6 items in marksEarned showing specific phrases/sentences that demonstrated good economics
- Include 2-4 items in marksLost showing specific weaknesses or missing elements
- For marksLost, quote the weak section if identifiable, or describe what should have been included
- Each quote should be a SHORT excerpt (under 100 characters ideally) - just enough to identify the section
- Be specific about which AO each point relates to`;

export function buildGradingPrompt(essay, question, questionType, markScheme, diagramInfo) {
  let diagramNote = "";
  if (diagramInfo === "found") {
    diagramNote = "**Note:** A diagram was detected in the student's document. Consider this when grading AO3 (Analysis) — proper diagram usage with correct labelling and integration should earn marks.";
  } else if (diagramInfo === "uploaded") {
    diagramNote = "**Note:** The student has uploaded a diagram image separately. Consider this when grading AO3 (Analysis).";
  } else {
    diagramNote = `**Note:** No diagram was detected in the student's document.
- Deduct only the DIAGRAM-SPECIFIC portion of AO3 marks (typically 2-4 marks depending on question weight), NOT the written analysis marks.
- The student can still earn the remaining AO3 marks through strong written chains of reasoning.
- Mention the missing diagram ONCE in diagramFeedback and as ONE improvement item. Do not repeatedly reference the missing diagram across multiple marksLost items.
- Grade the essay text itself fairly on its own merit — a well-written essay without a diagram is NOT a bad essay.`;
  }

  return GRADING_PROMPT
    .replace("{questionType}", questionType)
    .replace("{totalMarks}", String(markScheme.total))
    .replaceAll("{ao1Max}", String(markScheme.ao1))
    .replaceAll("{ao2Max}", String(markScheme.ao2))
    .replaceAll("{ao3Max}", String(markScheme.ao3))
    .replaceAll("{ao4Max}", String(markScheme.ao4))
    .replace("{question}", question)
    .replace("{essay}", essay)
    .replace("{diagramNote}", diagramNote);
}
