import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { slotId, effectiveDate, newStartTime, reason } = await request.json();

    // 1. Verify ownership and get course/enrollment details
    const slot = await prisma.timetableSlot.findUnique({
      where: { id: slotId },
      include: { 
        course: { 
          include: { enrollments: true } 
        } 
      }
    });

    if (!slot || slot.course.teacherId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Slot not found or unauthorized' }, { status: 404 });
    }

    // 2. Create the timetable update (shift) for a specific date
    await prisma.timetableUpdate.create({
      data: {
        slotId,
        updatedById: session.user.id,
        effectiveDate: new Date(effectiveDate),
        oldStartTime: slot.startTime,
        newStartTime: newStartTime,
        reason: reason || 'Teacher rescheduled',
      }
    });

    // 3. Generate system alerts for all enrolled students
    const formattedDate = new Date(effectiveDate).toLocaleDateString();
    const notifications = slot.course.enrollments.map(enrollment => ({
      userId: enrollment.studentId,
      type: 'SCHEDULE_UPDATE',
      message: `Your ${slot.course.code} class on ${formattedDate} has been shifted from ${slot.startTime} to ${newStartTime}.`,
      read: false
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ success: true, message: 'Class shifted and students notified.' });
  } catch (error) {
    console.error('Timetable Shift Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
