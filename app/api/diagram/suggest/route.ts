import { NextResponse } from 'next/server';
import {
  identifyDiagrams,
  suggestDiagramsForPlan,
  getDiagramById,
  getDiagramsForTopic,
  QUESTION_DIAGRAM_MARKS
} from '@/lib/diagrams';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, questionType, topic, mode = 'suggest' } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    // Get diagram marks info for the question type
    const marksInfo = QUESTION_DIAGRAM_MARKS[questionType] || { marks: 0, recommended: false };

    if (mode === 'identify') {
      // Simple identification - just find matching diagrams
      const matches = identifyDiagrams(question, 5);

      return NextResponse.json({
        success: true,
        matches,
        marksAvailable: marksInfo.marks,
        diagramRecommended: marksInfo.recommended
      });
    }

    // Full suggestion mode - get detailed suggestions for planning
    const suggestions = suggestDiagramsForPlan(question, questionType, topic);

    // Get the primary recommended diagram with full details
    const primaryDiagram = suggestions.length > 0 ? suggestions[0] : null;

    // Build response
    const response: any = {
      success: true,
      marksAvailable: marksInfo.marks,
      diagramRecommended: marksInfo.recommended,
      suggestions: suggestions.map(s => ({
        id: s.diagram.id,
        name: s.diagram.name,
        relevanceScore: s.relevanceScore,
        reasoning: s.reasoning,
        usage: s.usage,
        unit: s.diagram.unit,
        category: s.diagram.category,
        difficulty: s.diagram.difficulty
      }))
    };

    // Add primary diagram details if available
    if (primaryDiagram) {
      response.primaryDiagram = {
        id: primaryDiagram.diagram.id,
        name: primaryDiagram.diagram.name,
        description: primaryDiagram.diagram.description,
        keyFeatures: primaryDiagram.diagram.keyFeatures,
        examTips: primaryDiagram.diagram.examTips,
        commonMistakes: primaryDiagram.diagram.commonMistakes,
        gradingCriteria: primaryDiagram.diagram.gradingCriteria,
        axis: primaryDiagram.diagram.axis,
        relevanceScore: primaryDiagram.relevanceScore,
        usage: primaryDiagram.usage
      };
    }

    // Also suggest topic-based diagrams if topic provided
    if (topic) {
      const topicDiagrams = getDiagramsForTopic(topic).slice(0, 3);
      response.topicDiagrams = topicDiagrams.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Diagram suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest diagrams' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const topic = searchParams.get('topic');

  try {
    if (id) {
      // Get specific diagram by ID
      const diagram = getDiagramById(id);
      if (!diagram) {
        return NextResponse.json(
          { error: 'Diagram not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, diagram });
    }

    if (topic) {
      // Get diagrams for topic
      const diagrams = getDiagramsForTopic(topic);
      return NextResponse.json({
        success: true,
        topic,
        diagrams: diagrams.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          category: d.category,
          unit: d.unit
        }))
      });
    }

    return NextResponse.json(
      { error: 'Provide either id or topic parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Diagram fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diagram' },
      { status: 500 }
    );
  }
}
