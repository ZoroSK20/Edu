import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { paperId } = await request.json();

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: 'Missing paperId in request body.' }, 
        { status: 400 }
      );
    }

    // 1. Fetch the Paper record
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: { analyses: true }
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper not found.' }, 
        { status: 404 }
      );
    }

    // Clear existing analyses if they exist for this run
    if (paper.analyses.length > 0) {
      await prisma.paperAnalysis.deleteMany({ where: { paperId } });
    }

    // 2. Simulated Claude API Analysis
    // In production, we send the extracted text to Claude with a strict JSON prompt
    const simulatedClaudeResponse = [
      {
        questionNumber: 1,
        questionText: 'Explain React Server Components.',
        correctness: 'partial',
        missingConcepts: 'Hydration, Client Boundaries',
        errors: 'Missed detailing hydration.',
        confidence: 0.8,
      },
      {
        questionNumber: 2,
        questionText: 'Describe State Management.',
        correctness: 'incorrect',
        missingConcepts: 'Server State, React Context',
        errors: 'Confused client vs server state.',
        confidence: 0.4,
      }
    ];

    // 3. Create the PaperAnalysis records with the structured AI insights
    const newAnalyses = await prisma.$transaction(
      simulatedClaudeResponse.map((insight) =>
        prisma.paperAnalysis.create({
          data: {
            paperId,
            questionNumber: insight.questionNumber,
            questionText: insight.questionText,
            correctness: insight.correctness,
            missingConcepts: insight.missingConcepts,
            errors: insight.errors,
            confidence: insight.confidence,
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'AI paper analysis completed successfully.',
      data: newAnalyses
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during AI analysis.' }, 
      { status: 500 }
    );
  }
}
