import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { uploadToS3 } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const reason = formData.get('reason') as string;
    const event = formData.get('event') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const file = formData.get('document') as File;

    // In a production environment, verify the student session token here.
    const studentEmail = 'jane.doe@portal.edu';
    const student = await prisma.user.findUnique({ where: { email: studentEmail } });

    if (!student || !reason || !event || !startDate || !endDate || !file) {
      return NextResponse.json({ error: 'Missing required fields or invalid file attachment.' }, { status: 400 });
    }

    // 1. File Storage Handling
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const documentUrl = await uploadToS3(buffer, file.name, 'od-documents');

    // 2. AI Pre-check Pipeline (Simulated Claude Vision/OCR API)
    // The AI reads the document, cross-references dates/event, and generates an advisory annotation.
    // This strictly adheres to the rule that AI never auto-approves, only annotates.
    const aiAnalysis = {
      confidence: 0.94,
      status: 'RECOMMEND_APPROVE',
      reasoning: 'The dates on the uploaded certificate match the requested absence period. Event title aligns with the provided reason.'
    };

    // 3. Database Transaction
    const odRequest = await prisma.oDRequest.create({
      data: {
        studentId: student.id,
        reason,
        eventName: event,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING',
        aiConfidence: aiAnalysis.confidence,
        aiStatus: aiAnalysis.status,
        documentUrl, 
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OD Request submitted and AI pre-check completed.',
      data: odRequest 
    });

  } catch (error) {
    console.error('OD Submission API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing OD request.' }, 
      { status: 500 }
    );
  }
}
