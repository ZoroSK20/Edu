import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { uploadToS3 } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('paper') as File;
    const examId = formData.get('examId') as string;
    const studentId = formData.get('studentId') as string;

    if (!file || !examId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: paper file, examId, or studentId.' }, 
        { status: 400 }
      );
    }

    // Fetch the exam to get the associated courseId, as courseId is required for a Paper
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { courseId: true }
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Invalid examId.' }, 
        { status: 400 }
      );
    }

    // 1. File Storage Handling
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileUrl = await uploadToS3(buffer, file.name, 'papers');

    // 2. Database Transaction: Create Paper record & Queue Job
    // We use a transaction to guarantee the job is only queued if the paper is saved
    const result = await prisma.$transaction(async (tx) => {
      // Create the paper record in a pending state
      const paper = await tx.paper.create({
        data: {
          courseId: exam.courseId,
          examId,
          uploadedById: studentId,
          fileUrl,
          processingStatus: 'QUEUED', 
        }
      });

      // Create the background job for the OCR worker loop to pick up
      // This DB-backed queue replaces Redis/BullMQ to minimize infra overhead
      const job = await tx.job.create({
        data: {
          type: 'OCR_EXTRACTION',
          payload: JSON.stringify({ paperId: paper.id, fileUrl: paper.fileUrl }),
          status: 'QUEUED',
        }
      });

      return { paperId: paper.id, jobId: job.id };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Paper uploaded successfully. OCR extraction queued.',
      data: result 
    });

  } catch (error) {
    console.error('Paper upload API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing paper upload.' }, 
      { status: 500 }
    );
  }
}
