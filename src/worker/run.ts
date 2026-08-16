import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});
const useMockAI = !process.env.ANTHROPIC_API_KEY;

async function processOCRExtraction(jobId: string, payload: any) {
  const { paperId, fileUrl } = payload;
  if (!paperId) throw new Error("Missing paperId in payload");

  // Fetch the paper details to associate insights correctly
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: {
      exam: { include: { course: { include: { topics: true } } } },
      uploadedBy: true
    }
  });

  if (!paper) throw new Error("Paper not found");

  const topics = paper.exam?.course?.topics || [];
  const firstTopicId = topics.length > 0 ? topics[0].id : null;

  let analyses = [];
  let insights = [];

  if (useMockAI) {
    // Simulated AI Processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    analyses = [
      {
        questionNumber: 1,
        questionText: "Simulated extracted question text.",
        correctness: "partial",
        missingConcepts: "Simulated missing concept",
        errors: "Calculation error",
        suggestions: "Review chapter 4",
        confidence: 0.85,
        topicId: firstTopicId
      }
    ];
    insights = [
      {
        studentId: paper.uploadedById,
        topicId: firstTopicId,
        kind: "WEAK_TOPIC",
        content: "Student shows fundamental gaps in this simulated topic.",
        confidence: 0.88
      }
    ];
  } else {
    // Real Anthropic Processing (Vision/OCR on the document URL)
    // NOTE: In a real implementation we would fetch the document Buffer from S3 and pass it to Claude Vision.
    // For this boilerplate, we'll prompt Claude with text indicating we want a JSON output matching our schema.
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are an AI grader. Extract questions, analyze correctness, and output valid JSON matching the schema.",
      messages: [
        { role: "user", content: `Please analyze the exam paper located at: ${fileUrl}. Return JSON format with "analyses" and "insights" arrays.` }
      ]
    });
    
    try {
      // Very naive JSON parsing of Claude's response for demonstration
      const text = (msg.content[0] as any).text;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
        analyses = parsed.analyses || [];
        insights = parsed.insights || [];
      }
    } catch(e) {
      console.error("Failed to parse Claude output", e);
    }
  }

  // Save results to DB
  await prisma.$transaction(async (tx) => {
    for (const a of analyses) {
      if (a.topicId) {
        await tx.paperAnalysis.create({
          data: {
            paperId: paper.id,
            questionNumber: a.questionNumber,
            questionText: a.questionText,
            correctness: a.correctness,
            missingConcepts: a.missingConcepts,
            errors: a.errors,
            suggestions: a.suggestions,
            confidence: a.confidence,
            topicId: a.topicId
          }
        });
      }
    }

    for (const i of insights) {
      if (i.topicId && i.studentId) {
        await tx.aIInsight.create({
          data: {
            studentId: i.studentId,
            topicId: i.topicId,
            kind: i.kind,
            content: i.content,
            confidence: i.confidence
          }
        });
      }
    }

    await tx.paper.update({
      where: { id: paper.id },
      data: { processingStatus: 'COMPLETED' }
    });
  });

  return { processed: true, analysesCount: analyses.length };
}

async function workerLoop() {
  console.log("Worker started. Polling for jobs...", useMockAI ? "(Using Mock AI)" : "(Using Real Anthropic AI)");
  while (true) {
    const job = await prisma.job.findFirst({
      where: { status: 'QUEUED' },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    console.log(`Processing job ${job.id} of type ${job.type}`);
    await prisma.job.update({ where: { id: job.id }, data: { status: 'PROCESSING' } });

    try {
      const payload = JSON.parse(job.payload);
      let result;

      if (job.type === 'OCR_EXTRACTION') {
        result = await processOCRExtraction(job.id, payload);
      } else {
        throw new Error(`Unknown job type: ${job.type}`);
      }

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', result: JSON.stringify(result) }
      });
      console.log(`Job ${job.id} completed.`);
    } catch (error: any) {
      console.error(`Job ${job.id} failed:`, error);
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'FAILED', error: error.message || String(error) }
      });
    }
  }
}

workerLoop().catch(console.error);
