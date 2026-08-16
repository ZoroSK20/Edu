import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, action } = body; 

    // Validate the incoming action payload
    if (!requestId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload provided for OD review.' },
        { status: 400 }
      );
    }

    // Update the OD Request status in the database
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      },
    });

    // In a fully scaled environment, we would trigger a Notification creation here
    // to alert the student of the status change.

    return NextResponse.json({
      success: true,
      message: `OD Request successfully ${action.toLowerCase()}d.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('OD Review API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing review.' },
      { status: 500 }
    );
  }
}
