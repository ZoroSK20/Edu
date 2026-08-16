import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { paperId, studentId, courseId } = await request.json();

    if (!paperId || !studentId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required routing IDs.' },
        { status: 400 }
      );
    }

    // 1. Fetch the Paper and all its PaperAnalysis question rows
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { analyses: true }
    });

    const analyses = paper?.analyses || [];
    if (analyses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No AI analysis found for this paper to map.' },
        { status: 404 }
      );
    }

    // Parse the feedback to extract missing concepts from each question row
    const missingConcepts: string[] = [];
    for (const analysis of analyses) {
      if (analysis.missingConcepts) {
        // Split by comma in case multiple concepts are stored in one field
        const concepts = analysis.missingConcepts.split(',').map((c) => c.trim());
        missingConcepts.push(...concepts);
      }
    }

    if (missingConcepts.length === 0) {
      return NextResponse.json({ success: true, message: 'No missing concepts to map.' });
    }

    // 2. Fetch valid Course Topics to enforce the strict mapping rule
    const validTopics = await prisma.courseTopic.findMany({
      where: { courseId: courseId }
    });

    // 3. Simulate AI Topic Mapping
    // In production, we prompt Claude: "Map these missing concepts strictly to the provided valid topic IDs."
    // We will simulate finding a match for the first missing concept to a random valid topic for testing.
    const mappedInsights = [];
    if (validTopics.length > 0) {
      const targetTopic = validTopics[0]; // Simulating a successful mapping

      mappedInsights.push({
        studentId,
        topicId: targetTopic.id,
        kind: 'SKILL_GAP',
        confidence: 0.89,
        content: `Identified gap in ${targetTopic.title} based on missing concept(s): ${missingConcepts.slice(0, 2).join(', ')}. Review the relevant modules.`,
        sourceDataRef: paperId,
      });
    }

    // 4. Save the Insights to the database
    if (mappedInsights.length > 0) {
      await prisma.aIInsight.createMany({
        data: mappedInsights
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Topic mapping complete. AI Insights generated successfully.',
      data: mappedInsights
    });

  } catch (error) {
    console.error('Topic Mapping Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during topic mapping.' },
      { status: 500 }
    );
  }
}
